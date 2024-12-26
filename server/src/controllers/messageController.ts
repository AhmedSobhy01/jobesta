import { Request, Response } from 'express';
import db from '../db/db.js';
import { promises as fs } from 'fs';
import { IMessage } from '../models/model.js';
import { io } from '../index.js';

export async function getMessages(req: Request, res: Response) {
  try {
    const result = await db.query(
      `SELECT m.id, m.message, m.attachment_path, m.sent_at, a.first_name, a.last_name, a.profile_picture, a.username, m.account_id, a.role account_role FROM messages m
      JOIN accounts a ON m.account_id = a.id
      WHERE job_id = $1 AND freelancer_id = $2
      ORDER BY m.sent_at ASC`,
      [req.params.jobId, req.params.freelancerId],
    );

    const messages = result.rows.map((message) => ({
      id: message.id,
      message: message.message,
      attachmentPath: message.attachment_path,
      sentAt: message.sent_at,
      sender: {
        firstName: message.first_name,
        lastName: message.last_name,
        profilePicture:
          message!.profile_picture ||
          'https://ui-avatars.com/api/?name=' +
            message!.first_name +
            '+' +
            message!.last_name,
        username: message.username,
        isAdmin: message.account_role === 'admin',
      },
    }));

    res.json({
      status: true,
      message: 'Messages retrieved',
      data: {
        messages,
      },
    });
  } catch {
    res
      .status(500)
      .json({ status: false, message: 'Error retrieving messages' });
  }
}

export async function sendMessage(req: Request, res: Response) {
  const { message } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO messages (message, attachment_path, job_id, freelancer_id, account_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, sent_at`,
      [
        message,
        req.file ? req.file.path : null,
        req.params.jobId,
        req.params.freelancerId,
        req.user!.id,
      ],
    );

    // Send notification to recipient
    if (req.user!.role === 'client' || req.user!.role === 'admin') {
      const accountResult = await db.query(
        'SELECT account_id FROM freelancers WHERE id = $1',
        [req.params.freelancerId],
      );

      await db.query(
        `INSERT INTO notifications (type, message, account_id, url)
        VALUES ('message_received', 'You have a new message', $1, $2)`,
        [accountResult.rows[0].account_id, `/jobs/${req.params.jobId}/manage`],
      );
    }

    if (req.user!.role === 'freelancer' || req.user!.role === 'admin') {
      const accountResult = await db.query(
        'SELECT client_id FROM jobs WHERE id = $1',
        [req.params.jobId],
      );

      await db.query(
        `INSERT INTO notifications (type, message, account_id, url)
        VALUES ('message_received', 'You have a new message', $1, $2)`,
        [accountResult.rows[0].client_id, `/jobs/${req.params.jobId}/manage`],
      );
    }

    const messageTobeSent: IMessage = {
      id: result.rows[0].id,
      message,
      attachmentPath: req.file ? req.file.path : null,
      sentAt: result.rows[0].sent_at,
      sender: {
        firstName: req.user!.first_name,
        lastName: req.user!.last_name,
        profilePicture:
          req.user!.profile_picture ||
          'https://ui-avatars.com/api/?name=' +
            req.user!.first_name +
            '+' +
            req.user!.last_name,
        username: req.user!.username,
        isAdmin: req.user!.role === 'admin',
      },
    };

    io.to(`job-chat-${req.params.jobId}`).emit('recieve-message', messageTobeSent);

    res.json({
      status: true,
      message: 'Message sent',
      data: {
        message: messageTobeSent,
      },
    });
  } catch {
    res.status(500).json({ status: false, message: 'Error sending message' });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const result = await db.query(
      `SELECT attachment_path FROM messages WHERE id = $1 AND job_id = $2 AND freelancer_id = $3`,
      [req.params.messageId, req.params.jobId, req.params.freelancerId],
    );

    if (result.rows[0].attachment_path)
      await fs.unlink(result.rows[0].attachment_path);

    await db.query(
      `DELETE FROM messages WHERE id = $1 AND job_id = $2 AND freelancer_id = $3`,
      [req.params.messageId, req.params.jobId, req.params.freelancerId],
    );

    res.json({ status: true, message: 'Message deleted' });
  } catch {
    res.status(500).json({ status: false, message: 'Error deleting message' });
  }
}
