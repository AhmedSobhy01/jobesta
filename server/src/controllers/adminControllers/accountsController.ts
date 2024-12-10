import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../../db/db.js';

export async function getAccounts(req: Request, res: Response) {
  try {
    const accountsQuery = await db.query('SELECT * from accounts');
    const accounts = accountsQuery.rows.map((account) => {
      return {
        id: account.id,
        firstName: account.first_name,
        lastName: account.last_name,
        username: account.username,
        email: account.email,
        profilePicture: account.profile_picture,
        isBanned: account.is_banned,
        role: account.role,
        createdAt: account.created_at,
      };
    });

    res
      .status(200)
      .json({ status: true, message: 'Accounts fetched', accounts });
  } catch {
    res
      .status(500)
      .json({ message: 'Failed to fetch accounts', status: false });
  }
}

export async function createAccount(req: Request, res: Response) {
  const { firstName, lastName, username, email, password, role } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userIdQuery = await db.query(
      'INSERT INTO accounts (first_name,last_name,username,email,password,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [firstName, lastName, username, email, hashedPassword, role],
    );

    if (role === 'freelancer') {
      await db.query('INSERT INTO freelancers (account_id) VALUES ($1)', [
        userIdQuery.rows[0].id,
      ]);
    }

    res.status(201).json({ message: 'Account created', status: true });
  } catch {
    res
      .status(500)
      .json({ message: 'Failed to create account', status: false });
  }
}

export async function updateAccount(req: Request, res: Response) {
  const { accountId } = req.params;
  const { firstName, lastName, username, email, password } = req.body;

  try {
    await db.query(
      'UPDATE accounts SET first_name = $1, last_name = $2, username = $3, email = $4, password = $5 WHERE id = $6',
      [firstName, lastName, username, email, password, accountId],
    );
    res.status(200).json({ message: 'Account updated', status: true });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: 'Failed to update account', status: false });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  const { accountId } = req.params;

  try {
    await db.query('DELETE FROM accounts WHERE id = $1', [accountId]);
    res.status(200).json({ message: 'Account deleted', status: true });
  } catch {
    res
      .status(500)
      .json({ message: 'Failed to delete account', status: false });
  }
}

export async function banAccount(req: Request, res: Response) {
  const { accountId } = req.params;

  try {
    await db.query('UPDATE accounts SET is_banned = true WHERE id = $1', [
      accountId,
    ]);
    res.status(200).json({ message: 'Account banned', status: true });
  } catch {
    res.status(500).json({ message: 'Failed to ban account', status: false });
  }
}

export async function unbanAccount(req: Request, res: Response) {
  const { accountId } = req.params;

  try {
    await db.query('UPDATE accounts SET is_banned = false WHERE id = $1', [
      accountId,
    ]);
    res.status(200).json({ message: 'Account unbanned', status: true });
  } catch {
    res.status(500).json({ message: 'Failed to unban account', status: false });
  }
}
