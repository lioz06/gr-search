import { Request, Response, NextFunction } from 'express';
import {logger} from '../logger/logger';

export function unCoughtErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(JSON.stringify(err));
  res.end({ error: err });
}

export function apiErrorHandler(
  err: any,
  req: Request,
  res: Response,
  message: string,
) {
  const error: object = { Message: message, Request: req, Stack: err };
  logger.error(JSON.stringify(error));
  res.json({ Message: message });
}