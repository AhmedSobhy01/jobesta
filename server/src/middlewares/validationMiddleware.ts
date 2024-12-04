import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages: Record<string, string> = {};

    errors.array().forEach((error) => {
      if (error.type === 'field') {
        errorMessages[error.path] = error.msg;
      }
    });

    res.status(422).json({ status: false, errors: errorMessages });
    return;
  }

  next();
};
