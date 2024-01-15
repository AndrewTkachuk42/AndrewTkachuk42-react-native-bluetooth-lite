import { useCallback, useEffect, useRef, useState } from 'react';

import { PermissionResult } from '../types/types';
import type { Bluetooth } from '../services/bluetooth';
import { IS_IOS } from '../constants/constants';

export const useBluetoothPermission = (bluetooth: Bluetooth) => {
  const [isGranted, setIsGranted] = useState(false);
  const [status, setStatus] = useState(PermissionResult.NOT_REQUESTED);

  const iosPermissionListener = useRef<(() => void) | null>(null);

  const checkPermission = useCallback(async () => {
    const isPermissionGranted = await bluetooth.checkBluetoothPermission();

    setIsGranted(isPermissionGranted);

    if (isPermissionGranted || IS_IOS) {
      setStatus(bluetooth._permissionStatus);
      return isPermissionGranted;
    }

    return isPermissionGranted;
  }, [bluetooth]);

  const requestPermission = useCallback(async () => {
    const result = await bluetooth.requestBluetoothPermission();

    setStatus(bluetooth._permissionStatus);
    setIsGranted(bluetooth._isPermissionGranted);

    return result;
  }, [bluetooth]);

  useEffect(() => {
    if (isGranted || bluetooth._isPermissionRequested || IS_IOS) {
      return;
    }

    requestPermission();
  }, [isGranted, requestPermission, bluetooth]);

  useEffect(() => {
    // Ios permission listener
    if (isGranted) {
      iosPermissionListener.current?.();
      return;
    }

    iosPermissionListener.current = bluetooth.subscribeToIosPermission(
      (event) => {
        setIsGranted(event.isGranted);
        setStatus(event.status);
      }
    );

    return () => iosPermissionListener.current?.();
  }, [isGranted, bluetooth]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission, bluetooth]);

  return { isGranted, status, checkPermission, requestPermission };
};
