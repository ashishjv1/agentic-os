import { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import ChatBar from './components/ChatBar';
import ApiStatus from './components/ApiStatus';
import { Agent, ChatMessage, GeneratedApp } from './types';
import { createOpenRouterService } from './services/openRouterService';
import { debugEnvVars } from './utils/debug';
import { testOpenRouterConnection } from './utils/testConnection';
import './App.css';

// Default fallback agents (using OpenRouter as fallback)
const FALLBACK_AGENTS: Agent[] = [
  { 
    id: 'app-generator', 
    name: 'App Generator', 
    description: 'Creates complex applications with DeepSeek V3 (Most Powerful)',
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat'
  },
  { 
    id: 'utility-agent', 
    name: 'Utility Tools', 
    description: 'Fast tools and calculators with DeepSeek V3',
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat'
  },
  { 
    id: 'widget-agent', 
    name: 'Widgets', 
    description: 'UI components with WizardLM 2 (8x22B)',
    provider: 'openrouter',
    model: 'microsoft/wizardlm-2-8x22b'
  },
  { 
    id: 'game-agent', 
    name: 'Games', 
    description: 'Creative games with Claude 3 Haiku',
    provider: 'openrouter',
    model: 'anthropic/claude-3-haiku'
  },
  { 
    id: 'info-agent', 
    name: 'Info Search', 
    description: 'Latest news, research & information with AI search',
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat'
  },
];

interface ApiKeys {
  openai: string;
  anthropic: string;
  openrouter: string;
}

interface SelectedModels {
  openai: string;
  anthropic: string;
  openrouter: string;
}

interface CustomModels {
  openai: string;
  anthropic: string;
  openrouter: string;
}

// Generate available agents based on API keys, selected models, and custom models
const getAvailableAgents = (apiKeys: ApiKeys, selectedModels: SelectedModels, customModels: CustomModels): Agent[] => {
  const agents: Agent[] = [];

  // Helper function to get the actual model name
  const getActualModel = (provider: keyof SelectedModels) => {
    return selectedModels[provider] === 'custom' ? customModels[provider] : selectedModels[provider];
  };

  // Always show all agents, but indicate if API key is configured
  
  // OpenAI agents
  const openaiModel = getActualModel('openai');
  agents.push({
    id: 'openai-agent',
    name: 'OpenAI Assistant',
    description: apiKeys.openai 
      ? `Powered by ${openaiModel || selectedModels.openai}` 
      : 'Configure OpenAI API key to use',
    provider: 'openai',
    model: openaiModel || selectedModels.openai,
    requiresApiKey: !apiKeys.openai
  });

  // Anthropic agents
  const anthropicModel = getActualModel('anthropic');
  agents.push({
    id: 'anthropic-agent',
    name: 'Claude Assistant',
    description: apiKeys.anthropic 
      ? `Powered by ${anthropicModel || selectedModels.anthropic}` 
      : 'Configure Anthropic API key to use',
    provider: 'anthropic',
    model: anthropicModel || selectedModels.anthropic,
    requiresApiKey: !apiKeys.anthropic
  });

  // OpenRouter agents
  const openrouterModel = getActualModel('openrouter');
  agents.push({
    id: 'openrouter-agent',
    name: 'OpenRouter Assistant',
    description: apiKeys.openrouter 
      ? `Powered by ${openrouterModel || selectedModels.openrouter}` 
      : 'Configure OpenRouter API key to use',
    provider: 'openrouter',
    model: openrouterModel || selectedModels.openrouter,
    requiresApiKey: !apiKeys.openrouter
  });

  // If no agents available from API keys, return fallback agents
  if (agents.length === 0) {
    return FALLBACK_AGENTS;
  }

  return agents;
};

function App() {
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    try {
      const saved = localStorage.getItem('agentic-os-api-keys');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load API keys from localStorage:', error);
    }
    return { openai: '', anthropic: '', openrouter: '' };
  });

  // Selected models state
  const [selectedModels, setSelectedModels] = useState<SelectedModels>(() => {
    try {
      const saved = localStorage.getItem('agentic-os-selected-models');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load selected models from localStorage:', error);
    }
    return {
      openai: 'gpt-4o',
      anthropic: 'claude-3-5-sonnet-20241022',
      openrouter: 'deepseek/deepseek-chat'
    };
  });

  // Custom models state
  const [customModels, setCustomModels] = useState<CustomModels>(() => {
    try {
      const saved = localStorage.getItem('agentic-os-custom-models');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load custom models from localStorage:', error);
    }
    return {
      openai: '',
      anthropic: '',
      openrouter: ''
    };
  });

  // Available agents based on API keys, selected models, and custom models
  const [availableAgents, setAvailableAgents] = useState<Agent[]>(() => getAvailableAgents(apiKeys, selectedModels, customModels));
  const [selectedAgent, setSelectedAgent] = useState<Agent>(availableAgents[0]);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [appHistory, setAppHistory] = useState<GeneratedApp[]>([]);
  const [currentApp, setCurrentApp] = useState<GeneratedApp | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiStatus, setShowApiStatus] = useState(false);
  const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);

  // Update available agents when API keys change
  useEffect(() => {
    const newAvailableAgents = getAvailableAgents(apiKeys, selectedModels, customModels);
    setAvailableAgents(newAvailableAgents);
    
    // If current selected agent is not available anymore, switch to first available
    if (!newAvailableAgents.find(agent => agent.id === selectedAgent.id)) {
      setSelectedAgent(newAvailableAgents[0]);
    }
  }, [apiKeys, selectedAgent.id, selectedModels, customModels]);

  const handleApiKeysUpdate = (newApiKeys: ApiKeys) => {
    setApiKeys(newApiKeys);
  };

  const handleSelectedModelsUpdate = (newSelectedModels: SelectedModels) => {
    setSelectedModels(newSelectedModels);
  };

  const handleCustomModelsUpdate = (newCustomModels: CustomModels) => {
    setCustomModels(newCustomModels);
  };

  const handleAgentSelection = (agent: Agent) => {
    if (agent.requiresApiKey) {
      // Show API configuration modal with specific message
      alert(`Please configure your ${agent.provider?.toUpperCase()} API key to use this agent. Click the settings button to add your API key.`);
      setShowApiStatus(true);
      return;
    }
    setSelectedAgent(agent);
  };

  // Debug environment variables on component mount
  useEffect(() => {
    console.log('=== App Starting ===');
    console.log('API Key loaded:', !!import.meta.env.VITE_OPENROUTER_API_KEY);
    console.log('API Key preview:', import.meta.env.VITE_OPENROUTER_API_KEY?.substring(0, 10) + '...');
    debugEnvVars();
    
    // Test OpenRouter connection
    testOpenRouterConnection();
  }, []);

  const handleSendMessage = async (message: string) => {
    console.log('💬 New message received:', message);
    
    // Create abort controller for this generation
    const abortController = new AbortController();
    setCurrentAbortController(abortController);
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      agentId: selectedAgent.id,
    };

    console.log('💬 Adding user message to chat history');
    setChatHistory(prev => [...prev, userMessage]);
    setIsGenerating(true);
    console.log('⏳ Set generating state to true');

    try {
      console.log('🎯 Starting app generation process...');
      const generatedApp = await generateApp(message, selectedAgent, abortController.signal);
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log('🛑 Generation was cancelled');
        return;
      }
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Generated ${generatedApp.name} successfully!`,
        timestamp: new Date(),
        agentId: selectedAgent.id,
      };

      console.log('💬 Adding assistant message to chat history');
      setChatHistory(prev => [...prev, assistantMessage]);
      
      // Update app history and set current app
      console.log('🏗️ Updating app state...');
      if (currentApp) {
        setAppHistory(prev => [currentApp, ...prev]);
      }
      setCurrentApp(generatedApp);
      console.log('✅ App generation process complete!');

    } catch (error) {
      console.error('❌ Failed to generate app:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Generation was cancelled by user');
        const cancelMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⛔ Generation stopped by user.',
          timestamp: new Date(),
          agentId: selectedAgent.id,
        };
        setChatHistory(prev => [...prev, cancelMessage]);
      } else if (error instanceof Error && error.message === 'Generation cancelled') {
        console.log('🛑 Generation was cancelled by user (fallback)');
        const cancelMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⛔ Generation stopped by user.',
          timestamp: new Date(),
          agentId: selectedAgent.id,
        };
        setChatHistory(prev => [...prev, cancelMessage]);
      } else if (error instanceof Error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error while generating the app: ${error.message}`,
          timestamp: new Date(),
          agentId: selectedAgent.id,
        };
        setChatHistory(prev => [...prev, errorMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an unknown error while generating the app.',
          timestamp: new Date(),
          agentId: selectedAgent.id,
        };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } finally {
      console.log('⏳ Set generating state to false');
      setIsGenerating(false);
      setCurrentAbortController(null);
    }
  };

  const generateApp = async (prompt: string, agent: Agent, abortSignal?: AbortSignal): Promise<GeneratedApp> => {
    console.log('🚀 Starting app generation...');
    console.log('Prompt:', prompt);
    console.log('Agent:', agent.name);
    
    // Check for selected instructions and append them to the prompt
    const selectedInstructions = JSON.parse(localStorage.getItem('selectedInstructions') || '{}');
    const selectedInstructionId = selectedInstructions[agent.id];
    
    let enhancedPrompt = prompt;
    
    if (selectedInstructionId) {
      // Get the instruction content (this would ideally come from a service)
      const instructionContent = getInstructionContent(selectedInstructionId);
      if (instructionContent) {
        enhancedPrompt = `${prompt}\n\nAdditional Instructions: ${instructionContent}`;
        console.log('📝 Enhanced prompt with instructions:', enhancedPrompt);
      }
    }
    
    try {
      // Create OpenRouter service for the specific agent
      console.log('📡 Creating OpenRouter service...');
      const openRouterService = createOpenRouterService(agent.id);
      console.log('✅ OpenRouter service created');
      
      // Generate app using AI with enhanced prompt
      console.log('🤖 Calling OpenRouter API...');
      const response = await openRouterService.generateApp({
        prompt: enhancedPrompt,
        agentType: agent.id,
        context: `Previous apps: ${appHistory.map(app => app.name).slice(0, 3).join(', ')}`,
        abortSignal
      });
      console.log('✅ OpenRouter response received:', response);

      const generatedApp = {
        id: Date.now().toString(),
        name: response.name,
        prompt,
        agentId: agent.id,
        html: response.html,
        css: response.css,
        js: response.js,
        createdAt: new Date(),
      };
      
      console.log('✅ App generation successful:', generatedApp.name);
      return generatedApp;
      
    } catch (error) {
      console.error('❌ App generation failed:', error);
      console.log('🔄 Falling back to mock generation...');
      
      // Fallback to mock generation if API fails
      return await generateMockApp(enhancedPrompt, agent, abortSignal);
    }
  };

  const generateMockApp = async (prompt: string, agent: Agent, abortSignal?: AbortSignal): Promise<GeneratedApp> => {
    // Mock app generation as fallback
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (abortSignal?.aborted) {
          reject(new Error('Generation cancelled'));
          return;
        }
        
        resolve(getMockAppTemplate(prompt, agent));
      }, 1000);
      
      // If abort signal is triggered, clear timeout and reject
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Generation cancelled'));
        });
      }
    });
  };

  const getMockAppTemplate = (prompt: string, agent: Agent): GeneratedApp => {
    const appTemplates = {
      'app-generator': {
        calculator: {
          name: 'Calculator',
          html: `
            <div class="calculator">
              <div class="display">
                <input type="text" id="display" readonly>
              </div>
              <div class="buttons">
                <button onclick="clearDisplay()">C</button>
                <button onclick="deleteLast()">←</button>
                <button onclick="appendToDisplay('/')">/</button>
                <button onclick="appendToDisplay('*')">×</button>
                <button onclick="appendToDisplay('7')">7</button>
                <button onclick="appendToDisplay('8')">8</button>
                <button onclick="appendToDisplay('9')">9</button>
                <button onclick="appendToDisplay('-')">-</button>
                <button onclick="appendToDisplay('4')">4</button>
                <button onclick="appendToDisplay('5')">5</button>
                <button onclick="appendToDisplay('6')">6</button>
                <button onclick="appendToDisplay('+')">+</button>
                <button onclick="appendToDisplay('1')">1</button>
                <button onclick="appendToDisplay('2')">2</button>
                <button onclick="appendToDisplay('3')">3</button>
                <button onclick="calculate()" class="equals">=</button>
                <button onclick="appendToDisplay('0')" class="zero">0</button>
                <button onclick="appendToDisplay('.')">.</button>
              </div>
            </div>
          `,
          css: `
            .calculator {
              background: var(--glass-secondary);
              border-radius: var(--border-radius-lg);
              padding: 24px;
              width: 320px;
              margin: 20px auto;
              box-shadow: var(--shadow-glass);
              backdrop-filter: blur(16px);
              border: 1px solid var(--border-color);
            }
            .display {
              margin-bottom: 15px;
            }
            .display input {
              width: 100%;
              height: 70px;
              font-size: 24px;
              text-align: right;
              background: var(--glass-primary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              padding: 0 20px;
              border-radius: var(--border-radius-sm);
              backdrop-filter: blur(8px);
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            .buttons {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            .buttons button {
              height: 56px;
              font-size: 18px;
              border-radius: var(--border-radius-sm);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              background: var(--glass-tertiary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              cursor: pointer;
              backdrop-filter: blur(12px);
              box-shadow: var(--shadow-glass);
              font-weight: 500;
            }
            .buttons button:hover {
              transform: translateY(-3px) scale(1.02);
              background: var(--glass-primary);
              box-shadow: 0 8px 24px rgba(0, 122, 204, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            .equals {
              grid-row: span 2;
              background: var(--accent-blue) !important;
            }
            .zero {
              grid-column: span 2;
            }
          `,
          js: `
            // Calculator functionality wrapped in IIFE
            (function() {
              'use strict';
              
              const calculator = {
                appendToDisplay: function(value) {
                  const display = document.getElementById('display');
                  if (display) {
                    display.value += value;
                  }
                },
                
                clearDisplay: function() {
                  const display = document.getElementById('display');
                  if (display) {
                    display.value = '';
                  }
                },
                
                deleteLast: function() {
                  const display = document.getElementById('display');
                  if (display) {
                    display.value = display.value.slice(0, -1);
                  }
                },
                
                calculate: function() {
                  const display = document.getElementById('display');
                  if (display) {
                    try {
                      const expression = display.value.replace(/×/g, '*');
                      const result = Function('"use strict"; return (' + expression + ')')();
                      display.value = result;
                    } catch (error) {
                      display.value = 'Error';
                    }
                  }
                }
              };
              
              // Make functions global for onclick handlers
              if (typeof window !== 'undefined') {
                window.appendToDisplay = calculator.appendToDisplay;
                window.clearDisplay = calculator.clearDisplay;
                window.deleteLast = calculator.deleteLast;
                window.calculate = calculator.calculate;
              }
            })();
          `
        }
      }
    };

    // Simple keyword matching for demo
    const isCalculator = prompt.toLowerCase().includes('calculator');
    
    if (isCalculator && agent.id === 'app-generator') {
      const template = appTemplates['app-generator'].calculator;
      return {
        id: Date.now().toString(),
        name: template.name + ' (Fallback)',
        prompt,
        agentId: agent.id,
        html: template.html,
        css: template.css,
        js: template.js,
        createdAt: new Date(),
      };
    }

    // Default simple app
    return {
      id: Date.now().toString(),
      name: 'Simple App (Fallback)',
      prompt,
      agentId: agent.id,
      html: `<div class="simple-app"><h2>Generated App</h2><p>You asked: "${prompt}"</p><p>This is a fallback app generated by ${agent.name}</p><p style="color: var(--text-secondary); font-size: 12px;">Note: Set up OpenRouter API key for AI generation</p></div>`,
      css: `.simple-app { padding: 40px; text-align: center; background: var(--glass-secondary); border-radius: var(--border-radius-lg); margin: 20px; backdrop-filter: blur(16px); box-shadow: var(--shadow-glass); border: 1px solid var(--border-color); }`,
      js: `console.log('Fallback app generated for: ${prompt}');`,
      createdAt: new Date(),
    };
  };

  // Helper function to get instruction content by ID
  const getInstructionContent = (instructionId: string): string | null => {
    const instructionsMap: Record<string, string> = {
      'inst-responsive': 'Make sure the application is fully responsive and works well on mobile devices. Include touch-friendly controls and proper viewport scaling.',
      'inst-accessibility': 'Include proper accessibility features like keyboard navigation, ARIA labels, high contrast colors, and screen reader compatibility.',
      'inst-dark-mode': 'Include a dark mode toggle that switches between light and dark themes with smooth transitions.',
      'inst-local-storage': 'Use localStorage to save and restore user data, settings, and preferences across browser sessions.',
      'inst-export': 'Include export functionality to let users save their data as files (JSON, CSV, or text format).',
      'inst-real-time': 'Include real-time updates and live data refresh functionality where appropriate.',
      'inst-high-score': 'Include high score tracking with localStorage persistence and score display functionality.',
      'inst-sound': 'Include sound effects and audio feedback for game actions. Use Web Audio API or HTML5 audio elements.'
    };
    
    return instructionsMap[instructionId] || null;
  };

  const switchToApp = (app: GeneratedApp) => {
    if (currentApp) {
      setAppHistory(prev => [currentApp, ...prev.filter(a => a.id !== app.id)]);
    }
    setCurrentApp(app);
  };


  const minimizeCurrentApp = () => {
    if (currentApp) {
      // Move current app to history and clear current app
      setAppHistory(prev => [currentApp, ...prev.filter(a => a.id !== currentApp.id)]);
      setCurrentApp(null);
    }
  };

  const closeCurrentApp = () => {
    if (appHistory.length > 0) {
      // Switch to the most recent app in history
      const nextApp = appHistory[0];
      setAppHistory(prev => prev.slice(1));
      setCurrentApp(nextApp);
    } else {
      // No apps in history, go back to welcome screen
      setCurrentApp(null);
    }
  };

  const cancelGeneration = () => {
    if (currentAbortController) {
      console.log('🛑 Cancelling generation...');
      currentAbortController.abort();
      setCurrentAbortController(null);
      setIsGenerating(false);
      
      // Add immediate feedback message
      const cancelMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⛔ Generation stopped.',
        timestamp: new Date(),
        agentId: selectedAgent.id,
      };
      setChatHistory(prev => [...prev, cancelMessage]);
    }
  };

  return (
    <div className="app">
      <Desktop 
        currentApp={currentApp}
        onCloseApp={closeCurrentApp}
        onMinimizeApp={minimizeCurrentApp}
        onShowApiStatus={() => setShowApiStatus(true)}
        onGenerateApp={handleSendMessage}
        selectedAgent={selectedAgent.id}
      />
      <ChatBar
        selectedAgent={selectedAgent}
        onAgentChange={handleAgentSelection}
        availableAgents={availableAgents}
        onSendMessage={handleSendMessage}
        onCancelGeneration={cancelGeneration}
        chatHistory={chatHistory}
        isGenerating={isGenerating}
        hasCurrentApp={!!currentApp}
        appHistory={appHistory}
        onSwitchToApp={switchToApp}
      />
      <ApiStatus 
        isVisible={showApiStatus}
        onClose={() => setShowApiStatus(false)}
        onApiKeysUpdate={handleApiKeysUpdate}
        onSelectedModelsUpdate={handleSelectedModelsUpdate}
        onCustomModelsUpdate={handleCustomModelsUpdate}
      />
    </div>
  );
}

export default App;
