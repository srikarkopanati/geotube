import React from 'react';
import { View } from 'react-native';
import { AppProvider } from '../../context/AppContext';
import HomePage from '../../components/HomePage';

export default function HomeScreen() {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
}
