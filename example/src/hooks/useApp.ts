import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useBluetooth,
  useAdapterState,
  useBluetoothPermission,
  useConnectionState,
  useScaner,
} from 'react-native-bluetooth-lite';

export const useApp = () => {
  const { bluetooth } = useBluetooth();
  const { isGranted } = useBluetoothPermission();
  const { isEnabled } = useAdapterState();
  const { isConnected, connectionState } = useConnectionState();
  const { devices, scan, isScanning } = useScaner({ duration: 2 });
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
  }, [selectedDevice, bluetooth]);

  const disconnect = useCallback(() => bluetooth.disconnect(), [bluetooth]);

  useEffect(() => {
    bluetooth.init({ autoDecodeBytes: true, timeoutDuration: 5 }); // optional

    return bluetooth.destroy;
  }, [bluetooth]);

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
