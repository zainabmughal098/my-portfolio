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

export async function getResumeById(id: number, userUid: string) {
  try {
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
    if (resumeId) {
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
