import { db } from './index.ts';
import { users, resumes } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export interface UserProfileInput {
  uid: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}

export async function getOrCreateUser(profile: UserProfileInput) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: profile.uid,
        email: profile.email,
        name: profile.name || null,
        picture: profile.picture || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: profile.email,
          name: profile.name || null,
          picture: profile.picture || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database user sync failed.', { cause: error });
  }
}

export async function getLatestResumeForUser(userUid: string) {
  try {
    const results = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userUid, userUid))
      .orderBy(desc(resumes.updatedAt))
      .limit(1);

    return results[0] || null;
  } catch (error) {
    console.error('Failed to get latest resume:', error);
    throw new Error('Database query for resume failed.', { cause: error });
  }
}

export async function getUserResumes(userUid: string) {
  try {
    const results = await db
      .select({
        id: resumes.id,
        title: resumes.title,
        createdAt: resumes.createdAt,
        updatedAt: resumes.updatedAt,
      })
      .from(resumes)
      .where(eq(resumes.userUid, userUid))
      .orderBy(desc(resumes.updatedAt));

    return results;
  } catch (error) {
    console.error('Failed to get user resumes list:', error);
    throw new Error('Database query for resume list failed.', { cause: error });
  }
}

// PostgreSQL serial integer limit (32-bit signed: -2147483648 to 2147483647)
const MAX_PG_INTEGER = 2147483647;

export function isValidPgIntegerId(id: unknown): id is number {
  if (typeof id !== 'number' || isNaN(id) || !Number.isInteger(id)) return false;
  return id > 0 && id <= MAX_PG_INTEGER;
}

export async function getResumeById(id: number, userUid: string) {
  try {
    if (!isValidPgIntegerId(id)) {
      return null;
    }

    const results = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id))
      .limit(1);

    if (results.length === 0 || results[0].userUid !== userUid) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get resume by ID:', error);
    throw new Error('Database query for single resume failed.', { cause: error });
  }
}

export async function getPublicResumeById(id: number) {
  try {
    if (!isValidPgIntegerId(id)) {
      return null;
    }

    const results = await db
      .select({
        id: resumes.id,
        title: resumes.title,
        data: resumes.data,
        updatedAt: resumes.updatedAt,
      })
      .from(resumes)
      .where(eq(resumes.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get public resume by ID:', error);
    return null;
  }
}

export async function getLatestPublicResume() {
  try {
    const results = await db
      .select({
        id: resumes.id,
        title: resumes.title,
        data: resumes.data,
        updatedAt: resumes.updatedAt,
      })
      .from(resumes)
      .orderBy(desc(resumes.updatedAt))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get latest public resume:', error);
    return null;
  }
}

export async function saveOrUpdatePublicShare(
  dataJson: string,
  title: string,
  resumeId?: number,
  userUid?: string
) {
  try {
    // If a resumeId is provided, is a valid 32-bit int, and exists, update it
    if (isValidPgIntegerId(resumeId)) {
      const existing = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(resumes)
          .set({
            data: dataJson,
            title: title || existing[0].title,
            updatedAt: new Date(),
          })
          .where(eq(resumes.id, resumeId))
          .returning();

        return updated[0];
      }
    }

    // Otherwise, create new resume record under userUid or a public guest user
    const targetUid = userUid || 'public-guest';
    const userDbRecord = await db
      .select()
      .from(users)
      .where(eq(users.uid, targetUid))
      .limit(1);

    let userDbId: number;
    if (userDbRecord.length === 0) {
      const newUser = await getOrCreateUser({
        uid: targetUid,
        email: targetUid === 'public-guest' ? 'guest@foliocraft.app' : 'user@foliocraft.app',
        name: 'FolioCraft Creator',
      });
      userDbId = newUser.id;
    } else {
      userDbId = userDbRecord[0].id;
    }

    const inserted = await db
      .insert(resumes)
      .values({
        userId: userDbId,
        userUid: targetUid,
        title: title || 'My Portfolio Resume',
        data: dataJson,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to save or update public share:', error);
    throw new Error('Database public share save failed.', { cause: error });
  }
}

export async function createNewResume(
  userUid: string,
  userDbId: number,
  title: string,
  dataJson: string
) {
  try {
    const inserted = await db
      .insert(resumes)
      .values({
        userId: userDbId,
        userUid,
        title,
        data: dataJson,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create new resume in database:', error);
    throw new Error('Database create resume failed.', { cause: error });
  }
}

export async function updateResumeById(
  id: number,
  userUid: string,
  title: string | undefined,
  dataJson: string
) {
  try {
    if (!isValidPgIntegerId(id)) {
      return null;
    }

    const updatePayload: any = {
      data: dataJson,
      updatedAt: new Date(),
    };
    if (title && title.trim()) {
      updatePayload.title = title.trim();
    }

    const updated = await db
      .update(resumes)
      .set(updatePayload)
      .where(eq(resumes.id, id))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error('Failed to update resume in database:', error);
    throw new Error('Database resume update failed.', { cause: error });
  }
}

export async function renameResumeById(id: number, userUid: string, newTitle: string) {
  try {
    if (!isValidPgIntegerId(id)) {
      return null;
    }

    const updated = await db
      .update(resumes)
      .set({
        title: newTitle.trim(),
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error('Failed to rename resume:', error);
    throw new Error('Database rename failed.', { cause: error });
  }
}

export async function deleteResumeById(id: number, userUid: string) {
  try {
    if (!isValidPgIntegerId(id)) {
      return null;
    }

    const deleted = await db
      .delete(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userUid, userUid)))
      .returning();

    return deleted[0] || null;
  } catch (error) {
    console.error('Failed to delete resume:', error);
    throw new Error('Database delete resume failed.', { cause: error });
  }
}

export async function saveResumeForUser(
  userUid: string,
  userDbId: number,
  title: string,
  dataJson: string,
  resumeId?: number
) {
  try {
    if (isValidPgIntegerId(resumeId)) {
      const existingById = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .limit(1);

      if (existingById.length > 0 && existingById[0].userUid === userUid) {
        const updated = await db
          .update(resumes)
          .set({
            title,
            data: dataJson,
            updatedAt: new Date(),
          })
          .where(eq(resumes.id, resumeId))
          .returning();

        return updated[0];
      }
    }

    // Fallback: Check if user already has any saved resume
    const existing = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userUid, userUid))
      .orderBy(desc(resumes.updatedAt))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(resumes)
        .set({
          title,
          data: dataJson,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, existing[0].id))
        .returning();

      return updated[0];
    } else {
      const inserted = await db
        .insert(resumes)
        .values({
          userId: userDbId,
          userUid,
          title,
          data: dataJson,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return inserted[0];
    }
  } catch (error) {
    console.error('Failed to save resume in database:', error);
    throw new Error('Database resume save failed.', { cause: error });
  }
}
