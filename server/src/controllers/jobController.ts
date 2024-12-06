import { Request, Response } from 'express';
import db from '../db/db.js';

export async function createJob(req: Request, res: Response): Promise<void> {
  const { title, description, category, budget, duration } = req.body;
  try {
    await db.query(
      'INSERT INTO jobs (title, description, category_id, budget, duration, client_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [title, description, category, budget, duration, req.user!.id],
    );
    res.status(201).json({ status: true, message: 'Job created' });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating job' });
  }
}

export async function getJobs(req: Request, res: Response): Promise<void> {
  let queryString =
    "SELECT j.id, j.status, j.budget, j.duration, j.title, j.description, j.created_at, client.first_name, client.last_name, client.username, client.profile_picture,c.id category_id,c.name ,c.description category_description FROM jobs j JOIN categories c ON c.id = j.category_id JOIN accounts client ON client.id = j.client_id WHERE status = 'open' ";

  if (req.query.category) {
    queryString += `AND category_id = ${req.query.category} `;
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

  try {
    const jobsQuery = await db.query(queryString);

    const jobs = jobsQuery.rows.map((job) => {
      return {
        id: job.id,
        status: job.status,
        budget: job.budget,
        duration: job.duration,
        title: job.title,
        description: job.description,
        category: {
          id: job.category_id,
          name: job.name,
          description: job.category_description,
        },
        createAt: job.created_at,
        client: {
          first_name: job.first_name,
          last_name: job.last_name,
          username: job.username,
          profile_picture: job.profile_picture,
        },
      };
    });

    res.json({
      status: true,
      message: 'Jobs retrieved',
      data: {
        jobs,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error retrieving jobs' });
  }
}

export async function getJobById(req: Request, res: Response) {
  try {
    const jobQuery = await db.query(
      'SELECT j.id, j.status, j.budget, j.duration, j.title, j.description, j.created_at, client.first_name, client.last_name, client.username, client.profile_picture,c.id category_id,c.name ,c.description category_description FROM jobs j JOIN categories c ON c.id = j.category_id JOIN accounts client ON client.id = j.client_id WHERE j.id = $1 ',
      [req.params.id],
    );
    if (jobQuery.rows.length === 0) {
      res.status(404).json({ status: false, message: 'Job not found' });
      return;
    }
    const job = {
      id: jobQuery.rows[0].id,
      status: jobQuery.rows[0].status,
      budget: jobQuery.rows[0].budget,
      duration: jobQuery.rows[0].duration,
      title: jobQuery.rows[0].title,
      description: jobQuery.rows[0].description,
      category: {
        id: jobQuery.rows[0].category_id,
        name: jobQuery.rows[0].name,
        description: jobQuery.rows[0].category_description,
      },
      createAt: jobQuery.rows[0].created_at,
      client: {
        first_name: jobQuery.rows[0].first_name,
        last_name: jobQuery.rows[0].last_name,
        username: jobQuery.rows[0].username,
        profile_picture: jobQuery.rows[0].profile_picture,
      },
    };

    res.json({
      status: true,
      message: 'Job retrieved',
      data: {
        job,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error retrieving job' });
  }
}
