import { Request, Response } from 'express';
import db from '../db/db.js';

export async function completeMilestone(req: Request, res: Response) {
  const { jobId, freelancerId, milestoneOrder } = req.params;

  try {
    await db.query(
      'UPDATE milestones SET status = $1 WHERE job_id = $2 AND freelancer_id = $3 AND "order" = $4',
      ['completed', jobId, freelancerId, milestoneOrder],
    );

    res.json({ status: true, message: 'Milestone completed' });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error completing milestone' });
  }
}
