import {
  PermissionsAndroid,
  NativeModules,
  type PermissionStatus,
} from 'react-native';
import { IS_ANDROID, PLATFORM_VERSION } from '../constants/constants';
import { AndroidPermissionStatus } from '../types/types';

const processAndroidResult = (results: {
  [key: string]: PermissionStatus;
}): boolean => {
  const allGranted = Object.values(results).every(
    (status) => status === AndroidPermissionStatus.GRANTED
  );

  if (allGranted) {
    return true;
  }

  const someBlocked = Object.values(results).some(
    (status) => status === AndroidPermissionStatus.NEVER_ASK
  );

  if (someBlocked) {
    return false;
  }

  return false;
};

export const checkAndroidPermission = async (): Promise<boolean> => {
  if (IS_ANDROID && PLATFORM_VERSION >= 31) {
    const result = await Promise.all([
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN!),
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT!
      ),
    ]);

    return result.every((status) => status);
  }

  if (IS_ANDROID && PLATFORM_VERSION >= 23) {
    return PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!
    );
  }

  return false;
};

export const requestAndroidPermission = async (): Promise<boolean> => {
  if (IS_ANDROID && PLATFORM_VERSION >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN!,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT!,
    ]);

    return processAndroidResult(result);
  }

  if (IS_ANDROID && PLATFORM_VERSION >= 23) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!
    );

    if (result === AndroidPermissionStatus.GRANTED) {
      return true;
    }

    if (result === AndroidPermissionStatus.DENIED) {
      return false;
    }

    return false;
  }

  return false;
};

const checkIosPermission = (): Promise<boolean> =>
  NativeModules.BluetoothLite.checkPermission();

const requestIosPermission = (): Promise<boolean> =>
  NativeModules.BluetoothLite.requestPermission();

export const checkPermission = IS_ANDROID
  ? checkAndroidPermission
  : checkIosPermission;

export const requestPermission = IS_ANDROID
  ? requestAndroidPermission
  : requestIosPermission;
