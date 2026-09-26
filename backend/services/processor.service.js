import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { db, projectFiles, projects } from "../../database/index.js";
import { eq } from "drizzle-orm";
import { execSync } from "child_process";
import os from "os";

const IGNORED_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".next",
  ".vite",
  "vendor",
];
const BINARY_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".mp4",
  ".mp3",
  ".pdf",
  ".zip",
  ".exe",
  ".dll",
  ".so",
  ".class",
  ".jar",
  ".woff",
  ".woff2",
  ".ttf",
];

function isFileIgnored(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.includes(ext)) return true;

  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (IGNORED_DIRS.includes(part)) return true;
  }
  return false;
}

export async function processLocalZip(projectId, zipPath) {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  let count = 0;
  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    const entryName = entry.entryName;
    if (isFileIgnored(entryName)) continue;

    try {
      const content = entry.getData().toString("utf8");
      if (content.includes("\u0000")) continue; // skip binary

      await db.insert(projectFiles).values({
        projectId,
        filePath: entryName,
        extension: path.extname(entryName).toLowerCase().replace(".", ""),
        content: content,
      });
      count++;
    } catch (e) {
      console.warn(`Failed to read entry ${entryName}`, e);
    }
  }

  await db
    .update(projects)
    .set({ stats: { filesCount: count } })
    .where(eq(projects.id, projectId));
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
}

function walkDir(dir, baseDir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(baseDir, fullPath);

    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!isFileIgnored(relPath)) {
        results = results.concat(walkDir(fullPath, baseDir));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

export async function processGithubRepo(projectId, url) {
  const tempDir = path.join(os.tmpdir(), `codelens-repo-${projectId}`);

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  try {
    execSync(`git clone --depth 1 ${url} ${tempDir}`);

    const files = walkDir(tempDir, tempDir);
    let count = 0;
    for (const file of files) {
      // const relativePath = path.relative(tempDir, file);
      const relativePath = path.relative(tempDir, file).replace(/\\/g, "/");
      if (isFileIgnored(relativePath)) continue;

      try {
        const content = fs.readFileSync(file, "utf8");
        if (content.includes("\u0000")) continue;

        await db.insert(projectFiles).values({
          projectId,
          filePath: relativePath,
          extension: path.extname(relativePath).toLowerCase().replace(".", ""),
          content: content,
        });
        count++;
      } catch (e) {
        console.warn(`Failed to read file ${file}`, e);
      }
    }
    await db
      .update(projects)
      .set({ stats: { filesCount: count } })
      .where(eq(projects.id, projectId));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
