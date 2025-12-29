import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default defineConfig(
  {
    ignores: ['**/node_modules', '**/dist', '**/out'],
    // 修复 ESLint 9.x 扁平配置格式错误
    // reportUnusedDisableDirectives 在扁平配置中必须放在 linterOptions 对象中
    // 旧写法（eslintrc 格式）：reportUnusedDisableDirectives: 'off'
    // 新写法（flat config 格式）：linterOptions.reportUnusedDisableDirectives
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    }
  },
  tseslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser
      }
    }
  },
  {
    files: ['**/*.{ts,mts,tsx,vue}', '**/*.d.ts'],
    rules: {
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/require-v-for-key': 'warn', // 关闭 v-for 必须有 key 的检查
      //'vue/valid-v-for': 'off', // 关闭 v-for 验证
      '@typescript-eslint/no-explicit-any': 'off', // 关闭禁止使用 any 的规则
      '@typescript-eslint/explicit-function-return-type': 'off', // 关闭函数必须写返回类型的规则
      '@typescript-eslint/no-unused-vars': 'warn', // 关闭未使用的变量检查
      'no-unused-vars': 'off', // 关闭未使用的变量检查
      'no-undef': 'off', // 关闭未定义变量检查（TypeScript 会处理这个）
      '@typescript-eslint/ban-ts-comment': 'off', // 允许使用 @ts-ignore 等注释
      '@typescript-eslint/no-non-null-assertion': 'off', // 允许使用非空断言
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts'
          }
        }
      ]
    }
  },
  eslintConfigPrettier
)
