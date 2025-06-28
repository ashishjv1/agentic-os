import React from 'react';
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
  return (
    <div className="agent-selector">
      <select
        value={selectedAgent.id}
        onChange={(e) => {
          const agent = agents.find(a => a.id === e.target.value);
          if (agent) onAgentChange(agent);
        }}
        className="agent-select"
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
      <div className="agent-description">
        {selectedAgent.description}
      </div>
    </div>
  );
};

export default AgentSelector;
