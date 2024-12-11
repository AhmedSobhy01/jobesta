import { Request, Response } from 'express';
import db from '../../db/db.js';

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

export async function deleteBadge(req: Request, res: Response) {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM badges WHERE id = $1', [id]);
    res.json({ status: true, message: 'Badge deleted' });
  } catch {
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting badge',
    });
  }
}
