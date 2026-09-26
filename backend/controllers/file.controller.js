import { getProjectFilesList, getProjectFileById } from '../../database/repositories/project.repository.js';

export async function listProjectFiles(req, res) {
  try {
    const projectId = req.params.id;
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const files = await getProjectFilesList(projectId);
    res.json(files);
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
}

export async function getFileContent(req, res) {
  try {
    const { id: projectId, fileId } = req.params;
    if (!req.user?.uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const file = await getProjectFileById(projectId, fileId);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.json(file);
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
}
