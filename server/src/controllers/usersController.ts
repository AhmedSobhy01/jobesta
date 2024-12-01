import type { Request, Response } from 'express';
import type { IPreviousWork } from '../models/model';
import db from '../db/db';

export async function getUser(req: Request, res: Response) {
  const userData = req.user;
  res.status(200).json({ status: true, message: 'User Found', data: userData });
}

export async function updateUser(req: Request, res: Response) {
  const id = req.user!.id;
  const bio = req.body.bio;

  const freelancerAccount = await db.query(
    'SELECT * FROM freelancers WHERE account_id = $1',
    [id],
  );

  const updateFreelancerQuery = {
    text: '',
    values: [''],
  };

  if (freelancerAccount.rowCount !== null && freelancerAccount.rowCount > 0) {
    updateFreelancerQuery.text =
      'UPDATE freelancers SET bio = $1 WHERE account_id = $2 RETURNING id';
    updateFreelancerQuery.values = [bio, id];
  } else {
    updateFreelancerQuery.text =
      'INSERT INTO freelancers (bio,balance,account_id) values ($1,$2,$3) RETURNING id';
    updateFreelancerQuery.values = [bio, 0, id];
  }

  const previousWork = req.body.previousWork as Array<IPreviousWork>;
  const skills = req.body.skills;
  try {
    const freelancerIdQuery = await db.query(updateFreelancerQuery);
    const { id: freelacnerId } = freelancerIdQuery.rows[0];

    await db.query('DELETE FROM skills WHERE freelancer_id = $1', [
      freelacnerId,
    ]);
    await db.query('DELETE FROM previous_works WHERE freelancer_id = $1', [
      freelacnerId,
    ]);

    previousWork.sort(
      (a: IPreviousWork, b: IPreviousWork) => a.order - b.order,
    );

    for (const [i, work] of previousWork.entries()) {
      await db.query('INSERT INTO previous_works values ($1,$2,$3,$4,$5)', [
        freelacnerId,
        i + 1,
        work.title,
        work.description,
        work.url || null,
      ]);
    }

    for (const skill of skills) {
      await db.query('INSERT INTO skills values ($1,$2)', [
        freelacnerId,
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
