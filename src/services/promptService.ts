export interface SimplePrompt {
  id: string;
  name: string;
  description: string;
  category: string;
  agentPrompt: string;
  isDefault?: boolean;
}

export interface PromptSelections {
  [agentType: string]: string; // Selected prompt ID for each agent
}

// Curated prompt marketplace
export const PROMPT_MARKETPLACE: SimplePrompt[] = [
  // App Generator Prompts
  {
    id: 'app-gen-default',
    name: 'Standard Apps',
    description: 'General purpose applications with good functionality',
    category: 'app-generator',
    agentPrompt: `You specialize in creating interactive applications like calculators, converters, text editors, forms, and productivity tools. Focus on functionality and user experience.`,
    isDefault: true
  },
  {
    id: 'app-gen-advanced',
    name: 'Advanced Features',
    description: 'Apps with more sophisticated features and better UI/UX',
    category: 'app-generator',
    agentPrompt: `You are an expert at creating advanced interactive applications with sophisticated features. Focus on creating apps with multiple functions, data persistence using localStorage, advanced calculations, rich UI components, drag-and-drop interfaces, and professional-grade user experiences. Include features like export/import, keyboard shortcuts, and advanced state management.`
  },
  {
    id: 'app-gen-minimal',
    name: 'Clean & Simple',
    description: 'Minimalist apps focused on core functionality',
    category: 'app-generator',
    agentPrompt: `You specialize in creating clean, minimalist applications that focus on core functionality. Prioritize simplicity, fast loading, and intuitive interfaces. Remove any unnecessary features and create apps that do one thing exceptionally well with beautiful, uncluttered designs.`
  },

  // Utility Agent Prompts
  {
    id: 'util-default',
    name: 'Basic Tools',
    description: 'Simple utility tools for everyday tasks',
    category: 'utility-agent',
    agentPrompt: `You create simple utility tools like timers, counters, unit converters, password generators, and small helper apps. Prioritize simplicity and usefulness.`,
    isDefault: true
  },
  {
    id: 'util-productivity',
    name: 'Productivity Focus',
    description: 'Tools designed to boost productivity and efficiency',
    category: 'utility-agent',
    agentPrompt: `You create productivity-focused utility tools that help users work more efficiently. Include features like batch processing, automation, keyboard shortcuts, quick actions, time-saving workflows, and integration capabilities. Focus on tools that eliminate repetitive tasks and streamline common operations.`
  },
  {
    id: 'util-developer',
    name: 'Developer Tools',
    description: 'Utilities specifically designed for developers',
    category: 'utility-agent',
    agentPrompt: `You create developer-focused utility tools like code formatters, hash generators, JSON validators, regex testers, color pickers, and API testing tools. Include features like syntax highlighting, code validation, copy-to-clipboard functionality, and developer-friendly interfaces with technical precision.`
  },

  // Widget Agent Prompts
  {
    id: 'widget-default',
    name: 'Dashboard Widgets',
    description: 'Standard widgets for dashboards and displays',
    category: 'widget-agent',
    agentPrompt: `You build dashboard widgets like clocks, weather displays, progress bars, charts, and status indicators. Focus on visual appeal and real-time updates.`,
    isDefault: true
  },
  {
    id: 'widget-animated',
    name: 'Animated Widgets',
    description: 'Widgets with smooth animations and transitions',
    category: 'widget-agent',
    agentPrompt: `You create visually stunning dashboard widgets with smooth animations, transitions, and dynamic effects. Include CSS animations, hover effects, loading animations, and interactive visual feedback. Focus on creating widgets that are not just functional but also delightful to interact with.`
  },
  {
    id: 'widget-data',
    name: 'Data Visualization',
    description: 'Widgets focused on displaying and visualizing data',
    category: 'widget-agent',
    agentPrompt: `You specialize in creating data visualization widgets including charts, graphs, meters, progress indicators, and statistical displays. Focus on clear data presentation, interactive charts, real-time updates, and professional-looking data visualizations that make complex information easy to understand.`
  },

  // Game Agent Prompts
  {
    id: 'game-default',
    name: 'Classic Games',
    description: 'Traditional games with standard rules',
    category: 'game-agent',
    agentPrompt: `You create simple games like tic-tac-toe, memory games, word games, puzzles, and interactive entertainment. Emphasize fun gameplay and clear rules.`,
    isDefault: true
  },
  {
    id: 'game-puzzle',
    name: 'Brain Puzzles',
    description: 'Challenging puzzles and brain training games',
    category: 'game-agent',
    agentPrompt: `You create challenging brain puzzle games that test logic, memory, pattern recognition, and problem-solving skills. Include features like difficulty levels, scoring systems, hints, time challenges, and progressive difficulty. Focus on games that are educational and mentally stimulating.`
  },
  {
    id: 'game-casual',
    name: 'Casual Fun',
    description: 'Relaxing and easy-to-play casual games',
    category: 'game-agent',
    agentPrompt: `You create casual, relaxing games that are easy to pick up and play. Focus on stress-free gameplay, pleasant visuals, simple controls, and games that can be enjoyed in short sessions. Include calming colors, gentle animations, and gameplay that's more about relaxation than competition.`
  },

  // Information Agent Prompts
  {
    id: 'info-default',
    name: 'Research & News',
    description: 'Current information and news with citations',
    category: 'info-agent',
    agentPrompt: `You specialize in creating information apps that display current news, research results, fact sheets, and knowledge summaries. Focus on presenting information in an organized, readable format with proper citations and sources. Create apps that display research results, news summaries, fact comparisons, timelines, and informational dashboards.`,
    isDefault: true
  },
  {
    id: 'info-academic',
    name: 'Academic Research',
    description: 'Scholarly format with detailed citations and analysis',
    category: 'info-agent',
    agentPrompt: `You are an academic research specialist creating scholarly information apps. Present information with detailed citations, methodology notes, confidence levels, and academic formatting. Include sections for abstract, key findings, methodology, limitations, and references. Focus on credibility, peer-review quality, and scientific rigor.`
  },
  {
    id: 'info-news',
    name: 'Breaking News',
    description: 'News-style layout with headlines and summaries',
    category: 'info-agent',
    agentPrompt: `You are a news specialist creating news-style information apps. Present information as breaking news with compelling headlines, lead paragraphs, quotes, and timeline of events. Include news-style formatting with bylines, datelines, and news hierarchy. Focus on timeliness, relevance, and journalistic presentation.`
  },
  {
    id: 'info-comparison',
    name: 'Comparative Analysis',
    description: 'Side-by-side comparisons and analysis tables',
    category: 'info-agent',
    agentPrompt: `You specialize in creating comparative analysis apps that present information through side-by-side comparisons, pros/cons tables, feature matrices, and analytical breakdowns. Include comparison charts, scoring systems, and decision-making frameworks. Focus on helping users understand differences and make informed choices.`
  },
  {
    id: 'info-timeline',
    name: 'Timeline & History',
    description: 'Chronological presentation with historical context',
    category: 'info-agent',
    agentPrompt: `You create timeline and historical information apps that present information chronologically. Include interactive timelines, historical context, cause-and-effect relationships, and temporal analysis. Focus on helping users understand how events unfold over time and their interconnections.`
  }
];

class PromptService {
  private static STORAGE_KEY = 'agentic-os-prompt-selections';

  static getPromptsByCategory(category: string): SimplePrompt[] {
    return PROMPT_MARKETPLACE.filter(prompt => prompt.category === category);
  }

  static getPromptById(id: string): SimplePrompt | undefined {
    return PROMPT_MARKETPLACE.find(prompt => prompt.id === id);
  }

  static getDefaultPrompt(category: string): SimplePrompt {
    const defaultPrompt = PROMPT_MARKETPLACE.find(
      prompt => prompt.category === category && prompt.isDefault
    );
    return defaultPrompt || PROMPT_MARKETPLACE.find(prompt => prompt.category === category)!;
  }

  static getSelectedPrompts(): PromptSelections {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  static saveSelectedPrompts(selections: PromptSelections): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(selections));
    } catch (error) {
      console.error('Failed to save prompt selections:', error);
    }
  }

  static getSelectedPromptForAgent(agentType: string): SimplePrompt {
    const selections = this.getSelectedPrompts();
    const selectedId = selections[agentType];
    
    if (selectedId) {
      const prompt = this.getPromptById(selectedId);
      if (prompt) return prompt;
    }
    
    return this.getDefaultPrompt(agentType);
  }

  static selectPrompt(agentType: string, promptId: string): void {
    const selections = this.getSelectedPrompts();
    selections[agentType] = promptId;
    this.saveSelectedPrompts(selections);
  }
}

export default PromptService;
