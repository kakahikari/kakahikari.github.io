import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/public/**',
      '**/temp/**',
      '**/*.min.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    plugins: {
      import: pluginImport,
      'simple-import-sort': pluginSimpleImportSort,
    },
    languageOptions: {
      globals: {
        // Node.js 環境
        process: 'readonly',
        // 瀏覽器環境
        document: 'readonly',
        window: 'readonly',
        location: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
        Event: 'readonly',
      },
    },
    rules: {
      // TypeScript 規則
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Vue 規則
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],

      // 一般規則
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // 由 TypeScript 版本處理

      // Import 相關規則
      'import/order': 'off', // 關閉 import/order，使用 simple-import-sort
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            'vitepress/theme',
            'typescript-eslint',
            '^@theme/',
            '../functions',
          ],
        },
      ],
      'import/no-unused-modules': 'warn',

      // Simple Import Sort 規則
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // 代碼品質
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
  // 必須放在最後以覆蓋格式相關的規則
  prettierConfig,
)
