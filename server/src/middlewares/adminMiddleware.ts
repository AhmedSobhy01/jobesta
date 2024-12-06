import type { Request, Response, NextFunction } from 'express';

export async function checkIfAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user!.role != 'admin') {
    res.status(403).json({
      status: false,
      message: "You don't have permission to access this resource",
    });
    return;
  }

  next();
}
