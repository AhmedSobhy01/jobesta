import { Request, Response } from 'express';
import db from '../db/db.js';

export async function createReview(req: Request, res: Response): Promise<void> {
  const { rating, comment } = req.body;
  console.log(
    rating,
    comment,
    req.params.jobId,
    req.params.freelancer_id,
    req.user!.id,
  );
  try {
    await db.query(
      'INSERT INTO reviews (rating, comment, job_id, freelancer_id, account_id) VALUES ($1, $2, $3, $4, $5)',
      [
        rating,
        comment,
        req.params.jobId,
        req.params.freelancerId,
        req.user!.id,
      ],
    );

    res.status(201).json({
      status: true,
      message: 'Review created',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating review' });
  }
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const account = await db.query(
      'SELECT * FROM accounts WHERE username = $1 ',
      [req.params!.username],
    );

    let sender = null;
    let result = null;
    let username = null;

    if (account.rows[0].role === 'freelancer') {
      const freelancerUser = await db.query(
        'SELECT * FROM freelancers WHERE account_id = $1',
        [account.rows[0].id],
      );

      sender = await db.query(
        'SELECT j.client_id AS senderid, a.username AS senderusername FROM propsals p JOIN jobs j ON p.job_id = j.id JOIN acccounts a ON a.id = j.client_id WHERE p.status = accepted AND j.status = completed AND p.freelancer_id = $1',
        [freelancerUser.rows[0].id],
      );

      result = await db.query(
        'SELECT * FROM reviews r WHERE r.account_id = $1',
        [sender.rows[0].senderid],
      );
    } else {
      sender = await db.query(
        'SELECT p.freelancer_id AS senderid, a.username AS senderusername FROM jobs j JOIN proposals p ON p.job_id = j.id JOIN freelancers f ON p.freelancer_id = f.id JOIN accounts a ON f.account_id = a.id WHERE p.status = $1 AND j.status = $2 AND j.client_id = $3',
        ['accepted', 'completed', account.rows[0].id],
      );
      result = await db.query(
        'SELECT * FROM reviews r WHERE r.freelancer_id = $1',
        [sender.rows[0].senderid],
      );
    }

    username = sender.rows[0].senderusername;

    const reviews = result.rows.map((review) => {
      return {
        senderUsername: username,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      };
    });

    res.status(201).json({
      status: true,
      message: 'Reviews retrieved',
      data: {
        reviews,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error getting reviews' });
  }
}
