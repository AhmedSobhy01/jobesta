import { Request, Response } from 'express';
import db from '../db/db.js';
import { IPreviousWork } from '../models/model.js';

export async function getUser(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  const query = await db.query('SELECT * FROM Accounts WHERE id = $1', [
    req.user.id,
  ]);

  if (query.rowCount == 0) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  const userData = query.rows[0];
  delete userData.password;
  delete userData.id;

  res.status(200).json({ message: 'User Found', data: userData });
}

export async function updateUser(req: Request, res: Response) {
  if (!req.user) {
    res.status(422).json({ message: 'User not found' });
    return;
  }

  const id = req.user.id;
  const bio = req.body.bio;

  const user = await db.query(
    'SELECT * FROM freelancers WHERE account_id = $1',
    [id],
  );

  const updateFreelancerQuery = {
    text: '',
    values: [''],
  };

  if (user.rowCount !== null && user.rowCount > 0) {
    updateFreelancerQuery.text = 'UPDATE freelancers SET bio = $1 RETURNING id';
    updateFreelancerQuery.values = [bio];
  } else {
    updateFreelancerQuery.text =
      'INSERT INTO freelancers (bio,balance,account_id) values ($1,$2,$3) RETURNING id';
    updateFreelancerQuery.values = [bio, 0, id];
  }

  const previousWork = req.body.previousWork;
  const skills = req.body.skills;
  try {
    const freelancerIdQuery = await db.query(updateFreelancerQuery);
    for (const work of previousWork as Array<IPreviousWork>) {
      await db.query('INSERT INTO previous_works values ($1,$2,$3,$4,$5)', [
        freelancerIdQuery.rows[0].id,
        work.order,
        work.title,
        work.description,
        work.url || null,
      ]);
    }

    for (const skill of skills) {
      await db.query('INSERT INTO skills values ($1,$2)', [
        freelancerIdQuery.rows[0].id,
        skill,
      ]);
    }

    res.status(201).json({ message: 'Updated freelancer' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating freelancer', error: err });
  }
}
