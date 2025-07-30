import { BlockNoteEditor } from "@blocknote/core";

export interface WebsiteSettings {
  title: string;
  description?: string;
  theme: 'light' | 'dark' | 'auto';
  customCss?: string;
  showAuthor?: boolean;
  authorName?: string;
}

export function generateWebsiteHtml(
  editor: BlockNoteEditor,
  settings: WebsiteSettings
): string {
  const blocks = editor.topLevelBlocks;
  
  // Generate CSS based on theme
  const css = generateCSS(settings.theme, settings.customCss);
  
  // Convert blocks to HTML
  const contentHtml = blocks.map(block => convertBlockToHtml(block)).join('\n');
  
  // Generate meta tags
  const metaTags = generateMetaTags(settings);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.title}</title>
    ${metaTags}
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="website-container">
        <header class="website-header">
            <h1 class="website-title">${settings.title}</h1>
            ${settings.showAuthor && settings.authorName ? 
              `<p class="website-author">By ${settings.authorName}</p>` : ''}
        </header>
        
        <main class="website-content">
            ${contentHtml}
        </main>
        
        <footer class="website-footer">
            <p>✨ Generated with <a href="https://worknest.app" target="_blank" rel="noopener">WorkNest</a> - Collaborative Document Editor</p>
        </footer>
    </div>
</body>
</html>`;
}

function generateCSS(theme: string, customCss?: string): string {
  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#6366f1' : '#4f46e5';
  const bgColor = isDark ? '#0f0f23' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const codeBg = isDark ? '#1e1b4b' : '#f8fafc';
  
  const baseCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: ${textColor};
      background: ${bgColor};
      background-image: ${isDark ? 
        'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)' : 
        'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)'
      };
      background-attachment: fixed;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .website-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 3rem 2rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .website-header {
      text-align: center;
      margin-bottom: 4rem;
      padding: 3rem 0;
      background: ${isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)'};
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid ${borderColor};
      position: relative;
      overflow: hidden;
    }
    
    .website-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, ${primaryColor}, #a855f7, ${primaryColor});
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    .website-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, ${primaryColor}, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    
    .website-author {
      font-size: 1.2rem;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .website-author::before {
      content: '👤';
      font-size: 1rem;
    }
    
    .website-content {
      flex: 1;
      font-size: 1.125rem;
      background: ${isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 3rem;
      border: 1px solid ${borderColor};
      box-shadow: ${isDark ? 
        '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 
        '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
      };
    }
    
    .website-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 3rem 0 1.5rem 0;
      color: ${textColor};
      position: relative;
      padding-bottom: 0.5rem;
    }
    
    .website-content h1::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, ${primaryColor}, #a855f7);
      border-radius: 2px;
    }
    
    .website-content h2 {
      font-size: 2rem;
      font-weight: 600;
      margin: 2.5rem 0 1rem 0;
      color: ${textColor};
    }
    
    .website-content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 2rem 0 0.75rem 0;
      color: ${textColor};
    }
    
    .website-content p {
      margin-bottom: 1.5rem;
      color: ${textColor};
      line-height: 1.8;
    }
    
    .website-content ul, .website-content ol {
      margin: 1.5rem 0;
      padding-left: 2.5rem;
    }
    
    .website-content li {
      margin-bottom: 0.75rem;
      line-height: 1.7;
    }
    
    .website-content ul li::marker {
      color: ${primaryColor};
    }
    
    .website-content blockquote {
      border-left: 4px solid ${primaryColor};
      padding: 1.5rem 2rem;
      margin: 2rem 0;
      font-style: italic;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      background: ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
      border-radius: 0 12px 12px 0;
      position: relative;
    }
    
    .website-content blockquote::before {
      content: '"';
      font-size: 4rem;
      color: ${primaryColor};
      position: absolute;
      top: -1rem;
      left: 1rem;
      opacity: 0.3;
    }
    
    .website-content code {
      background: ${codeBg};
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
      color: ${isDark ? '#f1f5f9' : '#1e293b'};
      border: 1px solid ${borderColor};
    }
    
    .website-content pre {
      background: ${codeBg};
      padding: 1.5rem;
      border-radius: 12px;
      overflow-x: auto;
      margin: 2rem 0;
      border: 1px solid ${borderColor};
      position: relative;
    }
    
    .website-content pre::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${primaryColor}, #a855f7);
      border-radius: 12px 12px 0 0;
    }
    
    .website-content pre code {
      background: none;
      padding: 0;
      border: none;
      color: ${textColor};
    }
    
    .website-content img {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      margin: 2rem 0;
      box-shadow: ${isDark ? 
        '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : 
        '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      };
      transition: transform 0.3s ease;
    }
    
    .website-content img:hover {
      transform: scale(1.02);
    }
    
    .website-footer {
      text-align: center;
      margin-top: 4rem;
      padding: 2rem 0;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      font-size: 0.875rem;
      border-top: 1px solid ${borderColor};
    }
    
    .website-footer a {
      color: ${primaryColor};
      text-decoration: none;
      font-weight: 500;
    }
    
    .website-footer a:hover {
      text-decoration: underline;
    }
    
    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
    
    /* Selection styling */
    ::selection {
      background: ${primaryColor};
      color: white;
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${primaryColor};
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #a855f7;
    }
    
    @media (max-width: 768px) {
      .website-container {
        padding: 1.5rem 1rem;
      }
      
      .website-title {
        font-size: 2.5rem;
      }
      
      .website-content {
        font-size: 1rem;
        padding: 2rem 1.5rem;
      }
      
      .website-header {
        padding: 2rem 1rem;
        margin-bottom: 2rem;
      }
    }
    
    @media (max-width: 480px) {
      .website-title {
        font-size: 2rem;
      }
      
      .website-content h1 {
        font-size: 2rem;
      }
      
      .website-content h2 {
        font-size: 1.5rem;
      }
    }
  `;
  
  return baseCSS + (customCss || '');
}

function convertBlockToHtml(block: any): string {
  const { type, content } = block;
  
  switch (type) {
    case 'paragraph':
      return `<p>${convertInlineContent(content)}</p>`;
    case 'heading':
      const level = block.props?.level || 1;
      return `<h${level}>${convertInlineContent(content)}</h${level}>`;
    case 'bulletListItem':
      return `<li>${convertInlineContent(content)}</li>`;
    case 'numberedListItem':
      return `<li>${convertInlineContent(content)}</li>`;
    case 'bulletList':
      return `<ul>${content.map(convertBlockToHtml).join('')}</ul>`;
    case 'numberedList':
      return `<ol>${content.map(convertBlockToHtml).join('')}</ol>`;
    case 'quote':
      return `<blockquote>${convertInlineContent(content)}</blockquote>`;
    case 'code':
      return `<pre><code>${convertInlineContent(content)}</code></pre>`;
    case 'image':
      const imageUrl = block.props?.url || '';
      const caption = block.props?.caption || '';
      return `<img src="${imageUrl}" alt="${caption}" />`;
    default:
      return `<p>${convertInlineContent(content)}</p>`;
  }
}

function convertInlineContent(content: any[]): string {
  if (!Array.isArray(content)) return '';
  
  return content.map(item => {
    if (typeof item === 'string') return item;
    
    const { type, text, styles } = item;
    
    if (type === 'text') {
      let html = text;
      
      if (styles?.bold) html = `<strong>${html}</strong>`;
      if (styles?.italic) html = `<em>${html}</em>`;
      if (styles?.underline) html = `<u>${html}</u>`;
      if (styles?.strike) html = `<del>${html}</del>`;
      if (styles?.code) html = `<code>${html}</code>`;
      
      return html;
    }
    
    return text || '';
  }).join('');
}

function generateMetaTags(settings: WebsiteSettings): string {
  return `
    <meta name="description" content="${settings.description || settings.title}">
    <meta property="og:title" content="${settings.title}">
    <meta property="og:description" content="${settings.description || settings.title}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${settings.title}">
    <meta name="twitter:description" content="${settings.description || settings.title}">
  `;
} 