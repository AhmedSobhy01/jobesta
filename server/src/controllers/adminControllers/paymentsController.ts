import { Request, Response } from 'express';
import db from '../../db/db.js';

export async function getPaymentsForAccount(req: Request, res: Response) {
  try {
    const { accountId } = req.params;

    const accountQuery = await db.query(
      'SELECT * FROM accounts WHERE id = $1',
      [accountId],
    );

    const paymentsQuery = `
      SELECT
        payments.status,
        jobs.id AS job_id,
        jobs.title,
        af.username AS freelancer_username,
        af.first_name AS freelancer_first_name,
        af.last_name AS freelancer_last_name,
        ac.username AS client_username,
        ac.first_name AS client_first_name,
        ac.last_name AS client_last_name,
        milestones.name AS milestone_name,
        milestones.amount,
        payments.stripe_id,
        payments.created_at
      FROM payments
      JOIN jobs ON payments.job_id = jobs.id
      JOIN freelancers ON payments.freelancer_id = freelancers.id
      JOIN accounts af ON freelancers.account_id = af.id
      JOIN accounts ac ON payments.client_id = ac.id
      JOIN milestones ON payments.job_id = milestones.job_id AND payments.freelancer_id = milestones.freelancer_id AND payments.milestone_order = milestones.order
      ${accountQuery.rows[0].role === 'freelancer' ? ' WHERE payments.freelancer_id = (SELECT id FROM freelancers WHERE account_id = $1)' : ' WHERE payments.client_id = $1'}
    `;

    const paymentsResult = await db.query(paymentsQuery, [accountId]);

    const payments = paymentsResult.rows.map((payment) => ({
      status: payment.status,
      amount: payment.amount,
      job: {
        id: payment.job_id,
        title: payment.title,
      },
      freelancer: {
        username: payment.freelancer_username,
        firstName: payment.freelancer_first_name,
        lastName: payment.freelancer_last_name,
      },
      client: {
        username: payment.client_username,
        firstName: payment.client_first_name,
        lastName: payment.client_last_name,
      },
      milestoneName: payment.milestone_name,
      stripeId: payment.stripe_id,
      createdAt: payment.created_at,
    }));

    res.status(200).json({ status: true, data: { payments } });
  } catch {
    res.status(500).json({ status: false, message: 'Failed to get payments' });
  }
}
