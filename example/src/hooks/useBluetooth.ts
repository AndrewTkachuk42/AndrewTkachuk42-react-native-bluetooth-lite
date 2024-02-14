import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useAdapterState,
  useBluetoothPermission,
  useConnectionState,
  useScaner,
  bluetoothManager,
} from 'react-native-bluetooth-lite';

const bluetooth = bluetoothManager.getInstance();

export const useBluetooth = () => {
  const { isGranted } = useBluetoothPermission();
  const { isEnabled } = useAdapterState(bluetooth);
  const { isConnected, connectionState } = useConnectionState(bluetooth);
  const { devices, scan, isScanning } = useScaner(bluetooth, { duration: 2 });
  const [selected, setSelected] = useState(-1);

  const scanHandler = useCallback(() => {
    setSelected(-1);
    scan();
  }, [scan]);

  const selectedDevice = useMemo(
    () => devices[selected] || null,
    [devices, selected]
  );

  const connect = useCallback(() => {
    if (!selectedDevice) return;

    bluetooth.connect(selectedDevice.address, { duration: 2 });
  }, [selectedDevice]);

  const disconnect = useCallback(() => bluetooth.disconnect(), []);

  useEffect(() => {
    bluetooth.init({ autoDecodeBytes: true, timeoutDuration: 5 }); // optional

    return bluetooth.destroy;
  }, []);

  return {
    devices,
    connect,
    disconnect,
    isScanning,
    isConnected,
    selected,
    setSelected,
    isEnabled,
    connectionState,
    scan: scanHandler,
    isDeviceSelected: Boolean(selectedDevice),
    isGranted,
  };
};
