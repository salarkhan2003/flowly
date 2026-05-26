/** @type {import('expo/config').ExpoConfig} */
export default {
  expo: {
    name: 'Flowly',
    slug: 'salar',
    version: '1.0.2',
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
      package: 'com.salarkhan.flowly',
      versionCode: 3,
      softwareKeyboardLayoutMode: 'resize',
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
      groqApiKey:
        process.env.GROQ_API_KEY ??
        process.env.EXPO_PUBLIC_GROQ_API_KEY ??
        '',
    },
    owner: 'salarkhan22s-organization',
  },
};
