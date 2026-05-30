/** @type {import('expo/config').ExpoConfig} */
const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim() ?? '';

if (
  process.env.EAS_BUILD === 'true' &&
  process.env.EAS_BUILD_PROFILE === 'production' &&
  !groqApiKey
) {
  throw new Error(
    'EXPO_PUBLIC_GROQ_API_KEY must be set for production APK builds (AI will not work). ' +
      'Run: eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value gsk_YOUR_KEY --scope project'
  );
}

export default {
  expo: {
    name: 'Flowly',
    slug: 'salar',
    version: '1.0.7',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'cover',
      backgroundColor: '#E0F2EC',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.flowly.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#E0F2EC',
      },
      package: 'com.flowly.app',
      versionCode: 8,
      googleServicesFile: './google-services.json',
      softwareKeyboardLayoutMode: 'resize',
      permissions: ['INTERNET', 'RECORD_AUDIO'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
      [
        'expo-speech-recognition',
        {
          microphonePermission:
            'Allow Flowly to use the microphone for voice notes and AI commands.',
          speechRecognitionPermission:
            'Allow Flowly to turn your speech into text for notes, tasks, and AI.',
        },
      ],
    ],
    scheme: 'flowly',
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'ea69c369-3d07-491b-bff8-66075237eec3',
      },
      groqApiKey,
    },
    owner: 'salarkhan22s-organization',
  },
};
