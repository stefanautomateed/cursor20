import { FileItem } from '@/types';

export function createDefaultProject(): FileItem[] {
  return [
    {
      name: 'index.html',
      path: 'index.html',
      type: 'file',
      content: '',
    },
  ];
}

export function findFileByPath(files: FileItem[], path: string): FileItem | null {
  for (const file of files) {
    if (file.path === path) {
      return file;
    }
    if (file.type === 'folder' && file.children) {
      const found = findFileByPath(file.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function updateFileContent(files: FileItem[], path: string, content: string): FileItem[] {
  return files.map(file => {
    if (file.path === path) {
      return { ...file, content };
    }
    if (file.type === 'folder' && file.children) {
      return {
        ...file,
        children: updateFileContent(file.children, path, content),
      };
    }
    return file;
  });
}

export function addFile(files: FileItem[], newFile: FileItem): FileItem[] {
  return [...files, newFile];
}

export function deleteFile(files: FileItem[], path: string): FileItem[] {
  return files.filter(file => {
    if (file.path === path) return false;
    if (file.type === 'folder' && file.children) {
      file.children = deleteFile(file.children, path);
    }
    return true;
  });
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    md: 'markdown',
  };
  return languageMap[ext] || 'plaintext';
}

export function buildPreviewHTML(files: FileItem[]): string {
  const htmlFile = files.find(f => f.name === 'index.html');
  const cssFile = files.find(f => f.name.endsWith('.css'));
  const jsFile = files.find(f => f.name.endsWith('.js'));

  if (!htmlFile?.content) return '';

  let html = htmlFile.content;

  // If there's a separate CSS file, inject it
  if (cssFile?.content) {
    const styleTag = `<style>${cssFile.content}</style>`;
    // Try to inject before </head> or at the beginning
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${styleTag}\n</head>`);
    } else {
      html = styleTag + html;
    }
  }

  // If there's a separate JS file, inject it
  if (jsFile?.content) {
    const scriptTag = `<script>${jsFile.content}</script>`;
    // Try to inject before </body> or at the end
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      html = html + scriptTag;
    }
  }

  return html;
}

export function downloadProject(files: FileItem[], projectName: string) {
  if (files.length === 1 && files[0].name === 'index.html') {
    // Single file - download as HTML
    const blob = new Blob([files[0].content || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // Multiple files - could implement ZIP download
    // For now, download the preview HTML
    const html = buildPreviewHTML(files);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
