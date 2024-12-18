import { Request, Response } from 'express';
import db from '../../db/db.js';
import fs from 'fs/promises';

export async function getBadges(req: Request, res: Response) {
  try {
    const badges = await db.query('SELECT * FROM badges');
    res.json({
      status: true,
      message: 'Badges fetched',
      data: { badges: badges.rows },
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
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating badge',
    });
  }
}
