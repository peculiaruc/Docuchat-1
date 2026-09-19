import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/helpers/env.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text','html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/config/**'],
        }     
    },
});

