import { Request, Response } from 'express';
import db from '../db/db.js';
import { updateFreelancer } from '../db/dbHelper.js';

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

  res.status(200).json({ message: 'User Found', data: query.rows[0] });
}

export async function updateUser(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'User not found' });
    return;
  }
  const update = await updateFreelancer({ id: req.user.id, ...req.body });
  if(update){
    res.status(201).json({message:"Updated freelancer"});
    return;  
  }
  res.status(400).json({message:"Error updating freelancer"});
  return;
}
