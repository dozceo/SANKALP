// Design tokens for graph visualizations
// These map to Tailwind CSS variables defined in globals.css

export const GRAPH_COLORS = {
  // Nodes
  student: 'hsl(var(--primary))',      // Primary Blue/Purple
  subject: 'hsl(var(--blue-500))',     // Blue
  chapter: 'hsl(var(--cyan-500))',     // Cyan
  topic: 'hsl(var(--muted-foreground))', // Gray
  weakness: 'hsl(var(--destructive))', // Red
  strength: 'hsl(var(--success))',     // Green
  skill: 'hsl(var(--warning))',        // Amber
  peer: 'hsl(var(--accent))',          // Accent

  // Interaction States
  hover: {
    base: 'hsl(var(--accent))',
    light: 'hsl(var(--accent) / 0.3)',
  },
  highlight: {
    base: 'hsl(var(--primary))',
    light: 'hsl(var(--primary) / 0.3)',
    border: 'hsl(var(--primary-foreground))',
  },

  // Defaults
  defaultNode: 'hsl(var(--primary))',
  link: 'hsl(var(--border))',
  text: 'hsl(var(--foreground))',
  textSecondary: 'hsl(var(--muted-foreground))',
};

// Helper to resolve HSL vars if needed for canvas (Canvas API needs raw color strings)
// Note: This is a simplified resolver. For full HSL support in Canvas,
// we might need a utility to read computed styles or just use hex/rgb fallbacks if critical.
// For now, we'll keep the hex values as fallbacks in the consuming components
// but try to use these constants where possible.

export const GRAPH_COLORS_HEX = {
  student: '#7c3aed',    // violet-600 (Primary)
  subject: '#3b82f6',    // blue-500
  chapter: '#06b6d4',    // cyan-500
  topic: '#6b7280',      // gray-500
  weakness: '#ef4444',   // red-500
  strength: '#22c55e',   // green-500
  skill: '#f59e0b',      // amber-500
  peer: '#8b5cf6',       // violet-500

  hover: '#c4b5fd',      // violet-300
  hoverLight: '#e9d5ff', // violet-100

  highlight: '#8b5cf6',  // violet-500
  highlightLight: '#ddd6fe', // violet-200

  default: '#6d28d9',    // violet-700
} as const;
