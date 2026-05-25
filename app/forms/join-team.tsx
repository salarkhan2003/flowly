import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as Haptics from 'expo-haptics';
import { FormScrollLayout } from '../../components/forms/FormScrollLayout';
import { OptionChips } from '../../components/forms/OptionChips';
import { StableFormField } from '../../components/forms/StableFormField';
import { SuccessCelebration } from '../../components/forms/SuccessCelebration';
import { TelegramJoinButton } from '../../components/forms/TelegramJoinButton';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { submitToFormspree } from '../../lib/formspree';
import { showError } from '../../lib/alert';
import { useAuthStore } from '../../stores/authStore';
import { usePrefsStore } from '../../stores/prefsStore';

const AGE_OPTIONS = [
  { value: '8-15' as const, label: '8–15' },
  { value: '16-18' as const, label: '16–18' },
  { value: '18-30' as const, label: '18–30' },
  { value: '30-45' as const, label: '30–45' },
  { value: 'above-45' as const, label: '45+' },
];

const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'transgender' as const, label: 'Transgender' },
  { value: 'prefer-not' as const, label: 'Prefer not to say' },
];

export default function JoinTeamScreen() {
  const { C } = useTheme();
  const user = useAuthStore((s) => s.user);
  const markTeamJoined = usePrefsStore((s) => s.markTeamJoined);

  const initialName = useRef(user?.name ?? '').current;
  const initialEmail = useRef(user?.email ?? '').current;

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [ageRange, setAgeRange] = useState<(typeof AGE_OPTIONS)[number]['value'] | ''>('');
  const [gender, setGender] = useState<(typeof GENDER_OPTIONS)[number]['value'] | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName && !trimmedEmail) {
      showError('Almost there', 'Add your name or email — or tap "Not now" to go back.');
      return;
    }

    setSubmitting(true);
    const version = Application.nativeApplicationVersion ?? '1.0.0';

    const result = await submitToFormspree({
      formType: 'join_team',
      _subject: 'Flowly Team Join',
      name: trimmedName || undefined,
      email: trimmedEmail || undefined,
      phone: phone.trim() || undefined,
      age_range: ageRange || undefined,
      gender: gender || undefined,
      app_version: version,
    });

    setSubmitting(false);

    if (!result.ok) {
      showError('Could not submit', result.error ?? 'Please try again.');
      return;
    }

    await markTeamJoined();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSucceeded(true);
  }, [name, email, phone, ageRange, gender, markTeamJoined]);

  if (succeeded) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
        <ScreenHeader title="Welcome aboard" showBack />
        <SuccessCelebration
          title="You're part of the Flowly team!"
          subtitle="Thanks for joining. We'll share updates when they're ready."
        />
        <View style={styles.successActions}>
          <TelegramJoinButton />
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: C.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.doneTxt, { color: C.bg }]}>Back to app</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <ScreenHeader title="Join Flowly team" showBack />
      <FormScrollLayout>
        <Text style={[styles.intro, { color: C.textSecondary }]}>
          Optional — share only what you want. Tap chips without the keyboard jumping.
        </Text>

        <TelegramJoinButton compact />

        <StableFormField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <StableFormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <StableFormField
          label="Mobile (optional)"
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 234 567 8900"
          keyboardType="phone-pad"
          returnKeyType="done"
        />

        <OptionChips label="Age range" options={AGE_OPTIONS} value={ageRange} onChange={setAgeRange} optional />
        <OptionChips label="Gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} optional />

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: C.accent }, submitting && styles.submitOff]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color={C.bg} />
          ) : (
            <Text style={[styles.submitTxt, { color: C.bg }]}>Join the team</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skip}
          onPress={() => {
            Keyboard.dismiss();
            router.back();
          }}
        >
          <Text style={[styles.skipTxt, { color: C.textMuted }]}>Not now</Text>
        </TouchableOpacity>
      </FormScrollLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  intro: { fontSize: 14, lineHeight: 21 },
  submit: {
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  submitOff: { opacity: 0.65 },
  submitTxt: { fontSize: 17, fontWeight: '800' },
  skip: { alignItems: 'center', paddingVertical: 14 },
  skipTxt: { fontSize: 14, fontWeight: '600' },
  successActions: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  doneBtn: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTxt: { fontSize: 16, fontWeight: '800' },
});
