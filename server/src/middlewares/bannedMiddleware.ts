import type { Request, Response, NextFunction } from 'express';

export async function checkBanned(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user!.is_banned) {
    res.status(403).json({
      status: false,
      message: 'You Account is banned',
    });

    return;
  }

  next();
}
