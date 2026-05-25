import React, { useRef, useState } from 'react';
import {
  Animated, Dimensions, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';

const { width, height } = Dimensions.get('window');

// ─── Geometric SVG-style illustrations ───────────────────────────────────────

function BrainIllustration() {
  return (
    <View style={illus.wrap}>
      <View style={illus.outerRing} />
      <View style={illus.innerRing} />
      {/* Nodes */}
      {[
        { top: 20, left: 0 }, { top: 20, right: 0 },
        { bottom: 20, left: 0 }, { bottom: 20, right: 0 },
        { top: -8, left: '50%' as any },
      ].map((pos, i) => (
        <View key={i} style={[illus.node, pos]} />
      ))}
      {/* Center glow */}
      <View style={illus.centerGlow} />
      {/* Lines */}
      <View style={[illus.line, { top: '50%', left: 0, right: 0, height: 1 }]} />
      <View style={[illus.line, { left: '50%', top: 0, bottom: 0, width: 1 }]} />
    </View>
  );
}

function AIIllustration() {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <View style={illus.wrap}>
      <View style={illus.outerRing} />
      {rays.map((angle, i) => (
        <View
          key={i}
          style={[
            illus.ray,
            { transform: [{ rotate: `${angle}deg` }] },
          ]}
        />
      ))}
      <View style={[illus.square, { transform: [{ rotate: '45deg' }] }]} />
      <View style={illus.centerGlow} />
    </View>
  );
}

function OfflineIllustration() {
  return (
    <View style={illus.wrap}>
      <View style={illus.outerRing} />
      {/* Phone shape */}
      <View style={illus.phone}>
        <View style={illus.phoneLine} />
        <View style={[illus.phoneLine, { width: 32, marginTop: 5 }]} />
        <View style={[illus.phoneLine, { width: 40, marginTop: 5 }]} />
      </View>
      {/* Shield */}
      <View style={illus.shield} />
      <View style={illus.centerGlow} />
    </View>
  );
}

function NameIllustration() {
  return (
    <View style={illus.wrap}>
      <View style={illus.outerRing} />
      <View style={illus.innerRing} />
      {/* Person silhouette */}
      <View style={illus.head} />
      <View style={illus.body} />
      <View style={illus.centerGlow} />
    </View>
  );
}

const illus = StyleSheet.create({
  wrap: {
    width: 160, height: 160, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    borderWidth: 1, borderColor: Colors.accent, opacity: 0.25,
  },
  innerRing: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    borderWidth: 1.5, borderColor: Colors.accent, opacity: 0.5,
  },
  node: {
    position: 'absolute', width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6,
  },
  centerGlow: {
    position: 'absolute', width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 10,
  },
  line: { position: 'absolute', backgroundColor: Colors.accent, opacity: 0.2 },
  ray: {
    position: 'absolute', width: 1, height: 60, backgroundColor: Colors.accent,
    opacity: 0.25, top: 50,
  },
  square: {
    position: 'absolute', width: 56, height: 56,
    borderWidth: 2, borderColor: Colors.accent, opacity: 0.6,
  },
  phone: {
    position: 'absolute', width: 52, height: 72, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.accent, alignItems: 'center', paddingTop: 14,
  },
  phoneLine: { width: 24, height: 2, backgroundColor: Colors.accent, borderRadius: 1, opacity: 0.7 },
  shield: {
    position: 'absolute', right: 20, top: 30, width: 32, height: 38, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.accent, backgroundColor: Colors.accentDim,
  },
  head: {
    position: 'absolute', top: 28, width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: Colors.accent, backgroundColor: Colors.accentDim,
  },
  body: {
    position: 'absolute', bottom: 18, width: 56, height: 32, borderRadius: 28,
    borderWidth: 2, borderColor: Colors.accent, backgroundColor: Colors.accentDim,
  },
});

// ─── Glow orb + grid ─────────────────────────────────────────────────────────

function GlowOrb({ style }: { style?: object }) {
  const pulse = useRef(new Animated.Value(0.05)).current;
  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.12, duration: 3000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.05, duration: 3000, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', borderRadius: 9999, backgroundColor: Colors.accent, opacity: pulse }, style]}
    />
  );
}

function GridLines() {
  const cols = 7, rows = 12;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: cols + 1 }, (_, i) => (
        <View key={`v${i}`} style={{
          position: 'absolute', left: (width / cols) * i, top: 0, bottom: 0,
          width: 1, backgroundColor: Colors.accent, opacity: 0.035,
        }} />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <View key={`h${i}`} style={{
          position: 'absolute', top: (height / rows) * i, left: 0, right: 0,
          height: 1, backgroundColor: Colors.accent, opacity: 0.035,
        }} />
      ))}
    </View>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1', title: 'Your Second Brain',
    subtitle: 'Notes, tasks, projects and AI — beautifully unified.',
    Illustration: BrainIllustration,
  },
  {
    id: '2', title: 'AI That Knows You',
    subtitle: 'Groq AI with full access to your data. Ask anything, create anything.',
    Illustration: AIIllustration,
  },
  {
    id: '3', title: 'Offline First',
    subtitle: 'Everything stored locally on your device. No account needed.',
    Illustration: OfflineIllustration,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { setupProfile } = useAuthStore();

  const totalSlides = SLIDES.length + 1; // +1 for name slide
  const isNameSlide = activeIndex === SLIDES.length;
  const isLast = activeIndex === totalSlides - 1;

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleNext = async () => {
    if (!isNameSlide) {
      goToSlide(activeIndex + 1);
    } else {
      const trimmed = name.trim();
      if (!trimmed) { setNameError('Please enter your name to continue'); return; }
      setNameError('');
      await setupProfile(trimmed);
      router.replace('/(tabs)/home');
    }
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View style={styles.container}>
      <GridLines />
      <GlowOrb style={{ top: -140, left: -100, width: 360, height: 360 }} />
      <GlowOrb style={{ bottom: -120, right: -80, width: 300, height: 300 }} />

      <SafeAreaView style={styles.safeArea}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="cover" />
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.logoText}>Flowly</Text>
        </View>

        {/* Slides */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            scrollEnabled={false}
            style={styles.slideScroll}
          >
            {/* Feature slides */}
            {SLIDES.map((slide) => {
              const { Illustration } = slide;
              return (
                <View key={slide.id} style={styles.slide}>
                  <View style={styles.illustrationWrap}>
                    <Illustration />
                  </View>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                </View>
              );
            })}

            {/* Name slide */}
            <View style={styles.slide}>
              <View style={styles.illustrationWrap}>
                <NameIllustration />
              </View>
              <Text style={styles.slideTitle}>What's your name?</Text>
              <Text style={styles.slideSubtitle}>
                Flowly AI will remember you and personalize your experience.
              </Text>
              <View style={styles.nameInputWrap}>
                <TextInput
                  style={[styles.nameInput, nameError ? styles.nameInputError : null]}
                  value={name}
                  onChangeText={(t) => { setName(t); setNameError(''); }}
                  placeholder="Enter your name..."
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                  autoFocus={false}
                />
                {nameError ? <Text style={styles.nameError}>{nameError}</Text> : null}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Dots */}
        <View style={styles.dots}>
          {Array.from({ length: totalSlides }, (_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, isLast && styles.primaryBtnGlow]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
          {!isLast && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => goToSlide(SLIDES.length)}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip to setup</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safeArea: { flex: 1 },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  logoWrap: { position: 'relative' },
  logo: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.borderGlow },
  logoGlow: {
    position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 18,
    backgroundColor: Colors.accent, opacity: 0.1,
  },
  logoText: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  slideScroll: { flex: 1 },
  slide: {
    width, flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.lg,
  },
  illustrationWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  slideTitle: {
    fontSize: 30, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 26, paddingHorizontal: Spacing.sm,
  },
  nameInputWrap: { width: '100%', gap: 6 },
  nameInput: {
    width: '100%', height: 56,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.borderGlow,
    paddingHorizontal: 20,
    fontSize: 18, fontWeight: '600', color: Colors.textPrimary,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  nameInputError: { borderColor: Colors.danger },
  nameError: { fontSize: 13, color: Colors.danger, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: Spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  dotActive: {
    width: 28, height: 6, borderRadius: 3, backgroundColor: Colors.accent,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 8, elevation: 4,
  },
  actions: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm },
  primaryBtn: {
    height: 58, borderRadius: Radius.lg, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  primaryBtnGlow: {
    shadowOpacity: 0.7, shadowRadius: 24, elevation: 14,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: Colors.bg, letterSpacing: 0.5 },
  skipBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
});
