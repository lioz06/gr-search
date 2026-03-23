import express, { Application } from 'express';
import Routes from './routes';
import { unCoughtErrorHandler } from './handlers/errorHandler';
import { logger } from './logger/logger';

const morgan = require('morgan')

export default class Server {
  constructor(app: Application) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Application): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // access logger
    app.use(morgan('common'));
    app.use(unCoughtErrorHandler);
  }
}


process.on('beforeExit', function (err) {
  logger.error(JSON.stringify(err));
  console.error(err);
});
