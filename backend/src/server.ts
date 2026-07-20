import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.info(`ZamoraFest backend escuchando en http://localhost:${env.PORT}`);
});

let isShuttingDown = false;

const shutdown = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.info(`Señal ${signal} recibida. Cerrando el servidor...`);

  const forceShutdownTimeout = setTimeout(() => {
    console.error('El servidor no pudo cerrarse dentro del tiempo permitido.');
    process.exit(1);
  }, 10_000);

  forceShutdownTimeout.unref();

  server.close((error) => {
    clearTimeout(forceShutdownTimeout);

    if (error) {
      console.error('Ocurrió un error al cerrar el servidor.', error);
      process.exitCode = 1;
      return;
    }

    console.info('Servidor cerrado correctamente.');
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
