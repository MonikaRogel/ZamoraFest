import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

import { config } from 'dotenv';

const projectRoot = resolve(import.meta.dirname, '..');

const environmentResult = config({
  path: resolve(projectRoot, '.env.test'),
  override: true,
  quiet: true,
});

if (environmentResult.error) {
  throw new Error('No se pudo cargar el archivo .env.test.');
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error('TEST_DATABASE_URL no está configurada.');
}

let databaseName: string;

try {
  databaseName = decodeURIComponent(new URL(testDatabaseUrl).pathname.replace(/^\//, ''));
} catch {
  throw new Error('TEST_DATABASE_URL no contiene una URL válida.');
}

if (databaseName !== 'zamorafest_test') {
  throw new Error('Operación cancelada: la base objetivo no es zamorafest_test.');
}

const prismaCliPath = resolve(projectRoot, 'node_modules', 'prisma', 'build', 'index.js');

const commandEnvironment: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: testDatabaseUrl,
  TEST_DATABASE_URL: testDatabaseUrl,
};

const commands = [
  ['migrate', 'deploy'],
  ['db', 'seed'],
];

console.log(`Preparando exclusivamente la base ${databaseName}...`);

for (const argumentsList of commands) {
  const result = spawnSync(process.execPath, [prismaCliPath, ...argumentsList], {
    cwd: projectRoot,
    env: commandEnvironment,
    stdio: 'inherit',
  });

  if (result.error || result.status !== 0) {
    throw new Error(`Prisma no pudo completar: ${argumentsList.join(' ')}.`);
  }
}

console.log('Base de pruebas preparada correctamente.');
