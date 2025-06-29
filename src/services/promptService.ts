export interface SimplePrompt {
  id: string;
  name: string;
  description: string;
  agentPrompt: string;
  isDefault?: boolean;
}

export interface PromptSelections {
  [agentType: string]: string; // Selected prompt ID for each agent
}

// General prompts that work for all agent types
export const PROMPT_MARKETPLACE: SimplePrompt[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced approach with good functionality and UX',
    agentPrompt: `Create a well-designed, functional application with good user experience. Focus on clean interface, intuitive controls, and reliable functionality.`,
    isDefault: true
  },
  {
    id: 'advanced',
    name: 'Advanced Features',
    description: 'Sophisticated features and enhanced capabilities',
    agentPrompt: `Create an advanced application with sophisticated features and enhanced capabilities. Include multiple functions, data persistence using localStorage, keyboard shortcuts, export/import options, and professional-grade user experience. Focus on power user features and advanced functionality.`
  },
  {
    id: 'minimal',
    name: 'Clean & Simple',
    description: 'Minimalist design focused on core functionality',
    agentPrompt: `Create a clean, minimalist application that focuses on core functionality. Prioritize simplicity, fast loading, and intuitive interfaces. Remove unnecessary features and create something that does one thing exceptionally well with beautiful, uncluttered design.`
  },
  {
    id: 'visual',
    name: 'Visual & Animated',
    description: 'Rich visuals with smooth animations and effects',
    agentPrompt: `Create a visually stunning application with smooth animations, transitions, and dynamic effects. Include CSS animations, hover effects, loading animations, interactive visual feedback, and delightful micro-interactions. Focus on creating something that's not just functional but also visually engaging.`
  },
  {
    id: 'productivity',
    name: 'Productivity Focus',
    description: 'Designed to boost efficiency and streamline workflows',
    agentPrompt: `Create a productivity-focused application that helps users work more efficiently. Include features like batch processing, automation, keyboard shortcuts, quick actions, time-saving workflows, and integration capabilities. Focus on eliminating repetitive tasks and streamlining common operations.`
  },
  {
    id: 'data-driven',
    name: 'Data & Analytics',
    description: 'Focus on data visualization and analytical features',
    agentPrompt: `Create a data-driven application that excels at presenting and analyzing information. Include charts, graphs, meters, progress indicators, statistical displays, comparison tables, and analytical tools. Focus on clear data presentation, interactive visualizations, and helping users understand complex information.`
  },
  {
    id: 'interactive',
    name: 'Highly Interactive',
    description: 'Rich interactivity with engaging user experience',
    agentPrompt: `Create a highly interactive application with engaging user experience. Include drag-and-drop interfaces, real-time updates, interactive elements, responsive feedback, dynamic content, and features that encourage user engagement. Focus on creating an application that's fun and satisfying to use.`
  },
  {
    id: 'professional',
    name: 'Professional Grade',
    description: 'Enterprise-quality with robust features',
    agentPrompt: `Create a professional-grade application suitable for business or enterprise use. Include robust error handling, data validation, security considerations, accessibility features, comprehensive functionality, and polished interface. Focus on reliability, scalability, and professional presentation.`
  }
];

class PromptService {
  private static STORAGE_KEY = 'agentic-os-prompt-selections';

  static getAllPrompts(): SimplePrompt[] {
    return PROMPT_MARKETPLACE;
  }

  static getPromptById(id: string): SimplePrompt | undefined {
    return PROMPT_MARKETPLACE.find(prompt => prompt.id === id);
  }

  static getDefaultPrompt(): SimplePrompt {
    const defaultPrompt = PROMPT_MARKETPLACE.find(prompt => prompt.isDefault);
    return defaultPrompt || PROMPT_MARKETPLACE[0];
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
    
    return this.getDefaultPrompt();
  }

  static selectPrompt(agentType: string, promptId: string): void {
    const selections = this.getSelectedPrompts();
    selections[agentType] = promptId;
    this.saveSelectedPrompts(selections);
  }
}

export default PromptService;
