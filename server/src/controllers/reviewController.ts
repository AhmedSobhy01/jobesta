import { Request, Response } from 'express';
import db from '../db/db.js';

export async function createReview(req: Request, res: Response): Promise<void> {
  const { rating, comment } = req.body;

  try {
    if (comment) {
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
    } else {
      await db.query(
        'INSERT INTO reviews (rating, job_id, freelancer_id, account_id) VALUES ($1, $2, $3, $4, $5)',
        [rating, req.params.jobId, req.params.freelancerId, req.user!.id],
      );
    }

    res.status(201).json({
      status: true,
      message: 'Review created',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating review' });
  }
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  try {
    await db.query(
      'DELETE FROM reviews WHERE job_id = $1 AND freelancer_id = $2 AND account_id = $3',
      [req.params.jobId, req.params.freelancerId, req.user!.id],
    );

    res.status(201).json({
      status: true,
      message: 'Review deleted',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting review' });
  }
}
