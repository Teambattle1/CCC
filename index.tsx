import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './app.css';
import { NuqsAdapter } from 'nuqs/adapters/react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <ErrorBoundary>
        <NuqsAdapter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NuqsAdapter>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
