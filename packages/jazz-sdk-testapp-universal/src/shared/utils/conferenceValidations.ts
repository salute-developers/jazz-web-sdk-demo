const isEmpty = (value: string): boolean => !value || /^\s*$/.test(value);

const hasSpaces = (value: string): boolean => /\s+/.test(value);

export const ALLOWED_CHARS_REGEX =
  /^[\p{L}\p{M}\p{N}\p{P}\p{Z}\p{Sc}\p{Sm}№]*$/u;

export const ALLOWED_CHARS_EMOJI_REGEX =
  /^[\p{L}\p{M}\p{N}\p{P}\p{Z}\p{Sc}\p{Sm}\p{Emoji_Presentation}№]*$/u;

export type ValidateConferenceForm = {
  conferenceName?: string;
  userName?: string;
  roomId?: string;
  password?: string;
};

export type ErrorReport = string | undefined;

export type ValidateReport = Record<string, ErrorReport>;

type ValidateFunction = (value: string) => ErrorReport;

const hasOnlyAllowedSymbols = (value: string): boolean =>
  ALLOWED_CHARS_REGEX.test(value);

const hasOnlyAllowedSymbolsWithEmoji = (value: string): boolean =>
  ALLOWED_CHARS_REGEX.test(value);

const validates: Record<string, ValidateFunction> = {
  conferenceName: (value) => {
    if (!value || isEmpty(value)) return 'empty conference name';
    if (!hasOnlyAllowedSymbols(value))
      return 'conference name include not allowed chars';
    return undefined;
  },
  userName: (value) => {
    if (!value || isEmpty(value)) return 'empty user name';
    if (!hasOnlyAllowedSymbolsWithEmoji(value))
      return 'conference name include not allowed chars';
    return undefined;
  },
  roomId: (value) => {
    if (!value || isEmpty(value)) return 'empty id';
    if (hasSpaces(value)) return 'id include spaces';
    return undefined;
  },
  password: (value) => {
    if (!value || isEmpty(value)) return 'empty password';
    if (hasSpaces(value)) return 'password include spaces';
    return undefined;
  },
};

export function validateConferenceForm(
  form: ValidateConferenceForm,
): ValidateReport {
  return Object.entries(form).reduce<ValidateReport>((calc, [field, value]) => {
    if (validates[field] && value !== undefined) {
      const result = validates[field](value);

      if (result) {
        calc[field] = result;
      }
    }
    return calc;
  }, {});
}
