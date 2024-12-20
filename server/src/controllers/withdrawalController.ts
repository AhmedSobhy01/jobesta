import { Request, Response } from 'express';
import db from '../db/db.js';

export async function getWithdrawals(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const limit = parseInt(process.env.PAGINATION_LIMIT || '10');

    const totalItemsQuery = await db.query(
      'SELECT COUNT(*) FROM withdrawals WHERE freelancer_id = $1',
      [req.user!.freelancer!.id],
    );
    const totalItems = parseInt(totalItemsQuery.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const page =
      parseInt(req.query.page as string) > 0 &&
      parseInt(req.query.page as string) <= totalPages
        ? parseInt(req.query.page as string)
        : 1;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT * FROM withdrawals WHERE freelancer_id = $1 ORDER BY requested_at DESC LIMIT $2 OFFSET $3`,
      [req.user!.freelancer!.id, limit, offset],
    );

    const withdrawals = result.rows.map((withdrawal) => {
      return {
        id: withdrawal.id,
        status: withdrawal.status,
        amount: withdrawal.amount,
        paymentMethod: withdrawal.payment_method,
        paymentUsername: withdrawal.payment_username,
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

export async function createWithdrawal(
  req: Request,
  res: Response,
): Promise<void> {
  const { amount, paymentMethod, paymentUsername } = req.body;

  try {
    await db.query(
      'INSERT INTO withdrawals (amount, payment_method, payment_username, freelancer_id) VALUES ($1, $2, $3, $4)',
      [amount, paymentMethod, paymentUsername, req.user!.freelancer!.id],
    );

    await db.query(
      'UPDATE freelancers SET balance = balance - $1 WHERE id = $2',
      [amount, req.user!.freelancer!.id],
    );

    res.status(201).json({
      status: true,
      message: 'Withdrawal created',
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error creating withdrawal' });
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
