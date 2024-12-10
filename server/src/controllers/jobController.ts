import { Request, Response } from 'express';
import db from '../db/db.js';
import { IJob, IProposal } from '../models/model.js';

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

  if (req.query.category)
    queryString += `AND category_id = ${req.query.category} `;

  if (req.query.minBudget)
    queryString += `AND budget >=  ${req.query.minBudget} `;

  if (req.query.maxBudget)
    queryString += `AND budget <=  ${req.query.maxBudget} `;

  if (req.query.sortBy) {
    queryString += `ORDER BY ${req.query.sortBy} `;

    if (req.query.sortOrder) queryString += `${req.query.sortOrder} `;
  }

  const limit = parseInt(process.env.PAGE_LIMIT || '10');

  const totalItemsQuery = await db.query(
    "SELECT COUNT(*) FROM jobs WHERE status = 'open'",
  );
  const totalItems = parseInt(totalItemsQuery.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  const page =
    parseInt(req.query.page as string) > 0 &&
    parseInt(req.query.page as string) <= totalPages
      ? parseInt(req.query.page as string)
      : 1;
  const offset = (page - 1) * limit;

  queryString += `LIMIT ${limit} OFFSET ${offset}`;

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
        createdAt: job.created_at,
        client: {
          firstName: job.first_name,
          lastName: job.last_name,
          username: job.username,
          profilePicture: job.profile_picture,
        },
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

export async function getJobById(req: Request, res: Response) {
  try {
    const jobQuery = await db.query(
      'SELECT j.id, j.status, j.budget, j.duration, j.title, j.description, j.created_at,j.client_id, client.first_name, client.last_name, client.username, client.profile_picture,c.id category_id,c.name ,c.description category_description FROM jobs j JOIN categories c ON c.id = j.category_id JOIN accounts client ON client.id = j.client_id WHERE j.id = $1 ',
      [req.params.id],
    );

    if (jobQuery.rows.length === 0) {
      res.status(404).json({ status: false, message: 'Job not found' });
      return;
    }

    const job: IJob = {
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
      createdAt: jobQuery.rows[0].created_at,
      client: {
        firstName: jobQuery.rows[0].first_name,
        lastName: jobQuery.rows[0].last_name,
        username: jobQuery.rows[0].username,
        profilePicture: jobQuery.rows[0].profile_picture,
      },
      myJob: false,
      proposals: [],
    };

    if (
      req.user &&
      req.user.role == 'client' &&
      jobQuery.rows[0].client_id == req.user.id
    ) {
      job.myJob = true;

      const proposalQuery = await db.query(
        `SELECT p.job_id, p.freelancer_id, p.status, p.cover_letter, p.created_at, a.username, a.first_name, a.last_name, a.profile_picture, m.order milestone_order, m.status milestone_status, m.name, m.duration,m.amount  FROM proposals p 
        JOIN jobs j ON p.job_id = j.id 
        JOIN freelancers f ON p.freelancer_id = f.id
        JOIN milestones m ON m.job_id = j.id and m.freelancer_id = f.id 
        JOIN accounts a ON f.account_id = a.id
        WHERE p.job_id = $1 AND j.client_id = $2`,
        [req.params.id, req.user.id],
      );

      const proposalsObject = proposalQuery.rows.reduce<
        Record<string, IProposal>
      >((acc, proposal) => {
        if (!acc[proposal.freelancer_id]) {
          acc[proposal.freelancer_id] = {
            status: proposal.status,
            coverLetter: proposal.cover_letter,
            createdAt: proposal.created_at,
            freelancer: {
              username: proposal.username,
              firstName: proposal.first_name,
              lastName: proposal.last_name,
              profilePicture: proposal.profile_picture,
            },
            milestones: [],
          };
        }

        acc[proposal.freelancer_id].milestones!.push({
          order: proposal.milestone_order,
          status: proposal.milestone_status,
          duration: proposal.duration,
          amount: proposal.amount,
          name: proposal.name,
        });

        return acc;
      }, {});

      job.proposals = Object.values(proposalsObject);
    }

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
