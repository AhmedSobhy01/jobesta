import { Request, Response } from 'express';
import db from './../db/db.js';

export async function getCategories(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const categories = await db.query('SELECT * FROM categories');
    console.log(categories.rows);
    res.json({
      success: true,
      message: 'Categories retrieved',
      data: {
        categories: categories.rows,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
    });
  }
}
