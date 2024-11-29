import db from '../db/db.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface IuserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profile_picture: string | undefined;
}

function validLoginData(data: IuserData): boolean {
  if (data.email === undefined || data.password === undefined) {
    return false;
  }
  if (data.email.trim() === '' || data.password.trim() === '') {
    return false;
  }
  return true;
}

function validRegisterationData(data: IuserData): boolean {
  if (!validLoginData(data)) return false;

  if (
    data.first_name === undefined ||
    data.last_name === undefined ||
    data.username === undefined ||
    data.role === undefined
  ) {
    return false;
  }

  if (
    data.first_name.trim() === '' ||
    data.last_name.trim() === '' ||
    data.username.trim() === '' ||
    data.role.trim() === ''
  ) {
    return false;
  }
  return true;
}

export async function userExists(email: string): Promise<boolean> {
  const query = await db.query('SELECT * FROM accounts WHERE email = $1', [
    email,
  ]);
  return query.rowCount !== null && query.rowCount > 0;
}

export async function registerAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const data = req.body;

  if (data == null || !validRegisterationData(data)) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const userExist = await userExists(data.email);
  if (userExist) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);
  data.password = hashedPassword;

  await db.query(
    'INSERT INTO accounts (first_name,last_name,username,email,password,role,profile_picture) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [
      data.first_name,
      data.last_name,
      data.username,
      data.email,
      data.password,
      data.role,
      data.profile_picture || null,
    ],
    (err: Error) => {
      if (err) {
        res.status(400).json({ message: 'Error creating user', error: err }); // Send an error response if the query fails
        return;
      }
    },
  );

  const userQuery = await db.query('SELECT * FROM accounts WHERE email = $1', [
    data.email,
  ]);
  const user = userQuery.rows[0];
  const jwtToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '1hour',
    },
  );
  // Generate the refresh token
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '30d' },
  );

  // Send the response
  res
    .status(201)
    .json({ message: 'User created', data: { jwtToken, refreshToken } });
  return;
}

export async function loginAccount(req: Request, res: Response): Promise<void> {
  const data: IuserData = req.body;

  if (!validLoginData(data)) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const query = await db.query('SELECT * FROM accounts WHERE email = $1', [
    data.email,
  ]);
  if (query.rowCount === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const user = query.rows[0];

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  const jwtToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '1hour',
    },
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '30d' },
  );

  res.status(200).json({ message: 'Login successful', jwtToken, refreshToken });
}

export async function generateRefreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: 'Invalid token' });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; email: string };

    const jwtToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1hour',
      },
    );
    res.status(200).json({ message: 'Token refreshed', jwtToken });
    return;
  } catch (err) {
    res.status(403).json({ message: 'Invalid token', err });
    return;
  }
}
