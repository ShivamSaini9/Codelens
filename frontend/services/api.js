/**
 * Centralized API client service for Express backend
 */

export async function syncUserWithBackend(token) {
  const res = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to sync user with backend');
  return await res.json();
}

export async function fetchProjects(token) {
  const res = await fetch('/api/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return await res.json();
}

export async function fetchProjectById(token, projectId) {
  const res = await fetch(`/api/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  return await res.json();
}

export async function createGithubProject(token, { url, name }) {
  const res = await fetch('/api/projects/github', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to connect repository');
  }
  return await res.json();
}

export async function uploadLocalProject(token, formData) {
  const res = await fetch('/api/projects/local', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload project');
  }
  return await res.json();
}

export async function fetchProjectFiles(token, projectId) {
  const res = await fetch(`/api/projects/${projectId}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch project files');
  return await res.json();
}

export async function fetchFileContent(token, projectId, fileId) {
  const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch file content');
  return await res.json();
}

export async function sendChatMessage(token, projectId, message) {
  return await fetch(`/api/projects/${projectId}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
}
