import type { Request, Response } from 'express';
import type { IPreviousWork } from '../models/model';
import db from '../db/db.js';

export async function getUser(req: Request, res: Response): Promise<void> {
  const userData = req.user;
  res.status(200).json({ status: true, message: 'User Found', data: userData });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  if (req.user!.role != 'freelancer') {
    res.status(403).json({
      status: false,
      message: 'You are not authorized to update this user',
    });

    return;
  }

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
