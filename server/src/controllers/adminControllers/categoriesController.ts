import { Request, Response } from 'express';
import db from '../../db/db.js';

export async function getCategories(req: Request, res: Response) {
  try {
    let categoriesQueryString = 'SELECT * FROM categories';
    const countQuery = 'SELECT COUNT(*) FROM categories';

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

    categoriesQueryString += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(categoriesQueryString);

    const categories = result.rows.map((category) => {
      return {
        id: category.id,
        name: category.name,
        description: category.description,
      };
    });

    res.json({
      status: true,
      message: 'Categories fetched',
      data: {
        categories,
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
      message: 'An error occurred while fetching categories',
    });
  }
}

export async function createCategory(req: Request, res: Response) {
  const { name, description } = req.body;

  try {
    await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2)',
      [name, description],
    );
    res.json({ status: true, message: 'Category created' });
  } catch {
    res.status(500).json({
      status: false,
      message: 'An error occurred while creating category',
    });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ status: true, message: 'Category deleted' });
  } catch {
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting category',
    });
  }
}
