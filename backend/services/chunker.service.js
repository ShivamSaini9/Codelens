export function chunkCode(code, maxLines = 100, overlap = 20) {
  const lines = code.split('\n');
  const chunks = [];
  
  if (lines.length === 0) return chunks;
  
  for (let i = 0; i < lines.length; i += (maxLines - overlap)) {
    const end = Math.min(i + maxLines, lines.length);
    const chunkLines = lines.slice(i, end);
    
    // Skip empty chunks
    if (chunkLines.join('').trim() === '') continue;
    
    chunks.push({
      content: chunkLines.join('\n'),
      startLine: i + 1,
      endLine: end,
    });
    
    if (end === lines.length) break;
  }
  
  return chunks;
}
