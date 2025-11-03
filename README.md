# 🎨 Vibe Coder - AI-Powered Website Builder

A modern, AI-powered platform for creating beautiful websites in seconds. Simply describe what you want, and watch as AI generates a complete, production-ready website with live preview.

![Vibe Coder](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### Core Features
- **🤖 AI-Powered Generation**: Uses GPT-4o to generate stunning, ultra-modern websites with impeccable design
- **📁 Multi-File Projects**: Automatically creates proper project structures (HTML, CSS, JS files)
- **🔄 Iterative Refinement**: Polish and improve your website without regenerating everything - AI makes surgical edits
- **🗂️ File Explorer**: Browse, create, edit, and delete files in your project
- **⚡ Real-time Streaming**: Watch your website being created in real-time
- **👁️ Live Preview**: Instant preview that combines all project files
- **💻 Monaco Code Editor**: Full VS Code editor with syntax highlighting and intelligent editing
- **🎨 Impeccable Design**: Generates websites with cutting-edge aesthetics (glassmorphism, gradients, smooth animations)

### Advanced Features
- **🔍 Context-Aware AI**: AI sees all your project files and makes intelligent changes
- **📱 Responsive Design**: All generated websites are perfectly mobile-friendly
- **⬇️ Download & Share**: Export your complete project
- **🎯 Multiple Views**: Toggle between Split, Code-only, and Preview-only views
- **✨ Modern UI**: Beautiful dark-themed interface inspired by top dev tools

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cursor20
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Initial Creation
1. **Describe Your Vision**
   - Enter a detailed description of the website you want to create
   - Be specific about features, style, and functionality
   - Example: "A stunning landing page for a tech startup with glassmorphism effects, animated hero section, feature grid, and pricing table"

2. **Watch AI Build Your Project**
   - AI generates a complete multi-file project (HTML, CSS, JS)
   - Files appear in the file explorer on the left
   - See real-time streaming of code generation
   - Preview updates automatically as files are created

### Iterative Refinement
3. **Polish & Improve**
   - Use the input bar to refine specific aspects
   - AI makes surgical edits without destroying your work
   - Examples:
     - "Make the header sticky with a blur effect"
     - "Add smooth scroll animations"
     - "Change the color scheme to blue and purple"
     - "Add a contact form with validation"

### File Management
4. **Browse & Edit**
   - Click files in the explorer to view/edit them
   - Create new files with the + button
   - Delete files you don't need (hover to see delete icon)
   - Edit code directly in Monaco editor
   - Changes reflect instantly in preview

### Export & Share
5. **Download Your Work**
   - Click "Download" to save your complete project
   - Click "Copy Code" to copy the current file's code
   - All files are combined into a working website

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI Model**: OpenAI GPT-4o
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Styling**: Tailwind CSS
- **API**: Edge Runtime for optimal performance

## 📦 Project Structure

```
cursor20/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # AI code generation API with operation modes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/
│   ├── FileExplorer.tsx          # File tree sidebar
│   └── CodeEditor.tsx            # Monaco editor wrapper
├── lib/
│   └── fileUtils.ts              # File system utilities
├── types/
│   └── index.ts                  # TypeScript type definitions
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🎨 Example Prompts

### Initial Creation Prompts
Try these detailed prompts to get started:

- **Portfolio**: "A breathtaking personal portfolio with glassmorphism effects, dark theme, animated hero section with gradient text, projects showcase with hover effects and smooth transitions, skills grid with icons, timeline section, and contact form"

- **SaaS Landing**: "A modern SaaS landing page with gradient hero section, feature cards with icons and hover effects, pricing table with popular badge, testimonials slider with avatars, FAQ accordion, and newsletter signup with validation"

- **Restaurant**: "A beautiful restaurant website with full-screen hero image, elegant menu with categories and filters, photo gallery with lightbox effect, reservation form with date picker, chef's story section, and embedded Google Maps"

- **E-commerce**: "A sleek e-commerce product page with image gallery and zoom, product details with tabs, size selector, reviews section with stars, related products carousel, and add to cart animation"

### Refinement Prompts
Use these to improve your existing project:

- "Make the header sticky with a subtle blur effect when scrolling"
- "Add smooth scroll animations that trigger when elements enter viewport"
- "Change the color scheme to use blue and purple gradients"
- "Add a loading animation that plays when the page first loads"
- "Implement a dark mode toggle button with smooth transitions"
- "Add hover effects to all buttons with scale and shadow animations"
- "Create a mobile hamburger menu with smooth slide-in animation"

## 🔧 Configuration

### API Settings

The AI generation uses the following settings (configurable in `app/api/generate/route.ts`):

- **Model**: `gpt-4o` (OpenAI's latest and most capable model)
- **Temperature**: `0.7` (balance between creativity and consistency)
- **Max Tokens**: `6000` (allows for comprehensive multi-file generation)

### Operation Modes

The system has three intelligent operation modes:

1. **CREATE MODE**: Initial project generation
   - Generates complete multi-file project structure
   - Returns HTML, CSS, and JS files separately
   - Emphasizes ultra-modern, beautiful design

2. **REFINE MODE**: Iterative improvements
   - AI sees all existing files
   - Makes surgical edits without destroying working code
   - Returns only files that need changes

3. **ADD MODE**: Adding new features
   - Adds functionality while preserving existing code
   - Creates new files or modifies existing ones as needed

### Design Philosophy

The AI is instructed to create websites with:
- **Cutting-edge aesthetics**: Glassmorphism, gradients, subtle animations
- **Perfect typography**: Modern fonts with proper hierarchy
- **Beautiful colors**: Think Stripe, Linear, Vercel quality
- **Smooth interactions**: Micro-interactions and hover effects
- **Flawless responsiveness**: Mobile-first approach
- **Clean code**: Semantic HTML, modular structure
- **Accessibility**: ARIA labels and keyboard navigation

You can customize these guidelines by modifying the system prompt in `app/api/generate/route.ts`

## 🚨 Important Notes

- **API Costs**: Each generation uses OpenAI API credits. Monitor your usage at https://platform.openai.com/usage
- **Rate Limits**: OpenAI has rate limits. If you hit them, wait a moment and try again
- **Generated Code**: Always review generated code before deploying to production
- **Security**: The preview iframe is sandboxed for security

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Troubleshooting

### "Failed to generate code" error
- Check that your `.env` file has a valid `OPENAI_API_KEY`
- Verify your OpenAI account has available credits
- Check the browser console for detailed error messages

### Preview not updating
- Try refreshing the page
- Check if the generated code is valid HTML
- Look for JavaScript errors in the browser console

### Slow generation
- This is normal for complex websites
- The streaming feature lets you see progress in real-time
- Consider simplifying your prompt for faster results

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by the Vibe Coder team
