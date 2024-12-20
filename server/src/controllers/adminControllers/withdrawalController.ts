import { Request, Response } from 'express';
import db from '../../db/db.js';

export async function getWithdrawals(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    let queryString = `
      SELECT 
        w.*,
        a.username AS freelancer_username,
        a.first_name AS freelancer_first_name,
        a.last_name AS freelancer_last_name
      FROM withdrawals w 
      JOIN freelancers f ON w.freelancer_id = f.id 
      JOIN accounts a ON f.account_id = a.id
    `;
    let countString = 'SELECT COUNT(*) FROM withdrawals';
    const queryParams = [];

    if (req.query.status) {
      queryString += ' WHERE status = $1';
      countString += ' WHERE status = $1';
      queryParams.push(req.query.status as string);
    }

    const limit = parseInt(process.env.PAGINATION_LIMIT || '10');

    const totalItemsQuery = await db.query(countString, queryParams);
    const totalItems = parseInt(totalItemsQuery.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const page =
      parseInt(req.query.page as string) > 0 &&
      parseInt(req.query.page as string) <= totalPages
        ? parseInt(req.query.page as string)
        : 1;
    const offset = (page - 1) * limit;

    queryString += ` ORDER BY requested_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(queryString, queryParams);

    const withdrawals = result.rows.map((withdrawal) => {
      return {
        id: withdrawal.id,
        status: withdrawal.status,
        amount: withdrawal.amount,
        paymentMethod: withdrawal.payment_method,
        paymentUsername: withdrawal.payment_username,
        freelancer: {
          username: withdrawal.freelancer_username,
          firstName: withdrawal.freelancer_first_name,
          lastName: withdrawal.freelancer_last_name,
        },
        requestedAt: withdrawal.requested_at,
      };
    });

    res.status(200).json({
      status: true,
      data: {
        withdrawals,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          perPage: limit,
        },
      },
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching withdrawals' });
  }
}

export async function completeWithdrawal(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    await db.query('UPDATE withdrawals SET status = $1 WHERE id = $2', [
      'completed',
      req.params.id,
    ]);

    res.status(200).json({
      status: true,
      message: 'Withdrawal completed',
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error completing withdrawal' });
  }
}

export async function deleteWithdrawal(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    await db.query(
      'UPDATE freelancers SET balance = balance + (SELECT amount FROM withdrawals WHERE id = $1) WHERE id = (SELECT freelancer_id FROM withdrawals WHERE id = $2)',
      [req.params.id, req.params.id],
    );

    await db.query('DELETE FROM withdrawals WHERE id = $1', [req.params.id]);

    res.status(200).json({
      status: true,
      message: 'Withdrawal deleted',
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error deleting withdrawal' });
  }
}
