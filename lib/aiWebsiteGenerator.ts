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
  colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'dark' | 'custom';
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
  
  // Create industry-standard focused prompt
  const prompt = `
Create a clean, professional website from this Liveblocks document content following industry standards.

${settings.includeNavigation ? 'CRITICAL: USER SELECTED NAVIGATION MENU - YOU MUST CREATE A FIXED TOP NAVIGATION BAR!' : ''}

Return ONLY the complete HTML document with embedded CSS - NO explanations, NO markdown, NO code blocks.

Start with <!DOCTYPE html> and include ALL CSS inline in a <style> tag.

**CONTENT:** ${contentString}

**INDUSTRY STANDARDS TO FOLLOW:**

**1. TYPOGRAPHY:**
- Font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif
- Sizes: h1 (2rem), h2 (1.5rem), h3 (1.25rem), body (1rem)
- Line-height: 1.5 for all text
- **CRITICAL TEXT CONTRAST RULE: Text color MUST be significantly different from background color for readability!**
- **Light backgrounds:** Use dark text (#000000, #1a202c, #2d3748, #4a5568)
- **Dark backgrounds:** Use light text (#ffffff, #f7fafc, #edf2f7, #e2e8f0)
- **NEVER use similar colors for text and background!**
- **Test contrast:** Text should be clearly visible and readable

**2. LAYOUT:**
- Container: max-width: 1200px, margin: 0 auto, padding: 1rem
- Sections: margin-bottom: 2rem, padding: 1rem
- Headings: margin-bottom: 0.5rem
- Paragraphs: margin-bottom: 1rem

**3. COLORS & MODERN STYLING:**
- **FOUNDATION: CRITICAL TEXT CONTRAST - Text must be clearly visible!**
- **Light backgrounds:** Use dark text (#000000, #1a202c, #2d3748, #4a5568)
- **Dark backgrounds:** Use light text (#ffffff, #f7fafc, #edf2f7, #e2e8f0)
- **NEVER use similar colors for text and background!**
- Backgrounds: Use gradients for visual appeal (linear-gradient)
- Cards: White/light backgrounds with subtle shadows
- Buttons: Gradient backgrounds with hover effects
- Accents: Modern colors (#667eea, #764ba2, #f093fb, #f5576c)
- **EXAMPLES:**
  - ✅ Good: Dark text (#2d3748) on light background (#ffffff)
  - ✅ Good: Light text (#ffffff) on dark background (#1a202c)
  - ❌ Bad: Light gray text (#e2e8f0) on light background (#f7fafc)
  - ❌ Bad: Dark gray text (#4a5568) on dark background (#2d3748)

**4. MODERN UI COMPONENTS:**
- **Buttons:** background: linear-gradient(135deg, #667eea, #764ba2), color: white, padding: 12px 24px, border-radius: 8px, border: none, cursor: pointer, transition: 0.3s ease, hover: transform: translateY(-2px), box-shadow: 0 4px 12px rgba(0,0,0,0.15)
- **Cards:** background: white, border-radius: 12px, box-shadow: 0 4px 20px rgba(0,0,0,0.1), padding: 2rem, margin: 1rem 0
- **Lists:** Remove default bullets, add custom styled bullet holders with background colors, padding, and icons
- **Sections:** Add subtle background gradients or colors for visual separation

**5. RESPONSIVE:**
- Mobile-first approach
- Breakpoints: 768px for tablet, 1024px for desktop
- Touch-friendly buttons (min 44px)

**6. NAVIGATION:** ${settings.includeNavigation ? `
CRITICAL: YOU MUST CREATE A NAVIGATION BAR! USER SELECTED NAVIGATION MENU!

NAVIGATION REQUIREMENTS:
- CREATE a fixed top navigation bar at the very top of the page
- Position: fixed, top: 0, left: 0, right: 0, z-index: 1000
- Background: rgba(255, 255, 255, 0.95) with backdrop-filter: blur(10px)
- Height: 70px, padding: 0 2rem
- Display: flex, justify-content: space-between, align-items: center
- Logo/Brand: Come up with a brand name based on the document content
- Navigation Links: Right side with these items: ${settings.navigationItems?.join(', ') || 'Home, About, Contact'}
- Link styling: padding: 8px 16px, border-radius: 6px, color: #2d3748, text-decoration: none
- Hover effects: background: rgba(102, 126, 234, 0.1), color: #667eea
- Create anchor links: href="#home", href="#about", etc. for smooth scrolling
- Add margin-top: 70px to body content to account for fixed nav
- MUST INCLUDE THIS NAVIGATION BAR IN THE HTML!
` : 'No navigation menu needed.'}

**CRITICAL: FOLLOW SELECTED STYLE EXACTLY!**

**SELECTED STYLE:** ${settings.style} - YOU MUST FOLLOW THIS STYLE PRECISELY!

**STYLE REQUIREMENTS:**
${settings.style === 'modern' ? `
- MODERN STYLE: Use glassmorphism, gradients, rounded corners, subtle shadows
- Colors: Clean whites, soft grays, modern accent colors
- Typography: Clean sans-serif, good spacing
- Layout: Card-based, generous whitespace, modern grid layouts
` : ''}${settings.style === 'minimal' ? `
- MINIMAL STYLE: Clean, simple, lots of whitespace, minimal colors
- Colors: Black, white, one accent color maximum
- Typography: Simple fonts, minimal text, clean hierarchy
- Layout: Sparse, focused, no unnecessary elements
` : ''}${settings.style === 'professional' ? `
- PROFESSIONAL STYLE: Business-appropriate, trustworthy, corporate
- Colors: Navy blues, grays, whites, conservative palette
- Typography: Traditional, readable, professional fonts
- Layout: Structured, organized, formal sections
` : ''}${settings.style === 'creative' ? `
- CREATIVE STYLE: Artistic, unique, expressive, bold
- Colors: Vibrant, creative combinations, artistic palette
- Typography: Interesting fonts, creative layouts
- Layout: Asymmetrical, artistic, creative compositions
` : ''}${settings.style === 'blog' ? `
- BLOG STYLE: Content-focused, readable, article-like
- Colors: Easy on eyes, reading-friendly palette
- Typography: Excellent readability, article formatting
- Layout: Content-first, readable columns, blog structure
` : ''}

**SELECTED COLOR SCHEME:** ${settings.colorScheme} - STICK TO THIS COLOR PALETTE!

**COLOR REQUIREMENTS:**
${settings.colorScheme === 'blue' ? `
- PRIMARY: Blues (#2563eb, #3b82f6, #60a5fa)
- SECONDARY: Light blues and whites
- ACCENT: Darker blues for contrast
` : ''}${settings.colorScheme === 'purple' ? `
- PRIMARY: Purples (#7c3aed, #8b5cf6, #a78bfa)
- SECONDARY: Light purples and whites
- ACCENT: Darker purples for contrast
` : ''}${settings.colorScheme === 'green' ? `
- PRIMARY: Greens (#059669, #10b981, #34d399)
- SECONDARY: Light greens and whites
- ACCENT: Darker greens for contrast
` : ''}${settings.colorScheme === 'orange' ? `
- PRIMARY: Oranges (#ea580c, #f97316, #fb923c)
- SECONDARY: Light oranges and whites
- ACCENT: Darker oranges for contrast
` : ''}${settings.colorScheme === 'dark' ? `
- PRIMARY: Dark grays and blacks (#1f2937, #374151, #4b5563)
- SECONDARY: Medium grays
- ACCENT: White text, bright accent colors
` : ''}

**MODERN STYLING REQUIREMENTS:**

**Buttons:** Create gradient buttons with hover effects - background: linear-gradient(135deg, #667eea, #764ba2), padding: 12px 24px, border-radius: 8px, hover: transform: translateY(-2px) and box-shadow

**Cards:** Use white backgrounds with subtle shadows - border-radius: 12px, box-shadow: 0 4px 20px rgba(0,0,0,0.1), padding: 2rem, hover effects

**Lists:** Style with custom bullet holders - remove default bullets, add background colors, use checkmarks or icons, padding: 12px 16px, border-left: 4px solid accent color

**Sections:** Add visual separation with subtle backgrounds or gradients, proper spacing, rounded corners

**CRITICAL RULES:**
- Keep "IMAGE_PLACEHOLDER" and "VIDEO_PLACEHOLDER" exactly as written
- Industry standards first, then modern styling
- **CRITICAL TEXT CONTRAST: Text color MUST be significantly different from background color!**
- **Light backgrounds = Dark text (#000000, #1a202c, #2d3748)**
- **Dark backgrounds = Light text (#ffffff, #f7fafc, #edf2f7)**
- **NEVER use similar colors for text and background!**
- High contrast text, beautiful modern elements
- Test readability, then enhance with style
- FOLLOW THE SELECTED STYLE (${settings.style}) AND COLOR SCHEME (${settings.colorScheme}) EXACTLY!
- DO NOT MIX STYLES OR CHANGE THE USER'S SELECTED THEME!

${settings.customInstructions ? `**CUSTOM:** ${settings.customInstructions}` : ''}

**FINAL REMINDER: STICK TO ${settings.style.toUpperCase()} STYLE WITH ${settings.colorScheme.toUpperCase()} COLORS!**

Return ONLY the HTML document.
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
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a SENIOR WEB DEVELOPER who follows industry standards while creating modern, beautiful websites. CRITICAL: ENSURE TEXT IS ALWAYS VISIBLE - NO WHITE TEXT ON WHITE BACKGROUNDS OR BLACK TEXT ON BLACK BACKGROUNDS! STYLE CONSISTENCY RULE: YOU MUST FOLLOW THE SELECTED STYLE AND COLOR SCHEME EXACTLY - DO NOT DEVIATE FROM USER'S CHOICES! INDUSTRY STANDARDS FIRST: 1) Clean, semantic HTML structure, 2) Accessible color contrast (WCAG AA), 3) Responsive design, 4) Standard typography hierarchy, 5) Consistent spacing. THEN ADD MODERN ELEMENTS: Styled buttons with hover effects, card layouts, smooth transitions, gradient backgrounds, subtle shadows, rounded corners, modern colors. NAVIGATION RULE: IF USER REQUESTS NAVIGATION, YOU MUST CREATE A FIXED TOP NAVIGATION BAR - DO NOT IGNORE THIS REQUIREMENT! FUNDAMENTAL RULES: Ensure perfect readability first, then enhance with modern styling. Use high contrast text. Create beautiful buttons with hover states. Style lists with modern bullet holders. Add cards for content sections. Use smooth transitions (0.3s ease). CRITICAL TEXT CONTRAST RULE: Text color MUST be significantly different from background color - NEVER use similar colors! Light backgrounds need dark text (#000000, #1a202c, #2d3748), dark backgrounds need light text (#ffffff, #f7fafc, #edf2f7). NEVER USE WHITE TEXT ON WHITE BACKGROUND OR BLACK TEXT ON BLACK BACKGROUND! CRITICAL: Return ONLY the complete HTML document with embedded CSS - NO explanations, NO markdown, NO code blocks. Start with <!DOCTYPE html> and include ALL CSS inline in a <style> tag. Keep IMAGE_PLACEHOLDER and VIDEO_PLACEHOLDER exactly as written - DO NOT convert them to HTML tags. TYPOGRAPHY: Use system fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif. Ensure readability first, then style beautifully. MODERN STYLING: Buttons with gradients, hover effects, shadows. Cards with subtle backgrounds. Beautiful bullet points. Smooth animations. ALWAYS MATCH THE SELECTED STYLE AND COLORS!"
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