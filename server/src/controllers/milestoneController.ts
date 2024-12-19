import { Request, Response } from 'express';
import db from '../db/db.js';

export async function completeMilestone(req: Request, res: Response) {
  const { jobId, freelancerId, milestoneOrder } = req.params;

  try {
    await db.query(
      'UPDATE milestones SET status = $1 WHERE job_id = $2 AND freelancer_id = $3 AND "order" = $4',
      ['completed', jobId, freelancerId, milestoneOrder],
    );

    const result = await db.query(
      'SELECT COUNT(*) FROM milestones WHERE job_id = $1 AND freelancer_id = $2 AND status = $3',
      [jobId, freelancerId, 'pending'],
    );

    if (result.rows[0].count === '0') {
      await db.query('UPDATE jobs SET status = $1 WHERE id = $2', [
        'completed',
        jobId,
      ]);
    }

    await db.query(
      'INSERT INTO payments (job_id, freelancer_id, milestone_order, client_id, status) VALUES ($1, $2, $3, $4)',
      [jobId, freelancerId, milestoneOrder, req.user!.id, 'completed'],
    );

    await db.query(
      'UPDATE freelancers SET balance = balance + (SELECT amount FROM milestones WHERE job_id = $1 AND freelancer_id = $2 AND "order" = $3) WHERE id = $2',
      [jobId, freelancerId, milestoneOrder],
    );

    res.json({ status: true, message: 'Milestone completed' });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error completing milestone' });
  }
}
