import { Platform } from 'react-native';

export const DEFAULT_MTU_SIZE = 517; // Max android mtu size

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';

export const PLATFORM_VERSION = Number(Platform.Version);

export const APP_ACTIVE = 'active';
