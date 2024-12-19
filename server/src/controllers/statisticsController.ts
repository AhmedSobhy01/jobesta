import { Request, Response } from 'express';
import db from '../db/db';

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const statistics = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM accounts WHERE role = 'client') AS clients_count,
        (SELECT COUNT(*) FROM accounts WHERE role = 'freelancer') AS freelancers_count,
        (SELECT COUNT(*) FROM jobs) AS jobs_count
      `,
    );

    res.status(200).json({
      status: true,
      message: 'Statistics fetched successfully',
      data: {
        clientsCount: statistics.rows[0].clients_count,
        freelancersCount: statistics.rows[0].freelancers_count,
        jobsCount: statistics.rows[0].jobs_count,
      },
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Failed to get statistics' });
  }
};
