import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useBluetooth,
  useAdapterState,
  useBluetoothPermission,
  useScaner,
  useConnection,
} from 'react-native-bluetooth-lite';

const scanOptions = { duration: 2 };

export const useApp = () => {
  const { bluetooth } = useBluetooth();
  const { isGranted } = useBluetoothPermission();
  const { isEnabled } = useAdapterState();
  const { isConnected, connect, disconnect, connectionState } = useConnection();
  const { devices, scan, isScanning } = useScaner(scanOptions);
  const [selected, setSelected] = useState(-1);

  const scanHandler = useCallback(() => {
    setSelected(-1);
    scan();
  }, [scan]);

  const selectedDevice = useMemo(
    () => devices[selected] || null,
    [devices, selected]
  );

  const connectHandler = useCallback(() => {
    if (!selectedDevice) return;

    connect(selectedDevice.address, { duration: 2 });
  }, [selectedDevice, connect]);

  useEffect(() => {
    bluetooth.init({ autoDecodeBytes: true, timeoutDuration: 5 }); // optional

    return bluetooth.destroy;
  }, [bluetooth]);

  return {
    devices,
    connect: connectHandler,
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
