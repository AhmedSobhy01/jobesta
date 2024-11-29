import db from './db.js';

async function userExists(id: string) {
  const query = await db.query('SELECT * FROM Accouts WHERE id = $1', [id]);
  return !(query.rowCount == 0);
}

export async function updateFreelancer(data) {
  const id = data.id;
  const bio = data.bio;

  if (await userExists(id)) {
    const query = await db.query('UPDATE freelancers SET bio = $1', [bio]);
    if (query.rowCount == 0) return false;
  } else {
    const query = await db.query(
      'INSERT INTO freelancers (bio,balance,account_id) values ($1,$2,$3)',
      [bio, 0, id],
    );
    if (query.rowCount == 0) return false;
  }

  const previousWork = data.previousWork;
  previousWork.forEach(async (work) => {
    const query = await db.query(
      'INSERT INTO previous_works values ($1,$2,$3,$4,$5)',
      [id, work.order, work.title, work.description, work.url || null],
    );
    if (query.rowCount == 0) return false;
  });

  return true;
}
