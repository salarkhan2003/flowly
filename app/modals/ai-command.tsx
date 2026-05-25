import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClayCard } from '../../components/ui/ClayCard';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const COMMANDS = [
  { id: '1', icon: '✎', label: 'New Note', action: () => router.replace('/notes/new') },
  { id: '2', icon: '✓', label: 'New Task', action: () => router.replace('/tasks/new') },
  { id: '3', icon: '✦', label: 'Ask AI', action: () => router.replace('/(tabs)/ai') },
  { id: '4', icon: '⌕', label: 'Search', action: () => router.replace('/hub/search') },
  { id: '5', icon: '◈', label: 'New Project', action: () => router.replace('/projects/new') },
  { id: '6', icon: '⌂', label: 'Go Home', action: () => router.replace('/(tabs)/home') },
];

export default function AICommandModal() {
  const { C } = useTheme();
  const [query, setQuery] = useState('');
  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <ClayCard style={styles.sheet}>
        <View style={styles.handle} />
        <View style={[styles.searchRow, { borderBottomColor: C.border }]}>
          <Text style={[styles.searchIcon, { color: C.textMuted }]}>⌕</Text>
          <TextInput
            style={[styles.searchInput, { color: C.textPrimary }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Type a command..."
            placeholderTextColor={C.textMuted}
            autoFocus
          />
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.closeBtn, { color: C.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.commandItem, { backgroundColor: C.bgCardAlt }]}
              onPress={() => {
                router.back();
                setTimeout(item.action, 100);
              }}
            >
              <Text style={[styles.commandIcon, { color: C.accent }]}>{item.icon}</Text>
              <Text style={[styles.commandLabel, { color: C.textPrimary }]}>{item.label}</Text>
              <Text style={[styles.commandArrow, { color: C.textMuted }]}>↵</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      </ClayCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  sheet: { flex: 1, padding: Spacing.sm, overflow: 'hidden' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.5)',
    alignSelf: 'center',
    marginVertical: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, ...Typography.bodyLg, paddingVertical: 8 },
  closeBtn: { fontSize: 16, padding: 4 },
  list: { padding: Spacing.sm },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  commandIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  commandLabel: { ...Typography.bodyLg, flex: 1 },
  commandArrow: { fontSize: 14 },
});
