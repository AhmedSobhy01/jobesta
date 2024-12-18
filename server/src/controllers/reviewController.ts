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
