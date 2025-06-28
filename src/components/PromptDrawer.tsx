import React, { useState, useEffect, useMemo } from 'react';
import PromptService, { SimplePrompt } from '../services/promptService';
import './PromptDrawer.css';

interface PromptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgent: string;
  onPromptSelect: (prompt: SimplePrompt) => void;
}

export default function PromptDrawer({ isOpen, onClose, selectedAgent, onPromptSelect }: PromptDrawerProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<Record<string, string>>({});
  const [allPrompts, setAllPrompts] = useState<SimplePrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    console.log('🎯 PromptDrawer: Loading prompts for agent:', selectedAgent);
    
    // Load all prompts and selections
    const selections = PromptService.getSelectedPrompts();
    setSelectedPrompts(selections);
    console.log('🎯 PromptDrawer: Current selections:', selections);
    
    if (showAllCategories) {
      // Get all prompts from all categories
      const categories = ['app-generator', 'utility-agent', 'widget-agent', 'game-agent'];
      const allPromptsFromAllCategories = categories.flatMap(category => 
        PromptService.getPromptsByCategory(category)
      );
      console.log('🎯 PromptDrawer: Found all prompts:', allPromptsFromAllCategories);
      setAllPrompts(allPromptsFromAllCategories);
    } else {
      // Get prompts for current agent only
      const agentPrompts = PromptService.getPromptsByCategory(selectedAgent);
      console.log('🎯 PromptDrawer: Found prompts for', selectedAgent, ':', agentPrompts);
      setAllPrompts(agentPrompts);
    }
  }, [selectedAgent, showAllCategories]);

  // Filter prompts based on search term
  const filteredPrompts = useMemo(() => {
    if (!searchTerm.trim()) {
      return allPrompts;
    }
    
    const term = searchTerm.toLowerCase();
    return allPrompts.filter(prompt => 
      prompt.name.toLowerCase().includes(term) ||
      prompt.description.toLowerCase().includes(term) ||
      prompt.agentPrompt.toLowerCase().includes(term) ||
      prompt.category.toLowerCase().includes(term)
    );
  }, [allPrompts, searchTerm]);

  const handlePromptSelect = (prompt: SimplePrompt) => {
    const newSelections = {
      ...selectedPrompts,
      [selectedAgent]: prompt.id
    };
    setSelectedPrompts(newSelections);
    PromptService.selectPrompt(selectedAgent, prompt.id);
    // Don't call onPromptSelect here to prevent auto-closing the drawer
    // onPromptSelect(prompt);
  };

  const selectedPromptId = selectedPrompts[selectedAgent];

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

        <div className="search-section">
          <input
            type="text"
            placeholder="Search prompts... (e.g., 'game generation', 'productivity')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-options">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showAllCategories}
                onChange={(e) => setShowAllCategories(e.target.checked)}
              />
              Show all categories
            </label>
          </div>
        </div>

        <div className="prompts-list">
          <div className="debug-info">
            <div>Agent: {selectedAgent}</div>
            <div>Total prompts: {allPrompts.length}</div>
            <div>Filtered: {filteredPrompts.length}</div>
            <div>Selected: {selectedPromptId || 'none'}</div>
            {searchTerm && <div>Search: "{searchTerm}"</div>}
          </div>
          
          {filteredPrompts.length === 0 ? (
            <div className="no-prompts">
              {searchTerm ? (
                <>
                  <p>No prompts found for "{searchTerm}"</p>
                  <p>Try a different search term or check "Show all categories"</p>
                </>
              ) : (
                <>
                  <p>No custom prompts available for this agent.</p>
                  <p>Using default behavior.</p>
                </>
              )}
            </div>
          ) : (
            filteredPrompts.map(prompt => (
              <div
                key={prompt.id}
                className={`prompt-card ${selectedPromptId === prompt.id ? 'selected' : ''}`}
              >
                <div className="prompt-header">
                  <h3>{prompt.name}</h3>
                  <div className="prompt-badges">
                    {prompt.isDefault && <span className="default-badge">Default</span>}
                    <span className="category-badge">{prompt.category.replace('-', ' ')}</span>
                  </div>
                </div>
                <p className="prompt-description">{prompt.description}</p>
                
                <details className="prompt-details">
                  <summary>View Prompt Instructions</summary>
                  <div className="prompt-text">
                    {prompt.agentPrompt}
                  </div>
                </details>
                
                <div className="prompt-actions">
                  <button 
                    className="select-prompt-btn"
                    onClick={() => handlePromptSelect(prompt)}
                  >
                    {selectedPromptId === prompt.id ? '✓ Active' : 'Use This Prompt'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <p className="footer-text">
            {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  );
}
