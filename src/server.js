import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import router from './routers/index.js';
import { UPLOAD_DIR } from './constants/avatar.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

dotenv.config();

import { env } from './utils/env.js';

const PORT = Number(env('PORT', '3000'));

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use(router);

  app.use('/api-docs', swaggerDocs());

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
