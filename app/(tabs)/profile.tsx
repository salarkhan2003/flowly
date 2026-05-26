import React, { useCallback, useRef, useState } from 'react';
import { LatestUpdatesModal } from '../../components/profile/LatestUpdatesModal';
import { getInstalledVersionDisplay, isUpdateAvailable } from '../../lib/updates';
import {
  ActivityIndicator, Animated, Image, ScrollView, Share, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { showConfirm, showError } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { TelegramJoinButton } from '../../components/forms/TelegramJoinButton';
import { CheckForUpdatesButton } from '../../components/profile/CheckForUpdatesButton';
import { DownloadUpdateButton } from '../../components/profile/DownloadUpdateButton';
import { exportFlowlyPdf } from '../../lib/exportPdf';
import { shareLatestVersion, getFlowlyDownloadUrl } from '../../lib/shareApp';
import { ClayCard } from '../../components/ui';
import { getColors, Spacing, Radius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useNotesStore } from '../../stores/notesStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUpdateStore } from '../../stores/updateStore';
import type { UpdateCheckPolicy } from '../../types';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user, updateSettings, updateProfile, resetApp } = useAuthStore();
  const { notes } = useNotesStore();
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();
  const { mode, toggle } = useThemeStore();
  const {
    available: updateAvailable,
    latestRelease,
    isChecking,
    checkForUpdates,
    refreshLatestRelease,
    refreshInstalledVersion,
    lastMessage,
  } = useUpdateStore();
  const C = getColors(mode);
  const isDark = mode === 'dark';
  const updatePolicy: UpdateCheckPolicy = user?.settings?.update_check_policy ?? 'notify';

  const UPDATE_POLICY_OPTIONS: { value: UpdateCheckPolicy; label: string; hint: string }[] = [
    { value: 'notify', label: 'Notify in Settings', hint: 'Badge only — no popup on launch' },
    { value: 'on_launch', label: 'Prompt on launch', hint: 'Ask when you open the app (max once / 24h)' },
    { value: 'never', label: 'Never check', hint: 'Fully offline — check manually below' },
  ];

  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const updatesSectionY = useRef(0);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [showChangelog, setShowChangelog] = useState(false);
  const [exporting, setExporting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshInstalledVersion();
      refreshLatestRelease().catch(() => {});
      if (section !== 'updates') return;
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, updatesSectionY.current - 12),
          animated: true,
        });
      }, 400);
      return () => clearTimeout(timer);
    }, [section, refreshLatestRelease, refreshInstalledVersion])
  );

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await updateProfile({ name: trimmed });
    setEditingName(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleThemeToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggle();
  };

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExporting(true);
    try {
      await exportFlowlyPdf({ user, notes, tasks, projects });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create PDF.';
      showError('Export failed', msg);
    } finally {
      setExporting(false);
    }
  };

  const handleShareApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ok = await shareLatestVersion();
    if (ok) await refreshLatestRelease();
  };

  const handleReset = () => {
    showConfirm({
      title: 'Reset Flowly',
      message:
        'This permanently deletes all tasks, notes, projects, and settings on this device. This cannot be undone.',
      confirmLabel: 'Reset everything',
      cancelLabel: 'Keep my data',
      destructive: true,
      onConfirm: async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await resetApp();
        router.replace('/(auth)/onboarding');
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.topBar, { borderBottomColor: C.border }]}>
        <Text style={[styles.topBarTitle, { color: C.textPrimary }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
          onPress={handleShareApp}
          activeOpacity={0.85}
          accessibilityLabel="Share Flowly app download link"
        >
          <Text style={[styles.shareIcon, { color: C.accent }]}>↗</Text>
          <Text style={[styles.shareLabel, { color: C.accent }]}>Share app</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarWrap, { borderColor: C.borderGlow }]}>
            <Image source={require('../../assets/icon.png')} style={styles.avatarBg} resizeMode="cover" />
            <View style={[styles.avatarOverlay, { backgroundColor: isDark ? 'rgba(5,10,20,0.55)' : 'rgba(240,244,255,0.55)' }]}>
              <Text style={[styles.avatarInitial, { color: C.accent }]}>
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={[styles.nameInput, { color: C.textPrimary, borderColor: C.borderGlow, backgroundColor: C.bgCard }]}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                placeholder="Your name"
                placeholderTextColor={C.textMuted}
              />
              <TouchableOpacity style={[styles.saveNameBtn, { backgroundColor: C.accent }]} onPress={handleSaveName}>
                <Text style={[styles.saveNameText, { color: C.bg }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelNameBtn, { borderColor: C.border }]} onPress={() => { setEditingName(false); setNameInput(user?.name ?? ''); }}>
                <Text style={[styles.cancelNameText, { color: C.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setEditingName(true); setNameInput(user?.name ?? ''); }} style={styles.nameRow}>
              <Text style={[styles.name, { color: C.textPrimary }]}>{user?.name ?? 'User'}</Text>
              <View style={[styles.editBadge, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                <Text style={[styles.editBadgeText, { color: C.accent }]}>Edit</Text>
              </View>
            </TouchableOpacity>
          )}

          <Text style={[styles.subtitle, { color: C.textSecondary }]}>All data stored locally on this device</Text>
        </View>

        {/* Appearance */}
        <ClayCard style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={styles.sectionContent}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                <Text style={[styles.iconBoxText, { color: C.accent }]}>{isDark ? 'D' : 'L'}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Appearance</Text>
            </View>
            <TouchableOpacity style={[styles.themeToggleRow, { backgroundColor: C.bgCardAlt, borderColor: C.border }]} onPress={handleThemeToggle} activeOpacity={0.8}>
              <View style={styles.themeLeft}>
                <View style={[styles.themeIconWrap, { backgroundColor: isDark ? '#1a2540' : '#FFF9E6' }]}>
                  {isDark ? (
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: C.textSecondary, overflow: 'hidden' }}>
                      <View style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: C.bgCardAlt }} />
                    </View>
                  ) : (
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFB830' }} />
                  )}
                </View>
                <View>
                  <Text style={[styles.themeLabel, { color: C.textPrimary }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                  <Text style={[styles.themeSubLabel, { color: C.textMuted }]}>
                    {isDark ? 'Enabled — tap for light' : 'Default light — tap for dark'}
                  </Text>
                </View>
              </View>
              <View style={[styles.themeTrack, { backgroundColor: isDark ? C.accentDim : '#E2E8F0', borderColor: isDark ? C.borderGlow : '#CBD5E0' }]}>
                <Animated.View style={[styles.themeThumb, {
                  backgroundColor: isDark ? C.accent : '#FFFFFF',
                  transform: [{ translateX: isDark ? 22 : 2 }],
                  shadowColor: isDark ? C.accent : '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isDark ? 0.8 : 0.2,
                  shadowRadius: isDark ? 6 : 2,
                  elevation: isDark ? 6 : 2,
                }]} />
              </View>
            </TouchableOpacity>
          </View>
        </ClayCard>

        {/* AI Info */}
        <ClayCard style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]} glowing>
          <View style={styles.sectionContent}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                <Text style={[styles.iconBoxText, { color: C.accent }]}>AI</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>AI Assistant</Text>
            </View>
            <View style={styles.aiRow}>
              <View style={[styles.aiDot, { backgroundColor: C.accent, shadowColor: C.accent }]} />
              <Text style={[styles.aiStatus, { color: C.accent }]}>Groq · llama-3.3-70b</Text>
            </View>
            <Text style={[styles.aiNote, { color: C.textSecondary }]}>
              Built-in AI with full access to your notes, tasks, and projects.
            </Text>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/settings/ai' as Href)}
            >
              <Text style={[styles.menuItemText, { color: C.textPrimary }]}>Configure API key</Text>
              <Text style={[styles.menuItemArrow, { color: C.accent }]}>›</Text>
            </TouchableOpacity>
          </View>
        </ClayCard>

        {/* Community & feedback */}
        <ClayCard style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]} glowing>
          <View style={styles.sectionContent}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: C.pastelLavender + '44', borderColor: C.borderGlow }]}>
                <Text style={[styles.iconBoxText, { color: C.accent }]}>♥</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Community</Text>
            </View>
            <Text style={[styles.aiNote, { color: C.textSecondary }]}>
              Join the Flowly team for future updates — completely optional.
            </Text>
            <TelegramJoinButton compact />
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: C.border }]}
              onPress={() => router.push('/forms/join-team')}
            >
              <Text style={[styles.menuItemText, { color: C.textPrimary }]}>Join Flowly team</Text>
              <Text style={[styles.menuItemArrow, { color: C.accent }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/forms/feedback')}
            >
              <Text style={[styles.menuItemText, { color: C.textPrimary }]}>Bugs, feedback & features</Text>
              <Text style={[styles.menuItemArrow, { color: C.accent }]}>›</Text>
            </TouchableOpacity>
          </View>
        </ClayCard>

        {/* Notifications */}
        <ClayCard style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={styles.sectionContent}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: C.warning + '20', borderColor: C.warning + '40' }]}>
                <Text style={[styles.iconBoxText, { color: C.warning }]}>N</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Notifications</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: C.textPrimary }]}>Enable Notifications</Text>
              <Switch
                value={user?.settings?.notifications_enabled ?? true}
                onValueChange={(v) => updateSettings({ notifications_enabled: v })}
                trackColor={{ false: C.bgCardAlt, true: C.accentDim }}
                thumbColor={user?.settings?.notifications_enabled ? C.accent : C.textMuted}
              />
            </View>
          </View>
        </ClayCard>

        {/* App & updates */}
        <View
          onLayout={(e) => {
            updatesSectionY.current = e.nativeEvent.layout.y;
          }}
        >
        <ClayCard style={[styles.section, { backgroundColor: C.bgCard, borderColor: updateAvailable && isUpdateAvailable(updateAvailable) ? C.borderGlow : C.border }]} glowing={!!(updateAvailable && isUpdateAvailable(updateAvailable))}>
          <View style={styles.sectionContent}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                <Text style={[styles.iconBoxText, { color: C.accent }]}>↑</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>App & Updates</Text>
              {updateAvailable && isUpdateAvailable(updateAvailable) && (
                <View style={[styles.updateBadge, { backgroundColor: C.accent, borderColor: C.accent }]}>
                  <Text style={[styles.updateBadgeText, { color: C.bg }]}>New</Text>
                </View>
              )}
            </View>

            <Text style={[styles.versionLine, { color: C.textSecondary }]}>
              Installed: Flowly {getInstalledVersionDisplay()}
              {isChecking ? ' · checking…' : ''}
            </Text>
            {lastMessage && !isChecking ? (
              <Text style={[styles.lastCheckMsg, { color: updateAvailable && isUpdateAvailable(updateAvailable) ? C.accent : C.textMuted }]}>
                {lastMessage}
              </Text>
            ) : null}

            {!updateAvailable ? (
              <Text style={[styles.aiNote, { color: C.textMuted }]}>
                Direct APK installs do not auto-update. Tap below to check version.json on GitHub.
              </Text>
            ) : null}

            <CheckForUpdatesButton />
            {updateAvailable && isUpdateAvailable(updateAvailable) ? <DownloadUpdateButton /> : null}

            <TouchableOpacity
              style={[styles.whatsNewBtn, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                refreshLatestRelease()
                  .catch(() => {})
                  .finally(() => setShowChangelog(true));
              }}
            >
              <Text style={[styles.whatsNewLabel, { color: C.textPrimary }]}>What's new in latest release</Text>
              <Text style={[styles.menuItemArrow, { color: C.accent }]}>›</Text>
            </TouchableOpacity>

            <LatestUpdatesModal
              visible={showChangelog}
              manifest={latestRelease}
              onClose={() => setShowChangelog(false)}
            />

            <Text style={[styles.policyLabel, { color: C.textMuted }]}>Update notifications</Text>
            {UPDATE_POLICY_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.policyRow,
                  { borderBottomColor: C.border, borderBottomWidth: i < UPDATE_POLICY_OPTIONS.length - 1 ? 1 : 0 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSettings({ update_check_policy: opt.value });
                  if (opt.value !== 'never') checkForUpdates({ force: true });
                }}
              >
                <View style={styles.policyLeft}>
                  <Text style={[styles.policyTitle, { color: C.textPrimary }]}>{opt.label}</Text>
                  <Text style={[styles.policyHint, { color: C.textMuted }]}>{opt.hint}</Text>
                </View>
                <View style={[styles.policyDot, { borderColor: C.borderGlow, backgroundColor: updatePolicy === opt.value ? C.accent : 'transparent' }]} />
              </TouchableOpacity>
            ))}
          </View>
        </ClayCard>
        </View>

        {/* Data */}
        <ClayCard style={[styles.section, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={styles.sectionContent}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: C.info + '20', borderColor: C.info + '40' }]}>
                <Text style={[styles.iconBoxText, { color: C.info }]}>D</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Data</Text>
            </View>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: C.border }]}
              onPress={handleExport}
              disabled={exporting}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuItemText, { color: C.textPrimary }]}>Export as PDF</Text>
                <Text style={[styles.menuItemSub, { color: C.textMuted }]}>
                  Stylish report · notes, tasks & projects
                </Text>
              </View>
              {exporting ? (
                <ActivityIndicator size="small" color={C.accent} />
              ) : (
                <Text style={[styles.menuItemArrow, { color: C.accent }]}>PDF</Text>
              )}
            </TouchableOpacity>
            {[
              { label: 'Notes', count: notes.length },
              { label: 'Tasks', count: tasks.length },
              { label: 'Projects', count: projects.length },
            ].map((item, i, arr) => (
              <View key={item.label} style={[styles.menuItem, i === arr.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: C.border }]}>
                <Text style={[styles.menuItemText, { color: C.textPrimary }]}>{item.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                  <Text style={[styles.countText, { color: C.accent }]}>{item.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </ClayCard>

        {/* Reset */}
        <TouchableOpacity style={[styles.resetBtn, { borderColor: C.danger + '50' }]} onPress={handleReset} activeOpacity={0.7}>
          <Text style={[styles.resetBtnText, { color: C.danger }]}>Reset App</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: C.textMuted }]}>
          Flowly {getInstalledVersionDisplay()} · Offline-first
        </Text>
        <Text style={[styles.shareUrl, { color: C.textMuted }]} selectable>
          Share v{latestRelease.latestVersion}: {getFlowlyDownloadUrl(latestRelease)}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  shareIcon: { fontSize: 14, fontWeight: '800' },
  shareLabel: { fontSize: 13, fontWeight: '700' },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 140 },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 10 },
  avatarWrap: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', borderWidth: 2 },
  avatarBg: { position: 'absolute', width: '100%', height: '100%' },
  avatarOverlay: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 34, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  editBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  editBadgeText: { fontSize: 11, fontWeight: '700' },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', paddingHorizontal: Spacing.md },
  nameInput: { flex: 1, height: 44, borderRadius: Radius.md, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 16, fontWeight: '600' },
  saveNameBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.md },
  saveNameText: { fontSize: 13, fontWeight: '700' },
  cancelNameBtn: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1 },
  cancelNameText: { fontSize: 13, fontWeight: '600' },
  subtitle: { fontSize: 13, fontWeight: '400' },
  section: { marginBottom: 0 },
  sectionContent: { padding: Spacing.md, gap: Spacing.sm },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  iconBox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconBoxText: { fontSize: 11, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  themeToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: Radius.md, borderWidth: 1 },
  themeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeSubLabel: { fontSize: 11, fontWeight: '400', marginTop: 1 },
  themeTrack: { width: 48, height: 26, borderRadius: 13, borderWidth: 1, justifyContent: 'center' },
  themeThumb: { width: 20, height: 20, borderRadius: 10 },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot: { width: 8, height: 8, borderRadius: 4, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  aiStatus: { fontSize: 14, fontWeight: '600' },
  aiNote: { fontSize: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { fontSize: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1 },
  menuItemText: { fontSize: 15, fontWeight: '600' },
  menuItemSub: { fontSize: 11, marginTop: 2 },
  menuItemArrow: { fontSize: 18, fontWeight: '700' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  countText: { fontSize: 12, fontWeight: '700' },
  resetBtn: { marginTop: Spacing.sm, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  resetBtnText: { fontSize: 14, fontWeight: '600' },
  version: { fontSize: 11, textAlign: 'center', marginTop: 4 },
  shareUrl: { fontSize: 10, textAlign: 'center', marginTop: 6, paddingHorizontal: Spacing.md },
  versionLine: { fontSize: 13, marginBottom: 4 },
  lastCheckMsg: { fontSize: 12, lineHeight: 17, marginBottom: 6 },
  updateBadge: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  updateBadgeText: { fontSize: 10, fontWeight: '800' },
  updateBanner: { padding: 12, borderRadius: Radius.md, borderWidth: 1, gap: 4, marginBottom: 4 },
  updateBannerTitle: { fontSize: 15, fontWeight: '700' },
  updateBannerBody: { fontSize: 12, lineHeight: 18 },
  updateBannerAction: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  policyLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  policyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  policyLeft: { flex: 1, gap: 2 },
  policyTitle: { fontSize: 14, fontWeight: '600' },
  policyHint: { fontSize: 11 },
  policyDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  whatsNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  whatsNewLabel: { fontSize: 14, fontWeight: '600' },
});
