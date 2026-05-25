import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'flowly:';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await AsyncStorage.getItem(PREFIX + key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {}
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {}
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const flowlyKeys = keys.filter((k) => k.startsWith(PREFIX));
      if (flowlyKeys.length > 0) await AsyncStorage.multiRemove(flowlyKeys);
    } catch {}
  },
};
