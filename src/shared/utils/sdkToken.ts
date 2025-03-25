import { isMatching, P } from 'ts-pattern';
import { v4 } from 'uuid';

import { encodeBytesAsBase64 } from './base64';

const KEY_PATTERN = {
  /**
   * @example EC
   */
  kty: P.string,
  /**
   * @example P-384, P-256, P-521
   */
  crv: P.string,
  x: P.string,
  y: P.string,
  d: P.string,
  use: P.string,
  kid: P.string,
};

export type SecretResultKey = P.infer<typeof KEY_PATTERN>;

const SECRET_RESULT_PATTERN = {
  projectId: P.string,
  key: KEY_PATTERN,
};

export type SecretResult = P.infer<typeof SECRET_RESULT_PATTERN>;

export type Base64String = string;

export type ErrorCode = 'ER_INVALID_KEY' | 'ER_UNSUPPORTED_ALGORITHM';

export type GenerateSdkTokenError = Error & {
  code: ErrorCode;
  message: string;
};

export type SdkTokenOptions = {
  /**
   * Уникальный идентификатор запроса от клиента к серверу
   * @example beaff5c1-644c-413f-ba76-a583d892b5a4
   */
  requestId?: string;
  /**
   * Время в секундах через которое истечет срок жизни токена
   * @default 120
   */
  expireIn?: number;
  /**
   * Название компании или проекта используется в логах
   * Есть ограничение в 100 символов
   */
  iss?: string;
  /**
   * Идентификатор пользователя
   */
  sub: string;
  /**
   * Имя пользователя
   */
  userName?: string;
  /**
   * Почта пользователя
   */
  userEmail?: string;
};

export type JWTHeader = {
  alg: string;
  kid: string;
  typ: 'JWT';
};

export type JWTPayload = {
  /**
   * JWT Issuer
   *
   * @see [RFC7519#section-4.1.1](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1)
   */
  iss?: string;

  /**
   * JWT Subject
   *
   * @see [RFC7519#section-4.1.2](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2)
   */
  sub: string;

  /** JWT Audience [RFC7519#section-4.1.3](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3). */
  aud?: string | string[];

  /**
   * JWT ID
   *
   * @see [RFC7519#section-4.1.7](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7)
   */
  jti?: string;

  /**
   * JWT Not Before
   *
   * @see [RFC7519#section-4.1.5](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5)
   */
  nbf?: number;

  /**
   * JWT Expiration Time
   *
   * @see [RFC7519#section-4.1.4](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4)
   */
  exp?: number;

  /**
   * JWT Issued At
   *
   * @see [RFC7519#section-4.1.6](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6)
   */
  iat?: number;

  /** Any other JWT Claim Set member. */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  [propName: string]: unknown;
};

/**
 *
 * @param secret base64 строка
 * @param options настройки окружения
 *
 * @returns {Promise} токен доступа
 */
export async function createSdkToken(
  secret: string,
  options: SdkTokenOptions,
): Promise<{
  sdkToken: string;
}> {
  const {
    requestId = v4(),
    expireIn = 120,
    iss,
    userEmail,
    sub,
    userName,
  } = options;
  const iat = Math.round(Date.now() / 1000);

  const algorithm = recognizeAlgorithm(secret);

  const payload: JWTPayload = {
    iat,
    exp: iat + expireIn,
    jti: requestId,
    sdkProjectId: algorithm.projectId,
    iss, // для логов. Не больше 100 символов.
    sub, // Идентификатор пользователя в пространстве B2B сервиса
    userName: userName, // опционально, для отображения в комнате
    userEmail: userEmail, // опционально
  };

  const header: JWTHeader = {
    alg: algorithm.alg,
    kid: algorithm.kid,
    typ: 'JWT',
  };

  const headerBase64 = encodeSafeUrl(JSON.stringify(header));
  const payloadBase64 = encodeSafeUrl(JSON.stringify(payload));

  const textToSign = headerBase64 + '.' + payloadBase64;

  const privateKey = await importECDSAPrivateKey(algorithm.jwk);

  const { signature } = await algorithm.sign(textToSign, privateKey);

  const signedJwt = createSignedJWT(textToSign, signature);

  return {
    sdkToken: signedJwt,
  };
}

export const encoder = new TextEncoder();
export const decoder = new TextDecoder(undefined, { fatal: true });

/**
 * text to base64 safe url
 */
export const encodeSafeUrl = (input: Uint8Array | string): Base64String =>
  encodeBytesAsBase64(input)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/**
 * base64 safe url to text
 */
export const decodeSafeUrl = (input: Uint8Array | Base64String): string => {
  let encoded = '';
  if (input instanceof Uint8Array) {
    encoded = decoder.decode(input);
  }
  if (typeof input === 'string') {
    encoded = input;
  }
  encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  try {
    return atob(encoded);
  } catch {
    throw new TypeError('The input to be decoded is not correctly encoded.');
  }
};

export function recognizeAlgorithm(key: Base64String): {
  alg: string;
  kid: string;
  projectId: string;
  sign: (
    value: string,
    privateKey: CryptoKey,
  ) => Promise<{
    signature: ArrayBuffer;
  }>;
  jwk: JsonWebKey;
} {
  const result = parseSecret(key);

  const ecJwk = createEcJwk(result.key);

  const alg = getAlgorithm(result.key);

  const kid = result.key.kid;
  return {
    alg,
    kid,
    jwk: ecJwk,
    projectId: result.projectId,
    sign: async (value, privateKey) => {
      const encodedData = encoder.encode(value);

      const signature = await window.crypto.subtle.sign(
        subtleDsa(alg, privateKey.algorithm),
        privateKey,
        encodedData,
      );

      return {
        signature,
      };
    },
  };
}

export function createSignedJWT(
  textToSign: string,
  signature: ArrayBuffer,
): string {
  return textToSign + '.' + encodeSafeUrl(new Uint8Array(signature));
}

export function parseSecret(key: Base64String): SecretResult {
  let result: SecretResult;
  try {
    result = JSON.parse(decodeSafeUrl(key));
  } catch (error) {
    throw createError('ER_INVALID_KEY', 'Invalid Key');
  }

  if (!isMatching(SECRET_RESULT_PATTERN, result)) {
    throw createError('ER_INVALID_KEY', 'Invalid Key');
  }

  return result;
}

function createError(code: ErrorCode, message: string): GenerateSdkTokenError {
  const error = new Error(message) as GenerateSdkTokenError;
  error.message = message;
  error.code = code;

  return error;
}
/*
  Import a JSON Web Key format EC private key, to use for ECDSA signing.
  Takes an object representing the JSON Web Key, and returns a Promise
  that will resolve to a CryptoKey representing the private key.
  */
export function importECDSAPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'ECDSA',
      namedCurve: jwk.crv,
    },
    true,
    ['sign'],
  );
}

export function getAlgorithm(data: SecretResultKey): string {
  switch (data.crv) {
    case 'P-384':
      return 'ES384';
    case 'P-256':
      return 'ES256';
    case 'P-521':
      return 'ES521';
    default:
      throw createError(
        'ER_UNSUPPORTED_ALGORITHM',
        `Unsupported algorithm ${data.crv}`,
      );
  }
}

export function createEcJwk(data: SecretResultKey): JsonWebKey {
  return {
    crv: data.crv,
    d: data.d,
    ext: true,
    key_ops: ['sign'],
    kty: data.kty,
    x: data.x,
    y: data.y,
  };
}

export function subtleDsa(alg: string, algorithm: KeyAlgorithm): EcdsaParams {
  switch (alg) {
    case 'ES256':
      return { hash: 'SHA-256', name: 'ECDSA' };
    case 'ES384':
      return { hash: 'SHA-384', name: 'ECDSA' };
    case 'ES512':
      return { hash: 'SHA-512', name: 'ECDSA' };
    default:
      throw createError(
        'ER_UNSUPPORTED_ALGORITHM',
        `Unsupported algorithm ${algorithm.name}`,
      );
  }
}
