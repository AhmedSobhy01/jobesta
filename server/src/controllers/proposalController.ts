import { Request, Response } from 'express';
import db from '../db/db.js';
import { IMilestone, IProposal } from '../models/model.js';

export async function createProposal(req: Request, res: Response) {
  try {
    await db.query(
      `INSERT INTO proposals (job_id, freelancer_id, cover_letter) 
      VALUES ($1, $2, $3);`,
      [req.params.jobId, req.user!.freelancer!.id, req.body.coverLetter],
    );

    const milestones = req.body.milestones as Array<IMilestone>;
    milestones.sort((a: IMilestone, b: IMilestone) => a.order - b.order);

    for (const [i, milestone] of milestones.entries()) {
      await db.query(
        'INSERT INTO milestones (job_id,freelancer_id,"order",name, duration,amount) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.params.jobId,
          req.user!.freelancer!.id,
          i + 1,
          milestone.name,
          milestone.duration,
          milestone.amount,
        ],
      );
    }

    res.status(201).json({ status: true, message: 'Proposal created' });
  } catch {
    res.status(500).json({ status: false, message: 'Error creating proposal' });
  }
}

export async function updateProposal(req: Request, res: Response) {
  try {
    await db.query(
      'UPDATE proposals SET cover_letter = $1 WHERE job_id = $2 AND freelancer_id = $3',
      [req.body.coverLetter, req.params.jobId, req.user!.freelancer!.id],
    );

    await db.query(
      'DELETE FROM milestones WHERE job_id = $1 AND freelancer_id = $2',
      [req.params.jobId, req.user!.freelancer!.id],
    );

    const milestones = req.body.milestones as Array<IMilestone>;

    milestones.sort((a: IMilestone, b: IMilestone) => a.order - b.order);

    for (const [i, milestone] of milestones.entries()) {
      await db.query(
        'INSERT INTO milestones (job_id,freelancer_id,"order",name, duration,amount) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          req.params.jobId,
          req.user!.freelancer!.id,
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

export async function getMyProposals(req: Request, res: Response) {
  try {
    const proposalsQuery = await db.query(
      `SELECT p.job_id, p.status status, p.cover_letter, p.created_at, m.order, m.status milestone_status, m.duration, m.amount, m.name 
	  FROM proposals p 
	  JOIN milestones m ON m.job_id = p.job_id AND m.freelancer_id = p.freelancer_id
	  WHERE p.freelancer_id = $1
	  ORDER BY p.job_id, m.order ASC
	  `,
      [req.user!.freelancer!.id],
    );

    const proposalsObject = proposalsQuery.rows.reduce<
      Record<string, IProposal>
    >((acc, proposal) => {
      if (!acc[proposal.job_id]) {
        acc[proposal.job_id] = {
          jobId: proposal.job_id,
          status: proposal.status,
          coverLetter: proposal.cover_letter,
          createdAt: proposal.created_at,
          milestones: [],
        };
      }

      acc[proposal.job_id].milestones!.push({
        order: proposal.order,
        status: proposal.milestone_status,
        duration: proposal.duration,
        amount: proposal.amount,
        name: proposal.name,
      });

      return acc;
    }, {});

    const proposals = Object.values(proposalsObject);

    res.json({
      status: true,
      message: 'Proposals retrieved',
      data: {
        proposals,
      },
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ status: false, message: 'Error retrieving proposals' });
  }
}

export async function deleteProposal(req: Request, res: Response) {
  try {
    await db.query(
      'DELETE FROM proposals WHERE job_id = $1 AND freelancer_id = $2',
      [req.params.jobId, req.user!.freelancer!.id],
    );

    res.json({ status: true, message: 'Proposal deleted' });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting proposal' });
  }
}
