import { Request, Response } from 'express';
import db from './../db/db.js';

export async function getCategories(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const categoriesQuery = await db.query('SELECT * FROM categories');
    const categories = categoriesQuery.rows.map((category) => {
      return {
        id: category.id,
        name: category.name,
        description: category.description,
      };
    });
    res.json({
      success: true,
      message: 'Categories retrieved',
      data: {
        categories,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
    });
  }
}
