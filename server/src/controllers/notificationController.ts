import { Request, Response } from 'express';
import db from '../db/db.js';

export async function getNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const account_id = req.user!.id;
  let queryString = `SELECT n.id, n.type, n.message, n.is_read, n.created_at FROM notifications n WHERE account_id = ${account_id}`;

  const countQuery = `SELECT COUNT(*) FROM notifications n WHERE account_id = ${account_id}`;

  const limit = parseInt(process.env.PAGINATION_LIMIT || '10');

  const totalItemsQuery = await db.query(countQuery);
  const totalItems = parseInt(totalItemsQuery.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  const page =
    parseInt(req.query.page as string) > 0 &&
    parseInt(req.query.page as string) <= totalPages
      ? parseInt(req.query.page as string)
      : 1;
  const offset = (page - 1) * limit;

  queryString += ` LIMIT ${limit} OFFSET ${offset}`;

  try {
    const notificationsQuery = await db.query(queryString);

    const notifications = notificationsQuery.rows.map((notification) => {
      return {
        type: notification.type,
        message: notification.message,
        isRead: notification.is_read,
        createdAt: notification.created_at,
      };
    });

    res.json({
      status: true,
      message: 'Notifications retrieved',
      data: {
        notifications,
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
      .json({ status: false, message: 'Error retrieving notifications' });
  }
}
