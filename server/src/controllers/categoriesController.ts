import { Request, Response } from 'express';
import db from './../db/db.js';

export async function getCategories(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const categoriesQuery = await db.query(`
      SELECT c.id, c.name, c.description, COUNT(j.id) as jobs_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id
      WHERE j.status = 'open'
      GROUP BY c.id, c.name, c.description
    `);

    const categories = categoriesQuery.rows.map((category) => {
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        jobsCount: category.jobs_count,
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
