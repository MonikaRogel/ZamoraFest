import express from 'express';

import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { eventoRouter } from './modules/eventos/evento.routes.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/eventos', eventoRouter);

app.use(notFoundHandler);
app.use(errorHandler);
