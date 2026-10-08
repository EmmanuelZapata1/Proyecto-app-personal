import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// En web usamos localStorage; en Android/iOS, el almacenamiento cifrado del sistema.
export async function readSecure(key: string) {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

export async function writeSecure(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    if (value) globalThis.localStorage?.setItem(key, value);
    else globalThis.localStorage?.removeItem(key);
    return;
  }
  if (value) await SecureStore.setItemAsync(key, value);
  else await SecureStore.deleteItemAsync(key);
}
