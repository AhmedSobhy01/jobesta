import type { Request, Response } from 'express';
import db from '../db/db.js';

export async function getAccount(req: Request, res: Response): Promise<void> {
  const userData = req.user;
  res.status(200).json({ status: true, message: 'User Found', data: userData });
}

export async function updateAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const username = req.body.username;
  const email = req.body.email;

  try {
    await db.query(
      'UPDATE accounts SET first_name = $1, last_name = $2, username = $3, email = $4 WHERE id = $5',
      [firstName, lastName, username, email, userId],
    );

    res.status(201).json({ status: true, message: 'Updated account' });
  } catch {
    res.status(500).json({
      status: false,
      message: 'Error updating account',
    });
  }
}

export async function updateProfilePicture(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const profilePicture = req.body.profile_picture;

  try {
    await db.query('UPDATE accounts SET profile_picture = $1 WHERE id = $2', [
      profilePicture,
      userId,
    ]);

    res.status(201).json({ status: true, message: 'Updated profile picture' });
  } catch {
    res.status(500).json({
      status: false,
      message: 'Error updating profile picture',
    });
  }
}
