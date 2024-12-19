import { Request, Response } from 'express';
import db from '../../db/db.js';

export async function getStatistics(req: Request, res: Response) {
  try {
    const totalDataQuery = await db.query(
      `SELECT
	  	(SELECT COUNT(*) FROM accounts WHERE role = 'client') AS total_clients, 
		(SELECT COUNT(*) FROM accounts WHERE role = 'freelancer') AS total_freelancers,
		(SELECT COUNT(*) FROM jobs) AS total_jobs, 
		(SELECT COUNT(*) FROM proposals) AS total_proposals, 
		(SELECT COUNT(*) FROM categories) AS total_categories, 
		(SELECT COUNT(*) FROM reviews) AS total_reviews, 
		(SELECT COUNT(*) FROM proposals WHERE status = 'accepted') AS total_accepted_proposals, 
		(SELECT COUNT(*) FROM jobs WHERE status = 'open') AS total_open_jobs, 
		(SELECT COUNT(*) FROM jobs WHERE status = 'completed') AS total_completed_jobs`,
    );

    res.json({
      status: true,
      message: 'Statistics fetched',
      data: {
        statistics: {
          totalClients: totalDataQuery.rows[0].total_clients,
          totalFreelancers: totalDataQuery.rows[0].total_freelancers,
          totalJobs: totalDataQuery.rows[0].total_jobs,
          totalProposals: totalDataQuery.rows[0].total_proposals,
          totalCategories: totalDataQuery.rows[0].total_categories,
          totalReviews: totalDataQuery.rows[0].total_reviews,
          totalAcceptedProposals:
            totalDataQuery.rows[0].total_accepted_proposals,
          totalOpenJobs: totalDataQuery.rows[0].total_open_jobs,
          totalCompletedJobs: totalDataQuery.rows[0].total_completed_jobs,
        },
      },
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Failed to fetch statistics' });
  }
}
