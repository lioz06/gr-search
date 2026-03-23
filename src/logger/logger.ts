import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'gr-search' },
  transports: [
    //
    // - log to the `console` (by default for docker) with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    new winston.transports.Console({
    format: winston.format.simple(),
  }), 
  ],
});
