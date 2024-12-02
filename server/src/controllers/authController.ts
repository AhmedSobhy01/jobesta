import db from '../db/db.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { configDotenv } from 'dotenv';

configDotenv();

export async function registerAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const { first_name, last_name, username, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userIdQuery = await db.query(
    'INSERT INTO accounts (first_name,last_name,username,email,password,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [first_name, last_name, username, email, hashedPassword, role],
  );

  if (role === 'freelancer') {
    await db.query('INSERT INTO freelancers (account_id) VALUES ($1)', [
      userIdQuery.rows[0].id,
    ]);
  }

  const user = userIdQuery.rows[0];
  const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '1hour',
  });

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
}

export async function loginAccount(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const query = await db.query('SELECT * FROM accounts WHERE email = $1', [
    email,
  ]);

  if (query.rowCount === 0) {
    res.status(404).json({ status: false, message: 'Invalid credentials' });
    return;
  }

  const user = query.rows[0];

  const validPassword = await bcrypt.compare(password, user.password);
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
