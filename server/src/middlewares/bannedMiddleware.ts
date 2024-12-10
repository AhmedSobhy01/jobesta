import type { Request, Response, NextFunction } from 'express';

export async function checkBanned(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user!.is_banned) {
    res.status(403).json({
      status: false,
      message: 'You are banned from the platform',
    });

    return;
  }

  next();
}
