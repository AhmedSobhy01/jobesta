import { Request, Response } from 'express';
import db from '../db/db.js';
import { IJob, IProposal } from '../models/model.js';

export async function createJob(req: Request, res: Response): Promise<void> {
  const { title, description, category, budget, duration } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO jobs (title, description, category_id, budget, duration, client_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [title, description, category, budget, duration, req.user!.id],
    );

    res.status(201).json({
      status: true,
      message: 'Job created',
      data: {
        jobId: result.rows[0].id,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating job' });
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

export async function getJobs(req: Request, res: Response): Promise<void> {
  let queryString =
    "SELECT j.id, j.status, j.budget, j.duration, j.title, j.description, j.created_at, client.first_name, client.last_name, client.username, client.profile_picture,c.id category_id,c.name ,c.description category_description FROM jobs j LEFT JOIN categories c ON c.id = j.category_id INNER JOIN accounts client ON client.id = j.client_id WHERE status = 'open' ";

  let countQuery = "SELECT COUNT(*) FROM jobs j WHERE status = 'open' ";

  if (Array.isArray(req.query.categories) && req.query.categories.length) {
    queryString += `AND category_id IN (${req.query.categories.join(',')}) `;
    countQuery += `AND category_id IN (${req.query.categories.join(',')}) `;
  }

  if (req.query.minBudget) {
    queryString += `AND budget >=  ${req.query.minBudget} `;
    countQuery += `AND budget >=  ${req.query.minBudget} `;
  }

  if (req.query.maxBudget) {
    queryString += `AND budget <=  ${req.query.maxBudget} `;
    countQuery += `AND budget <=  ${req.query.maxBudget} `;
  }

  if (req.query.sortBy) {
    queryString += `ORDER BY j.${req.query.sortBy} `;

    if (req.query.sortOrder) queryString += `${req.query.sortOrder} `;
  } else {
    queryString += 'ORDER BY j.created_at DESC ';
  }

  const limit = parseInt(process.env.PAGINATION_LIMIT || '10');

  const totalItemsQuery = await db.query(countQuery);
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
          profilePicture:
            job.profile_picture ||
            'https://ui-avatars.com/api/?name=' +
              job.first_name +
              '+' +
              job.last_name,
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
      'SELECT j.id, j.status, j.budget, j.duration, j.title, j.description, j.created_at,j.client_id, client.first_name, client.last_name, client.username, client.profile_picture,c.id category_id,c.name ,c.description category_description FROM jobs j LEFT JOIN categories c ON c.id = j.category_id JOIN accounts client ON client.id = j.client_id WHERE j.id = $1 ',
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
        profilePicture:
          jobQuery.rows[0].profile_picture ||
          'https://ui-avatars.com/api/?name=' +
            jobQuery.rows[0].first_name +
            '+' +
            jobQuery.rows[0].last_name,
      },
      myProposal: null,
      myJob: false,
      proposals: [],
    };

    if (req.user && req.user.role == 'freelancer') {
      const proposalQuery = await db.query(
        `SELECT p.cover_letter, p.status, p.created_at, m.order milestone_order, m.status milestone_status, m.name, m.duration, m.amount, a.username, a.first_name, a.last_name, a.profile_picture 
        FROM proposals p 
        LEFT JOIN milestones m ON p.job_id = m.job_id AND p.freelancer_id = m.freelancer_id 
        JOIN freelancers f ON p.freelancer_id = f.id
        JOIN accounts a ON f.account_id = a.id
        WHERE p.job_id = $1 AND p.freelancer_id = $2
        ORDER BY m.order ASC`,
        [req.params.id, req.user.freelancer!.id],
      );

      if (proposalQuery.rows.length > 0) {
        job.myProposal = {
          coverLetter: proposalQuery.rows[0].cover_letter,
          status: proposalQuery.rows[0].status,
          createdAt: proposalQuery.rows[0].created_at,
          freelancer: {
            id: req.user.freelancer!.id,
            username: proposalQuery.rows[0].username,
            firstName: proposalQuery.rows[0].first_name,
            lastName: proposalQuery.rows[0].last_name,
            profilePicture:
              proposalQuery.rows[0].profile_picture ||
              'https://ui-avatars.com/api/?name=' +
                proposalQuery.rows[0].first_name +
                '+' +
                proposalQuery.rows[0].last_name,
          },
          milestones: proposalQuery.rows.map((row) => ({
            order: row.milestone_order,
            status: row.milestone_status,
            duration: row.duration,
            amount: row.amount,
            name: row.name,
          })),
        };
      }
    }

    const reviewss = await db.query(
      `
        SELECT * FROM reviews WHERE job_id = $1
        `,
      [req.params.id],
    );

    job.reviews = await Promise.all(
      reviewss.rows?.map(async (review) => {
        const result = await db.query(`SELECT * FROM accounts WHERE id = $1`, [
          review.account_id,
        ]);

        return {
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          sender: {
            firstName: result.rows[0]?.first_name,
            lastName: result.rows[0]?.last_name,
            username: result.rows[0]?.username,
            role: result.rows[0]?.role,
            profilePicture:
              result.rows[0]?.profile_picture ||
              `https://ui-avatars.com/api/?name=${result.rows[0]?.first_name}+${result.rows[0]?.last_name}`,
          },
        };
      }),
    );

    if (req.user && (req.user.role === 'client' || req.user.role === 'admin')) {
      if (
        req.user.role === 'client' &&
        jobQuery.rows[0].client_id === req.user.id
      ) {
        job.myJob = true;
      }

      const proposalQuery = await db.query(
        `SELECT p.job_id, p.freelancer_id, p.status, p.cover_letter, p.created_at, a.username, a.first_name, a.last_name, a.profile_picture, m.order milestone_order, m.status milestone_status, m.name, m.duration, m.amount 
      FROM proposals p 
      JOIN jobs j ON p.job_id = j.id 
      JOIN freelancers f ON p.freelancer_id = f.id
      JOIN milestones m ON m.job_id = j.id AND m.freelancer_id = f.id 
      JOIN accounts a ON f.account_id = a.id
      WHERE p.job_id = $1 ${req.user.role === 'client' ? 'AND j.client_id = $2' : ''}
      ORDER BY m.order ASC`,
        req.user.role === 'client'
          ? [req.params.id, req.user.id]
          : [req.params.id],
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
              id: proposal.freelancer_id,
              username: proposal.username,
              firstName: proposal.first_name,
              lastName: proposal.last_name,
              profilePicture:
                proposal.profile_picture ||
                `https://ui-avatars.com/api/?name=${proposal.first_name}+${proposal.last_name}`,
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

export async function acceptProposal(req: Request, res: Response) {
  try {
    const jobId = req.params.jobId;
    const freelancerId = req.params.freelancerId;

    await db.query('UPDATE proposals SET status = $1 WHERE job_id = $2', [
      'rejected',
      jobId,
    ]);

    await db.query(
      'UPDATE proposals SET status = $1 WHERE job_id = $2 AND freelancer_id = $3',
      ['accepted', jobId, freelancerId],
    );

    await db.query('UPDATE jobs SET status = $1 WHERE id = $2', [
      'in_progress',
      jobId,
    ]);

    // Send notification to accepted freelancer
    const accountResult = await db.query(
      'SELECT account_id FROM freelancers WHERE id = $1',
      [freelancerId],
    );

    await db.query(
      `INSERT INTO notifications (type, message, account_id, url)
      VALUES ('proposal_accepted', 'Your proposal has been accepted', $1, $2)`,
      [accountResult.rows[0].account_id, `/jobs/${jobId}/manage`],
    );

    // Send notification to rejected freelancers
    const result = await db.query(
      'SELECT freelancers.account_id FROM proposals JOIN freelancers ON proposals.freelancer_id = freelancers.id WHERE job_id = $1 AND status = $2',
      [jobId, 'rejected'],
    );

    const rejectedFreelancers = result.rows.map((row) => row.account_id);

    for (const id of rejectedFreelancers) {
      await db.query(
        `INSERT INTO notifications (type, message, account_id, url)
        VALUES ('proposal_rejected', 'Your proposal has been rejected', $1, $2)`,
        [id, `/jobs/${jobId}`],
      );
    }

    res.status(200).json({
      status: true,
      message: 'Proposal accepted',
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error accepting proposal' });
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
