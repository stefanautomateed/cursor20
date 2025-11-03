# 🎨 Vibe Coder - AI-Powered Website Builder

A modern, AI-powered platform for creating beautiful websites in seconds. Simply describe what you want, and watch as AI generates a complete, production-ready website with live preview.

![Vibe Coder](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

- **🤖 AI-Powered Generation**: Uses GPT-4 to generate complete, self-contained HTML websites
- **⚡ Real-time Streaming**: Watch your website being created in real-time
- **👁️ Live Preview**: Instant preview of your generated website
- **💻 Code Editor**: Edit and refine the generated code with Monaco Editor
- **🔄 Iterative Refinement**: Continuously improve your website with follow-up prompts
- **📱 Responsive Design**: All generated websites are mobile-friendly
- **⬇️ Download & Share**: Export your website as a single HTML file
- **🎨 Beautiful UI**: Modern, dark-themed interface with smooth animations

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

1. **Start Creating**
   - Enter a description of the website you want to create
   - Example: "A landing page for a coffee shop with a hero section, menu, and contact form"

2. **Watch the Magic**
   - The AI will generate a complete HTML website in real-time
   - See the code and preview side-by-side

3. **Refine & Iterate**
   - Use the input bar at the bottom to make changes
   - Example: "Make the header sticky" or "Add a dark mode toggle"

4. **Export Your Work**
   - Click "Download" to save your website as an HTML file
   - Click "Copy Code" to copy the code to your clipboard

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
│   │       └── route.ts          # AI code generation API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🎨 Example Prompts

Try these prompts to get started:

- "A personal portfolio website with a dark theme, showcasing projects and skills"
- "A modern landing page for a SaaS product with pricing tiers and features"
- "A beautiful restaurant website with menu, gallery, and reservation form"
- "An e-commerce product page with image gallery, reviews, and add to cart button"
- "A blog homepage with featured posts, categories, and search functionality"

## 🔧 Configuration

### API Settings

The AI generation uses the following settings (configurable in `app/api/generate/route.ts`):

- **Model**: `gpt-4o` (OpenAI's latest model)
- **Temperature**: `0.7` (balance between creativity and consistency)
- **Max Tokens**: `4000` (allows for comprehensive code generation)

### Customization

You can customize the AI's behavior by modifying the system prompt in `app/api/generate/route.ts`:

```typescript
const systemPrompt = `You are an expert web developer...`;
```

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
