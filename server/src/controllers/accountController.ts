import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import db from '../db/db.js';

export async function getAccount(req: Request, res: Response): Promise<void> {
  const userData = req.user;

  res.status(200).json({
    status: true,
    message: 'User Found',
    data: {
      id: userData!.id,
      firstName: userData!.first_name,
      lastName: userData!.last_name,
      username: userData!.username,
      email: userData!.email,
      role: userData!.role,
      isBanned: userData!.is_banned,
      profilePicture: userData!.profile_picture,
    },
  });
}

export async function updateAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.user!.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
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
  try {
    if (!req.file) {
      res.status(422).json({
        status: false,
        message: 'No file uploaded or invalid file format',
        errors: {
          file: 'Please upload a valid image file (jpg, jpeg, png) (Max: 2MB)',
        },
      });
      return;
    }

    if (req.user!.profile_picture) await fs.unlink(req.user!.profile_picture);

    await db.query('UPDATE accounts SET profile_picture = $1 WHERE id = $2', [
      req.file.path,
      req.user!.id,
    ]);

    res.json({
      status: true,
      message: 'Profile picture updated successfully!',
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error updating profile picture' });
  }
}
