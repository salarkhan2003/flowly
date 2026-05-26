import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { FormScrollLayout } from '../../components/forms/FormScrollLayout';
import { GlowButton } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { testGroqApiKey } from '../../lib/ai';
import { showError, showSuccess } from '../../lib/alert';
import {
  clearUserGroqApiKey,
  getBundledGroqApiKey,
  getGroqKeyStatus,
  saveUserGroqApiKey,
} from '../../lib/groqKey';

const SECURE_KEY = 'groq_api_key';

export default function AISettingsScreen() {
  const { C } = useTheme();
  const [keyInput, setKeyInput] = useState('');
  const [hasBundled, setHasBundled] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setHasBundled(!!getBundledGroqApiKey());
    const status = await getGroqKeyStatus();
    setAiReady(status.ready);
    try {
      const stored = await SecureStore.getItemAsync(SECURE_KEY);
      if (stored?.trim()) {
        setKeyInput(stored.trim());
        setHasOverride(true);
      } else {
        setKeyInput('');
        setHasOverride(false);
      }
    } catch {
      setKeyInput('');
      setHasOverride(false);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      await clearUserGroqApiKey();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('Using app default', hasBundled ? 'Built-in Groq key is active.' : 'Add a key if AI is unavailable.');
      setHasOverride(false);
      setTimeout(() => router.back(), 500);
      return;
    }
    if (!trimmed.startsWith('gsk_')) {
      showError('Invalid key', 'Groq keys usually start with gsk_');
      return;
    }
    await saveUserGroqApiKey(trimmed);
    setHasOverride(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSuccess('API key saved', 'Your key is stored securely on this device.');
    setTimeout(() => router.back(), 500);
  };

  const handleTest = async () => {
    const key = keyInput.trim() || getBundledGroqApiKey();
    if (!key) {
      showError('No key', 'Enter a key or use a build with a bundled default.');
      return;
    }
    setTesting(true);
    const result = await testGroqApiKey(key);
    setTesting(false);
    if (result.ok) {
      showSuccess('Test passed', result.message);
    } else {
      showError('Test failed', result.message);
    }
  };

  const handleClear = async () => {
    await clearUserGroqApiKey();
    setKeyInput('');
    setHasOverride(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
        >
          <View style={[s.backArrow, { borderColor: C.accent }]} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>AI Settings</Text>
        <View style={s.headerSpacer} />
      </View>

      <FormScrollLayout contentContainerStyle={s.content}>
        <Text style={[s.lead, { color: C.textSecondary }]}>
          Get a free key at console.groq.com. Leave empty to use the app default when available.
        </Text>

        {aiReady ? (
          <View style={[s.banner, { backgroundColor: C.successDim, borderColor: C.borderGlow }]}>
            <Text style={[s.bannerText, { color: C.accent }]}>
              {hasBundled
                ? 'AI is ready — this APK includes a built-in Groq key.'
                : 'AI is ready — using your saved API key.'}
              {hasBundled && hasOverride ? ' Your key overrides the built-in key.' : ''}
            </Text>
          </View>
        ) : (
          <View style={[s.banner, { backgroundColor: C.warningDim, borderColor: C.warning + '40' }]}>
            <Text style={[s.bannerText, { color: C.warning }]}>
              AI not configured — add your Groq API key below (get one free at console.groq.com).
            </Text>
          </View>
        )}

        <Text style={[s.label, { color: C.textMuted }]}>GROQ API KEY (OPTIONAL OVERRIDE)</Text>
        <TextInput
          style={[s.input, { color: C.textPrimary, backgroundColor: C.bgCard, borderColor: C.border }]}
          value={keyInput}
          onChangeText={setKeyInput}
          placeholder="gsk_... (leave empty for app default)"
          placeholderTextColor={C.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          editable={!loading}
        />

        <GlowButton
          label={testing ? 'Testing…' : 'Test key'}
          onPress={handleTest}
          variant="secondary"
          fullWidth
          disabled={testing}
          icon={testing ? <ActivityIndicator color={C.accent} size="small" /> : undefined}
        />

        <GlowButton label="Save" onPress={handleSave} fullWidth size="lg" />

        {hasOverride || keyInput.length > 0 ? (
          <TouchableOpacity onPress={handleClear}>
            <Text style={[s.clearLink, { color: C.danger }]}>Clear saved override</Text>
          </TouchableOpacity>
        ) : null}
      </FormScrollLayout>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }, { translateX: 2 }],
  },
  headerTitle: { ...Typography.headingMd, flex: 1, textAlign: 'center', fontWeight: '700' },
  headerSpacer: { width: 36 },
  content: { gap: Spacing.md },
  lead: { ...Typography.bodyMd, lineHeight: 22 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  banner: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  bannerText: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  clearLink: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 8 },
});
