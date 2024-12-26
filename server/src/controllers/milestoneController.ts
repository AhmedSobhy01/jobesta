import { Request, Response } from 'express';
import db from '../db/db.js';
import { io } from '../index.js';

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
      'INSERT INTO payments (job_id, freelancer_id, milestone_order, client_id, status) VALUES ($1, $2, $3, $4, $5)',
      [jobId, freelancerId, milestoneOrder, req.user!.id, 'completed'],
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

    const notificationQuery1 = await db.query(
      `INSERT INTO notifications (type, message, account_id, url)
      VALUES ('milestone_completed', 'You have completed a milestone', $1, $2) RETURNING id,created_at`,
      [accountResult.rows[0].account_id, `/jobs/${jobId}/manage`],
    );

    io.to(`notifications-${accountResult.rows[0].account_id}`).emit(
      'new-notification',
      {
        id: notificationQuery1.rows[0].id,
        type: 'milestone_completed',
        message: 'You have completed a milestone',
        isRead: false,
        createdAt: notificationQuery1.rows[0].created_at,
        url: `/jobs/${jobId}/manage`,
      },
    );

    // Send notification to freelancer about payment
    const notificationQuery2 = await db.query(
      `INSERT INTO notifications (type, message, account_id, url)
      VALUES ('payment_received', 'You have received payment for a milestone', $1, '/payments') RETURNING id,created_at`,
      [accountResult.rows[0].account_id],
    );

    io.to(`notifications-${accountResult.rows[0].account_id}`).emit(
      'new-notification',
      {
        id: notificationQuery2.rows[0].id,
        type: 'payment_received',
        message: 'You have received payment for a milestone',
        isRead: false,
        createdAt: notificationQuery2.rows[0].created_at,
        url: `/payments`,
      },
    );

    res.json({ status: true, message: 'Milestone completed' });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, message: 'Error completing milestone' });
  }
}
