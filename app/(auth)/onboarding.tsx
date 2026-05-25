import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { submitToFormspree } from '../../lib/formspree';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Your second brain',
    subtitle: 'Notes, tasks, and projects in one soft, playful workspace.',
    accentKey: 'pastelSky' as const,
    secondaryKey: 'pastelPeach' as const,
    mascot: 'note' as const,
  },
  {
    id: '2',
    title: 'AI that knows you',
    subtitle: 'Ask Flowly anything — it reads your notes and tasks to help.',
    accentKey: 'pastelPeach' as const,
    secondaryKey: 'pastelSky' as const,
    mascot: 'ai' as const,
  },
  {
    id: '3',
    title: 'Ready when you are',
    subtitle: 'Everything stays on your device. Enter your name — email optional for updates.',
    accentKey: 'pastelMint' as const,
    secondaryKey: 'pastelLavender' as const,
    mascot: 'wave' as const,
  },
];

function PuffAvatar({
  bodyColor,
  cheekColor,
  eyeColor,
  variant,
}: {
  bodyColor: string;
  cheekColor: string;
  eyeColor: string;
  variant: 'note' | 'ai' | 'wave';
}) {
  return (
    <View style={avatar.outer}>
      <View style={[avatar.dropShadow, { shadowColor: bodyColor }]} />
      <View style={[avatar.body, { backgroundColor: bodyColor }]}>
        <View style={[avatar.shine, { backgroundColor: 'rgba(255,255,255,0.55)' }]} />
        <View style={avatar.face}>
          <View style={avatar.eyes}>
            <View style={[avatar.eye, { backgroundColor: eyeColor }]} />
            <View style={[avatar.eye, { backgroundColor: eyeColor }]} />
          </View>
          <View style={[avatar.mouth, variant === 'wave' && avatar.mouthSmile]} />
          <View style={[avatar.cheek, { left: 18, backgroundColor: cheekColor }]} />
          <View style={[avatar.cheek, { right: 18, backgroundColor: cheekColor }]} />
        </View>
        {variant === 'note' ? (
          <View style={[avatar.prop, { right: -8, top: 24, backgroundColor: cheekColor }]}>
            <View style={[avatar.propLine, { backgroundColor: eyeColor }]} />
            <View style={[avatar.propLine, { width: 14, backgroundColor: eyeColor, opacity: 0.6 }]} />
          </View>
        ) : null}
        {variant === 'ai' ? (
          <View style={[avatar.spark, { top: 8, right: 12, backgroundColor: cheekColor }]} />
        ) : null}
      </View>
    </View>
  );
}

function SquishyToggle({
  value,
  onToggle,
  label,
}: {
  value: boolean;
  onToggle: () => void;
  label: string;
}) {
  const { C } = useTheme();
  const squish = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.spring(squish, { toValue: 0.92, useNativeDriver: true, speed: 80 }),
      Animated.spring(squish, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[toggle.wrap, { transform: [{ scale: squish }] }]}>
      <Text style={[toggle.label, { color: C.textSecondary }]}>{label}</Text>
      <Pressable
        onPress={press}
        style={[
          toggle.track,
          {
            backgroundColor: value ? C.accentDim : C.bgCardDeep,
            borderColor: value ? C.accent : C.border,
          },
          Shadows.clay,
        ]}
      >
        <View style={[toggle.trackShine, { backgroundColor: C.clayHighlight }]} />
        <Animated.View
          style={[
            toggle.thumb,
            {
              backgroundColor: value ? C.accent : C.bgCard,
              borderColor: value ? C.accentMid : C.border,
              alignSelf: value ? 'flex-end' : 'flex-start',
            },
            Shadows.soft,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

function ClayIconAsset({
  children,
  bg,
  border,
}: {
  children: React.ReactNode;
  bg: string;
  border: string;
}) {
  return (
    <View style={[asset.tile, { backgroundColor: bg, borderColor: border }, Shadows.clay]}>
      <View style={[asset.tileShine, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
      {children}
    </View>
  );
}

function HeartToggleIcon({ color }: { color: string }) {
  return (
    <View style={asset.heartWrap}>
      <View style={[asset.heartL, { backgroundColor: color }]} />
      <View style={[asset.heartR, { backgroundColor: color }]} />
    </View>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <View style={[asset.gear, { borderColor: color }]}>
      <View style={[asset.gearCore, { backgroundColor: color }]} />
    </View>
  );
}

function ChatBubbleIcon({ color }: { color: string }) {
  return (
    <View>
      <View style={[asset.bubble, { borderColor: color }]}>
        <View style={[asset.bubbleDot, { backgroundColor: color }]} />
        <View style={[asset.bubbleDot, { backgroundColor: color, opacity: 0.5 }]} />
        <View style={[asset.bubbleDot, { backgroundColor: color, opacity: 0.35 }]} />
      </View>
      <View style={[asset.bubbleTail, { borderTopColor: color }]} />
    </View>
  );
}

export default function OnboardingScreen() {
  const { C, mode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [offline, setOffline] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { setupProfile } = useAuthStore();

  const slide = SLIDES[activeIndex];
  const accent = C[slide.accentKey];
  const secondary = C[slide.secondaryKey];
  const isLast = activeIndex === SLIDES.length - 1;

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleNext = async () => {
    if (!isLast) {
      goToSlide(activeIndex + 1);
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Please enter your name to continue');
      return;
    }
    setNameError('');
    const trimmedEmail = email.trim();
    await setupProfile(trimmed, trimmedEmail || undefined);
    if (trimmedEmail) {
      void submitToFormspree({
        formType: 'onboarding',
        _subject: 'Flowly onboarding signup',
        name: trimmed,
        email: trimmedEmail,
      });
    }
    router.replace('/(tabs)/home');
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={[styles.orb, { backgroundColor: accent, top: -80, left: -60 }]} />
      <View style={[styles.orb, { backgroundColor: secondary, bottom: 120, right: -40, width: 200, height: 200 }]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.logoRow}>
          <View style={[styles.logoClay, { backgroundColor: C.bgCard }, Shadows.clay]}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImg} resizeMode="cover" />
          </View>
          <Text style={[styles.logoTxt, { color: C.textPrimary }]}>Flowly</Text>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((s, index) => {
              const a = C[s.accentKey];
              const b = C[s.secondaryKey];
              return (
                <View key={s.id} style={styles.slide}>
                  <View style={[styles.heroCard, { backgroundColor: C.bgCard, borderColor: a + '55' }, Shadows.clay]}>
                    <View style={[styles.heroShine, { backgroundColor: C.clayHighlight }]} />
                    <PuffAvatar
                      bodyColor={a}
                      cheekColor={b}
                      eyeColor={mode === 'light' ? '#1E293B' : C.bg}
                      variant={s.mascot}
                    />
                    {index === 1 ? (
                      <SquishyToggle
                        value={offline}
                        onToggle={() => setOffline((v) => !v)}
                        label="Offline-first mode"
                      />
                    ) : null}
                    {index === 2 ? (
                      <View style={styles.assetRow}>
                        <ClayIconAsset bg={C.pastelLavender + (mode === 'light' ? 'cc' : '44')} border={C.pastelLavender}>
                          <HeartToggleIcon color={C.pastelRose} />
                        </ClayIconAsset>
                        <ClayIconAsset bg={C.pastelMint + (mode === 'light' ? 'cc' : '44')} border={C.pastelMint}>
                          <GearIcon color={C.accent} />
                        </ClayIconAsset>
                        <ClayIconAsset bg={C.pastelSky + (mode === 'light' ? 'cc' : '44')} border={C.pastelSky}>
                          <ChatBubbleIcon color={C.accentMid} />
                        </ClayIconAsset>
                      </View>
                    ) : null}
                  </View>

                  <Text style={[styles.title, { color: C.textPrimary }]}>{s.title}</Text>
                  <Text style={[styles.sub, { color: C.textSecondary }]}>{s.subtitle}</Text>

                  {index === 2 ? (
                    <View style={styles.nameWrap}>
                      <TextInput
                        style={[
                          styles.nameInput,
                          {
                            color: C.textPrimary,
                            backgroundColor: C.bgCard,
                            borderColor: nameError ? C.danger : C.borderGlow,
                          },
                          Shadows.soft,
                        ]}
                        value={name}
                        onChangeText={(t) => {
                          setName(t);
                          setNameError('');
                        }}
                        placeholder="Your name..."
                        placeholderTextColor={C.textMuted}
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={handleNext}
                      />
                      <TextInput
                        style={[
                          styles.nameInput,
                          {
                            color: C.textPrimary,
                            backgroundColor: C.bgCard,
                            borderColor: C.border,
                            marginTop: 8,
                          },
                          Shadows.soft,
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email for updates (optional)"
                        placeholderTextColor={C.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {nameError ? (
                        <Text style={[styles.nameErr, { color: C.danger }]}>{nameError}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: C.textMuted },
                i === activeIndex && { backgroundColor: C.accent, width: 28 },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primary, { backgroundColor: C.accent }, Shadows.clayGlow]}
            onPress={handleNext}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryTxt}>{isLast ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
          {!isLast ? (
            <TouchableOpacity onPress={() => goToSlide(SLIDES.length - 1)} style={styles.skip}>
              <Text style={[styles.skipTxt, { color: C.textMuted }]}>Skip to setup</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const avatar = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center', height: 150 },
  dropShadow: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 14,
  },
  body: {
    width: 118,
    height: 118,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shine: { position: 'absolute', top: 10, left: 16, right: 16, height: 22, borderRadius: 14 },
  face: { alignItems: 'center', paddingTop: 8 },
  eyes: { flexDirection: 'row', gap: 22, marginBottom: 10 },
  eye: { width: 12, height: 14, borderRadius: 6 },
  mouth: { width: 18, height: 6, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.15)' },
  mouthSmile: { width: 22, height: 10, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  cheek: { position: 'absolute', bottom: 28, width: 14, height: 8, borderRadius: 8, opacity: 0.45 },
  prop: {
    position: 'absolute',
    width: 36,
    height: 44,
    borderRadius: 10,
    padding: 8,
    gap: 5,
    ...Shadows.soft,
  },
  propLine: { height: 3, width: 18, borderRadius: 2 },
  spark: { position: 'absolute', width: 16, height: 16, borderRadius: 8 },
});

const toggle = StyleSheet.create({
  wrap: { marginTop: Spacing.md, alignItems: 'center', gap: 8 },
  label: { fontSize: 12, fontWeight: '600' },
  track: {
    width: 112,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    padding: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackShine: { position: 'absolute', top: 0, left: 12, right: 12, height: 1 },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
});

const asset = StyleSheet.create({
  tile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileShine: { position: 'absolute', top: 0, left: 8, right: 8, height: 1 },
  heartWrap: { width: 22, height: 20, flexDirection: 'row', justifyContent: 'center' },
  heartL: { width: 11, height: 11, borderTopLeftRadius: 11, transform: [{ rotate: '-45deg' }] },
  heartR: { width: 11, height: 11, borderTopRightRadius: 11, transform: [{ rotate: '45deg' }], marginLeft: -4 },
  gear: { width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  gearCore: { width: 8, height: 8, borderRadius: 4 },
  bubble: {
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
  },
  bubbleDot: { width: 4, height: 4, borderRadius: 2 },
  bubbleTail: {
    alignSelf: 'center',
    marginTop: -1,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.14,
  },
  safe: { flex: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: Spacing.md },
  logoClay: { padding: 6, borderRadius: 16 },
  logoImg: { width: 40, height: 40, borderRadius: 12 },
  logoTxt: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  heroCard: {
    width: '100%',
    minHeight: 280,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    overflow: 'hidden',
  },
  heroShine: { position: 'absolute', top: 0, left: 24, right: 24, height: 1 },
  assetRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.sm },
  nameWrap: { width: '100%', gap: 6, marginTop: Spacing.sm },
  nameInput: {
    width: '100%',
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    fontSize: 17,
    fontWeight: '600',
  },
  nameErr: { fontSize: 13, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: Spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3 },
  actions: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm },
  primary: {
    height: 58,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTxt: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  skip: { height: 44, alignItems: 'center', justifyContent: 'center' },
  skipTxt: { fontSize: 14, fontWeight: '500' },
});
