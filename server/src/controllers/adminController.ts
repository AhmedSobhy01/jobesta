import { Request, Response } from 'express';
import db from '../db/db.js';

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await db.query('SELECT * FROM categories');
    res.json({
      status: true,
      message: 'Categories fetched',
      data: { categories: categories.rows },
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
