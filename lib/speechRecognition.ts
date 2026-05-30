import Constants from 'expo-constants';

/** Expo Go cannot load native speech recognition. APK / dev client can. */
export function isSpeechRecognitionSupported(): boolean {
  const env = Constants.executionEnvironment;
  if (env === 'storeClient') return false;
  if (Constants.appOwnership === 'expo') return false;
  return true;
}

export function getExpoGoVoiceHint(): string {
  return 'Voice needs the Flowly APK (not Expo Go). Install the latest release from Profile → App & updates.';
}
