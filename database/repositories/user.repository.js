import { db } from '../connection.js';
import { users } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid, email) {
  const result = await db.insert(users)
    .values({
      uid,
      email,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
      },
    })
    .returning();

  return result[0];
}

export async function getUserByUid(uid) {
  const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  return result[0] || null;
}
