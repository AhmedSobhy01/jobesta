import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../../db/db.js';
import { IPreviousWork } from '../../models/model.js';

export async function getAccounts(req: Request, res: Response) {
  try {
    let accountsQuery = 'SELECT * from accounts';
    let countQuery = 'SELECT COUNT(*) FROM accounts';
    const queryParams: string[] = [];

    if (req.query.role) {
      accountsQuery += ` WHERE role = '${req.query.role}'`;
      countQuery += ` WHERE role = '${req.query.role}'`;
    }

    if (req.query.search) {
      const searchCondition = `first_name ILIKE $1 OR last_name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1 OR CONCAT(first_name, ' ', last_name) ILIKE $1`;
      queryParams.push(`%${req.query.search.toString()}%`);

      accountsQuery += req.query.role
        ? ` AND (${searchCondition})`
        : ` WHERE (${searchCondition})`;
      countQuery += req.query.role
        ? ` AND (${searchCondition})`
        : ` WHERE (${searchCondition})`;
    }

    accountsQuery += ' ORDER BY created_at DESC';

    const limit = parseInt(process.env.ADMIN_PAGINATION_LIMIT || '10');

    const totalItemsQuery = await db.query(countQuery, queryParams);
    const totalItems = parseInt(totalItemsQuery.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const page =
      parseInt(req.query.page as string) > 0 &&
      parseInt(req.query.page as string) <= totalPages
        ? parseInt(req.query.page as string)
        : 1;
    const offset = (page - 1) * limit;

    accountsQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(accountsQuery, queryParams);

    const accounts = result.rows.map((account) => {
      return {
        id: account.id,
        firstName: account.first_name,
        lastName: account.last_name,
        username: account.username,
        email: account.email,
        profilePicture:
          account.profile_picture ||
          'https://ui-avatars.com/api/?name=' +
            account.first_name +
            '+' +
            account.last_name,
        isBanned: account.is_banned,
        role: account.role,
        createdAt: account.created_at,
      };
    });

    res.status(200).json({
      status: true,
      message: 'Accounts fetched',
      data: {
        accounts,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          perPage: limit,
        },
      },
    });
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
      const freelancerDataQuery = await db.query(
        'INSERT INTO freelancers (account_id) VALUES ($1) RETURNING id',
        [userIdQuery.rows[0].id],
      );
      const { bio, skills, previousWork } = req.body;

      const freelancerId = freelancerDataQuery.rows[0].id;

      if (bio) {
        await db.query('UPDATE freelancers SET bio = $1 WHERE id = $2', [
          bio,
          freelancerId,
        ]);
      }

      for (const skill of skills) {
        await db.query(
          'INSERT INTO skills (name,freelancer_id) VALUES ($1,$2)',
          [skill, freelancerId],
        );
      }
      if (previousWork.length !== 0)
        previousWork.sort(
          (a: IPreviousWork, b: IPreviousWork) => a.order - b.order,
        );

      for (const [index, work] of previousWork.entries()) {
        await db.query(
          'INSERT INTO previous_works (title,description,url,"order",freelancer_id) VALUES ($1,$2,$3,$4,$5)',
          [work.title, work.description, work.url, index + 1, freelancerId],
        );
      }
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
    const accountQuery = await db.query(
      'UPDATE accounts SET first_name = $1, last_name = $2, username = $3, email = $4 WHERE id = $5 RETURNING role',
      [firstName, lastName, username, email, accountId],
    );

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await db.query('UPDATE accounts SET password = $1 WHERE id = $2', [
        hashedPassword,
        accountId,
      ]);
    }

    if (accountQuery.rows[0].role === 'freelancer') {
      const { bio, skills, previousWork } = req.body;
      const freelancerDataQuery = await db.query(
        'SELECT id FROM freelancers WHERE account_id = $1',
        [accountId],
      );

      const freelancerId = freelancerDataQuery.rows[0].id;

      await db.query('UPDATE freelancers SET bio = $1 WHERE id = $2', [
        bio,
        freelancerId,
      ]);

      await db.query('DELETE FROM skills WHERE freelancer_id = $1', [
        freelancerId,
      ]);

      for (const skill of skills) {
        await db.query(
          'INSERT INTO skills (name,freelancer_id) VALUES ($1,$2)',
          [skill, freelancerId],
        );
      }

      await db.query('DELETE FROM previous_works WHERE freelancer_id = $1', [
        freelancerId,
      ]);

      if (previousWork.length !== 0)
        previousWork.sort(
          (a: IPreviousWork, b: IPreviousWork) => a.order - b.order,
        );

      for (const [index, work] of previousWork.entries()) {
        await db.query(
          'INSERT INTO previous_works (title,description,url,"order",freelancer_id) VALUES ($1,$2,$3,$4,$5)',
          [work.title, work.description, work.url, index + 1, freelancerId],
        );
      }
    }

    res.status(200).json({ message: 'Account updated', status: true });
  } catch {
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

export async function getFreelancer(req: Request, res: Response) {
  const { accountId } = req.params;

  try {
    const freelancerDataQuery = await db.query(
      'SELECT id,bio FROM freelancers WHERE account_id = $1',
      [accountId],
    );

    const { id: freelancerId, bio } = freelancerDataQuery.rows[0];

    const skillsQuery = await db.query(
      'SELECT name FROM skills WHERE freelancer_id = $1',
      [freelancerId],
    );

    const skills = skillsQuery.rows.map((skill) => skill.name);

    const previousWorkQuery = await db.query(
      'SELECT title,description,url,"order" FROM previous_works WHERE freelancer_id = $1',
      [freelancerId],
    );

    const previousWork = previousWorkQuery.rows.map((work) => {
      return {
        order: work.order,
        title: work.title,
        description: work.description,
        url: work.url,
      };
    });

    previousWork.sort((a, b) => a.order - b.order);

    res.status(200).json({
      status: true,
      message: 'Freelancer fetched',
      data: {
        freelancer: {
          id: freelancerId,
          bio,
          skills,
          previousWork,
        },
      },
    });
  } catch {
    res
      .status(500)
      .json({ message: 'Failed to fetch freelancer', status: false });
  }
}
