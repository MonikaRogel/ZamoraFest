import { resolve } from 'node:path';

import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

const testEnvironment =
  config({
    path: resolve(import.meta.dirname, '.env.test'),
    quiet: true,
  }).parsed ?? {};

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      ...testEnvironment,
      NODE_ENV: 'test',
    },
    fileParallelism: false,
    maxWorkers: 1,
    hookTimeout: 15_000,
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**'],
    },
  },
});
