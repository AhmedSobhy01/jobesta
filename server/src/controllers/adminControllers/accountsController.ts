import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../../db/db.js';
import { IPreviousWork } from '../../models/model.js';

export async function getAccounts(req: Request, res: Response) {
  try {
    let accountsQuery = 'SELECT * from accounts';
    let countQuery = 'SELECT COUNT(*) FROM accounts';

    if (req.query.role) {
      accountsQuery += ` WHERE role = '${req.query.role}'`;
      countQuery += ` WHERE role = '${req.query.role}'`;
    }

    accountsQuery += ' ORDER BY created_at DESC';

    const limit = parseInt(process.env.ADMIN_PAGINATION_LIMIT || '10');

    const totalItemsQuery = await db.query(countQuery);
    const totalItems = parseInt(totalItemsQuery.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const page =
      parseInt(req.query.page as string) > 0 &&
      parseInt(req.query.page as string) <= totalPages
        ? parseInt(req.query.page as string)
        : 1;
    const offset = (page - 1) * limit;

    accountsQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(accountsQuery);

    const accounts = result.rows.map((account) => {
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
      'UPDATE accounts SET first_name = $1, last_name = $2, username = $3, email = $4 WHERE id = $5',
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

    console.log(freelancerDataQuery.rows);

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

    const previousWorks = previousWorkQuery.rows.map((work) => {
      return {
        order: work.order,
        title: work.title,
        description: work.description,
        url: work.url,
      };
    });

    previousWorks.sort((a, b) => a.order - b.order);

    res.status(200).json({
      status: true,
      message: 'Freelancer fetched',
      data: {
        freelancer: {
          id: freelancerId,
          bio,
          skills,
          previousWorks,
        },
      },
    });
  } catch {
    res
      .status(500)
      .json({ message: 'Failed to fetch freelancer', status: false });
  }
}

export async function updateFreelancer(req: Request, res: Response) {
  const { accountId } = req.params;
  const { bio, skills, previousWorks } = req.body;

  try {
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
      await db.query('INSERT INTO skills (name,freelancer_id) VALUES ($1,$2)', [
        skill,
        freelancerId,
      ]);
    }

    await db.query('DELETE FROM previous_works WHERE freelancer_id = $1', [
      freelancerId,
    ]);

    if(previousWorks.length !== 0) 
    previousWorks.sort(
      (a: IPreviousWork, b: IPreviousWork) => a.order - b.order,
    );

    for (const [index, work] of previousWorks.entries()) {
      await db.query(
        'INSERT INTO previous_works (title,description,url,"order",freelancer_id) VALUES ($1,$2,$3,$4,$5)',
        [work.title, work.description, work.url, index + 1, freelancerId],
      );
    }

    res.status(200).json({ message: 'Freelancer updated', status: true });
  } catch(err) {
    console.log(err);
    res
      .status(500)
      .json({ message: 'Failed to update freelancer', status: false });
  }
}
