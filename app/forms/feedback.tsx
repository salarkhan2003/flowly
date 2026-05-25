import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as Haptics from 'expo-haptics';
import { FormScrollLayout } from '../../components/forms/FormScrollLayout';
import { OptionChips } from '../../components/forms/OptionChips';
import { SuccessCelebration } from '../../components/forms/SuccessCelebration';
import { GlowInput } from '../../components/ui/GlowInput';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { submitToFormspree } from '../../lib/formspree';
import { showError } from '../../lib/alert';
import { useAuthStore } from '../../stores/authStore';

const CATEGORY_OPTIONS = [
  { value: 'bug' as const, label: 'Bug' },
  { value: 'feedback' as const, label: 'Feedback' },
  { value: 'feature' as const, label: 'Feature request' },
  { value: 'other' as const, label: 'Other' },
];

export default function FeedbackScreen() {
  const { C } = useTheme();
  const { user } = useAuthStore();

  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]['value'] | ''>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() && !title.trim()) {
      showError('Add a message', 'Tell us what happened or what you’d like — we need at least a title or details.');
      return;
    }

    setSubmitting(true);
    const version = Application.nativeApplicationVersion ?? '1.0.0';
    const result = await submitToFormspree({
      formType: 'feedback',
      _subject: `Flowly ${category || 'feedback'}: ${title.trim() || 'Report'}`,
      name: user?.name,
      email: email.trim() || undefined,
      category: category || 'feedback',
      message: [title.trim(), message.trim()].filter(Boolean).join('\n\n'),
      app_version: version,
    });
    setSubmitting(false);

    if (!result.ok) {
      showError('Could not send', result.error ?? 'Please try again.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSucceeded(true);
  };

  if (succeeded) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
        <ScreenHeader title="Thank you" showBack />
        <SuccessCelebration
          title="We got your report!"
          subtitle="Your feedback helps make Flowly better for everyone."
        />
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: C.accent }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.doneTxt, { color: C.bg }]}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <ScreenHeader title="Bugs & feedback" showBack />
      <FormScrollLayout>
        <Text style={[styles.intro, { color: C.textSecondary }]}>
          Everything here is optional. Share bugs, ideas, or praise — we read every submission.
        </Text>

        <OptionChips
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          optional
        />

        <GlowInput
          label="Title (optional)"
          value={title}
          onChangeText={setTitle}
          placeholder="Short summary"
        />

        <View style={styles.msgWrap}>
          <Text style={[styles.msgLabel, { color: C.textSecondary }]}>Details (optional)</Text>
          <TextInput
            style={[
              styles.msgInput,
              {
                color: C.textPrimary,
                backgroundColor: C.bgCard,
                borderColor: C.border,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe the issue or your idea..."
            placeholderTextColor={C.textMuted}
            multiline
            textAlignVertical="top"
            blurOnSubmit={false}
          />
        </View>

        <GlowInput
          label="Reply email (optional)"
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.submit, { backgroundColor: C.accent }, submitting && styles.submitOff]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.88}
        >
          {submitting ? (
            <ActivityIndicator color={C.bg} />
          ) : (
            <Text style={[styles.submitTxt, { color: C.bg }]}>Submit</Text>
          )}
        </TouchableOpacity>
      </FormScrollLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  intro: { fontSize: 14, lineHeight: 21 },
  msgWrap: { gap: 8 },
  msgLabel: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  msgInput: {
    minHeight: 140,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  submit: {
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitOff: { opacity: 0.7 },
  submitTxt: { fontSize: 17, fontWeight: '800' },
  doneBtn: {
    marginHorizontal: Spacing.md,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTxt: { fontSize: 16, fontWeight: '800' },
});
