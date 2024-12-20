import { Request, Response } from 'express';
import db from '../../db/db.js';

export const getJobReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await db.query(
      `
        SELECT
          r.id AS review_id,
          r.rating,
          r.comment,
          r.created_at,
          a.id AS account_id,
          a.username AS account_username,
          a.first_name AS account_first_name,
          a.last_name AS account_last_name,
          a.profile_picture AS account_profile_picture
        FROM reviews r
        JOIN accounts a ON r.account_id = a.id
        WHERE r.job_id = $1
        ORDER BY r.created_at DESC
      `,
      [req.params.jobId],
    );

    const reviews = result.rows.map((review) => ({
      id: review.review_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      sender: {
        username: review.account_username,
        firstName: review.account_first_name,
        lastName: review.account_last_name,
        profilePicture:
          review.account_profile_picture ||
          `https://ui-avatars.com/api/?name=${review.account_first_name}+${review.account_last_name}`,
      },
    }));

    res.status(200).json({
      status: true,
      message: 'Reviews fetched',
      data: { reviews },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: 'Error fetching reviews' });
  }
};

export async function updateReview(req: Request, res: Response) {
  try {
    const { rating, comment } = req.body;

    await db.query(
      'UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3',
      [rating, comment, req.params.reviewId],
    );

    res.json({ status: true, message: 'Review updated' });
  } catch {
    res.status(500).json({ status: false, message: 'Error updating review' });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    await db.query('DELETE FROM reviews WHERE id = $1', [req.params.reviewId]);

    res.json({ status: true, message: 'Review deleted' });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting review' });
  }
}
