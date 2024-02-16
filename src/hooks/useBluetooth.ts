import { useMemo } from 'react';
import { bluetoothManager } from '../services/bluetoothManager';

export const useBluetooth = () => {
  const bluetooth = useMemo(() => bluetoothManager.instance, []);

  return {
    bluetooth,
    destroy: bluetoothManager.destroy,
  };
};
