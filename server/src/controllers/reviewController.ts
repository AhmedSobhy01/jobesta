import { Request, Response } from 'express';
import db from '../db/db.js';

export async function getRecentReviews(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const reviewsQuery = await db.query(
      `SELECT 
        reviews.id, 
        reviews.rating, 
        reviews.comment, 
        reviews.created_at, 
        reviews.job_id, 
        jobs.title AS job_title, 
        reviews.account_id, 
        accounts.first_name AS reviewer_first_name, 
        accounts.last_name AS reviewer_last_name, 
        accounts.username AS reviewer_username, 
        accounts.profile_picture AS reviewer_profile_picture 
      FROM reviews 
      INNER JOIN jobs ON reviews.job_id = jobs.id 
      INNER JOIN accounts ON reviews.account_id = accounts.id 
      WHERE jobs.client_id = reviews.account_id 
      ORDER BY reviews.created_at DESC 
      LIMIT 3`,
    );

    const reviews = reviewsQuery.rows.map((review) => {
      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        job: {
          id: review.job_id,
          title: review.job_title,
        },
        sender: {
          id: review.account_id,
          firstName: review.reviewer_first_name,
          lastName: review.reviewer_last_name,
          username: review.reviewer_username,
          profilePicture:
            review.reviewer_profile_picture ||
            'https://ui-avatars.com/api/?name=' +
              review.reviewer_first_name +
              '+' +
              review.reviewer_last_name,
        },
      };
    });

    res.json({
      status: true,
      message: 'Reviews retrieved',
      data: {
        reviews,
      },
    });
  } catch {
    res.status(500).json({
      status: false,
      message: 'Error retrieving reviews',
    });
  }
}

export async function createReview(req: Request, res: Response): Promise<void> {
  const { rating, comment } = req.body;

  try {
    if (comment) {
      await db.query(
        'INSERT INTO reviews (rating, comment, job_id, freelancer_id, account_id) VALUES ($1, $2, $3, $4, $5)',
        [
          rating,
          comment,
          req.params.jobId,
          req.params.freelancerId,
          req.user!.id,
        ],
      );
    } else {
      await db.query(
        'INSERT INTO reviews (rating, job_id, freelancer_id, account_id) VALUES ($1, $2, $3, $4)',
        [rating, req.params.jobId, req.params.freelancerId, req.user!.id],
      );
    }

    // Send notification to reviewed account
    if (req.user!.role === 'client') {
      const accountResult = await db.query(
        'SELECT account_id FROM freelancers WHERE id = $1',
        [req.params.freelancerId],
      );
      await db.query(
        `INSERT INTO notifications (type, message, account_id, url)
        VALUES ('review_received', 'You have received a review', $1, $2)`,
        [accountResult.rows[0].account_id, `/jobs/${req.params.jobId}`],
      );
    } else {
      const accountResult = await db.query(
        'SELECT client_id FROM jobs WHERE id = $1',
        [req.params.jobId],
      );
      await db.query(
        `INSERT INTO notifications (type, message, account_id, url)
        VALUES ('review_received', 'You have received a review', $1, $2)`,
        [accountResult.rows[0].client_id, `/jobs/${req.params.jobId}`],
      );
    }

    res.status(201).json({
      status: true,
      message: 'Review created',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating review' });
  }
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  try {
    await db.query(
      'DELETE FROM reviews WHERE job_id = $1 AND freelancer_id = $2 AND account_id = $3',
      [req.params.jobId, req.params.freelancerId, req.user!.id],
    );

    res.status(201).json({
      status: true,
      message: 'Review deleted',
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting review' });
  }
}
