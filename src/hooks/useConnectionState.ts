import { useCallback, useEffect, useState } from 'react';

import { ConnectionState, type StateEvent } from '../types/types';
import { useBluetooth } from './useBluetooth';

export const useConnectionState = () => {
  const { bluetooth } = useBluetooth();

  const [connectionState, setConnectionState] = useState(
    ConnectionState.DISCONNECTED
  );

  const onConnectionStateChange = useCallback(
    (event: StateEvent) => setConnectionState(event.connectionState),
    []
  );

  useEffect(() => {
    const unsubscribe = bluetooth.subscribeToConnectionState(
      onConnectionStateChange
    );

    return unsubscribe;
  }, [onConnectionStateChange, bluetooth]);

  return {
    isConnected: connectionState === ConnectionState.CONNECTED,
    connectionState,
  };
};
