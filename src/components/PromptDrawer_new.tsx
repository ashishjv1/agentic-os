import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Load all prompts and selections
    const selections = PromptService.getSelectedPrompts();
    setSelectedPrompts(selections);
    
    // Get all prompts (we'll filter by agent category)
    const agentPrompts = PromptService.getPromptsByCategory(selectedAgent);
    setAllPrompts(agentPrompts);
  }, [selectedAgent]);

  const handlePromptSelect = (prompt: SimplePrompt) => {
    const newSelections = {
      ...selectedPrompts,
      [selectedAgent]: prompt.id
    };
    setSelectedPrompts(newSelections);
    PromptService.selectPrompt(selectedAgent, prompt.id);
    onPromptSelect(prompt);
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

        <div className="prompts-list">
          {allPrompts.length === 0 ? (
            <div className="no-prompts">
              <p>No custom prompts available for this agent.</p>
              <p>Using default behavior.</p>
            </div>
          ) : (
            allPrompts.map(prompt => (
              <div
                key={prompt.id}
                className={`prompt-card ${selectedPromptId === prompt.id ? 'selected' : ''}`}
                onClick={() => handlePromptSelect(prompt)}
              >
                <div className="prompt-header">
                  <h3>{prompt.name}</h3>
                  {prompt.isDefault && <span className="default-badge">Default</span>}
                </div>
                <p className="prompt-description">{prompt.description}</p>
                {selectedPromptId === prompt.id && (
                  <div className="selected-indicator">
                    <span>✓ Active</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <p className="footer-text">
            Select a prompt to customize your agent's behavior
          </p>
        </div>
      </div>
    </div>
  );
}
