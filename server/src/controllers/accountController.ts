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

    let reviewResult = null;
    let avgReviewRating = null;

    if (userData.role === 'client') {
      reviewResult = await db.query(
        `
        SELECT 
        r.rating,
        r.comment,
        r.created_at,
        a.first_name,
        a.last_name,
        a.username,
        a.profile_picture
      FROM reviews r
      JOIN jobs j 
        ON j.client_id = $2
        AND j.status = $3
      JOIN proposals p 
        ON r.job_id = p.job_id 
        AND p.job_id = j.id
        AND r.freelancer_id = p.freelancer_id
        AND p.status = $1
      JOIN accounts a 
        ON a.id = r.account_id
      WHERE r.account_id != $2
      `,
        ['accepted', userData.id, 'completed'],
      );

      avgReviewRating = await db.query(
        `
         SELECT 
          AVG(r.rating) AS averagerating
        FROM reviews r
        JOIN jobs j 
          ON j.client_id = $1
        JOIN proposals p 
          ON r.job_id = p.job_id 
          AND p.job_id = j.id
          AND r.freelancer_id = p.freelancer_id
        JOIN accounts a 
          ON a.id = r.account_id
        WHERE r.account_id != $1
        `,
        [userData.id],
      );
    } else if (userData.role === 'freelancer') {
      const result = await db.query(
        'SELECT id FROM freelancers WHERE account_id = $1',
        [userData.id],
      );

      const freelancerData = result.rows[0];

      reviewResult = await db.query(
        `
        SELECT 
          r.rating,
          r.comment,
          r.created_at,
          a.first_name,
          a.last_name,
          a.username,
          a.profile_picture
        FROM reviews r
        JOIN proposals p 
          ON r.job_id = p.job_id 
          AND p.freelancer_id = $3
          AND p.status = $1
        JOIN jobs j 
          ON j.id = p.job_id 
          AND j.status = $2
        JOIN accounts a 
          ON a.id = j.client_id
        WHERE r.account_id = j.client_id
        `,
        ['accepted', 'completed', freelancerData.id],
      );

      avgReviewRating = await db.query(
        `
        SELECT AVG(rating) AS averagerating
        from reviews
        where freelancer_id = $1 AND account_id != $2`,
        [freelancerData.id, userData.id],
      );
    }

    const reviews = reviewResult?.rows.map((review) => {
      return {
        sender: {
          username: review.username,
          firstName: review.first_name,
          lastName: review.last_name,
          profilePicture:
            review.profile_picture ||
            'https://ui-avatars.com/api/?name=' +
              review.first_name +
              '+' +
              review.last_name,
        },
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
        avgReviewRating: avgReviewRating?.rows[0].averagerating,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error fetching user' });
  }
}
