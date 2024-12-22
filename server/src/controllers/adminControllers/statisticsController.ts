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
		(SELECT COUNT(*) FROM jobs WHERE status = 'completed') AS total_completed_jobs,
    (SELECT MIN(budget) FROM jobs WHERE status = 'open' OR status = 'in_progress' OR status = 'completed') AS min_budget,
    (SELECT MAX(budget) FROM jobs WHERE status = 'open' OR status = 'in_progress' OR status = 'completed') AS max_budget,
    (SELECT AVG(budget) FROM jobs WHERE status = 'open' OR status = 'in_progress' OR status = 'completed') AS avg_budget`,
    );

    const jobsPerCategoryQuery = await db.query(
      `SELECT c.name, COUNT(j.id) as jobs_count
      FROM jobs j
      LEFT JOIN categories c ON c.id = j.category_id
      GROUP BY c.name`,
    );

    const paymentsPerMonthQuery = await db.query(
      `WITH
        months AS (
          SELECT generate_series(
              date_trunc('month', CURRENT_DATE) - interval '5 months', date_trunc('month', CURRENT_DATE), interval '1 month'
            ) AS MONTH
        ),
        paymentsPerMonth AS (
          SELECT date_trunc('month', p.created_at) AS MONTH, sum(m.amount) AS total_price
          FROM
            payments p
            JOIN milestones m ON p.job_id = m.job_id
            AND p.freelancer_id = m.freelancer_id
            AND p.milestone_order = m.order
          WHERE
            p.created_at >= date_trunc('month', CURRENT_DATE) - interval '6 months'
          GROUP BY
            MONTH
        )
      SELECT m.month, COALESCE(pp.total_price, 0) AS total_price
      FROM months m
        LEFT JOIN paymentsPerMonth pp ON m.month = pp.month
      ORDER BY m.month ASC`,
    );

    const freelancerBadgesCountQuery = await db.query(
      `SELECT badges.name as badge_name,COUNT(badge_freelancer.freelancer_id) as freelancers_count 
      FROM badges
      LEFT JOIN badge_freelancer ON badges.id = badge_freelancer.badge_id
      GROUP BY badges.name`,
    );

    const freelancerBadgesCount = freelancerBadgesCountQuery.rows.map(
      (badge) => {
        return {
          badgeName: badge.badge_name,
          freelancersCount: badge.freelancers_count,
        };
      },
    );

    const jobsPerCategory = jobsPerCategoryQuery.rows.map((category) => {
      return {
        name: category.name || 'Uncategorized',
        jobsCount: category.jobs_count,
      };
    });

    const paymentsPerMonth = paymentsPerMonthQuery.rows.map((payment) => {
      return {
        month: payment.month,
        totalPrice: payment.total_price,
      };
    });

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
          minBudget: totalDataQuery.rows[0].min_budget,
          maxBudget: totalDataQuery.rows[0].max_budget,
          avgBudget: totalDataQuery.rows[0].avg_budget,
          jobsPerCategory,
          paymentsPerMonth,
          freelancerBadgesCount,
        },
      },
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Failed to fetch statistics' });
  }
}
