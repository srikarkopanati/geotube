import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SearchBar() {
  const { state, search } = useApp();
  const { query } = state;
  const [inputValue, setInputValue] = useState(query);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      search(inputValue.trim());
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="Search YouTube videos..."
        placeholderTextColor="#9ca3af"
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>🔍</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: 400,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  button: {
    marginLeft: 8,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
});