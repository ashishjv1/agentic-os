import React, { useState } from 'react';
import { Agent, ChatMessage } from '../types';
import AgentSelector from './AgentSelector';
import ChatInput from './ChatInput';
import './ChatBar.css';

interface ChatBarProps {
  selectedAgent: Agent;
  onAgentChange: (agent: Agent) => void;
  availableAgents: Agent[];
  onSendMessage: (message: string) => void;
  onCancelGeneration: () => void;
  chatHistory: ChatMessage[];
  isGenerating: boolean;
}

const ChatBar: React.FC<ChatBarProps> = ({
  selectedAgent,
  onAgentChange,
  availableAgents,
  onSendMessage,
  onCancelGeneration,
  chatHistory,
  isGenerating,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="chat-bar">
      {showHistory && chatHistory.length > 0 && (
        <div className="chat-history">
          <div className="chat-history-header">
            <span>Chat History</span>
            <button onClick={() => setShowHistory(false)}>×</button>
          </div>
          <div className="chat-history-content">
            {chatHistory.map((message) => (
              <div key={message.id} className={`chat-message ${message.role}`}>
                <div className="message-header">
                  <span className="message-role">{message.role}</span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="chat-input-container">
        {isGenerating && (
          <div className="generation-status">
            <div className="status-indicator">
              <div className="pulse-dot"></div>
              <span>Generating with {selectedAgent.name}...</span>
            </div>
          </div>
        )}
        
        <AgentSelector
          selectedAgent={selectedAgent}
          agents={availableAgents}
          onAgentChange={onAgentChange}
        />
        
        <ChatInput
          onSendMessage={onSendMessage}
          onCancelGeneration={onCancelGeneration}
          isGenerating={isGenerating}
          placeholder={`Ask ${selectedAgent.name} to create something...`}
        />
        
        {chatHistory.length > 0 && (
          <button 
            className="history-toggle"
            onClick={() => setShowHistory(!showHistory)}
            title="Toggle chat history"
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBar;
