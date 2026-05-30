import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { FormScrollLayout } from '../../components/forms/FormScrollLayout';
import { ClayCard } from '../../components/ui/ClayCard';
import { GlowButton } from '../../components/ui';
import { ClayCategory, Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { testAiConnection } from '../../lib/ai';
import { showError, showSuccess } from '../../lib/alert';
import {
  AI_PROVIDERS,
  type AiKeySource,
  type AiProviderId,
  clearUserApiKey,
  defaultModelForProvider,
  getBundledGroqApiKey,
  getProviderDef,
  getUserApiKey,
  isGroqBundledInBuild,
  isValidModel,
  loadAiUserConfig,
  saveAiUserConfig,
  saveUserApiKey,
} from '../../lib/aiConfig';

export default function AISettingsScreen() {
  const { C } = useTheme();
  const [keySource, setKeySource] = useState<AiKeySource>('bundled');
  const [provider, setProvider] = useState<AiProviderId>('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [keyInput, setKeyInput] = useState('');
  const [hasBundled, setHasBundled] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const effectiveProvider: AiProviderId = keySource === 'bundled' ? 'groq' : provider;
  const providerDef = useMemo(() => getProviderDef(effectiveProvider), [effectiveProvider]);
  const models = providerDef.models;

  const load = useCallback(async () => {
    setLoading(true);
    setHasBundled(isGroqBundledInBuild());
    const config = await loadAiUserConfig();
    setKeySource(config.keySource);
    setProvider(config.provider);
    setModel(config.model);
    const stored = await getUserApiKey();
    setKeyInput(stored ?? '');
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const resolveTestKey = (): string => {
    if (keySource === 'bundled') return getBundledGroqApiKey();
    return keyInput.trim();
  };

  const handleSave = async () => {
    if (keySource === 'custom') {
      const trimmed = keyInput.trim();
      if (!trimmed) {
        showError('API key required', `Paste your ${providerDef.name} key to continue.`);
        return;
      }
      await saveUserApiKey(trimmed);
    }

    await saveAiUserConfig({
      keySource,
      provider: keySource === 'bundled' ? 'groq' : provider,
      model,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const label = keySource === 'bundled' ? 'App default (Groq)' : providerDef.name;
    showSuccess('AI ready', `${label} · ${model}`);
    setTimeout(() => router.back(), 450);
  };

  const handleTest = async () => {
    const key = resolveTestKey();
    if (!key) {
      showError(
        'No API key',
        keySource === 'bundled'
          ? 'This build has no embedded Groq key. Use Custom API or add EXPO_PUBLIC_GROQ_API_KEY for dev.'
          : `Enter your ${providerDef.name} API key below.`
      );
      return;
    }
    const testProvider = keySource === 'bundled' ? 'groq' : provider;
    const testModel =
      keySource === 'bundled'
        ? isValidModel('groq', model)
          ? model
          : defaultModelForProvider('groq')
        : model;
    setTesting(true);
    const result = await testAiConnection(testProvider, key, testModel);
    setTesting(false);
    if (result.ok) showSuccess('Connected', result.message);
    else showError('Connection failed', result.message);
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.back, { borderColor: C.border, backgroundColor: C.bgCard }]}>
          <View style={[s.backArrow, { borderColor: ClayCategory.purple }]} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>AI setup</Text>
        <View style={{ width: 40 }} />
      </View>

      <FormScrollLayout contentContainerStyle={s.scroll}>
        <ClayCard tone="purple" glowing style={s.hero}>
          <Text style={[s.heroTag, { color: ClayCategory.purple }]}>FLOWLY AI</Text>
          <Text style={[s.heroTitle, { color: C.textPrimary }]}>Connect your assistant</Text>
          <Text style={[s.heroBody, { color: C.textSecondary }]}>
            Groq, Gemini, Claude, OpenAI, Qwen, or DeepSeek. Keys stay on your device.
          </Text>
        </ClayCard>

        <Text style={[s.label, { color: C.textMuted }]}>CONNECTION</Text>
        <View style={s.row2}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setKeySource('bundled');
              setProvider('groq');
              setModel(defaultModelForProvider('groq'));
            }}
            style={[
              s.chip,
              {
                flex: 1,
                backgroundColor: keySource === 'bundled' ? ClayCategory.ai + '22' : C.bgCard,
                borderColor: keySource === 'bundled' ? ClayCategory.ai : C.border,
              },
            ]}
          >
            <Text style={[s.chipTitle, { color: C.textPrimary }]}>App default</Text>
            <Text style={[s.chipSub, { color: C.textMuted }]}>
              {hasBundled ? 'Groq · built-in' : 'Not in this build'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setKeySource('custom');
            }}
            style={[
              s.chip,
              {
                flex: 1,
                backgroundColor: keySource === 'custom' ? ClayCategory.coral + '22' : C.bgCard,
                borderColor: keySource === 'custom' ? ClayCategory.coral : C.border,
              },
            ]}
          >
            <Text style={[s.chipTitle, { color: C.textPrimary }]}>My API key</Text>
            <Text style={[s.chipSub, { color: C.textMuted }]}>Any provider</Text>
          </Pressable>
        </View>

        {keySource === 'custom' ? (
          <>
            <Text style={[s.label, { color: C.textMuted }]}>PROVIDER</Text>
            <View style={s.providerGrid}>
              {AI_PROVIDERS.map((p) => {
                const on = provider === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setProvider(p.id);
                      setModel(defaultModelForProvider(p.id));
                    }}
                    style={[
                      s.providerChip,
                      {
                        backgroundColor: on ? p.color + '22' : C.bgCard,
                        borderColor: on ? p.color : C.border,
                      },
                    ]}
                  >
                    <View style={[s.providerDot, { backgroundColor: p.color }]} />
                    <Text style={[s.providerName, { color: C.textPrimary }]}>{p.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <ClayCard tone="coral" style={s.keyCard}>
              <View style={s.keyHead}>
                <Text style={[s.keyLabel, { color: ClayCategory.coral }]}>API KEY</Text>
                <TouchableOpacity onPress={() => Linking.openURL(providerDef.docsUrl)}>
                  <Text style={[s.link, { color: C.accent }]}>Get key</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[s.input, { color: C.textPrimary, backgroundColor: C.bgCardAlt, borderColor: C.border }]}
                value={keyInput}
                onChangeText={setKeyInput}
                placeholder={providerDef.keyHint}
                placeholderTextColor={C.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <TouchableOpacity onPress={() => clearUserApiKey().then(() => setKeyInput(''))}>
                <Text style={[s.clear, { color: C.danger }]}>Clear saved key</Text>
              </TouchableOpacity>
            </ClayCard>
          </>
        ) : null}

        <Text style={[s.label, { color: C.textMuted }]}>MODEL</Text>
        <View style={s.modelList}>
          {models.map((m) => {
            const picked = model === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setModel(m.id);
                }}
                style={[
                  s.modelRow,
                  {
                    backgroundColor: picked ? providerDef.color + '18' : C.bgCard,
                    borderColor: picked ? providerDef.color : C.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.modelName, { color: C.textPrimary }]}>{m.label}</Text>
                  {m.hint ? <Text style={[s.modelHint, { color: C.textMuted }]}>{m.hint}</Text> : null}
                </View>
                {picked ? (
                  <View style={[s.check, { backgroundColor: providerDef.color }]}>
                    <Text style={s.checkMark}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <GlowButton
          label={testing ? 'Testing…' : 'Test connection'}
          onPress={handleTest}
          variant="secondary"
          fullWidth
          disabled={testing || loading}
          icon={testing ? <ActivityIndicator color={C.accent} size="small" /> : undefined}
        />
        <GlowButton label="Save & start using AI" onPress={handleSave} fullWidth size="lg" />
      </FormScrollLayout>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 8,
    height: 8,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    transform: [{ rotate: '45deg' }, { translateX: 2 }],
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800' },
  scroll: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  hero: { padding: Spacing.lg, gap: 6 },
  heroTag: Typography.caption,
  heroTitle: { fontSize: 22, fontWeight: '800' },
  heroBody: { ...Typography.bodyMd, lineHeight: 22 },
  label: { ...Typography.caption, marginTop: 4 },
  row2: { flexDirection: 'row', gap: 10 },
  chip: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    gap: 4,
  },
  chipTitle: { fontSize: 15, fontWeight: '700' },
  chipSub: { fontSize: 12 },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  providerName: { fontSize: 13, fontWeight: '600' },
  keyCard: { padding: Spacing.md, gap: 10 },
  keyHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  keyLabel: Typography.caption,
  link: { fontSize: 13, fontWeight: '700' },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  clear: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  modelList: { gap: 8 },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    gap: 12,
  },
  modelName: { fontSize: 15, fontWeight: '700' },
  modelHint: { fontSize: 12, marginTop: 2 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
