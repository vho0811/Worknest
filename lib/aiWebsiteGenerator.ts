import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DocumentData {
  title: string;
  content: any[];
  collaborators?: string[];
  lastModified?: Date;
}

export interface AIWebsiteSettings {
  style: 'modern' | 'minimal' | 'professional' | 'creative' | 'blog';
  colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'rose' | 'amber' | 'slate' | 'gradient';
  includeNavigation?: boolean;
  includeTOC?: boolean;
  customInstructions?: string;
  navigationItems?: string[]; // Array of navigation item titles
  autoGenerateImages?: boolean; // New: Auto-generate images when none provided
  enhanceContent?: boolean; // New: Automatically enhance content
  addIcons?: boolean; // New: Add relevant icons
}

// New: Enhanced content analysis for proactive suggestions
interface ContentAnalysis {
  contentType: 'business' | 'creative' | 'technical' | 'personal' | 'ecommerce' | 'portfolio' | 'blog' | 'landing';
  targetAudience: string;
  keyThemes: string[];
  suggestedSections: string[];
  callToActions: string[];
  visualElements: string[];
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'creative';
  industry: string;
}

// New: Generate images using AI
async function generateAIImages(content: string, count: number = 3): Promise<string[]> {
  try {
    // Analyze content to determine the most relevant image types
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: `Analyze this content and determine the most relevant image types for a website:

Content: ${content.substring(0, 1500)}

Based on the content, provide:
1. Content type (business, ecommerce, portfolio, blog, etc.)
2. Primary industry/theme
3. Target audience
4. 3 specific image descriptions that would be most relevant

Return in this exact format:
CONTENT_TYPE: [type]
INDUSTRY: [industry]
AUDIENCE: [audience]
IMAGE1: [specific description for hero image]
IMAGE2: [specific description for content image]
IMAGE3: [specific description for supporting image]`
        }
      ]
    });

    const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    // Parse the analysis
    const lines = analysis.split('\n').filter(line => line.trim());
    const contentType = lines.find(line => line.startsWith('CONTENT_TYPE:'))?.split(':')[1]?.trim() || 'business';
    const industry = lines.find(line => line.startsWith('INDUSTRY:'))?.split(':')[1]?.trim() || 'general';
    const image1 = lines.find(line => line.startsWith('IMAGE1:'))?.split(':')[1]?.trim() || 'professional business meeting';
    const image2 = lines.find(line => line.startsWith('IMAGE2:'))?.split(':')[1]?.trim() || 'modern office workspace';
    const image3 = lines.find(line => line.startsWith('IMAGE3:'))?.split(':')[1]?.trim() || 'team collaboration';
    
    console.log(`🎯 Content analysis: ${contentType} in ${industry} industry`);
    console.log(`🖼️ Image descriptions: ${image1}, ${image2}, ${image3}`);
    
    // Generate relevant images based on content analysis
    const images = [];
    
    // Hero image (first image)
    if (contentType.includes('ecommerce') || industry.includes('retail')) {
      images.push('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Shopping
    } else if (contentType.includes('portfolio') || industry.includes('creative')) {
      images.push('https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Creative work
    } else if (contentType.includes('tech') || industry.includes('technology')) {
      images.push('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Tech
    } else if (contentType.includes('food') || industry.includes('restaurant')) {
      images.push('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Food
    } else if (contentType.includes('fitness') || industry.includes('health')) {
      images.push('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Fitness
    } else if (contentType.includes('education') || industry.includes('learning')) {
      images.push('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Education
    } else {
      images.push('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Business
    }
    
    // Content image (second image)
    if (contentType.includes('ecommerce')) {
      images.push('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Products
    } else if (contentType.includes('portfolio')) {
      images.push('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Design work
    } else if (contentType.includes('tech')) {
      images.push('https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Coding
    } else if (contentType.includes('food')) {
      images.push('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Cooking
    } else if (contentType.includes('fitness')) {
      images.push('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Workout
    } else {
      images.push('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Office
    }
    
    // Supporting image (third image)
    if (contentType.includes('ecommerce')) {
      images.push('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // More products
    } else if (contentType.includes('portfolio')) {
      images.push('https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Creative process
    } else if (contentType.includes('tech')) {
      images.push('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Development
    } else if (contentType.includes('food')) {
      images.push('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Food prep
    } else if (contentType.includes('fitness')) {
      images.push('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Training
    } else {
      images.push('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); // Team
    }
    
    return images;
  } catch (error) {
    console.error('Failed to generate AI images:', error);
    // Fallback to generic professional images
    return [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
    ];
  }
}

// New: Enhanced content analysis
async function analyzeContentProactively(content: string): Promise<ContentAnalysis> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: `Analyze this content and provide comprehensive insights for website design:

Content: ${content.substring(0, 2000)}

Provide analysis in this exact JSON format:
{
  "contentType": "business|creative|technical|personal|ecommerce|portfolio|blog|landing",
  "targetAudience": "description of target audience",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "suggestedSections": ["section1", "section2", "section3"],
  "callToActions": ["cta1", "cta2"],
  "visualElements": ["element1", "element2"],
  "tone": "professional|casual|friendly|authoritative|creative",
  "industry": "industry name"
}

Focus on actionable insights that can improve the website design and user experience.`
        }
      ]
    });

    const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const cleanAnalysis = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(cleanAnalysis);
    } catch (parseError) {
      console.error('Failed to parse content analysis:', parseError);
      return {
        contentType: 'business',
        targetAudience: 'General audience',
        keyThemes: ['Professional', 'Quality', 'Service'],
        suggestedSections: ['Hero', 'About', 'Services'],
        callToActions: ['Learn More', 'Contact Us'],
        visualElements: ['Professional imagery', 'Clean design'],
        tone: 'professional',
        industry: 'General'
      };
    }
  } catch (error) {
    console.error('Content analysis failed:', error);
    return {
      contentType: 'business',
      targetAudience: 'General audience',
      keyThemes: ['Professional', 'Quality', 'Service'],
      suggestedSections: ['Hero', 'About', 'Services'],
      callToActions: ['Learn More', 'Contact Us'],
      visualElements: ['Professional imagery', 'Clean design'],
      tone: 'professional',
      industry: 'General'
    };
  }
}

// New: Enhance content with AI
async function enhanceContentWithAI(content: string, analysis: ContentAnalysis): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: `Enhance this content for a website, making it more engaging and professional:

Original Content: ${content.substring(0, 1500)}

Content Analysis:
- Type: ${analysis.contentType}
- Target Audience: ${analysis.targetAudience}
- Key Themes: ${analysis.keyThemes.join(', ')}
- Tone: ${analysis.tone}

Enhance the content by:
1. Adding compelling headlines and subheadings
2. Improving readability and flow
3. Adding relevant call-to-actions
4. Making it more engaging for the target audience
5. Maintaining the original message while making it more web-friendly

Return the enhanced content with better structure and engagement.`
        }
      ]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : content;
  } catch (error) {
    console.error('Content enhancement failed:', error);
    return content;
  }
}

// New: Generate relevant icons
function generateIconsForContent(content: string, analysis: ContentAnalysis): string[] {
  const icons = {
    business: ['💼', '📊', '🎯', '📈', '🤝'],
    creative: ['🎨', '✨', '🚀', '💡', '🌟'],
    technical: ['⚡', '🔧', '💻', '🔬', '📱'],
    personal: ['👤', '💝', '📖', '🎭', '🌱'],
    ecommerce: ['🛒', '💰', '📦', '🏷️', '🛍️'],
    portfolio: ['📸', '🎬', '🎵', '✍️', '🎪'],
    blog: ['📝', '📚', '💭', '🔍', '📖'],
    landing: ['🎯', '🚀', '💎', '⭐', '🔥']
  };

  const contentType = analysis.contentType as keyof typeof icons;
  return icons[contentType] || icons.business;
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
  let imageData = extractedImages;
  let videoData = extractedVideos;
  
  console.log(`Content length after filtering: ${contentString.length} characters`);
  
  // NEW: Proactive content enhancement
  let enhancedContent = contentString;
  let contentAnalysis: ContentAnalysis | null = null;
  let generatedIcons: string[] = [];
  
  if (settings.enhanceContent !== false) {
    console.log('🔍 Analyzing content proactively...');
    contentAnalysis = await analyzeContentProactively(contentString);
    console.log('📊 Content analysis complete:', contentAnalysis);
    
    enhancedContent = await enhanceContentWithAI(contentString, contentAnalysis);
    console.log('✨ Content enhanced');
    
    if (settings.addIcons !== false) {
      generatedIcons = generateIconsForContent(contentString, contentAnalysis);
      console.log('🎨 Generated icons:', generatedIcons);
    }
  }
  
  // NEW: Auto-generate images if none provided and setting is enabled
  if (imageData.length === 0 && settings.autoGenerateImages !== false) {
    console.log('🖼️ No images found, generating AI images...');
    const aiGeneratedImages = await generateAIImages(contentString, 3);
    imageData = [...imageData, ...aiGeneratedImages];
    console.log('✅ Generated', aiGeneratedImages.length, 'AI images');
  }
  
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

  // Create an intelligent, comprehensive prompt for world-class website generation
  const systemPrompt = `You are an elite full-stack developer and UX designer with 15+ years of experience creating award-winning websites. You specialize in translating any content into stunning, modern websites that rival the best agencies.

CORE EXPERTISE:
- Modern web design principles and latest UI/UX trends
- Advanced CSS techniques (Grid, Flexbox, animations, micro-interactions)
- Accessibility (WCAG 2.1 AA compliance)
- Performance optimization and mobile-first design
- Brand-aligned color psychology and typography
- Conversion-focused layouts and user flows

DESIGN PHILOSOPHY:
Create websites that are not just functional, but emotionally engaging and memorable. Every element should serve a purpose and contribute to the overall user experience.

OUTPUT REQUIREMENTS:
- Generate ONLY complete, production-ready HTML with embedded CSS
- NO explanations, markdown formatting, or code blocks
- Self-contained file that works immediately when opened
- Include proper meta tags, responsive design, and accessibility features
- PRESERVE ALL IMAGES: When you see image markers, create <img> tags with src="IMAGE_PLACEHOLDER"

TECHNICAL STANDARDS:
- Semantic HTML5 structure
- Modern CSS with custom properties (CSS variables)
- Responsive design that works on all devices (320px to 2560px)
- Smooth animations and micro-interactions
- Optimized performance (minimal CSS, efficient selectors)
- Cross-browser compatibility

VISUAL DESIGN EXCELLENCE:
- Professional typography hierarchy with perfect spacing
- Sophisticated color schemes with proper contrast ratios
- Modern layout patterns (cards, grids, hero sections)
- Subtle shadows, gradients, and visual depth
- Consistent design system throughout
- White space as a design element

ADVANCED FEATURES TO INCLUDE:
- Smooth scroll animations and parallax effects
- Hover states and interactive elements
- Loading animations and transitions
- Mobile-optimized touch interactions
- Proper focus states for accessibility
- SEO-optimized structure

CONTENT INTELLIGENCE:
Analyze the provided content and automatically:
- Extract key themes and create appropriate sections
- Generate compelling headlines and CTAs
- Organize information in logical flow
- Create navigation based on content structure
- Add relevant icons and visual elements
- **CRITICAL**: Convert ALL image markers ([IMAGE:...], IMAGE_PLACEHOLDER) into proper <img> tags

IMAGE HANDLING RULES:
1. When you see [IMAGE: something] → create: <img src="IMAGE_PLACEHOLDER" alt="Document Image">
2. When you see IMAGE_PLACEHOLDER → create: <img src="IMAGE_PLACEHOLDER" alt="Document Image">  
3. NEVER ignore image markers - they represent real user images
4. Always include proper responsive styling for images
5. Place images logically within the content flow

🎨 ADVANCED IMAGE PLACEMENT & STYLING:
- STRATEGIC PLACEMENT: Place images where they have maximum visual impact
- HERO IMAGES: Use first/main images as large hero elements (width: 100%, height: 400-600px)
- CONTENT IMAGES: Embed images within text with proper margins and flow
- GALLERY STYLE: Multiple images should be in responsive grids
- SIZING STRATEGY: Vary image sizes based on importance and content context
- VISUAL HIERARCHY: Larger images for key concepts, smaller for supporting content
- RESPONSIVE DESIGN: Images must work perfectly on mobile (max-width: 100%)
- PROFESSIONAL STYLING: Add shadows, borders, and modern CSS effects
- CONTEXTUAL POSITIONING: Float images left/right with text wrap when appropriate
- BREATHING ROOM: Always include generous margins around images

CSS STYLING FOR IMAGES:
- Use object-fit: cover for consistent aspect ratios
- Add border-radius for modern appearance (8-16px)
- Include subtle box-shadows for depth
- Implement hover effects where appropriate
- Ensure proper spacing with margin/padding
- Consider image overlays or captions when relevant

STYLE ADAPTATION:
Based on content type, automatically apply:
- Business/Corporate: Clean, professional, trust-building
- Creative/Portfolio: Bold, artistic, visually striking
- Blog/Content: Reader-friendly, typography-focused
- Product/SaaS: Conversion-optimized, feature-focused
- Personal: Warm, authentic, story-driven

Remember: You're not just coding a website, you're crafting a digital experience that tells a story and drives action. ALWAYS preserve user images by converting markers to <img> tags.

🏆 LEGENDARY WEBSITE CREATION MASTERY:
You are not just a developer - you are a digital architect, brand storyteller, and conversion wizard rolled into one. Your websites don't just look good, they create emotional connections and drive results.

🎯 PSYCHOLOGICAL DESIGN PRINCIPLES:
- COGNITIVE LOAD THEORY: Reduce mental effort through clear information hierarchy
- COLOR PSYCHOLOGY: Use colors that evoke specific emotions aligned with content purpose
- VISUAL ANCHORING: Create focal points that guide attention to key messages
- SOCIAL PROOF INTEGRATION: Naturally weave in credibility signals
- SCARCITY & URGENCY: Subtle design cues that encourage action
- TRUST BUILDING: Visual elements that establish immediate credibility

⚡ MICRO-INTERACTION MASTERY:
- HOVER SYMPHONIES: Every element responds to user interaction with purposeful animations
- SCROLL CHOREOGRAPHY: Content reveals itself through engaging scroll-triggered animations
- LOADING POETRY: Transform loading states into delightful micro-experiences
- CLICK FEEDBACK: Immediate visual/tactile responses to all user actions
- GESTURE FLUIDITY: Touch interactions feel natural and responsive

🎨 VISUAL STORYTELLING GENIUS:
- NARRATIVE FLOW: Content progression tells a compelling story from hero to CTA
- EMOTIONAL JOURNEY: Visual design guides users through specific emotional states
- BRAND PERSONALITY: Every design choice reflects and amplifies brand character
- VISUAL METAPHORS: Use design elements that reinforce content meaning
- MEMORABLE MOMENTS: Create "wow" moments that users remember and share

🔥 CONVERSION OPTIMIZATION SECRETS:
- EYE-TRACKING OPTIMIZATION: Layout follows natural reading patterns (F-pattern, Z-pattern)
- FRICTION ELIMINATION: Remove every possible barrier between user and desired action
- PROGRESSIVE DISCLOSURE: Reveal information in perfect sequence to build desire
- ANCHOR PRICING: Visual presentation that influences decision-making
- LOSS AVERSION: Design elements that create fear of missing out
- SOCIAL VALIDATION: Visual cues that show others have taken action

🚀 TECHNICAL WIZARDRY:
- 60FPS SMOOTHNESS: All animations run at perfect 60fps
- LIGHTHOUSE PERFECTION: 100% scores on performance, accessibility, SEO
- CORE WEB VITALS: Optimized LCP, FID, CLS for Google ranking
- PREFETCHING INTELLIGENCE: Anticipate user needs with smart resource loading
- PROGRESSIVE ENHANCEMENT: Works flawlessly even on old browsers
- ACCESSIBILITY EXCELLENCE: WCAG 2.1 AAA compliance with beautiful execution

💎 ENTERPRISE-GRADE POLISH:
- PIXEL-PERFECT PRECISION: Every element positioned with mathematical accuracy
- TYPOGRAPHY ARTISTRY: Font choices that enhance readability and brand perception
- WHITESPACE MASTERY: Breathing room that creates premium feel
- GRID SYSTEM PERFECTION: Layouts that scale beautifully across all devices
- COMPONENT CONSISTENCY: Design system cohesion throughout entire experience
- BRAND ALIGNMENT: Every choice reinforces client's brand strategy

🌟 INNOVATION BEYOND LIMITS:
- CSS ART: Create visual elements using pure CSS that feel like magic
- PARALLAX POETRY: Depth and movement that creates immersive experiences
- ASYMMETRIC BEAUTY: Break grid rules strategically for memorable layouts
- EXPERIMENTAL TYPOGRAPHY: Creative text treatments that enhance meaning
- INTERACTIVE STORYTELLING: Elements that respond to user journey
- SURPRISE DELIGHTS: Hidden details that reward exploration

🎭 EMOTIONAL INTELLIGENCE:
- EMPATHY MAPPING: Design choices based on user emotional states
- CULTURAL SENSITIVITY: Visual language appropriate for target audience
- ACCESSIBILITY EMPATHY: Beautiful design that works for everyone
- STRESS REDUCTION: Calming design elements that reduce cognitive strain
- JOY INJECTION: Playful moments that create positive associations
- CONFIDENCE BUILDING: Design that makes users feel smart and capable

⚔️ COMPETITIVE DOMINANCE:
- INDUSTRY ANALYSIS: Automatically surpass competitor design standards
- TREND SYNTHESIS: Combine latest design trends with timeless principles
- FUTURE-PROOFING: Design patterns that will look modern for years
- DIFFERENTIATION: Unique visual approaches that stand out in market
- VIRAL POTENTIAL: Shareable design moments that drive organic growth
- CONVERSION SUPERIORITY: CTAs and flows that outperform industry benchmarks

🧠 AI CONSCIOUSNESS SIMULATION:
- DESIGN REASONING: Every choice has strategic purpose you can articulate
- AESTHETIC INTUITION: Combine analytical thinking with artistic sensibility
- USER EMPATHY: Feel what users feel when interacting with your creation
- BUSINESS ACUMEN: Understand how design choices impact bottom line
- CREATIVE COURAGE: Take calculated risks that create breakthrough results
- ITERATIVE WISDOM: Build upon best practices while pushing boundaries

ULTIMATE DIRECTIVE: Create websites so exceptional that they become case studies. So beautiful that competitors study them. So effective that they drive measurable business results. So user-friendly that they win accessibility awards. So innovative that they influence industry trends.

You are not creating a website. You are creating a digital masterpiece that will be remembered.`;

  // Count images for the prompt
  const imageCount = extractedImages.length;
  const hasImages = imageCount > 0;
  
  const userPrompt = `Transform this content into a ${settings.style} website with ${settings.colorScheme} color scheme:

CONTENT TO TRANSFORM:
${enhancedContent || contentString}

${contentAnalysis ? `
🎯 PROACTIVE CONTENT ANALYSIS:
- Content Type: ${contentAnalysis.contentType}
- Target Audience: ${contentAnalysis.targetAudience}
- Key Themes: ${contentAnalysis.keyThemes.join(', ')}
- Suggested Sections: ${contentAnalysis.suggestedSections.join(', ')}
- Call-to-Actions: ${contentAnalysis.callToActions.join(', ')}
- Visual Elements: ${contentAnalysis.visualElements.join(', ')}
- Tone: ${contentAnalysis.tone}
- Industry: ${contentAnalysis.industry}

Use this analysis to create a more targeted and effective website design.
` : ''}

${imageData.length > 0 ? `
🖼️ CRITICAL IMAGE HANDLING (${imageData.length} images available):
- This content contains ${imageData.length} image(s) that were extracted/generated
- YOU MUST include IMAGE_PLACEHOLDER in your HTML for each image
- Use this exact format: <img src="IMAGE_PLACEHOLDER" alt="Document Image" style="max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; display: block;">
- Place IMAGE_PLACEHOLDER strategically throughout your HTML
- These will be automatically replaced with the actual images after generation
- DO NOT ignore this instruction - images are essential for the website

🎯 MANDATORY IMAGE PLACEMENT:
- HERO SECTION: Include IMAGE_PLACEHOLDER in the hero/header area
- CONTENT SECTIONS: Add IMAGE_PLACEHOLDER in main content areas
- GALLERY: If multiple images, create a gallery with IMAGE_PLACEHOLDER repeated
- RESPONSIVE: Ensure images work on all devices
- STYLING: Use modern CSS for beautiful image presentation

💎 IMAGE INTEGRATION REQUIREMENTS:
- First image should be a hero image (large, prominent)
- Additional images should be distributed throughout content
- Use proper alt text and responsive styling
- Create visual hierarchy with different image sizes
- Ensure images enhance the overall design narrative
` : `
🖼️ NO IMAGES DETECTED:
- No images were found in the content
- Consider adding relevant placeholder images or illustrations
- Use modern CSS to create visual interest without images
- Focus on typography, color, and layout to create visual appeal
`}

${generatedIcons.length > 0 ? `
🎨 GENERATED ICONS: ${generatedIcons.join(' ')}
Use these icons strategically throughout the design to enhance visual appeal and user experience.
` : ''}

STYLE REQUIREMENTS:
- Style: ${settings.style}
- Color Scheme: ${settings.colorScheme}
- Include Navigation: ${settings.includeNavigation}
- Include Table of Contents: ${settings.includeTOC}
${settings.navigationItems && settings.navigationItems.length > 0 ? `- Navigation Items: ${settings.navigationItems.join(', ')}` : ''}
${settings.customInstructions ? `- Special Instructions: ${settings.customInstructions}` : ''}

CONTENT INTELLIGENCE TASKS:
1. Analyze the content tone, purpose, and target audience
2. Create a compelling site structure with logical sections
3. Generate appropriate headlines and subheadings
4. Design call-to-action elements where relevant
5. Add visual hierarchy that guides the eye naturally
${imageData.length > 0 ? '6. MANDATORY: Include IMAGE_PLACEHOLDER in your HTML for each available image' : '6. Include placeholder images that match the content theme'}
7. Optimize for both desktop and mobile experiences
${contentAnalysis ? '8. USE CONTENT ANALYSIS: Incorporate the provided analysis insights into the design' : ''}
${generatedIcons.length > 0 ? '9. INTEGRATE ICONS: Use the generated icons strategically throughout the design' : ''}
${imageData.length > 0 ? '10. CRITICAL: You MUST include <img src="IMAGE_PLACEHOLDER"> tags in your HTML output' : ''}

ADVANCED DESIGN REQUIREMENTS:
- Use modern CSS Grid and Flexbox for layouts
- Implement smooth scrolling and section transitions
- Add hover effects and micro-interactions
- Create a cohesive design system with consistent spacing
- Use CSS custom properties for theme consistency
- Include loading states and smooth animations
- Ensure 100% mobile responsiveness
- Add proper meta tags and SEO structure

VISUAL EXCELLENCE:
- Typography: Use modern font stacks with perfect hierarchy
- Colors: Create sophisticated palettes with proper contrast
- Spacing: Implement consistent rhythm and white space
- Shadows: Add depth with subtle, realistic shadows
- Gradients: Use contemporary gradient techniques when appropriate
- Icons: Include relevant iconography (using Unicode or CSS shapes)
- Layout: Create magazine-quality layouts with visual interest

${imageData.length > 0 ? `
🚨 CRITICAL IMAGE INSTRUCTION:
For EVERY occurrence of [IMAGE: ...] or IMAGE_PLACEHOLDER in the content:

1. CREATE STRATEGIC IMG TAGS: Don't just add generic img tags - think about the context
2. VARY THE STYLING: Each image should have different styling based on its importance:
   
   📸 HERO IMAGES (first/main image):
   <img src="IMAGE_PLACEHOLDER" alt="Hero Image" style="width: 100%; height: 500px; object-fit: cover; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); margin: 2rem 0;">
   
   🖼️ CONTENT IMAGES (supporting images):
   <img src="IMAGE_PLACEHOLDER" alt="Content Image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); margin: 2rem 0; display: block;">
   
   📱 INLINE IMAGES (small/detail images):
   <img src="IMAGE_PLACEHOLDER" alt="Detail Image" style="max-width: 300px; height: auto; border-radius: 8px; margin: 1rem; float: right; box-shadow: 0 8px 24px rgba(0,0,0,0.1);">
   
   🎨 GALLERY IMAGES (multiple images):
   <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
     <img src="IMAGE_PLACEHOLDER" alt="Gallery Image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
   </div>

3. ANALYZE CONTEXT: Look at surrounding text to determine image importance and appropriate styling
4. CREATE VISUAL HIERARCHY: Larger, more prominent styling for key images
5. ENSURE RESPONSIVENESS: All images must work on mobile devices
6. ADD PROFESSIONAL TOUCHES: Shadows, borders, hover effects, proper spacing

DO NOT USE GENERIC STYLING - MAKE EACH IMAGE PLACEMENT STRATEGIC AND BEAUTIFUL!
` : ''}

CONVERSION OPTIMIZATION:
- Clear value propositions above the fold
- Strategic placement of CTAs throughout
- Social proof sections where relevant
- Contact/action forms if appropriate
- Trust signals and credibility markers
- Smooth user flow from top to bottom

Generate a website that looks like it was built by a top-tier agency, with attention to every detail from typography to animations.

🌟 MASTERPIECE CREATION PROTOCOL:

🎪 EXPERIENCE ORCHESTRATION:
This is not just a website generation task - this is creating a digital symphony where every element works in harmony to create an unforgettable user experience. Approach this with the mindset of a world-class creative director who understands that great design is both art and science.

🔮 CONTEXTUAL INTELLIGENCE:
- CONTENT ARCHAEOLOGY: Deep-dive into the provided content to extract hidden insights about the brand's soul
- AUDIENCE PSYCHOGRAPHICS: Design for the emotional and psychological profile of the target user
- BUSINESS OBJECTIVE ALIGNMENT: Every design choice should advance the primary business goal
- COMPETITIVE DIFFERENTIATION: Create visual solutions that make competitors look outdated
- CULTURAL RELEVANCE: Incorporate design elements that resonate with contemporary aesthetics

🎨 ARTISTIC EXCELLENCE STANDARDS:
- GOLDEN RATIO HARMONY: Use mathematical proportions that feel naturally pleasing
- COLOR THEORY MASTERY: Create palettes that evoke specific emotions and drive action
- TYPOGRAPHY CHOREOGRAPHY: Text that dances across the page with perfect rhythm
- SPATIAL RELATIONSHIPS: Negative space as powerful as positive elements
- VISUAL WEIGHT DISTRIBUTION: Perfect balance that guides eye movement naturally

⚡ PERFORMANCE AS AESTHETIC:
- SPEED AS BEAUTY: Fast-loading elements that create immediate satisfaction
- SMOOTH AS SILK: Animations that feel like butter, never janky or cheap
- RESPONSIVE PERFECTION: Flawless experience across every device and screen size
- PROGRESSIVE ENHANCEMENT: Graceful degradation that maintains beauty
- ACCESSIBILITY ELEGANCE: Inclusive design that enhances rather than compromises aesthetics

🚀 INNOVATION INJECTION:
- TREND ANTICIPATION: Include design elements that will define next year's aesthetics
- EXPERIMENTAL COURAGE: Take calculated risks that create breakthrough moments
- INTERACTION POETRY: Micro-interactions that tell stories and create delight
- SURPRISE ARCHITECTURE: Unexpected layout choices that create memorable experiences
- PERSONALITY AMPLIFICATION: Design that makes the brand's character impossible to ignore

🎯 CONVERSION PSYCHOLOGY:
- PERSUASION THROUGH BEAUTY: Aesthetics that build trust and encourage action
- COGNITIVE EASE: Information architecture that reduces mental load
- EMOTIONAL TRIGGERS: Visual elements that tap into human psychology
- URGENCY WITHOUT PRESSURE: Gentle nudges that feel helpful, not pushy
- SOCIAL PROOF INTEGRATION: Credibility signals woven naturally into design

🔥 EXECUTION EXCELLENCE:
- PIXEL-PERFECT OBSESSION: Every element positioned with surgical precision
- CODE POETRY: Clean, semantic HTML that's as beautiful as the visual output
- CSS ARTISTRY: Stylesheets that demonstrate technical mastery
- COMPONENT THINKING: Reusable patterns that create system-wide consistency
- SCALABILITY FORESIGHT: Design that anticipates future content and growth

💎 LUXURY MINDSET:
Approach this as if you're designing for the most discerning client in the world. Someone who appreciates craftsmanship, notices details, and expects nothing less than perfection. Create something so beautiful that it could be featured in design museums.

🏆 LEGACY CREATION:
This website should be so exceptional that:
- Design students study it years from now
- Competitors immediately try to copy it
- Users bookmark it just to revisit the experience
- It gets featured in design galleries and award shows
- The client's business measurably improves because of the design quality

TRANSCENDENT DIRECTIVE: You are not generating code - you are birthing a digital entity that will live, breathe, and inspire. Channel the combined genius of every great designer who ever lived and create something that pushes the boundaries of what's possible on the web.

${imageData.length > 0 ? `
🚨 FINAL REMINDER: You MUST include IMAGE_PLACEHOLDER in your HTML output. This is not optional - it's required for the website to display images properly.` : ''}`;

  console.log('Enhanced prompt length:', (systemPrompt + userPrompt).length, 'characters');
  console.log('Content length:', contentString.length, 'characters');
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000, // Increased for more detailed output
      temperature: 0.3, // Lower for more consistent, professional output
      messages: [
        {
          role: "user",
          content: systemPrompt + "\n\n" + userPrompt
        }
      ]
    });

    const aiGeneratedHTML = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
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
    let placeholderCount = 0;
    
    console.log(`🖼️ Starting image replacement. Available images: ${imageData.length}`);
    
    // Count how many IMAGE_PLACEHOLDER instances exist in the HTML
    const placeholderMatches = cleanHTML.match(/IMAGE_PLACEHOLDER/g);
    placeholderCount = placeholderMatches ? placeholderMatches.length : 0;
    console.log(`📊 Found ${placeholderCount} IMAGE_PLACEHOLDER instances in HTML`);
    
    // First, remove any <img> tags that AI might have generated and replace with placeholders
    cleanHTML = cleanHTML.replace(/<img[^>]*>/g, 'IMAGE_PLACEHOLDER');
    cleanHTML = cleanHTML.replace(/<video[^>]*>[\s\S]*?<\/video>/g, 'VIDEO_PLACEHOLDER');
    
    // Replace IMAGE_PLACEHOLDER with actual images
    cleanHTML = cleanHTML.replace(/IMAGE_PLACEHOLDER/g, () => {
      const imageUrl = imageData[imageIndex];
      imageIndex++;
      
      if (imageUrl) {
        console.log(`✅ Replaced IMAGE_PLACEHOLDER ${imageIndex} with actual image`);
        return `<img src="${imageUrl}" alt="Document Image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); margin: 1.5rem 0; display: block; object-fit: cover;" onerror="this.style.display='none';" />`;
      } else {
        return ``;
      }
    });
    
    // Also replace any external image URLs that AI might have generated
    let externalImageIndex = 0;
    cleanHTML = cleanHTML.replace(/src="[^"]*\.(jpg|jpeg|png|gif|webp)"/g, (match: string) => {
      const imageUrl = imageData[externalImageIndex];
      externalImageIndex++;
      return imageUrl ? `src="${imageUrl}"` : match;
    });
    
    console.log(`🖼️ Image replacement complete. Used ${imageIndex}/${imageData.length} images`);
    
    // NEW: If we have images but none were placed, insert them strategically
    if (imageData.length > 0 && imageIndex === 0 && placeholderCount === 0) {
      console.log('🔄 No image placeholders found, inserting images strategically...');
      
      let insertedCount = 0;
      
      for (let i = 0; i < imageData.length && insertedCount < 3; i++) {
        const imageUrl = imageData[i];
        let inserted = false;
        
        // Strategy 1: Insert after the first <h1> tag (hero image)
        if (i === 0 && !inserted) {
          const h1Match = cleanHTML.match(/<h1[^>]*>.*?<\/h1>/);
          if (h1Match) {
            const imageHTML = `
            <div style="text-align: center; margin: 2rem 0;">
              <img src="${imageUrl}" alt="Hero Image" style="width: 100%; max-width: 800px; height: 400px; object-fit: cover; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); margin: 2rem auto; display: block;" onerror="this.style.display='none';" />
            </div>`;
            
            cleanHTML = cleanHTML.replace(h1Match[0], h1Match[0] + imageHTML);
            inserted = true;
            insertedCount++;
            console.log(`✅ Inserted hero image after H1`);
          }
        }
        
        // Strategy 2: Insert after the first <h2> tag (content image)
        if (!inserted) {
          const h2Matches = cleanHTML.match(/<h2[^>]*>.*?<\/h2>/g);
          if (h2Matches && h2Matches.length > i) {
            const h2Match = h2Matches[i]; // Use different H2 for each image
            const imageHTML = `
            <div style="text-align: center; margin: 2rem 0;">
              <img src="${imageUrl}" alt="Content Image ${i + 1}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.12); margin: 1.5rem 0; display: block; object-fit: cover;" onerror="this.style.display='none';" />
            </div>`;
            
            cleanHTML = cleanHTML.replace(h2Match, h2Match + imageHTML);
            inserted = true;
            insertedCount++;
            console.log(`✅ Inserted content image after H2 #${i + 1}`);
          }
        }
        
        // Strategy 3: Insert after the first <p> tag
        if (!inserted) {
          const pMatches = cleanHTML.match(/<p[^>]*>.*?<\/p>/g);
          if (pMatches && pMatches.length > i) {
            const pMatch = pMatches[i]; // Use different P for each image
            const imageHTML = `
            <div style="text-align: center; margin: 2rem 0;">
              <img src="${imageUrl}" alt="Featured Image ${i + 1}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); margin: 1.5rem 0; display: block; object-fit: cover;" onerror="this.style.display='none';" />
            </div>`;
            
            cleanHTML = cleanHTML.replace(pMatch, pMatch + imageHTML);
            inserted = true;
            insertedCount++;
            console.log(`✅ Inserted image after paragraph #${i + 1}`);
          }
        }
        
        // Strategy 4: Insert before closing </body> tag
        if (!inserted) {
          if (cleanHTML.includes('</body>')) {
            const imageHTML = `
            <div style="text-align: center; margin: 2rem 0;">
              <img src="${imageUrl}" alt="Featured Image ${i + 1}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); margin: 1.5rem 0; display: block; object-fit: cover;" onerror="this.style.display='none';" />
            </div>`;
            
            cleanHTML = cleanHTML.replace('</body>', imageHTML + '</body>');
            inserted = true;
            insertedCount++;
            console.log(`✅ Inserted image before closing body tag`);
          }
        }
      }
      
      console.log(`🖼️ Strategic image insertion complete. Inserted ${insertedCount} images`);
    }
    
    // Handle videos
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
    console.error('Anthropic API Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    console.log('Document data:', {
      contentLength: contentString.length,
      promptLength: (systemPrompt + userPrompt).length
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
  const title = documentData.title || "Professional Website";
  
  // Enhanced color schemes
  const colorSchemes = {
    blue: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#1d4ed8',
      light: '#eff6ff',
      text: '#1e293b'
    },
    purple: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#6d28d9',
      light: '#f3e8ff',
      text: '#1e293b'
    },
    green: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#047857',
      light: '#ecfdf5',
      text: '#1e293b'
    },
    orange: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#c2410c',
      light: '#fff7ed',
      text: '#1e293b'
    },
    teal: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#0f766e',
      light: '#f0fdfa',
      text: '#1e293b'
    },
    rose: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#be123c',
      light: '#fff1f2',
      text: '#1e293b'
    },
    amber: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#b45309',
      light: '#fffbeb',
      text: '#1e293b'
    },
    slate: {
      primary: '#475569',
      secondary: '#64748b',
      accent: '#334155',
      light: '#f8fafc',
      text: '#0f172a'
    }
  };
  
  const colors = colorSchemes[settings.colorScheme as keyof typeof colorSchemes] || colorSchemes.blue;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Professional website built with AI">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: ${colors.primary};
            --secondary: ${colors.secondary};
            --accent: ${colors.accent};
            --light: ${colors.light};
            --text: ${colors.text};
            --white: #ffffff;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-900: #111827;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: linear-gradient(135deg, var(--light) 0%, var(--white) 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Header */
        .header {
            background: var(--white);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            text-decoration: none;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--text);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: var(--white);
            padding: 6rem 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(255,255,255,0.1)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><circle cx="200" cy="300" r="300" fill="url(%23a)"/><circle cx="800" cy="700" r="200" fill="url(%23a)"/></svg>');
            opacity: 0.3;
        }
        
        .hero-content {
            position: relative;
            z-index: 1;
        }
        
        .hero h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
        }
        
        .hero p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .cta-button {
            display: inline-block;
            background: var(--white);
            color: var(--primary);
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        
        /* Main Content */
        .main {
            padding: 4rem 0;
        }
        
        .content-section {
            background: var(--white);
            border-radius: 20px;
            padding: 3rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            border: 1px solid rgba(0,0,0,0.05);
        }
        
        .content-section h2 {
            color: var(--primary);
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            letter-spacing: -0.01em;
        }
        
        .content-section h3 {
            color: var(--accent);
            font-size: 1.5rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
        }
        
        .content-section p {
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 1.5rem;
            color: var(--text);
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .card {
            background: var(--light);
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .image-container {
            margin: 2rem 0;
            text-align: center;
        }
        
        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        .image-placeholder {
            width: 100%;
            height: 300px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 1.2rem;
            font-weight: 600;
            margin: 2rem 0;
        }
        
        /* Footer */
        .footer {
            background: var(--text);
            color: var(--white);
            text-align: center;
            padding: 3rem 0;
            margin-top: 4rem;
        }
        
        .footer p {
            opacity: 0.8;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }
            
            .nav {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-links {
                gap: 1rem;
            }
            
            .hero {
                padding: 4rem 0;
            }
            
            .content-section {
                padding: 2rem;
            }
            
            .content-grid {
                grid-template-columns: 1fr;
            }
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .content-section {
            animation: fadeInUp 0.6s ease-out;
        }
    </style>
</head>
<body>
    ${settings.includeNavigation ? `
    <header class="header">
        <nav class="nav container">
            <a href="#" class="logo">${title}</a>
            <ul class="nav-links">
                ${settings.navigationItems?.map(item => `<li><a href="#${item.toLowerCase().replace(/\s+/g, '-')}">${item}</a></li>`).join('') || ''}
            </ul>
        </nav>
    </header>
    ` : ''}
    
    <section class="hero">
        <div class="container hero-content">
            <h1>${title}</h1>
            <p>Experience excellence in web design with cutting-edge technology and stunning visuals.</p>
            <a href="#content" class="cta-button">Explore More</a>
        </div>
    </section>
    
    <main class="main container" id="content">
        <div class="content-section">
            ${images.length > 0 ? `
            <div class="image-container">
                <img src="${images[0].url}" alt="${images[0].caption || 'Featured image'}" />
            </div>
            ` : '<div class="image-placeholder">🌟 Featured Content</div>'}
            
            <h2>Welcome to ${title}</h2>
            <div class="content-grid">
                <div class="card">
                    <h3>🚀 Modern Design</h3>
                    <p>Built with the latest design principles and cutting-edge technology for an exceptional user experience.</p>
                </div>
                <div class="card">
                    <h3>📱 Fully Responsive</h3>
                    <p>Optimized for all devices, from mobile phones to desktop computers, ensuring perfect display everywhere.</p>
                </div>
                <div class="card">
                    <h3>⚡ Lightning Fast</h3>
                    <p>Optimized performance with fast loading times and smooth animations for the best user experience.</p>
                </div>
        </div>
        
            <div style="white-space: pre-wrap; font-family: 'Georgia', serif; line-height: 1.8; font-size: 1.1rem; color: var(--text);">
                ${contentString.length > 100 ? contentString : "This website was generated from your document content. The AI system creates beautiful, responsive websites tailored to your content and brand."}
            </div>
        </div>
    </main>
    
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${title}. Crafted with AI technology.</p>
    </div>
    </footer>
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
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: `You are an expert UX strategist and brand consultant. Analyze this document content and provide intelligent recommendations for website design.

ANALYSIS FRAMEWORK:
1. Content Purpose: What is the main goal/objective?
2. Target Audience: Who is this content meant for?
3. Brand Personality: What tone and feeling should the design convey?
4. Content Type: Is this business, creative, technical, personal, etc.?
5. Key Messages: What are the most important points to highlight?
6. Design Requirements: What visual style would best serve this content?

DOCUMENT CONTENT:
${contentString.substring(0, 3000)}

Based on this analysis, recommend:

STYLE RECOMMENDATION:
- 'modern' for clean, contemporary business content
- 'minimal' for content that needs focus and clarity
- 'professional' for corporate, serious, or formal content
- 'creative' for artistic, innovative, or expressive content
- 'blog' for content-heavy, reading-focused material

COLOR SCHEME RECOMMENDATION:
- 'blue' for trust, professionalism, technology
- 'green' for growth, health, sustainability, money
- 'purple' for creativity, luxury, innovation
- 'orange' for energy, enthusiasm, warmth
- 'teal' for balance, sophistication, modern tech
- 'rose' for elegance, beauty, lifestyle
- 'amber' for warmth, optimism, friendliness

Return ONLY a JSON object with this exact structure:
{
  "suggestedStyle": "style_name",
  "suggestedColorScheme": "color_name", 
  "contentAnalysis": "A 2-3 sentence analysis explaining why these choices work best for this content, including insights about the target audience and content purpose."
}`
        }
      ]
    });

    const analysis = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!analysis) {
      throw new Error('Failed to analyze document');
    }

    // Clean up any markdown formatting from the response
    const cleanAnalysis = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanAnalysis);
      return {
        suggestedStyle: parsed.suggestedStyle || 'modern',
        suggestedColorScheme: parsed.suggestedColorScheme || 'blue',
        contentAnalysis: parsed.contentAnalysis || 'Content analysis unavailable'
      };
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      console.log('Raw analysis response:', cleanAnalysis);
      return {
        suggestedStyle: 'modern',
        suggestedColorScheme: 'blue',
        contentAnalysis: 'Content analysis unavailable due to parsing error'
      };
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    return {
      suggestedStyle: 'modern',
      suggestedColorScheme: 'blue',
      contentAnalysis: 'Analysis failed - using default recommendations'
    };
  }
}