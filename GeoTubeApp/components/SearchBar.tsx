import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SearchBar() {
  const { state, search } = useApp();
  const { query } = state;
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = () => {
    const nextQuery = inputValue.trim();
    if (nextQuery) search(nextQuery);
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
          <Text style={styles.iconText}>⌕</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  button: {
    marginLeft: 8,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});
