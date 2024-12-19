import { Request, Response } from 'express';
import db from '../../db/db.js';
import { IMilestone, IProposal } from '../../models/model.js';

export const getJobProposals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await db.query(
      `
        SELECT
          p.status proposal_status,
          p.cover_letter cover_letter,
          p.created_at,
          f.id AS freelancer_id ,
          a.username freelancer_username,
          a.first_name freelancer_first_name,
          a.last_name freelancer_last_name,
          a.profile_picture freelancer_profile_picture,
          m.order milestone_order,
          m.status milestone_status,
          m.duration milestone_duration,
          m.amount milestone_amount,
          m.name milestone_name
        FROM proposals p
        JOIN freelancers f ON p.freelancer_id = f.id
        JOIN accounts a ON f.account_id = a.id
        JOIN milestones m ON p.job_id = m.job_id AND p.freelancer_id = m.freelancer_id
        WHERE p.job_id = $1
        ORDER BY created_at DESC
      `,
      [req.params.jobId],
    );

    const proposalsObject = result.rows.reduce<Record<string, IProposal>>(
      (acc, proposal) => {
        if (!acc[proposal.freelancer_id]) {
          acc[proposal.freelancer_id] = {
            status: proposal.proposal_status,
            coverLetter: proposal.cover_letter,
            createdAt: proposal.created_at,
            freelancer: {
              id: proposal.freelancer_id,
              username: proposal.freelancer_username,
              firstName: proposal.freelancer_first_name,
              lastName: proposal.freelancer_last_name,
              profilePicture:
                proposal.freelancer_profile_picture ||
                `https://ui-avatars.com/api/?name=${proposal.freelancer_first_name}+${proposal.freelancer_last_name}`,
            },
            milestones: [],
          };
        }

        acc[proposal.freelancer_id].milestones!.push({
          order: proposal.milestone_order,
          status: proposal.milestone_status,
          duration: proposal.milestone_duration,
          amount: proposal.milestone_amount,
          name: proposal.milestone_name,
        });

        return acc;
      },
      {},
    );

    res.status(200).json({
      status: true,
      message: 'Proposals fetched',
      data: {
        proposals: Object.values(proposalsObject),
      },
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error fetching proposals' });
  }
};

export async function updateProposal(req: Request, res: Response) {
  try {
    await db.query(
      'UPDATE proposals SET cover_letter = $1 WHERE job_id = $2 AND freelancer_id = $3',
      [req.body.coverLetter, req.params.jobId, req.params.freelancerId],
    );

    await db.query(
      'DELETE FROM milestones WHERE job_id = $1 AND freelancer_id = $2',
      [req.params.jobId, req.params.freelancerId],
    );

    const milestones = req.body.milestones as Array<IMilestone>;

    milestones.sort((a: IMilestone, b: IMilestone) => a.order - b.order);

    for (const [i, milestone] of milestones.entries()) {
      await db.query(
        'INSERT INTO milestones (job_id,freelancer_id,"order",name, duration,amount) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.params.jobId,
          req.params.freelancerId,
          i + 1,
          milestone.name,
          milestone.duration,
          milestone.amount,
        ],
      );
    }

    res.json({ status: true, message: 'Proposal updated' });
  } catch {
    res.status(500).json({ status: false, message: 'Error updating proposal' });
  }
}

export async function deleteProposal(req: Request, res: Response) {
  try {
    await db.query(
      'DELETE FROM proposals WHERE job_id = $1 AND freelancer_id = $2',
      [req.params.jobId, req.params.freelancerId],
    );

    res.json({ status: true, message: 'Proposal deleted' });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting proposal' });
  }
}
