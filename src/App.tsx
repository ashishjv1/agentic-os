import { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import ChatBar from './components/ChatBar';
import ApiStatus from './components/ApiStatus';
import { Agent, ChatMessage, GeneratedApp } from './types';
import { createOpenRouterService } from './services/openRouterService';
import { debugEnvVars } from './utils/debug';
import { testOpenRouterConnection } from './utils/testConnection';
import './App.css';

const AVAILABLE_AGENTS: Agent[] = [
  { 
    id: 'app-generator', 
    name: 'App Generator', 
    description: 'Creates complex applications with DeepSeek V3 (Most Powerful)' 
  },
  { 
    id: 'utility-agent', 
    name: 'Utility Tools', 
    description: 'Fast tools and calculators with DeepSeek V3' 
  },
  { 
    id: 'widget-agent', 
    name: 'Widgets', 
    description: 'UI components with WizardLM 2 (8x22B)' 
  },
  { 
    id: 'game-agent', 
    name: 'Games', 
    description: 'Creative games with Claude 3 Haiku' 
  },
  { 
    id: 'info-agent', 
    name: 'Info Search', 
    description: 'Latest news, research & information with AI search' 
  },
];

function App() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AVAILABLE_AGENTS[0]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [appHistory, setAppHistory] = useState<GeneratedApp[]>([]);
  const [currentApp, setCurrentApp] = useState<GeneratedApp | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiStatus, setShowApiStatus] = useState(false);
  const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);

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
          content: 'Generation cancelled by user.',
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
    
    try {
      // Create OpenRouter service for the specific agent
      console.log('📡 Creating OpenRouter service...');
      const openRouterService = createOpenRouterService(agent.id);
      console.log('✅ OpenRouter service created');
      
      // Generate app using AI
      console.log('🤖 Calling OpenRouter API...');
      const response = await openRouterService.generateApp({
        prompt,
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
      return await generateMockApp(prompt, agent);
    }
  };

  const generateMockApp = async (prompt: string, agent: Agent): Promise<GeneratedApp> => {
    // Mock app generation as fallback
    await new Promise(resolve => setTimeout(resolve, 1000));

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
              background: var(--bg-secondary);
              border-radius: var(--border-radius);
              padding: 20px;
              width: 300px;
              margin: 20px auto;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            .display {
              margin-bottom: 15px;
            }
            .display input {
              width: 100%;
              height: 60px;
              font-size: 24px;
              text-align: right;
              background: var(--bg-primary);
              border: 2px solid var(--border-color);
              color: var(--text-primary);
              padding: 0 15px;
            }
            .buttons {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            .buttons button {
              height: 50px;
              font-size: 18px;
              border-radius: 5px;
              transition: all 0.2s;
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              color: var(--text-primary);
              cursor: pointer;
            }
            .buttons button:hover {
              transform: translateY(-2px);
              background: var(--bg-primary);
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
      css: `.simple-app { padding: 40px; text-align: center; background: var(--bg-secondary); border-radius: var(--border-radius); margin: 20px; }`,
      js: `console.log('Fallback app generated for: ${prompt}');`,
      createdAt: new Date(),
    };
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

  const removeAppFromHistory = (appId: string) => {
    setAppHistory(prev => prev.filter(app => app.id !== appId));
    if (currentApp?.id === appId) {
      closeCurrentApp();
    }
  };

  const cancelGeneration = () => {
    if (currentAbortController) {
      console.log('🛑 Cancelling generation...');
      currentAbortController.abort();
      setCurrentAbortController(null);
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <Desktop 
        currentApp={currentApp}
        appHistory={appHistory}
        onSwitchToApp={switchToApp}
        onCloseApp={closeCurrentApp}
        onMinimizeApp={minimizeCurrentApp}
        onRemoveApp={removeAppFromHistory}
        onShowApiStatus={() => setShowApiStatus(true)}
        onGenerateApp={handleSendMessage}
        selectedAgent={selectedAgent.id}
      />
      <ChatBar
        selectedAgent={selectedAgent}
        onAgentChange={setSelectedAgent}
        availableAgents={AVAILABLE_AGENTS}
        onSendMessage={handleSendMessage}
        onCancelGeneration={cancelGeneration}
        chatHistory={chatHistory}
        isGenerating={isGenerating}
      />
      <ApiStatus 
        isVisible={showApiStatus}
        onClose={() => setShowApiStatus(false)}
      />
    </div>
  );
}

export default App;
