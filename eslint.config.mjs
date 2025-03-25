import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import jseslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintComments from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
// import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const generalConfig = tseslint.config([
  jseslint.configs.recommended,
  tseslint.configs.recommended,
  ...fixupConfigRules(
    compat.extends(
      'plugin:eslint-plugin-eslint-comments/recommended',
      'plugin:eslint-plugin-import/recommended',
      'plugin:eslint-plugin-import/typescript',
      'plugin:eslint-plugin-react-hooks/recommended',
    ),
  ),
  eslintConfigPrettier,
  {
    plugins: {
      import: fixupPluginRules(importPlugin),
      'eslint-comments': fixupPluginRules(eslintComments),
      'react-hooks': fixupPluginRules(reactHooks),
    },
    // languageOptions: {
    //   globals: {
    //     // ...globals.node,
    //     ...globals.browser,
    //   },
    // },
    rules: {
      'no-unused-vars': 'off',

      'sort-imports': [
        'warn',
        {
          ignoreDeclarationSort: true,
          ignoreCase: true,
        },
      ],

      // typescript rules
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/member-ordering': ['warn'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/method-signature-style': ['warn', 'property'],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: false,
          allowTernary: true,
          allowTaggedTemplates: false,
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',

      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',

      'class-methods-use-this': 'off',
      'no-implicit-coercion': 'error',
      'no-param-reassign': ['error', { props: false }],
      indent: 'off',
      'no-multiple-empty-lines': ['error', { max: 1 }],

      'import/prefer-default-export': 'off',
      'import/no-cycle': 'off',
      'import/no-default-export': 'error',

      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            'sibling',
            'index',
          ],

          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
          ],

          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'import/no-unresolved': 'off',
      'import/extensions': 'off',

      'eslint-comments/disable-enable-pair': [
        'error',
        { allowWholeFile: true },
      ],

      'no-underscore-dangle': 'off',
      'no-void': ['error', { allowAsStatement: true }],

      'default-case': 'error',
    },
  },
  // Typescript declarations
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/method-signature-style': 'off',
    },
  },

  // Node.js scripts
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]);

// eslint-disable-next-line import/no-default-export
export default generalConfig;
