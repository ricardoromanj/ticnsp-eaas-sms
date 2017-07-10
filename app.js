import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import logger from '@/config/logger';
import settings from '@/config/settings';

import smsRouter from '@/server/sms';

// Evangelio MicroService
const app = express();

// Middleware
app.use(bodyParser.json());

app.use('*', cors());

app.use(function (err, req, res, next) {
  logger.error(err.stack);
  res.status(500).json({ error: "There was an error" });
});

app.get('/health', (req, res) => {
  logger.info(`${req.ip} requested health status`);
  res.status(200).send('OK');
});

app.use('/', smsRouter);

app.listen(settings.port, () => {
  logger.info(`Listening on port ${settings.port}` );
});
