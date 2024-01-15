import { PermissionsAndroid, type PermissionStatus } from 'react-native';
import { IS_ANDROID, PLATFORM_VERSION } from '../constants/constants';
import { AndroidPermissionStatus, PermissionResult } from '../types/types';

const processAndroidResult = (results: { [key: string]: PermissionStatus }) => {
  const allGranted = Object.values(results).every(
    (status) => status === AndroidPermissionStatus.GRANTED
  );

  if (allGranted) {
    return PermissionResult.GRANTED;
  }

  const someBlocked = Object.values(results).some(
    (status) => status === AndroidPermissionStatus.NEVER_ASK
  );

  if (someBlocked) {
    return PermissionResult.BLOCKED;
  }

  return PermissionResult.DENIED;
};

export const checkAndroidPermissions = async (): Promise<boolean> => {
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

export const requestAndroidPermissions =
  async (): Promise<PermissionResult> => {
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
        return PermissionResult.GRANTED;
      }

      if (result === AndroidPermissionStatus.DENIED) {
        return PermissionResult.DENIED;
      }

      return PermissionResult.BLOCKED;
    }

    return PermissionResult.BLOCKED;
  };
