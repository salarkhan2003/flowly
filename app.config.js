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
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'cover',
      backgroundColor: '#050508',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.flowly.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#050508',
      },
      package: 'com.flowly.app',
      versionCode: 4,
      softwareKeyboardLayoutMode: 'resize',
      permissions: ['INTERNET'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router'],
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
