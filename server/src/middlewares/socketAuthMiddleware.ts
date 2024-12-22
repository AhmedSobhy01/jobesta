import { Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import db from '../db/db.js';

export async function socketAuthMiddleware(
  socket: Socket,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next: (err?: any) => void,
) {
  const token = socket.handshake.query.token as string;
  if (!token) return;
  const { id } = jwt.verify(
    token,
    process.env.JWT_SECRET as string,
  ) as JwtPayload;
  const query = await db.query('SELECT * FROM Accounts WHERE id = $1', [id]);
  if (query.rowCount == 0) {
    next(new Error('Unauthorized'));
  }
  next();
}
