import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LatestUpdatesModal } from '../../components/profile/LatestUpdatesModal';
import { ProfileHero } from '../../components/profile/ProfileHero';
import { ProfileRow } from '../../components/profile/ProfileRow';
import { ProfileSection } from '../../components/profile/ProfileSection';
import { TelegramJoinButton } from '../../components/forms/TelegramJoinButton';
import { CheckForUpdatesButton } from '../../components/profile/CheckForUpdatesButton';
import { DownloadUpdateButton } from '../../components/profile/DownloadUpdateButton';
import { exportFlowlyPdf } from '../../lib/exportPdf';
import { logError } from '../../lib/firebase';
import { pdfExportTypeFromCounts, trackEvent } from '../../lib/posthog';
import { useScreenAnalytics } from '../../hooks/useScreenAnalytics';
import { getAiStatus } from '../../lib/aiConfig';
import { isPushEnabled, onPushEnabledChanged } from '../../lib/notifications';
import { shareLatestVersion, getFlowlyDownloadUrl } from '../../lib/shareApp';
import { showConfirm, showError } from '../../lib/alert';
import { getInstalledVersionDisplay, isUpdateAvailable } from '../../lib/updates';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Radius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useNotesStore } from '../../stores/notesStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUpdateStore } from '../../stores/updateStore';
import type { UpdateCheckPolicy } from '../../types';

const UPDATE_POLICY_OPTIONS: { value: UpdateCheckPolicy; label: string; hint: string }[] = [
  { value: 'notify', label: 'Notify in Settings', hint: 'Badge only — no popup on launch' },
  { value: 'on_launch', label: 'Prompt on launch', hint: 'Ask when you open the app (max once / 24h)' },
  { value: 'never', label: 'Never check', hint: 'Fully offline — check manually' },
];

export default function ProfileScreen() {
  useScreenAnalytics('Profile');
  const { C } = useTheme();
  const { user, updateSettings, updateProfile, resetApp } = useAuthStore();
  const { notes } = useNotesStore();
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();
  const { mode, toggle } = useThemeStore();
  const isDark = mode === 'dark';
  const {
    available: updateAvailable,
    latestRelease,
    isChecking,
    checkForUpdates,
    refreshLatestRelease,
    refreshInstalledVersion,
    lastMessage,
  } = useUpdateStore();

  const updatePolicy: UpdateCheckPolicy = user?.settings?.update_check_policy ?? 'notify';
  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const updatesSectionY = useRef(0);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [showChangelog, setShowChangelog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [aiStatus, setAiStatus] = useState({ ready: false, label: 'Setting up…' });
  const [pushEnabled, setPushEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getAiStatus().then((s) =>
        setAiStatus({
          ready: s.ready,
          label: s.ready
            ? s.keySource === 'bundled'
              ? 'App default · Groq'
              : `${s.providerName}`
            : s.hasBundled
              ? 'Tap to verify setup'
              : 'Add your API key',
        })
      );
      isPushEnabled().then(setPushEnabled);
    }, [])
  );

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

  const handlePushToggle = async (enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPushEnabled(enabled);
    await updateSettings({ notifications_enabled: enabled });
    await onPushEnabledChanged(enabled, tasks);
  };

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExporting(true);
    try {
      await exportFlowlyPdf({ user, notes, tasks, projects });
      trackEvent('pdf_exported', {
        item_count: notes.length + tasks.length + projects.length,
        type: pdfExportTypeFromCounts(notes.length, tasks.length, projects.length),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      logError(e, 'profile:handleExport');
      showError('Export failed', e instanceof Error ? e.message : 'Could not create PDF.');
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
      message: 'Deletes all notes, tasks, projects, and settings on this device. Cannot be undone.',
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

  const hasUpdate = !!(updateAvailable && isUpdateAvailable(updateAvailable));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
          onPress={handleShareApp}
          activeOpacity={0.85}
        >
          <Text style={[styles.headerBtnText, { color: C.accent }]}>Share app</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <ProfileHero
          name={user?.name ?? 'User'}
          editing={editingName}
          nameInput={nameInput}
          onNameInput={setNameInput}
          onStartEdit={() => {
            setEditingName(true);
            setNameInput(user?.name ?? '');
          }}
          onSave={handleSaveName}
          onCancel={() => {
            setEditingName(false);
            setNameInput(user?.name ?? '');
          }}
          stats={{ notes: notes.length, tasks: tasks.length, projects: projects.length }}
        />

        <ProfileSection title="Preferences" subtitle="Theme and AI for the whole app">
          <ProfileRow
            label={isDark ? 'Dark mode' : 'Light mode'}
            hint="Mint clay theme · cards and backgrounds"
            iconLetter={isDark ? 'D' : 'L'}
            iconBg={isDark ? C.bgCardDeep : C.warningDim}
            iconColor={isDark ? C.accent : C.warning}
            switchProps={{ value: isDark, onValueChange: handleThemeToggle }}
            last={false}
          />
          <ProfileRow
            label="AI Assistant"
            hint={aiStatus.label}
            iconLetter="AI"
            iconBg={C.purpleDim}
            iconColor={C.purple}
            onPress={() => router.push('/settings/ai' as Href)}
            right={
              <View style={[styles.statusPill, { backgroundColor: aiStatus.ready ? C.accentDim : C.warningDim }]}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: aiStatus.ready ? C.accent : C.warning },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: aiStatus.ready ? C.accent : C.warning },
                  ]}
                >
                  {aiStatus.ready ? 'Ready' : 'Setup'}
                </Text>
              </View>
            }
            last
          />
        </ProfileSection>

        <ProfileSection title="Community" subtitle="Optional — stay in the loop">
          <View style={styles.telegramWrap}>
            <TelegramJoinButton compact />
          </View>
          <ProfileRow
            label="Join Flowly team"
            hint="Early access and product input"
            iconLetter="T"
            iconBg={C.pastelLavender + '55'}
            iconColor={C.purple}
            onPress={() => router.push('/forms/join-team')}
          />
          <ProfileRow
            label="Feedback & bugs"
            hint="Tell us what to improve"
            iconLetter="F"
            iconBg={C.infoDim}
            iconColor={C.info}
            onPress={() => router.push('/forms/feedback')}
            last
          />
        </ProfileSection>

        <ProfileSection title="Privacy" subtitle="Local notifications on this device">
          <ProfileRow
            label="Push notifications"
            hint="Task reminders, daily planning, and deadline alerts"
            iconLetter="N"
            iconBg={C.purpleDim}
            iconColor={C.purple}
            switchProps={{
              value: pushEnabled,
              onValueChange: handlePushToggle,
            }}
            last
          />
        </ProfileSection>

        <View
          onLayout={(e) => {
            updatesSectionY.current = e.nativeEvent.layout.y;
          }}
        >
          <ProfileSection
            title="App & updates"
            subtitle={`Installed · ${getInstalledVersionDisplay()}${isChecking ? ' · checking…' : ''}`}
            tone="ai"
            glowing={hasUpdate}
          >
            {lastMessage && !isChecking ? (
              <Text
                style={[
                  styles.updateMsg,
                  { color: hasUpdate ? C.accent : C.textMuted },
                ]}
              >
                {lastMessage}
              </Text>
            ) : null}
            <CheckForUpdatesButton />
            {hasUpdate ? <DownloadUpdateButton /> : null}
            <TouchableOpacity
              style={[styles.inlineBtn, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                refreshLatestRelease()
                  .catch(() => {})
                  .finally(() => setShowChangelog(true));
              }}
            >
              <Text style={[styles.inlineBtnText, { color: C.textPrimary }]}>What's new</Text>
              <Text style={[styles.inlineBtnArrow, { color: C.accent }]}>›</Text>
            </TouchableOpacity>
            <LatestUpdatesModal
              visible={showChangelog}
              manifest={latestRelease}
              onClose={() => setShowChangelog(false)}
            />
            <Text style={[styles.policyHeading, { color: C.textMuted }]}>Update alerts</Text>
            {UPDATE_POLICY_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.policyRow,
                  {
                    borderBottomColor: C.border,
                    borderBottomWidth: i < UPDATE_POLICY_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSettings({ update_check_policy: opt.value });
                  if (opt.value !== 'never') checkForUpdates({ force: true });
                }}
              >
                <View style={styles.policyText}>
                  <Text style={[styles.policyTitle, { color: C.textPrimary }]}>{opt.label}</Text>
                  <Text style={[styles.policyHint, { color: C.textMuted }]}>{opt.hint}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: C.borderGlow,
                      backgroundColor: updatePolicy === opt.value ? C.accent : 'transparent',
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ProfileSection>
        </View>

        <ProfileSection title="Your data">
          <ProfileRow
            label="Export PDF"
            hint="Notes, tasks, and projects in one report"
            iconLetter="P"
            iconBg={C.accentDim}
            iconColor={C.accent}
            onPress={handleExport}
            loading={exporting}
            right={exporting ? undefined : <Text style={[styles.pdfTag, { color: C.accent }]}>PDF</Text>}
          />
          <ProfileRow
            label="Notes"
            hint={`${notes.length} saved locally`}
            iconLetter="N"
            iconBg={C.purpleDim}
            iconColor={C.purple}
            right={<Text style={[styles.count, { color: C.purple }]}>{notes.length}</Text>}
          />
          <ProfileRow
            label="Tasks"
            hint={`${tasks.length} on this device`}
            iconLetter="T"
            iconBg={C.dangerDim}
            iconColor={C.danger}
            right={<Text style={[styles.count, { color: C.danger }]}>{tasks.length}</Text>}
          />
          <ProfileRow
            label="Projects"
            hint={`${projects.length} active boards`}
            iconLetter="P"
            iconBg={C.warningDim}
            iconColor={C.warning}
            right={<Text style={[styles.count, { color: C.warning }]}>{projects.length}</Text>}
            last
          />
        </ProfileSection>

        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: C.danger + '66', backgroundColor: C.dangerDim }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.resetText, { color: C.danger }]}>Reset app data</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: C.textMuted }]}>
          Flowly {getInstalledVersionDisplay()} · Offline-first
        </Text>
        <Text style={[styles.footerUrl, { color: C.textMuted }]} selectable>
          {getFlowlyDownloadUrl(latestRelease)}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  headerBtnText: { fontSize: 13, fontWeight: '700' },
  scroll: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 120 },
  telegramWrap: { marginBottom: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  updateMsg: { fontSize: 12, lineHeight: 17, marginBottom: 8, paddingHorizontal: 4 },
  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 8,
  },
  inlineBtnText: { fontSize: 14, fontWeight: '600' },
  inlineBtnArrow: { fontSize: 20, fontWeight: '700' },
  policyHeading: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
    paddingHorizontal: 4,
  },
  policyText: { flex: 1, gap: 2 },
  policyTitle: { fontSize: 14, fontWeight: '600' },
  policyHint: { fontSize: 11, lineHeight: 15 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  pdfTag: { fontSize: 13, fontWeight: '800' },
  count: { fontSize: 16, fontWeight: '800' },
  resetBtn: {
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 4,
  },
  resetText: { fontSize: 15, fontWeight: '700' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  footerUrl: { fontSize: 10, textAlign: 'center', paddingHorizontal: Spacing.md, lineHeight: 14 },
});
