import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types';
import './AgentSelector.css';

interface AgentSelectorProps {
  selectedAgent: Agent;
  agents: Agent[];
  onAgentChange: (agent: Agent) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent,
  agents,
  onAgentChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAgentSelect = (agent: Agent) => {
    onAgentChange(agent);
    setIsOpen(false);
  };

  return (
    <div className="agent-dropdown" ref={dropdownRef}>
      <button
        className="agent-select"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`dropdown-item ${selectedAgent.id === agent.id ? 'selected' : ''}`}
              onClick={() => handleAgentSelect(agent)}
            >
              <div className="agent-option-content">
                <span className="agent-name">{agent.name}</span>
                <span className="agent-description">{agent.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentSelector;
