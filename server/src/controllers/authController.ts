import db from '../db/db.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Validates the provided data object to ensure all required fields are present and not empty.
 * @param data - The data object to validate.
 * @returns {boolean} - Returns true if all required fields are present and not empty, otherwise false.
 */

interface IuserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profile_picture: string;
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

/**
 * Checks if a user with the given email exists in the database.
 *
 * @param email - The email address to check for existence.
 * @returns A promise that resolves to a boolean indicating whether the user exists.
 */
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

  // Check if the data is not empty or undefined
  if (data == null || !validRegisterationData(data)) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  // Check if the user already exists
  const userExist = await userExists(data.email);
  if (userExist) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);
  data.password = hashedPassword;

  const dataAttrs = [
    'first_name',
    'last_name',
    'username',
    'email',
    'password',
    'role',
  ];

  // Insert the user into the database
  const output = []; // Array to hold the data attributes to be inserted into the sql query
  dataAttrs.forEach((attr) => {
    output.push(data[attr]);
  });
  output.push(data.profile_picture || null); // Add the profile picture to the output array if exists
  await db.query(
    'INSERT INTO accounts (first_name,last_name,username,email,password,role,profile_picture) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    output,
    (err: Error) => {
      if (err) {
        res.status(400).json({ message: 'Error creating user', error: err }); // Send an error response if the query fails
        return;
      }
    },
  );

  // Generate a JWT token and send it in the response

  // Get the user from the database to acess the generated id
  const userQuery = await db.query('SELECT * FROM accounts WHERE email = $1', [
    data.email,
  ]);
  const user = userQuery.rows[0];
  // Generate the JWT token
  const jwtToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '5min',
    },
  );
  // Generate the refresh token
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '7d' },
  );

  // Send the response
  res.status(201).json({ message: 'User created', jwtToken, refreshToken });
  return;
}

export async function loginAccount(req: Request, res: Response): Promise<void> {
  const data: IuserData = req.body;

  // Check if the email and password are provided
  if (!validLoginData(data)) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  // Check if the user exists
  const query = await db.query('SELECT * FROM accounts WHERE email = $1', [
    data.email,
  ]);
  if (query.rowCount === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const user = query.rows[0];

  // Check if the password is correct
  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  // Generate the JWT token and send it in the response
  const jwtToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '5min',
    },
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '7d' },
  );

  res.status(200).json({ message: 'Login successful', jwtToken, refreshToken });
}

export async function generateRefreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  const { refreshToken } = req.body;

  // Check if the refresh token is provided
  if (!refreshToken) {
    res.status(400).json({ message: 'Invalid token' });
    return;
  }

  // Verify the refresh token and generate a new JWT token

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; email: string };

    const jwtToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '5min',
      },
    );
    res.status(200).json({ message: 'Token refreshed', jwtToken });
    return;
  } catch (err) {
    res.status(403).json({ message: 'Invalid token', err });
    return;
  }
}
