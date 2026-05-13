import React from 'react';
import { AppProvider } from './context/AppContext';
import HomePage from './components/HomePage';

export default function App() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
}
