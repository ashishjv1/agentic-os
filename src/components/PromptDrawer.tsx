import { useState, useEffect, useMemo } from 'react';
import PromptService, { SimplePrompt } from '../services/promptService';
import './PromptDrawer.css';

interface PromptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgent: string;
  onAddToExamples?: (prompt: { title: string; detailedPrompt: string }) => void;
}

export default function PromptDrawer({ isOpen, onClose, selectedAgent, onAddToExamples }: PromptDrawerProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<Record<string, string>>({});
  const [selectedInstructions, setSelectedInstructions] = useState<Record<string, string>>({});
  const [allPrompts, setAllPrompts] = useState<SimplePrompt[]>([]);
  const [allInstructions, setAllInstructions] = useState<SimplePrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'prompts' | 'instructions'>('prompts');

  useEffect(() => {
    console.log('🎯 PromptDrawer: Loading general prompts and instructions');
    
    // Load all prompts and selections
    const selections = PromptService.getSelectedPrompts();
    setSelectedPrompts(selections);
    console.log('🎯 PromptDrawer: Current selections:', selections);
    
    // Load instructions selections (stored separately)
    const instructionSelections = JSON.parse(localStorage.getItem('selectedInstructions') || '{}');
    setSelectedInstructions(instructionSelections);
    
    // Get general prompts from the service
    const generalPrompts = PromptService.getAllPrompts();
    setAllPrompts(generalPrompts);
    
    // Get general instructions
    const generalInstructions = getGeneralInstructions();
    setAllInstructions(generalInstructions);
  }, [selectedAgent]);

  // General instructions that can enhance any application
  const getGeneralInstructions = (): SimplePrompt[] => {
    return [
      {
        id: 'inst-responsive',
        name: 'Mobile Responsive',
        description: 'Ensure the app works perfectly on mobile devices',
        agentPrompt: 'Make the application fully responsive with mobile-first design. Include touch-friendly controls, proper viewport scaling, and optimized layouts for all screen sizes.'
      },
      {
        id: 'inst-dark-mode',
        name: 'Dark Mode Toggle',
        description: 'Add dark/light theme switching capability',
        agentPrompt: 'Include a dark mode toggle that switches between light and dark themes with smooth transitions and saves user preference in localStorage.'
      },
      {
        id: 'inst-data-persistence',
        name: 'Data Persistence',
        description: 'Save user data and settings locally',
        agentPrompt: 'Use localStorage to save and restore user data, settings, and application state across browser sessions. Include import/export functionality.'
      },
      {
        id: 'inst-accessibility',
        name: 'Accessibility Features',
        description: 'Include comprehensive accessibility support',
        agentPrompt: 'Include proper accessibility features: keyboard navigation, ARIA labels, high contrast support, screen reader compatibility, and focus management.'
      },
      {
        id: 'inst-animations',
        name: 'Smooth Animations',
        description: 'Add polished animations and transitions',
        agentPrompt: 'Include smooth animations and micro-interactions using CSS transitions and animations. Add loading states, hover effects, and engaging visual feedback.'
      },
      {
        id: 'inst-keyboard-support',
        name: 'Keyboard Shortcuts',
        description: 'Add keyboard shortcuts for power users',
        agentPrompt: 'Include keyboard shortcuts for common actions (Ctrl+S for save, Ctrl+Z for undo, etc.) and display shortcut hints in the interface.'
      },
      {
        id: 'inst-export-import',
        name: 'Export & Import',
        description: 'Allow users to backup and restore their data',
        agentPrompt: 'Include export functionality to save data as JSON/CSV files and import functionality to restore data from files. Add backup and restore capabilities.'
      },
      {
        id: 'inst-search-filter',
        name: 'Search & Filter',
        description: 'Add search and filtering capabilities',
        agentPrompt: 'Include comprehensive search functionality with real-time filtering, sorting options, and advanced search criteria. Add search history and saved filters.'
      }
    ];
  };

  // Filter prompts based on search term
  const filteredPrompts = useMemo(() => {
    const items = activeTab === 'prompts' ? allPrompts : allInstructions;
    if (!searchTerm.trim()) {
      return items;
    }
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.agentPrompt.toLowerCase().includes(term)
    );
  }, [allPrompts, allInstructions, searchTerm, activeTab]);

  const handlePromptSelect = (prompt: SimplePrompt) => {
    const newSelections = {
      ...selectedPrompts,
      [selectedAgent]: prompt.id
    };
    setSelectedPrompts(newSelections);
    PromptService.selectPrompt(selectedAgent, prompt.id);
  };

  const handleInstructionSelect = (instruction: SimplePrompt) => {
    const newSelections = {
      ...selectedInstructions,
      [selectedAgent]: selectedInstructions[selectedAgent] === instruction.id ? '' : instruction.id
    };
    setSelectedInstructions(newSelections);
    localStorage.setItem('selectedInstructions', JSON.stringify(newSelections));
  };

  const selectedPromptId = selectedPrompts[selectedAgent];
  const selectedInstructionId = selectedInstructions[selectedAgent];

  if (!isOpen) return null;

  return (
    <div className="prompt-drawer-overlay">
      <div className="prompt-drawer">
        <div className="prompt-drawer-header">
          <h2>Prompt Marketplace</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="agent-info">
          <span className="agent-label">Active Agent:</span>
          <span className="agent-name">{selectedAgent.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompts ({allPrompts.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            Instructions ({allInstructions.length})
          </button>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder={`Search ${activeTab}... (e.g., '${activeTab === 'prompts' ? 'advanced features' : 'responsive design'}')`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="prompts-list">
          <div className="section-header">
            <h3>{activeTab === 'prompts' ? 'Available Prompts' : 'Available Instructions'}</h3>
            <p className="section-description">
              {activeTab === 'prompts' 
                ? 'Choose a prompt template that defines how the agent will create your apps.'
                : 'Select optional instructions to enhance your prompts with additional features.'
              }
            </p>
          </div>
          
          {filteredPrompts.length === 0 ? (
            <div className="no-prompts">
              {searchTerm ? (
                <>
                  <p>No {activeTab} found for "{searchTerm}"</p>
                  <p>Try a different search term</p>
                </>
              ) : (
                <>
                  <p>No {activeTab} available.</p>
                  <p>Using default behavior.</p>
                </>
              )}
            </div>
          ) : (
            filteredPrompts.map(item => (
              <div
                key={item.id}
                className={`prompt-card ${
                  activeTab === 'prompts' 
                    ? (selectedPromptId === item.id ? 'selected' : '') 
                    : (selectedInstructionId === item.id ? 'selected' : '')
                }`}
              >
                <div className="prompt-header">
                  <h3>{item.name}</h3>
                  <div className="prompt-badges">
                    {item.isDefault && <span className="default-badge">Default</span>}
                    <span className="category-badge">
                      {activeTab === 'prompts' ? 'General' : 'Instruction'}
                    </span>
                  </div>
                </div>
                <p className="prompt-description">{item.description}</p>
                
                <details className="prompt-details">
                  <summary>View {activeTab === 'prompts' ? 'Prompt' : 'Instruction'} Details</summary>
                  <div className="prompt-text">
                    {item.agentPrompt}
                  </div>
                </details>
                
                <div className="prompt-actions">
                  <button 
                    className="select-prompt-btn"
                    onClick={() => {
                      if (activeTab === 'prompts') {
                        handlePromptSelect(item);
                      } else {
                        handleInstructionSelect(item);
                      }
                    }}
                  >
                    {activeTab === 'prompts' 
                      ? (selectedPromptId === item.id ? '✓ Active' : 'Use This Prompt')
                      : (selectedInstructionId === item.id ? '✓ Selected' : 'Add Instruction')
                    }
                  </button>
                  {onAddToExamples && activeTab === 'prompts' && (
                    <button 
                      className="add-to-examples-btn"
                      onClick={() => onAddToExamples({
                        title: item.name,
                        detailedPrompt: item.agentPrompt
                      })}
                      title="Add to Examples"
                    >
                      Add to Examples
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <p className="footer-text">
            {filteredPrompts.length} {activeTab} available
            {activeTab === 'instructions' && selectedInstructionId && (
              <span> • 1 instruction selected</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
