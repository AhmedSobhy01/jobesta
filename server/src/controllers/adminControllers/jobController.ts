import { Request, Response } from 'express';
import db from '../../db/db.js';

export async function getJobs(req: Request, res: Response): Promise<void> {
  try {
    let queryString = `
      SELECT
        j.id,
        j.status,
        j.budget,
        j.duration,
        j.title,
        j.description,
        j.created_at,
        client.first_name AS client_first_name,
        client.last_name AS client_last_name,
        client.username AS client_username,
        client.profile_picture AS client_profile_picture,
        c.id AS category_id,
        c.name AS category_name,
        c.description AS category_description,
        COUNT(p.job_id) AS proposals_count,
        f.account_id AS freelancer_account_id,
        freelancer.first_name AS freelancer_first_name,
        freelancer.last_name AS freelancer_last_name,
        freelancer.username AS freelancer_username
      FROM jobs j
      LEFT JOIN categories c ON c.id = j.category_id
      INNER JOIN accounts client ON client.id = j.client_id
      LEFT JOIN proposals p ON p.job_id = j.id
      LEFT JOIN freelancers f ON f.id = p.freelancer_id AND p.status = 'accepted'
      LEFT JOIN accounts freelancer ON freelancer.id = f.account_id
    `;
    let countQuery = `
      SELECT COUNT(*)
      FROM jobs j
      LEFT JOIN categories c ON c.id = j.category_id
      INNER JOIN accounts client ON client.id = j.client_id
      LEFT JOIN proposals p ON p.job_id = j.id
      LEFT JOIN freelancers f ON f.id = p.freelancer_id AND p.status = 'accepted'
      LEFT JOIN accounts freelancer ON freelancer.id = f.account_id
    `;
    const queryParams: string[] = [];

    if (req.query.search) {
      const searchCondition = `j.title ILIKE $1 OR j.description ILIKE $1 OR client.first_name ILIKE $1 OR client.last_name ILIKE $1 OR client.username ILIKE $1 OR freelancer.username ILIKE $1 OR CONCAT(client.first_name, ' ', client.last_name) ILIKE $1 OR CONCAT(freelancer.first_name, ' ', freelancer.last_name) ILIKE $1`;
      queryParams.push(`%${req.query.search.toString()}%`);

      queryString += ` WHERE (${searchCondition})`;
      countQuery += ` WHERE (${searchCondition})`;
    }

    if (req.query.status) {
      const statusCondition = `j.status = $${queryParams.length + 1}`;
      queryParams.push(req.query.status.toString());

      queryString +=
        queryParams.length === 1
          ? ` WHERE ${statusCondition}`
          : ` AND ${statusCondition}`;
      countQuery +=
        queryParams.length === 1
          ? ` WHERE ${statusCondition}`
          : ` AND ${statusCondition}`;
    }

    queryString += `
      GROUP BY j.id, client.id, c.id, f.id, freelancer.id
      ORDER BY j.created_at DESC
    `;

    const limit = parseInt(process.env.ADMIN_PAGINATION_LIMIT || '10');

    const totalItemsQuery = await db.query(countQuery, queryParams);
    const totalItems = parseInt(totalItemsQuery.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const page =
      parseInt(req.query.page as string) > 0 &&
      parseInt(req.query.page as string) <= totalPages
        ? parseInt(req.query.page as string)
        : 1;
    const offset = (page - 1) * limit;

    queryString += ` LIMIT ${limit} OFFSET ${offset}`;

    const jobsQuery = await db.query(queryString, queryParams);

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
          name: job.category_name,
          description: job.category_description,
        },
        proposalsCount: job.proposals_count,
        createdAt: job.created_at,
        client: {
          firstName: job.client_first_name,
          lastName: job.client_last_name,
          username: job.client_username,
          profilePicture:
            job.client_profile_picture ||
            'https://ui-avatars.com/api/?name=' +
              job.client_first_name +
              '+' +
              job.client_last_name,
        },
        freelancer: job.freelancer_username
          ? {
              username: job.freelancer_username,
              firstName: job.freelancer_first_name,
              lastName: job.freelancer_last_name,
            }
          : null,
      };
    });

    res.json({
      status: true,
      message: 'Jobs retrieved',
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          perPage: limit,
        },
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error retrieving jobs' });
  }
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const { title, description, category, budget, duration } = req.body;

  try {
    await db.query(
      'UPDATE jobs SET title = $1, description = $2, category_id = $3, budget = $4, duration = $5 WHERE id = $6',
      [title, description, category, budget, duration, req.params.jobId],
    );

    res.status(200).json({
      status: true,
      message: 'Job updated',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error updating job' });
  }
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  try {
    await db.query('DELETE FROM jobs WHERE id = $1', [req.params.jobId]);

    res.status(200).json({
      status: true,
      message: 'Job deleted',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting job' });
  }
}

export async function closeJob(req: Request, res: Response) {
  try {
    await db.query('UPDATE jobs SET status = $1 WHERE id = $2', [
      'closed',
      req.params.jobId,
    ]);

    await db.query('UPDATE proposals SET status = $1 WHERE job_id = $2', [
      'rejected',
      req.params.jobId,
    ]);

    res.status(200).json({
      status: true,
      message: 'Job closed',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error closing job' });
  }
}

export async function reopenJob(req: Request, res: Response) {
  try {
    await db.query('UPDATE jobs SET status = $1 WHERE id = $2', [
      'pending',
      req.params.jobId,
    ]);

    await db.query('UPDATE proposals SET status = $1 WHERE job_id = $2', [
      'pending',
      req.params.jobId,
    ]);

    res.status(200).json({
      status: true,
      message: 'Job reopened',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error reopening job' });
  }
}

export async function approveJob(req: Request, res: Response) {
  try {
    await db.query('UPDATE jobs SET status = $1 WHERE id = $2', [
      'open',
      req.params.jobId,
    ]);

    res.status(200).json({
      status: true,
      message: 'Job approved',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Error approving job' });
  }
}
