import express from 'express';

import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { eventoRouter } from './modules/eventos/evento.routes.js';
import { favoritoRouter } from './modules/favoritos/favorito.routes.js';
import { recordatorioRouter } from './modules/recordatorios/recordatorio.routes.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/eventos', eventoRouter);
app.use('/api/v1/favoritos', favoritoRouter);
app.use('/api/v1/recordatorios', recordatorioRouter);

app.use(notFoundHandler);
app.use(errorHandler);
