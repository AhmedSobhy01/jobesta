import type { Request, Response } from 'express';
import type { IPreviousWork } from '../models/model';
import db from '../db/db.js';

export async function getCurrentFreelancer({ user }: Request, res: Response) {
  const freelancerId = user!.freelancer!.id;

  try {
    const skillsQuery = await db.query(
      'SELECT name FROM skills WHERE freelancer_id = $1',
      [freelancerId],
    );

    const previousWorkQuery = await db.query(
      'SELECT * FROM previous_works WHERE freelancer_id = $1',
      [freelancerId],
    );

    const previousWork = previousWorkQuery.rows.map((work) => ({
      title: work.title,
      description: work.description,
      url: work.url,
    }));

    const skills = skillsQuery.rows.map((skill) => skill.name);

    const freelancer = {
      id: user!.freelancer!.id,
      balance: user!.freelancer!.balance,
      bio: user!.freelancer!.bio,
      previousWork,
      skills,
    };

    res
      .status(200)
      .json({ status: true, message: 'Freelancer Found', data: freelancer });
  } catch {
    res.status(500).json({
      status: false,
      message: 'Error fetching freelancer',
    });
  }
}

export async function updateFreelancer(
  req: Request,
  res: Response,
): Promise<void> {
  const freelancerId = req.user!.freelancer!.id;
  const bio = req.body.bio;
  const previousWork = req.body.previousWork as Array<IPreviousWork>;
  const skills = req.body.skills;

  try {
    await db.query(
      'UPDATE freelancers SET bio = $1 WHERE id = $2 RETURNING id',
      [bio, freelancerId],
    );

    await db.query('DELETE FROM skills WHERE freelancer_id = $1', [
      freelancerId,
    ]);

    await db.query('DELETE FROM previous_works WHERE freelancer_id = $1', [
      freelancerId,
    ]);

    previousWork.sort(
      (a: IPreviousWork, b: IPreviousWork) => a.order - b.order,
    );

    for (const [i, work] of previousWork.entries()) {
      await db.query('INSERT INTO previous_works values ($1,$2,$3,$4,$5)', [
        freelancerId,
        i + 1,
        work.title,
        work.description,
        work.url || null,
      ]);
    }

    for (const skill of skills) {
      await db.query('INSERT INTO skills values ($1,$2)', [
        freelancerId,
        skill,
      ]);
    }

    res.status(201).json({ status: true, message: 'Updated freelancer' });
  } catch {
    res.status(500).json({
      status: false,
      message: 'Error updating freelancer',
    });
  }
}

export async function getFreelancerByUsername(req: Request, res: Response) {
  const { username } = req.params;

  const freelancerDataQuery = await db.query(
    'SELECT f.id, f.bio, f.balance FROM accounts a JOIN freelancers f ON f.account_id = a.id WHERE a.username = $1',
    [username],
  );

  if (freelancerDataQuery.rowCount === 0) {
    res.status(404).json({
      status: false,
      message: 'Freelancer not found',
    });
    return;
  }

  const freelancerData = freelancerDataQuery.rows[0];

  const skillsQuery = await db.query(
    'SELECT name FROM skills WHERE freelancer_id = $1',
    [freelancerData.id],
  );

  const previousWorkQuery = await db.query(
    'SELECT * FROM previous_works WHERE freelancer_id = $1',
    [freelancerData.id],
  );

  const previousWork = previousWorkQuery.rows.map((work) => ({
    title: work.title,
    description: work.description,
    url: work.url,
  }));

  const skills = skillsQuery.rows.map((skill) => skill.name);

  const freelancer = {
    bio: freelancerData.bio,
    previousWork,
    skills,
  };

  res
    .status(200)
    .json({ status: true, message: 'Freelancer Found', data: freelancer });
}
