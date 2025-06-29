import React, { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onCancelGeneration?: () => void;
  isGenerating: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onCancelGeneration,
  isGenerating,
  placeholder = "Type your message...",
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isGenerating) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isGenerating}
        className="chat-input-field"
      />
      
      {isGenerating ? (
        <button
          onClick={onCancelGeneration}
          className="cancel-button"
          title="Stop generation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6H18V18H6V6Z"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="send-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatInput;
