import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

const COMMANDS = [
  { id: '1', icon: '✎', label: 'New Note', action: () => router.replace('/notes/new') },
  { id: '2', icon: '✓', label: 'New Task', action: () => router.replace('/tasks/new') },
  { id: '3', icon: '✦', label: 'Ask AI', action: () => router.replace('/(tabs)/ai') },
  { id: '4', icon: '⌕', label: 'Search', action: () => router.replace('/(tabs)/search') },
  { id: '5', icon: '◈', label: 'New Project', action: () => router.replace('/projects/new') },
  { id: '6', icon: '⌂', label: 'Go Home', action: () => router.replace('/(tabs)/home') },
];

export default function AICommandModal() {
  const [query, setQuery] = useState('');

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Type a command..."
          placeholderTextColor={Colors.textMuted}
          autoFocus
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.commandItem}
            onPress={() => { router.back(); setTimeout(item.action, 100); }}
          >
            <Text style={styles.commandIcon}>{item.icon}</Text>
            <Text style={styles.commandLabel}>{item.label}</Text>
            <Text style={styles.commandArrow}>↵</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCard },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchIcon: { fontSize: 18, color: Colors.textMuted },
  searchInput: {
    flex: 1,
    ...Typography.bodyLg,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  closeBtn: { fontSize: 16, color: Colors.textMuted, padding: 4 },
  list: { padding: Spacing.sm },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: 4,
  },
  commandIcon: { fontSize: 18, color: Colors.accent, width: 24, textAlign: 'center' },
  commandLabel: { ...Typography.bodyLg, color: Colors.textPrimary, flex: 1 },
  commandArrow: { fontSize: 14, color: Colors.textMuted },
});
