import { Platform } from 'react-native';

export const LINKING_ERROR =
  `The package 'react-native-bluetooth-lite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export const DEFAULT_MTU_SIZE = 517; // Max android mtu size

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';

export const PLATFORM_VERSION = Number(Platform.Version);

export const APP_ACTIVE = 'active';
