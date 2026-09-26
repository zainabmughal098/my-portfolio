import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getLatestResumeForUser,
  saveResumeForUser,
  getUserResumes,
  getResumeById,
  createNewResume,
  updateResumeById,
  renameResumeById,
  deleteResumeById,
} from './src/db/queries.ts';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// API Routes
// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sync User Profile on sign-in
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || req.body.email || '';
    const name = req.body.name || req.user!.name || '';
    const picture = req.body.picture || req.user!.picture || '';

    const dbUser = await getOrCreateUser({
      uid,
      email,
      name,
      picture,
    });

    res.json({ user: dbUser });
  } catch (error: any) {
    console.error('API /api/auth/sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Fetch logged in user's saved resume
app.get('/api/resume', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const resume = await getLatestResumeForUser(uid);
    if (!resume) {
      return res.status(404).json({ message: 'No saved resume found for user' });
    }
    res.json(resume);
  } catch (error: any) {
    console.error('API GET /api/resume error:', error);
    res.status(500).json({ error: error.message || 'Failed to get resume' });
  }
});

// Save or update logged in user's resume (legacy or default)
app.post('/api/resume', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const name = req.user!.name || '';
    const picture = req.user!.picture || '';

    // Ensure user exists in Postgres
    const dbUser = await getOrCreateUser({
      uid,
      email,
      name,
      picture,
    });

    const { title, data, resumeId } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing resume data payload' });
    }

    const dataJson = typeof data === 'string' ? data : JSON.stringify(data);
    const saved = await saveResumeForUser(
      uid,
      dbUser.id,
      title || 'My Portfolio Resume',
      dataJson,
      resumeId ? Number(resumeId) : undefined
    );

    res.json({ success: true, resume: saved });
  } catch (error: any) {
    console.error('API POST /api/resume error:', error);
    res.status(500).json({ error: error.message || 'Failed to save resume' });
  }
});

// LIST all resumes for current user
app.get('/api/resumes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const resumesList = await getUserResumes(uid);
    res.json({ resumes: resumesList });
  } catch (error: any) {
    console.error('API GET /api/resumes error:', error);
    res.status(500).json({ error: error.message || 'Failed to list resumes' });
  }
});

// GET single resume by ID
app.get('/api/resumes/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const resumeId = Number(req.params.id);
    if (isNaN(resumeId)) {
      return res.status(400).json({ error: 'Invalid resume ID' });
    }

    const resume = await getResumeById(resumeId, uid);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error: any) {
    console.error('API GET /api/resumes/:id error:', error);
    res.status(500).json({ error: error.message || 'Failed to load resume' });
  }
});

// CREATE a new resume
app.post('/api/resumes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || '';
    const name = req.user!.name || '';
    const picture = req.user!.picture || '';

    const dbUser = await getOrCreateUser({
      uid,
      email,
      name,
      picture,
    });

    const { title, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing resume data payload' });
    }

    const dataJson = typeof data === 'string' ? data : JSON.stringify(data);
    const newResume = await createNewResume(
      uid,
      dbUser.id,
      title?.trim() || 'New Untitled Resume',
      dataJson
    );

    res.status(201).json({ success: true, resume: newResume });
  } catch (error: any) {
    console.error('API POST /api/resumes error:', error);
    res.status(500).json({ error: error.message || 'Failed to create resume' });
  }
});

// UPDATE an existing resume by ID
app.put('/api/resumes/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const resumeId = Number(req.params.id);
    if (isNaN(resumeId)) {
      return res.status(400).json({ error: 'Invalid resume ID' });
    }

    const { title, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing resume data payload' });
    }

    const dataJson = typeof data === 'string' ? data : JSON.stringify(data);
    const updated = await updateResumeById(resumeId, uid, title, dataJson);
    if (!updated) {
      return res.status(404).json({ error: 'Resume not found or unauthorized' });
    }

    res.json({ success: true, resume: updated });
  } catch (error: any) {
    console.error('API PUT /api/resumes/:id error:', error);
    res.status(500).json({ error: error.message || 'Failed to update resume' });
  }
});

// RENAME a resume by ID
app.patch('/api/resumes/:id/rename', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const resumeId = Number(req.params.id);
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Resume title cannot be empty' });
    }

    const renamed = await renameResumeById(resumeId, uid, title.trim());
    if (!renamed) {
      return res.status(404).json({ error: 'Resume not found or unauthorized' });
    }

    res.json({ success: true, resume: renamed });
  } catch (error: any) {
    console.error('API PATCH /api/resumes/:id/rename error:', error);
    res.status(500).json({ error: error.message || 'Failed to rename resume' });
  }
});

// DELETE a resume by ID
app.delete('/api/resumes/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const resumeId = Number(req.params.id);
    if (isNaN(resumeId)) {
      return res.status(400).json({ error: 'Invalid resume ID' });
    }

    const deleted = await deleteResumeById(resumeId, uid);
    if (!deleted) {
      return res.status(404).json({ error: 'Resume not found or unauthorized' });
    }

    res.json({ success: true, deletedId: resumeId });
  } catch (error: any) {
    console.error('API DELETE /api/resumes/:id error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete resume' });
  }
});

// Frontend Serving: Vite dev middleware in development, static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Application server running on http://0.0.0.0:${port}`);
  });
}

startServer();
