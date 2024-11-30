import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const bearerText = req.header('Authorization');
  if (!bearerText || bearerText.trim() == 'Bearer') {
    res.status(401).json({ message: 'Unauthorized', status: false });
    return;
  }

  const jwtToken = bearerText.split(' ')[1];

  try {
    const user = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as {
      id: string;
    };
    req.user = user;
  } catch (err) {
    res.status(401).json({ message: 'Invalid JWT', err, status: false });
    return;
  }

  next();
}
