import type { Request, Response } from 'express';
import { promises as fs } from 'fs';
import db from '../db/db.js';
import bcrypt from 'bcrypt';

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
      profilePicture:
        userData!.profile_picture ||
        'https://ui-avatars.com/api/?name=' +
          userData!.first_name +
          '+' +
          userData!.last_name,
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

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      await db.query('UPDATE accounts SET password = $1 WHERE id = $2', [
        hashedPassword,
        userId,
      ]);
    }

    res
      .status(201)
      .json({ status: true, message: 'Updated account', data: { username } });
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

export async function getUserByUsername(
  req: Request,
  res: Response,
): Promise<void> {
  const { username } = req.params;

  try {
    const userDataQuery = await db.query(
      'SELECT * FROM accounts WHERE username = $1',
      [username],
    );

    if (userDataQuery.rowCount === 0) {
      res.status(404).json({
        status: false,
        message: 'User not found',
      });
      return;
    }

    const userData = userDataQuery.rows[0];

    const reviewSender = await db.query(
      'SELECT p.freelancer_id AS senderid, a.username AS senderusername FROM jobs j JOIN proposals p ON p.job_id = j.id JOIN freelancers f ON p.freelancer_id = f.id JOIN accounts a ON f.account_id = a.id WHERE p.status = $1 AND j.status = $2 AND j.client_id = $3',
      ['accepted', 'completed', userDataQuery.rows[0].id],
    );
    const reviewResult = await db.query(
      'SELECT * FROM reviews r WHERE r.freelancer_id = $1',
      [reviewSender.rows[0].senderid],
    );

    const reviewSenderUsername = reviewSender.rows[0].senderusername;

    const reviews = reviewResult.rows.map((review) => {
      return {
        senderUsername: reviewSenderUsername,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      };
    });

    let jobsQueryString = `SELECT j.id, j.status, j.budget, j.duration, j.title, j.description, j.created_at, client.first_name, client.last_name, client.username, client.profile_picture, c.id category_id, c.name category_name ,c.description category_description 
      FROM jobs j 
      JOIN accounts client ON client.id = j.client_id
      LEFT JOIN categories c ON c.id = j.category_id 
      LEFT JOIN proposals p ON p.job_id = j.id`;

    let jobsQueryParams: Array<string> = [];

    if (userData.role === 'client') {
      jobsQueryString += ' WHERE j.client_id = $1';
      jobsQueryParams = [userData.id];
    } else if (userData.role === 'freelancer') {
      const result = await db.query(
        'SELECT id FROM freelancers WHERE account_id = $1',
        [userData.id],
      );
      const freelancerData = result.rows[0];

      jobsQueryString += ' WHERE p.freelancer_id = $1 AND p.status = $2';
      jobsQueryParams = [freelancerData.id, 'accepted'];
    } else {
      jobsQueryString += ' WHERE 1 != 1';
    }

    const jobsQuery = await db.query(jobsQueryString, jobsQueryParams);

    const jobs = jobsQuery.rows.map((job) => ({
      id: job.id,
      status: job.status,
      budget: job.budget,
      duration: job.duration,
      title: job.title,
      description: job.description,
      category: {
        id: job.category_id,
        name: job.name,
        description: job.category_description,
      },
      createdAt: job.created_at,
      client: {
        firstName: job.first_name,
        lastName: job.last_name,
        username: job.username,
        profilePicture:
          job.profile_picture ||
          'https://ui-avatars.com/api/?name=' +
            job.first_name +
            '+' +
            job.last_name,
      },
    }));

    res.status(200).json({
      status: true,
      message: 'User Found',
      data: {
        firstName: userData!.first_name,
        lastName: userData!.last_name,
        username: userData!.username,
        role: userData!.role,
        isBanned: userData!.is_banned,
        profilePicture:
          userData!.profile_picture ||
          'https://ui-avatars.com/api/?name=' +
            userData!.first_name +
            '+' +
            userData!.last_name,
        jobs,
        reviews,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error fetching user' });
  }
}
