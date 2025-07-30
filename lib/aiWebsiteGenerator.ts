import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DocumentData {
  title: string;
  content: any[];
  collaborators?: string[];
  lastModified?: Date;
}

export interface AIWebsiteSettings {
  style: 'modern' | 'minimal' | 'professional' | 'creative' | 'blog';
  colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'dark' | 'monochrome' | 'sunset' | 'ocean' | 'forest';
  includeNavigation?: boolean;
  includeTOC?: boolean;
  customInstructions?: string;
  navigationItems?: string[]; // Array of navigation item titles
}

export async function generateAIWebsite(
  documentData: DocumentData,
  settings: AIWebsiteSettings
): Promise<string> {
  
  // Convert Liveblocks content to a simple string representation
  let contentString = JSON.stringify(documentData.content, null, 2);
  
  console.log(`Original content length: ${contentString.length} characters`);
  
  // Extract base64 images and videos for later use
  const base64Images = contentString.match(/"data:image\/[^;]+;base64,[^"]+"/g) || [];
  const base64Videos = contentString.match(/"data:video\/[^;]+;base64,[^"]+"/g) || [];
  console.log(`Found ${base64Images.length} base64 images and ${base64Videos.length} base64 videos`);
  
  // Store the actual base64 data for later injection
  const extractedImages = base64Images.map(img => img.replace(/"/g, ''));
  const extractedVideos = base64Videos.map(video => video.replace(/"/g, ''));
  
  // Replace base64 with placeholders to keep content small
  contentString = contentString.replace(/"data:image\/[^;]+;base64,[^"]+"/g, '"IMAGE_PLACEHOLDER"');
  contentString = contentString.replace(/"data:video\/[^;]+;base64,[^"]+"/g, '"VIDEO_PLACEHOLDER"');
  
  // Also remove any other large data URLs
  contentString = contentString.replace(/"data:[^"]{1000,}"/g, '"DATA_URL_PLACEHOLDER"');
  
  // Remove any remaining large strings (base64 might be in different format)
  contentString = contentString.replace(/"[^"]{5000,}"/g, '"LARGE_DATA_PLACEHOLDER"');
  
  // Store extracted data for post-processing
  const imageData = extractedImages;
  const videoData = extractedVideos;
  
  console.log(`Content length after filtering: ${contentString.length} characters`);
  
  // Debug: Show what's taking up space if still large
  if (contentString.length > 5000) {
    console.log('🔍 DEBUG: Still large after base64 removal. Checking for other large strings...');
    const largeStrings = contentString.match(/"[^"]{1000,}"/g) || [];
    console.log(`Found ${largeStrings.length} large strings (>1000 chars)`);
    if (largeStrings.length > 0) {
      console.log('First large string length:', largeStrings[0]?.length || 0);
    }
  }
  
  // Much more aggressive content reduction - extract only essential info
  if (contentString.length > 2000) {
    console.log('🔍 DEBUG: Large content detected. Creating simplified version...');
    
    // Extract only the essential content (text, headings, lists)
    const simplifiedContent = documentData.content.map((block: any) => {
      if (typeof block === 'string') return block;
      
      const { type, content, props } = block;
      
      // Extract text content
      const textContent = content?.map((item: any) => item.text || '').join(' ') || '';
      
      switch (type) {
        case 'heading':
          return `# ${textContent}`;
        case 'paragraph':
          return textContent;
        case 'bulletListItem':
          return `• ${textContent}`;
        case 'numberedListItem':
          return `${props?.index || 1}. ${textContent}`;
        case 'quote':
          return `> ${textContent}`;
        case 'image':
          return `[IMAGE: ${textContent || 'Image'}]`;
        case 'video':
          return `[VIDEO: ${textContent || 'Video'}]`;
        default:
          return textContent;
      }
    }).filter(text => text.trim().length > 0).join('\n\n');
    
    contentString = simplifiedContent;
    console.log(`Simplified content length: ${contentString.length} characters`);
  }
  
  // Final truncation if still too long
  const maxContentLength = 2000; // Very conservative limit
  if (contentString.length > maxContentLength) {
    console.log(`Content too large (${contentString.length} chars), truncating...`);
    contentString = contentString.substring(0, maxContentLength) + '...';
  }
  
  // Helper functions for cleaner prompt organization
  function getStyleDefinition(style: string): string {
    const definitions = {
      modern: `
• Clean, contemporary design with subtle animations
• Glassmorphism effects and gradient backgrounds  
• Rounded corners (8px-16px), soft shadows
• Card-based layouts with ample whitespace
• Smooth hover transitions and micro-interactions`,

      minimal: `
• Extreme simplicity with maximum impact
• Monochromatic or limited color palette
• Abundant whitespace and clean typography
• No decorative elements or unnecessary styling
• Focus on content hierarchy and readability`,

      professional: `
• Corporate and trustworthy appearance
• Conservative color palette (blues, grays, whites)
• Structured layouts with clear sections
• Traditional typography and formal styling
• Business-appropriate design elements`,

      creative: `
• Bold, artistic, and expressive design
• Vibrant colors and unique compositions
• Asymmetrical layouts and creative typography
• Eye-catching visuals and dynamic elements
• Artistic freedom while maintaining usability`,

      blog: `
• Content-first design optimized for reading
• Typography-focused with excellent readability
• Article-style layouts with proper spacing
• Sidebar or minimal navigation
• Reading-friendly color schemes and fonts`
    };

    return definitions[style as keyof typeof definitions] || definitions.modern;
  }

  function getColorDefinition(colorScheme: string): string {
    const definitions = {
      blue: `
• Primary: #2563eb (blue-600), #3b82f6 (blue-500)
• Secondary: #dbeafe (blue-100), #bfdbfe (blue-200)  
• Accent: #1d4ed8 (blue-700), #1e40af (blue-800)
• Text: #1e293b on light, #f8fafc on dark
• Background: #ffffff, #f8fafc (light gray)`,

      purple: `
• Primary: #7c3aed (violet-600), #8b5cf6 (violet-500)
• Secondary: #ede9fe (violet-100), #ddd6fe (violet-200)
• Accent: #6d28d9 (violet-700), #5b21b6 (violet-800) 
• Text: #1e293b on light, #f8fafc on dark
• Background: #ffffff, #faf5ff (purple tint)`,

      green: `
• Primary: #059669 (emerald-600), #10b981 (emerald-500)
• Secondary: #d1fae5 (emerald-100), #a7f3d0 (emerald-200)
• Accent: #047857 (emerald-700), #065f46 (emerald-800)
• Text: #1e293b on light, #f8fafc on dark  
• Background: #ffffff, #f0fdf4 (green tint)`,

      orange: `
• Primary: #ea580c (orange-600), #f97316 (orange-500)
• Secondary: #fed7aa (orange-200), #fdba74 (orange-300)
• Accent: #c2410c (orange-700), #9a3412 (orange-800)
• Text: #1e293b on light, #f8fafc on dark
• Background: #ffffff, #fff7ed (orange tint)`,

      dark: `
• Primary: #374151 (gray-700), #4b5563 (gray-600)
• Secondary: #1f2937 (gray-800), #111827 (gray-900)
• Accent: #6366f1 (indigo-500), #8b5cf6 (violet-500)
• Text: #f9fafb on dark, #1f2937 on light
• Background: #111827, #1f2937 (dark grays)`,

      monochrome: `
• Primary: #000000, #ffffff
• Secondary: #f3f4f6 (gray-100), #e5e7eb (gray-200)
• Accent: #6b7280 (gray-500), #374151 (gray-700)
• Text: #000000 on light, #ffffff on dark
• Background: #ffffff, #f9fafb (near white)`,

      sunset: `
• Primary: #f59e0b (amber-500), #f97316 (orange-500)
• Secondary: #fef3c7 (amber-100), #fed7aa (orange-200)
• Accent: #dc2626 (red-600), #be185d (pink-700)
• Text: #1e293b on light, #f8fafc on dark
• Background: #ffffff, #fffbeb (warm tint)`,

      ocean: `
• Primary: #0891b2 (cyan-600), #06b6d4 (cyan-500)
• Secondary: #cffafe (cyan-100), #a5f3fc (cyan-200)
• Accent: #0e7490 (cyan-700), #155e75 (cyan-800)
• Text: #1e293b on light, #f8fafc on dark
• Background: #ffffff, #f0fdff (cyan tint)`,

      forest: `
• Primary: #16a34a (green-600), #22c55e (green-500)
• Secondary: #dcfce7 (green-100), #bbf7d0 (green-200)
• Accent: #15803d (green-700), #166534 (green-800)
• Text: #1e293b on light, #f8fafc on dark
• Background: #ffffff, #f0fdf4 (green tint)`
    };

    return definitions[colorScheme as keyof typeof definitions] || definitions.blue;
  }

  // Create FOCUSED industry-standard prompt that prioritizes fundamentals
  const prompt = `
Create a modern, professional website from this document content. Return ONLY complete HTML with embedded CSS.

CONTENT: ${contentString}

=== CORE REQUIREMENTS ===
• Start with <!DOCTYPE html> and include ALL CSS in <style> tag
• Use semantic HTML5 structure (header, main, section, article, footer)
• Ensure WCAG AA accessibility compliance (contrast ratio ≥ 4.5:1)
• Keep IMAGE_PLACEHOLDER and VIDEO_PLACEHOLDER exactly as written
• Mobile-first responsive design with fluid typography

=== SELECTED STYLE: ${settings.style.toUpperCase()} ===
${getStyleDefinition(settings.style)}

=== COLOR SCHEME: ${settings.colorScheme.toUpperCase()} ===
${getColorDefinition(settings.colorScheme)}

=== TYPOGRAPHY SYSTEM ===
• Font Stack: Inter, system-ui, -apple-system, sans-serif
• Scale: h1(2.5rem), h2(2rem), h3(1.5rem), h4(1.25rem), body(1rem)
• Line Height: 1.6 for body, 1.2 for headings
• Font Weights: 400(normal), 500(medium), 600(semibold), 700(bold)

=== LAYOUT SYSTEM ===
• Container: max-width: 1280px, padding: clamp(1rem, 5vw, 2rem)
• Spacing: 4px base unit, multiples of 4 (8, 12, 16, 24, 32, 48, 64)
• Grid: CSS Grid for layouts, Flexbox for components
• Breakpoints: 640px(sm), 768px(md), 1024px(lg), 1280px(xl)

=== MODERN COMPONENTS ===
• Buttons: rounded-lg, shadow-sm, hover:shadow-md, transition-all
• Cards: bg-white, shadow-lg, rounded-xl, border border-gray-100
• Sections: py-16 md:py-24, proper content hierarchy
• Images: object-cover, rounded corners, proper aspect ratios

${settings.includeNavigation ? `
=== NAVIGATION REQUIREMENTS ===
• Fixed header: backdrop-blur-sm, bg-white/80, shadow-sm
• Height: 4rem, z-index: 50
• Logo: text-xl font-bold
• Links: ${settings.navigationItems?.join(', ') || 'Home, About, Services, Contact'}
• Mobile: hamburger menu with smooth transitions
• Add padding-top to body content to offset fixed header
` : ''}

${settings.customInstructions ? `=== CUSTOM REQUIREMENTS ===
${settings.customInstructions}` : ''}

=== OUTPUT FORMAT ===
Return complete HTML document starting with <!DOCTYPE html>. No explanations or markdown.
`;

  // Check prompt length and truncate if too long
  const maxPromptLength = 15000;
  const finalPrompt = prompt.length > maxPromptLength ? 
    prompt.substring(0, maxPromptLength) + '\n\n[Content truncated due to length]' : 
    prompt;
  
  console.log('Prompt length:', finalPrompt.length, 'characters');
  console.log('Content length:', contentString.length, 'characters');
  
  // Debug: Show what's in the content
  if (contentString.includes('base64')) {
    console.log('⚠️ WARNING: Still contains base64 data!');
    const base64Matches = contentString.match(/data:[^"]+base64,[^"]+/g);
    console.log(`Found ${base64Matches?.length || 0} base64 strings`);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a senior frontend developer who creates modern, accessible websites following industry standards. CORE PRINCIPLES: 1) Semantic HTML5 structure 2) WCAG AA accessibility compliance 3) Mobile-first responsive design 4) Modern CSS best practices 5) Optimized performance. DESIGN APPROACH: Clean, professional layouts with proper typography hierarchy, consistent spacing, and excellent color contrast. Use contemporary design patterns like card layouts, subtle shadows, smooth transitions, and grid-based structures. CRITICAL: Always ensure perfect text readability and follow the specified style/color scheme exactly. Return only complete HTML with embedded CSS."
        },
        {
          role: "user",
          content: finalPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const aiGeneratedHTML = response.choices[0]?.message?.content;
    
    if (!aiGeneratedHTML) {
      throw new Error('Failed to generate website content');
    }

    // Clean up the response to ensure it's only HTML
    let cleanHTML = aiGeneratedHTML.trim();
    
    // Remove any markdown code blocks
    if (cleanHTML.startsWith('```html')) {
      cleanHTML = cleanHTML.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanHTML.startsWith('```')) {
      cleanHTML = cleanHTML.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Replace placeholders with actual image/video sections
    let imageIndex = 0;
    let videoIndex = 0;
    
    // Also replace any external image URLs that AI might have generated
    cleanHTML = cleanHTML.replace(/src="[^"]*\.(jpg|jpeg|png|gif|webp)"/g, (match) => {
      const imageUrl = imageData[imageIndex];
      imageIndex++;
      return imageUrl ? `src="${imageUrl}"` : match;
    });
    
    // Remove any <img> tags that AI might have generated and replace with placeholders
    cleanHTML = cleanHTML.replace(/<img[^>]*>/g, 'IMAGE_PLACEHOLDER');
    cleanHTML = cleanHTML.replace(/<video[^>]*>[\s\S]*?<\/video>/g, 'VIDEO_PLACEHOLDER');
    
    cleanHTML = cleanHTML.replace(/IMAGE_PLACEHOLDER/g, () => {
      const imageUrl = imageData[imageIndex];
      imageIndex++;
      
      if (imageUrl) {
        return `<img src="${imageUrl}" alt="Document Image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); margin: 1.5rem 0; display: block; object-fit: cover;" />`;
      } else {
        return `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1rem; font-weight: 500; margin: 1.5rem 0;">📸 Image</div>`;
      }
    });
    
    cleanHTML = cleanHTML.replace(/VIDEO_PLACEHOLDER/g, () => {
      const videoUrl = videoData[videoIndex];
      videoIndex++;
      
      if (videoUrl) {
        return `<video controls style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); margin: 1.5rem 0; display: block;"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
      } else {
        return `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1rem; font-weight: 500; margin: 1.5rem 0;">🎥 Video</div>`;
      }
    });
    
    // Ensure it starts with <!DOCTYPE html>
    if (!cleanHTML.startsWith('<!DOCTYPE html>')) {
      cleanHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 2rem; 
        }
        .hero { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 4rem 2rem; 
            text-align: center; 
            border-radius: 20px; 
            margin-bottom: 2rem; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }
        .content { 
            background: white; 
            padding: 2rem; 
            border-radius: 16px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            line-height: 1.7;
        }
        h1, h2, h3 { margin-bottom: 1rem; }
        p { margin-bottom: 1rem; }
        img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>Generated Website</h1>
        </div>
        <div class="content">
            ${cleanHTML}
        </div>
    </div>
</body>
</html>`;
    }

    return cleanHTML;
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.log('Document data:', {
      contentLength: contentString.length,
      promptLength: finalPrompt.length
    });
    
    console.log('AI generation failed, trying fallback approach...');
    
    // Fallback: Create a simple but beautiful HTML page
    return createFallbackHTML(documentData, contentString, [], settings);
  }
}

function createFallbackHTML(
  documentData: DocumentData,
  contentString: string,
  images: Array<{url: string, caption: string}>,
  settings: AIWebsiteSettings
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6rem 2rem;
            text-align: center;
            margin-bottom: 3rem;
            border-radius: 20px;
        }
        
        .hero h1 {
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .content {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
            margin: 2rem 0;
        }
        
        .content pre {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 12px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero { padding: 4rem 1rem; }
            .container { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>Generated Website</h1>
            <p>Created from Liveblocks Document</p>
        </div>
        
        <div class="content">
            <h2>Document Content</h2>
            <pre>${contentString}</pre>
        </div>
    </div>
</body>
</html>`;
}

export async function analyzeDocumentForWebsite(
  documentData: DocumentData
): Promise<{
  suggestedStyle: AIWebsiteSettings['style'];
  suggestedColorScheme: AIWebsiteSettings['colorScheme'];
  contentAnalysis: string;
}> {
  const contentString = JSON.stringify(documentData.content, null, 2);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Analyze this Liveblocks document content and suggest the best website style and color scheme. Return only a JSON object with 'suggestedStyle', 'suggestedColorScheme', and 'contentAnalysis' fields."
        },
        {
          role: "user",
          content: `Analyze this document: ${contentString.substring(0, 2000)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const analysis = response.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('Failed to analyze document');
    }

    // Clean up any markdown formatting from the response
    const cleanAnalysis = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsed = JSON.parse(cleanAnalysis);
      return {
        suggestedStyle: parsed.suggestedStyle || 'modern',
        suggestedColorScheme: parsed.suggestedColorScheme || 'blue',
        contentAnalysis: parsed.contentAnalysis || 'Content analysis unavailable'
      };
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      return {
        suggestedStyle: 'modern',
        suggestedColorScheme: 'blue',
        contentAnalysis: 'Content analysis unavailable'
      };
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    return {
      suggestedStyle: 'modern',
      suggestedColorScheme: 'blue',
      contentAnalysis: 'Analysis failed'
    };
  }
}