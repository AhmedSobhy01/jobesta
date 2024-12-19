import { Request, Response } from 'express';
import db from '../../db/db.js';
import fs from 'fs/promises';

export async function getBadges(req: Request, res: Response) {
  try {
    let badgesQueryString = 'SELECT * FROM badges';
    const countQuery = 'SELECT COUNT(*) FROM badges';

    const limit = parseInt(process.env.ADMIN_PAGINATION_LIMIT || '10');

    const totalItemsQuery = await db.query(countQuery);
    const totalItems = parseInt(totalItemsQuery.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const page =
      parseInt(req.query.page as string) > 0 &&
      parseInt(req.query.page as string) <= totalPages
        ? parseInt(req.query.page as string)
        : 1;
    const offset = (page - 1) * limit;

    badgesQueryString += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(badgesQueryString);

    const badges = result.rows.map((badge) => {
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      };
    });

    res.json({
      status: true,
      message: 'Badges fetched',
      data: {
        badges,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          perPage: limit,
        },
      },
    });
  } catch {
    res.status(500).json({
      status: false,
      message: 'An error occurred while fetching badges',
    });
  }
}

export async function updateBadge(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    let updateQuery =
      'UPDATE badges SET name = $1, description = $2 WHERE id = $3';
    let queryParams = [name, description, id];

    if (req.file) {
      const oldBadgeIcon = await db.query(
        'SELECT icon FROM badges WHERE id = $1',
        [id],
      );
      await fs.unlink(oldBadgeIcon.rows[0].icon);
      const icon = req.file.path;
      updateQuery =
        'UPDATE badges SET name = $1, description = $2, icon = $3 WHERE id = $4';
      queryParams = [name, description, icon, id];
    }

    await db.query(updateQuery, queryParams);

    res.json({
      status: true,
      message: 'Badge updated',
    });
  } catch {
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating badge',
    });
  }
}
