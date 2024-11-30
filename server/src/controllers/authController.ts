import db from '../db/db.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { configDotenv } from 'dotenv';

configDotenv();

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

async function userExists(email: string): Promise<boolean> {
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
    res.status(422).json({ status: false, message: 'Invalid data' });
    return;
  }

  const userExist = await userExists(data.email);
  if (userExist) {
    res.status(422).json({ status: false, message: 'User already exists' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);

  try {
    const userIdQuery = await db.query(
      'INSERT INTO accounts (first_name,last_name,username,email,password,role,profile_picture) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,email',
      [
        data.first_name,
        data.last_name,
        data.username,
        data.email,
        data.password,
        data.role,
        data.profile_picture || null,
      ],
    );

    const user = userIdQuery.rows[0];
    const jwtToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1hour',
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '30d' },
    );

    res.status(201).json({
      status: true,
      message: 'User created',
      data: { jwtToken, refreshToken },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Failed to create user' });
  }
}

export async function loginAccount(req: Request, res: Response): Promise<void> {
  const data: IuserData = req.body;

  if (!validLoginData(data)) {
    res.status(422).json({ status: false, message: 'Invalid data' });
    return;
  }

  const query = await db.query('SELECT * FROM accounts WHERE email = $1', [
    data.email,
  ]);

  if (query.rowCount === 0) {
    res.status(404).json({ status: false, message: 'Invalid credentials' });
    return;
  }

  const user = query.rows[0];

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    res.status(401).json({ status: false, message: 'Invalid credentials' });
    return;
  }

  const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '1hour',
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: '30d' },
  );

  res.status(200).json({
    status: true,
    message: 'Login successful',
    data: { jwtToken, refreshToken },
  });
}

export async function generateRefreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(422).json({ status: false, message: 'Invalid token' });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload;

    const jwtToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1hour',
      },
    );

    res
      .status(200)
      .json({ status: true, message: 'Token refreshed', data: { jwtToken } });
  } catch {
    res.status(403).json({ status: false, message: 'Invalid token' });
  }
}
