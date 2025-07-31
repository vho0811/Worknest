# WorkNest - AI-Powered Document Collaboration Platform

A modern, real-time collaborative document editor with AI-powered website generation capabilities.

## ✨ Features

### 🤖 AI Website Generator
Transform any document into a beautiful, professional website with AI:

- **Multiple Design Styles**: Modern, Minimal, Professional, Creative, Blog
- **Color Schemes**: 9 different color palettes to match your brand
- **Proactive AI Features**:
  - **Auto-Generate Images**: Creates relevant images when none are provided
  - **Content Enhancement**: AI improves headlines, structure, and engagement
  - **Smart Icons**: Adds relevant icons based on content analysis
  - **Content Analysis**: Analyzes your content to suggest optimal design choices
- **Navigation & TOC**: Optional navigation menus and table of contents
- **Custom Instructions**: Add specific design requirements
- **Real-time Preview**: See your website instantly

### 📝 Real-time Collaboration
- Live collaborative editing with multiple users
- Real-time cursors and presence indicators
- Conflict-free editing with operational transformation
- Rich text editor with formatting options

### 🔐 Authentication & Security
- Clerk authentication integration
- User management and permissions
- Secure document access control

### 🎨 Modern UI/UX
- Beautiful, responsive design
- Dark/light mode support
- Intuitive user interface
- Mobile-friendly design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project
- Clerk account
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/worknest.git
cd worknest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Liveblocks
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Set up Firebase:
```bash
npm run firebase:setup
```

5. Run the development server:
```bash
npm run dev
```

## 🎯 AI Website Generator Features

### Proactive AI Enhancement

The AI website generator now includes intelligent features that make it more proactive:

#### 🔍 Content Analysis
- Automatically analyzes your document content
- Identifies content type, target audience, and key themes
- Suggests optimal design choices based on content
- Provides actionable insights for better website design

#### ✨ Content Enhancement
- Improves headlines and subheadings for better engagement
- Enhances content structure and readability
- Adds relevant call-to-actions
- Makes content more web-friendly while preserving your message

#### 🖼️ Auto-Generate Images
- Creates relevant images when none are provided
- Uses AI to analyze content and suggest appropriate imagery
- Integrates with Unsplash API for high-quality stock photos
- Places images strategically throughout the website

#### 🎨 Smart Icons
- Adds relevant icons based on content analysis
- Different icon sets for different content types (business, creative, technical, etc.)
- Enhances visual appeal and user experience
- Icons are strategically placed throughout the design

### How to Use Proactive Features

1. **Enable Proactive Features**: In the AI Website Generator dialog, you'll find a "Proactive AI Features" section with three toggles:
   - **Enhance Content**: AI improves your content automatically
   - **Auto-Generate Images**: Creates images when none are provided
   - **Add Smart Icons**: Includes relevant icons based on content

2. **Minimal Content Works**: You can now create websites with just a few lines of text, and the AI will:
   - Analyze what you've written
   - Enhance the content with better structure
   - Add relevant images and icons
   - Create a complete, professional website

3. **Example**: Try writing "Create an ecommerce website for selling handmade jewelry" and the AI will:
   - Analyze it as ecommerce content
   - Add relevant sections (Products, About, Contact)
   - Generate jewelry-related images
   - Include shopping cart and product icons
   - Create compelling headlines and CTAs

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Real-time**: Liveblocks
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **AI**: Anthropic Claude
- **Editor**: BlockNote
- **Deployment**: Vercel

## 📁 Project Structure

```
worknest/
├── actions/           # Server actions
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Utility functions
├── types/           # TypeScript types
└── public/          # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**WorkNest** - Where documents become websites with AI magic ✨
