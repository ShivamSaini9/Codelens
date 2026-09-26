import { findProjectsByUserId, findProjectById, createProject } from '../../database/repositories/project.repository.js';
import { enqueueIndexJob } from '../services/queue.service.js';

export async function listProjects(req, res) {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const projectsList = await findProjectsByUserId(req.user.uid);
    res.json(projectsList);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function getProject(req, res) {
  try {
    const projectId = req.params.id;
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const project = await findProjectById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

export async function createGithubProject(req, res) {
  try {
    const { url, name } = req.body;
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!url) {
      res.status(400).json({ error: 'Repository URL is required' });
      return;
    }

    const projectName = name || url.split('/').pop()?.replace('.git', '') || 'GitHub Repo';
    const project = await createProject({
      userId: req.user.uid,
      name: projectName,
      sourceType: 'github',
      sourceUrl: url,
      status: 'queued',
    });

    enqueueIndexJob(project.id, 'github', url);
    res.json(project);
  } catch (error) {
    console.error('Error creating GitHub project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function uploadLocalProject(req, res) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projectName = req.body.name || file.originalname.replace('.zip', '');
    const project = await createProject({
      userId: req.user.uid,
      name: projectName,
      sourceType: 'local',
      sourceUrl: file.originalname,
      status: 'queued',
    });

    enqueueIndexJob(project.id, 'local', file.path);
    res.json(project);
  } catch (error) {
    console.error('Error creating local project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}
