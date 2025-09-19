module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        // Code quality rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': ['error', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',
        'no-useless-return': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        'prefer-destructuring': ['error', {
            array: true,
            object: true
        }, {
            enforceForRenamedProperties: false
        }],

        // Style rules
        'indent': ['error', 4, { SwitchCase: 1 }],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'comma-spacing': 'error',
        'comma-style': 'error',
        'computed-property-spacing': 'error',
        'func-call-spacing': 'error',
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'object-curly-spacing': ['error', 'always'],
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always'
        }],
        'space-in-parens': 'error',
        'space-infix-ops': 'error',
        'space-unary-ops': 'error',
        'spaced-comment': 'error',

        // Best practices
        'eqeqeq': ['error', 'always'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        'no-alert': 'error',
        'no-caller': 'error',
        'no-iterator': 'error',
        'no-proto': 'error',
        'no-with': 'error',
        'radix': 'error',
        'wrap-iife': 'error',
        'yoda': 'error',
        'no-else-return': 'error',
        'no-return-assign': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unused-expressions': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-void': 'error',
        'prefer-promise-reject-errors': 'error',

        // Node.js specific rules
        'no-process-exit': 'error',
        'no-path-concat': 'error',
        'no-new-require': 'error',
        'no-mixed-requires': 'error',
        'handle-callback-err': 'error',
        'no-buffer-constructor': 'error',

        // Security rules
        'no-new-wrappers': 'error',
        'no-array-constructor': 'error',
        'no-new-object': 'error',
        'no-new-require': 'error'
    },
    overrides: [
        {
            files: ['**/*.test.js', '**/*.spec.js'],
            env: {
                jest: true
            },
            rules: {
                'no-console': 'off'
            }
        },
        {
            files: ['contracts/**/*.sol'],
            env: {
                node: true
            },
            rules: {
                'no-console': 'off'
            }
        }
    ]
};
