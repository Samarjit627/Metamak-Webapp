import React, { useState, useRef, useEffect } from 'react';
import './HybridChatInterface.css';

// Message type
interface Message {
  id: number;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

// Modes for hybrid interface
const MODES = {
  SIMPLE: 'Simple',
  ADVANCED: 'Advanced',
};

type Mode = keyof typeof MODES;

const defaultMessages: Message[] = [
  { id: 1, sender: 'bot', content: 'Welcome to SolidChat! Switch modes anytime.', timestamp: new Date().toLocaleTimeString() },
];

export const HybridChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('SIMPLE');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMsg, {
      id: messages.length + 2,
      sender: 'bot',
      content: `Echo: ${input}`,
      timestamp: new Date().toLocaleTimeString(),
    }]);
    setInput('');
  };

  // Keyboard send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className={`hybrid-chat-container ${mode.toLowerCase()}`}>
      <header className="chat-header">
        <h2>SolidChat <span className="mode-badge">{MODES[mode]}</span></h2>
        <button onClick={() => setMode(mode === 'SIMPLE' ? 'ADVANCED' : 'SIMPLE')} className="toggle-mode-btn">
          Switch to {mode === 'SIMPLE' ? 'Advanced' : 'Simple'} Mode
        </button>
        <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? 'Hide' : 'Show'} Sidebar
        </button>
      </header>
      <div className="chat-main">
        {showSidebar && (
          <aside className="chat-sidebar">
            <h3>Features</h3>
            <ul>
              <li>Simple & Advanced modes</li>
              <li>Message history & search</li>
              <li>Keyboard shortcuts</li>
              <li>Custom themes</li>
              <li>File & image sharing (Advanced)</li>
              <li>Reactions & threading (Advanced)</li>
              <li>Accessibility & mobile support</li>
              <li>End-to-end encryption</li>
              <li>Bot & API integration</li>
            </ul>
          </aside>
        )}
        <section className="chat-window">
          <div className="messages-list">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <span className="sender">{msg.sender === 'user' ? 'You' : 'Bot'}:</span>
                <span className="content">{msg.content}</span>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Chat input"
            />
            <button onClick={sendMessage} className="send-btn">Send</button>
          </div>
        </section>
      </div>
      <footer className="chat-footer">
        <span>SolidChat Hybrid Interface &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};

export default HybridChatInterface;
