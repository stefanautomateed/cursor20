/**
 * Vibe Coder Design System
 *
 * This is the official design system used across all generated projects.
 * It ensures consistency, modern aesthetics, and professional quality.
 */

export const DESIGN_SYSTEM = {
  // Color palette - Dark theme with vibrant accents
  colors: {
    background: {
      primary: '#0a0a0a',      // Main background
      secondary: '#111',        // Elevated surfaces
      tertiary: '#1a1a1a',      // Cards, inputs
      hover: '#222',            // Hover states
    },
    text: {
      primary: '#ffffff',       // Headings, important text
      secondary: '#ededed',     // Body text
      tertiary: '#gray-400',    // Muted text
      disabled: '#gray-500',    // Disabled states
    },
    border: {
      default: '#gray-800',     // Borders, dividers
      focus: '#purple-500',     // Focus rings
    },
    accent: {
      primary: {
        from: '#purple-500',
        to: '#pink-500',
      },
      secondary: {
        from: '#purple-600',
        to: '#pink-600',
      },
      tertiary: {
        from: '#purple-900',
        to: '#pink-900',
      },
    },
    status: {
      success: '#green-500',
      warning: '#yellow-500',
      error: '#red-500',
      info: '#blue-500',
    },
  },

  // Typography system
  typography: {
    fonts: {
      sans: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
      mono: `'Fira Code', 'Courier New', monospace`,
    },
    sizes: {
      xs: 'text-xs',       // 12px
      sm: 'text-sm',       // 14px
      base: 'text-base',   // 16px
      lg: 'text-lg',       // 18px
      xl: 'text-xl',       // 20px
      '2xl': 'text-2xl',   // 24px
      '3xl': 'text-3xl',   // 30px
      '4xl': 'text-4xl',   // 36px
      '5xl': 'text-5xl',   // 48px
      '6xl': 'text-6xl',   // 60px
    },
    weights: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },

  // Spacing scale
  spacing: {
    xs: 'space-x-1 space-y-1',   // 4px
    sm: 'space-x-2 space-y-2',   // 8px
    md: 'space-x-3 space-y-3',   // 12px
    lg: 'space-x-4 space-y-4',   // 16px
    xl: 'space-x-6 space-y-6',   // 24px
    '2xl': 'space-x-8 space-y-8', // 32px
  },

  // Border radius
  radius: {
    sm: 'rounded',           // 4px
    md: 'rounded-lg',        // 8px
    lg: 'rounded-xl',        // 12px
    xl: 'rounded-2xl',       // 16px
    full: 'rounded-full',    // 9999px
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    accent: 'shadow-lg shadow-purple-500/20',
  },

  // Component patterns
  components: {
    button: {
      primary: 'px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20',
      secondary: 'px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-lg transition-colors border border-gray-800',
      ghost: 'px-4 py-2 text-gray-400 hover:text-white transition-colors',
    },
    input: 'px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
    card: 'p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:bg-[#222] transition-colors',
    badge: {
      success: 'text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30',
      warning: 'text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      info: 'text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30',
    },
  },

  // Animation patterns
  animations: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3 },
    },
    hover: {
      whileHover: { scale: 1.05 },
      transition: { duration: 0.2 },
    },
  },

  // Layout patterns
  layouts: {
    container: 'container mx-auto px-4',
    section: 'py-12 md:py-20',
    card: 'max-w-7xl mx-auto',
  },
};

// Design principles for AI to follow
export const DESIGN_PRINCIPLES = `
VIBE CODER DESIGN SYSTEM - ALWAYS USE THIS AESTHETIC

1. COLOR SCHEME (Dark Theme):
   - Background: #0a0a0a (primary), #111 (secondary), #1a1a1a (tertiary)
   - Text: white, #ededed, text-gray-400
   - Accent: Purple-to-pink gradients (from-purple-500 to-pink-500)
   - Borders: border-gray-800
   - Status badges: Green/yellow/purple with /20 opacity backgrounds

2. TYPOGRAPHY:
   - System fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
   - Headings: text-5xl, text-4xl, text-3xl font-bold text-white
   - Body: text-base, text-lg text-gray-400
   - Small text: text-sm, text-xs text-gray-500

3. SPACING & LAYOUT:
   - Generous padding: px-6 py-4, px-8 py-4
   - Card spacing: p-4, p-6
   - Section spacing: py-12, py-20
   - Gaps: gap-3, gap-4, gap-6, gap-8

4. COMPONENTS STYLE:
   - Buttons:
     * Primary: bg-gradient-to-r from-purple-600 to-pink-600 with shadow-lg shadow-purple-500/20
     * Secondary: bg-[#1a1a1a] hover:bg-[#222] border border-gray-800
   - Inputs: bg-[#1a1a1a] border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
   - Cards: bg-[#1a1a1a] border border-gray-800 rounded-xl hover:bg-[#222]
   - Badges: bg-{color}-500/20 text-{color}-400 border border-{color}-500/30

5. BORDER RADIUS:
   - Small: rounded-lg (8px)
   - Medium: rounded-xl (12px)
   - Large: rounded-2xl (16px)
   - Buttons: rounded-lg
   - Cards: rounded-xl

6. TRANSITIONS & HOVER:
   - All interactive elements: transition-colors, transition-all
   - Hover states: hover:bg-[#222], hover:text-white, hover:scale-105
   - Duration: Fast (0.2s-0.3s)

7. FRAMER MOTION ANIMATIONS:
   - Fade in: initial={{ opacity: 0 }} animate={{ opacity: 1 }}
   - Slide up: initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
   - Scale in: initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
   - Hover: whileHover={{ scale: 1.05 }}

8. GLASSMORPHISM EFFECTS:
   - Use backdrop-blur-lg with bg-{color}/10 or bg-{color}/20
   - Example: bg-purple-500/10 backdrop-blur-lg border border-purple-500/20

9. GRADIENT USAGE:
   - Primary: bg-gradient-to-r from-purple-600 to-pink-600
   - Background: bg-gradient-to-br from-purple-900 via-blue-900 to-black
   - Subtle: bg-gradient-to-r from-purple-900/30 to-pink-900/30

10. ICONS:
    - Always use Lucide React icons
    - Size: w-4 h-4, w-5 h-5, w-6 h-6
    - Color: text-white, text-gray-400, text-purple-500

CONSISTENCY IS KEY: All projects should feel like they belong to the same design family!
`;

export default DESIGN_SYSTEM;
