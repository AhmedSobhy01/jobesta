import { Request, Response } from 'express';
import db from '../db/db.js';

export async function createJob(req: Request, res: Response): Promise<void> {
  const { title, description, category, budget, duration } = req.body;
  try {
    const categoryQuery = await db.query(
      'SELECT id FROM categories WHERE name = $1',
      [category],
    );
    if (categoryQuery.rows.length === 0) {
      res.status(404).json({ status: false, message: 'Category not found' });
      return;
    }

    await db.query(
      'INSERT INTO jobs (title, description, category_id, budget, duration, client_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        title,
        description,
        categoryQuery.rows[0].id,
        budget,
        duration,
        req.user!.id,
      ],
    );
    res.status(201).json({ status: true, message: 'Job created' });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating job' });
  }
}

export async function getJobs(req: Request, res: Response): Promise<void> {
  let queryString = "SELECT * FROM jobs WHERE status = 'open' ";
  try {
    if (req.query.category) {
      const categoryQuery = await db.query(
        'SELECT id FROM categories WHERE name = $1',
        [req.query.category],
      );
      if (categoryQuery.rows.length === 0) {
        res.status(404).json({ status: false, message: 'Category not found' });
        return;
      }
      queryString += `AND category_id = ${categoryQuery.rows[0].id} `;
    }

    if (req.query.minBudget) {
      queryString += `AND budget >=  ${req.query.minBudget} `;
    }
    if (req.query.maxBudget) {
      queryString += `AND budget <=  ${req.query.maxBudget} `;
    }
    if (req.query.sortBy) {
      queryString += `ORDER BY ${req.query.sortBy} `;
      if (req.query.sortOrder) {
        queryString += `${req.query.sortOrder} `;
      }
    }

    const jobsQuery = await db.query(queryString);

    res.json({
      status: true,
      message: 'Jobs retrieved',
      data: {
        jobs: jobsQuery.rows,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Error retrieving jobs' });
  }
}

export async function getJobById(req: Request, res: Response) {
  try {
    const jobQuery = await db.query('SELECT * FROM jobs WHERE id = $1', [
      req.params.id,
    ]);
    if (jobQuery.rows.length === 0) {
      res.status(404).json({ status: false, message: 'Job not found' });
      return;
    }
    res.json({
      status: true,
      message: 'Job retrieved',
      data: {
        job: jobQuery.rows[0],
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error retrieving job' });
  }
}
