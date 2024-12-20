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
      'INSERT INTO payments (job_id, freelancer_id, milestone_order, client_id) VALUES ($1, $2, $3, $4)',
      [jobId, freelancerId, milestoneOrder, req.user!.id],
    );

    await db.query(
      'UPDATE freelancers SET balance = balance + (SELECT amount FROM milestones WHERE job_id = $1 AND freelancer_id = $2 AND "order" = $3) WHERE id = $2',
      [jobId, freelancerId, milestoneOrder],
    );

    // Send notification to freelancer about milestone completion
    const accountResult = await db.query(
      'SELECT account_id FROM freelancers WHERE id = $1',
      [freelancerId],
    );

    await db.query(
      `INSERT INTO notifications (type, message, account_id, url)
      VALUES ('milestone_completed', 'You have completed a milestone', $1, $2)`,
      [accountResult.rows[0].account_id, `/jobs/${jobId}/manage`],
    );

    // Send notification to freelancer about payment
    await db.query(
      `INSERT INTO notifications (type, message, account_id, url)
      VALUES ('payment_received', 'You have received payment for a milestone', $1, '/payments')`,
      [accountResult.rows[0].account_id],
    );

    res.json({ status: true, message: 'Milestone completed' });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error completing milestone' });
  }
}
