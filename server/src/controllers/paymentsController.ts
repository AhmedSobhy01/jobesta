import { Request, Response } from 'express';
import db from '../db/db.js';

export async function getPayments(req: Request, res: Response): Promise<void> {
  let queryString = null;

  const limit = parseInt(process.env.PAGINATION_LIMIT || '10');

  let totalItemsQuery = null;
  let totalItems = null;
  let totalPages = null;

  let page = null;

  try {
    const user = await db.query('SELECT * FROM accounts WHERE id = $1', [
      req.user!.id,
    ]);

    let result = null;

    if (user.rows[0].role === 'client') {
      queryString = `SELECT a.username, j.title, p.job_id, p.created_at, p.status, m.name, m.amount FROM payments p JOIN milestones m ON p.job_id = m.job_id AND p.freelancer_id = m.freelancer_id AND p.milestone_order = m.order JOIN jobs j ON p.job_id = j.id JOIN freelancers f ON f.id = p.freelancer_id JOIN accounts a ON f.account_id = a.id WHERE p.client_id = $1`;

      const countQuery = `SELECT COUNT(*) FROM payments p WHERE p.client_id = $1`;

      totalItemsQuery = await db.query(countQuery, [req.user!.id]);
      totalItems = parseInt(totalItemsQuery.rows[0].count);
      totalPages = Math.ceil(totalItems / limit);

      page =
        parseInt(req.query.page as string) > 0 &&
        parseInt(req.query.page as string) <= totalPages
          ? parseInt(req.query.page as string)
          : 1;
      const offset = (page - 1) * limit;

      queryString += ` LIMIT ${limit} OFFSET ${offset}`;

      result = await db.query(queryString, [req.user!.id]);
    } else if (user.rows[0].role === 'freelancer') {
      const myFreelancer = await db.query(
        'SELECT * FROM freelancers WHERE account_id = $1',
        [req.user!.id],
      );
      queryString = `SELECT a.username,j.title, p.job_id, p.created_at, p.status, m.name, m.amount FROM payments p JOIN milestones m ON p.job_id = m.job_id AND p.freelancer_id = m.freelancer_id AND p.milestone_order = m.order JOIN jobs j ON p.job_id = j.id JOIN accounts a ON a.id = p.client_id WHERE p.freelancer_id = $1`;

      const countQuery = `SELECT COUNT(*) FROM payments p WHERE p.freelancer_id = $1`;

      totalItemsQuery = await db.query(countQuery, [myFreelancer.rows[0].id]);
      totalItems = parseInt(totalItemsQuery.rows[0].count);
      totalPages = Math.ceil(totalItems / limit);

      page =
        parseInt(req.query.page as string) > 0 &&
        parseInt(req.query.page as string) <= totalPages
          ? parseInt(req.query.page as string)
          : 1;
      const offset = (page - 1) * limit;

      queryString += ` LIMIT ${limit} OFFSET ${offset}`;

      result = await db.query(queryString, [myFreelancer.rows[0].id]);
    }

    const payments = result?.rows.map((payment) => {
      return {
        jobTitle: payment.title,
        jobId: payment.job_id,
        username: payment.username,
        createdAt: payment.created_at,
        status: payment.status,
        milestoneName: payment.name,
        amount: payment.amount,
      };
    });
    res.status(201).json({
      status: true,
      message: 'Payments retrieved',
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          perPage: limit,
        },
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error getting payments' });
  }
}
