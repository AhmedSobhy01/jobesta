import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import db from '../db/db.js';
import { Socket, ExtendedError } from 'socket.io';

configDotenv();

export async function prepareUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bearerText = req.header('Authorization');
    if (!bearerText || bearerText.trim() == 'Bearer') throw 'No token provided';

    const jwtToken = bearerText.split(' ')[1];

    const { id } = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    const query = await db.query('SELECT * FROM Accounts WHERE id = $1', [id]);
    if (query.rowCount == 0) throw 'User not found';

    req.user = {
      id: query.rows[0].id,
      first_name: query.rows[0].first_name,
      last_name: query.rows[0].last_name,
      username: query.rows[0].username,
      email: query.rows[0].email,
      role: query.rows[0].role,
      is_banned: query.rows[0].is_banned,
      profile_picture: query.rows[0].profile_picture,
    };

    if (query.rows[0].role == 'freelancer') {
      const freelancerQuery = await db.query(
        'SELECT * FROM freelancers WHERE account_id = $1',
        [id],
      );

      if (freelancerQuery.rowCount == 0) throw 'Freelancer not found';

      req.user.freelancer = {
        id: freelancerQuery.rows[0].id,
        balance: freelancerQuery.rows[0].balance,
        bio: freelancerQuery.rows[0].bio,
      };
    }
    next();
  } catch {
    next();
    return;
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  prepareUser(req, res, () => {
    if (!req.user || req.user.is_banned) {
      res.status(401).json({ message: 'Unauthorized', status: false });
      return;
    }
    next();
  });
}

export async function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  try {
    const jwtToken = socket.handshake.auth.token;

    const { id } = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    const query = await db.query('SELECT * FROM Accounts WHERE id = $1', [id]);
    if (query.rowCount == 0) throw 'User not found';

    socket.data.user = {
      id: query.rows[0].id,
      first_name: query.rows[0].first_name,
      last_name: query.rows[0].last_name,
      username: query.rows[0].username,
      email: query.rows[0].email,
      role: query.rows[0].role,
      is_banned: query.rows[0].is_banned,
      profile_picture: query.rows[0].profile_picture,
    };

    if (query.rows[0].role == 'freelancer') {
      const freelancerQuery = await db.query(
        'SELECT * FROM freelancers WHERE account_id = $1',
        [id],
      );

      if (freelancerQuery.rowCount == 0) throw 'Freelancer not found';

      socket.data.user.freelancer = {
        id: freelancerQuery.rows[0].id,
        balance: freelancerQuery.rows[0].balance,
        bio: freelancerQuery.rows[0].bio,
      };
    }
    next();
  } catch {
    next(new Error('Unauthorized'));
    return;
  }
}
