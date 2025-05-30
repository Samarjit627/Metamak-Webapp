import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => (
  <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '2rem' }}>
    <h1>Welcome to Manufacturing Analysis with AI</h1>
    <p>Your Vite + React + TypeScript app is running!</p>
  </div>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  console.error('Root element not found');
}
