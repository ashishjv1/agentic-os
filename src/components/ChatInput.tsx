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
          title="Cancel generation"
        >
          ⏹️
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="send-button"
        >
          ➤
        </button>
      )}
    </div>
  );
};

export default ChatInput;
