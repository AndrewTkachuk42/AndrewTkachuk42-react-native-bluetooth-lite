import { useCallback, useEffect, useState } from 'react';

import {
  ConnectionState,
  type StateEvent,
  type ConnectOptions,
  type ConnectionResponse,
} from '../types/types';
import { useBluetooth } from './useBluetooth';

export const useConnection = () => {
  const [inProgress, setInProgress] = useState(false);

  const { bluetooth } = useBluetooth();

  const [connectionState, setConnectionState] = useState(
    ConnectionState.DISCONNECTED
  );

  const onConnectionStateChange = useCallback(
    (event: StateEvent) => setConnectionState(event.connectionState),
    []
  );

  const performConnectionAction = useCallback(
    async (action: Promise<ConnectionResponse>) => {
      setInProgress(true);
      const result = await action;
      setInProgress(false);

      return result;
    },
    []
  );

  const connect = useCallback(
    (address: string, options: ConnectOptions) => {
      const action = bluetooth.connect(address, options);

      return performConnectionAction(action);
    },
    [performConnectionAction, bluetooth]
  );

  const disconnect = useCallback(() => {
    const action = bluetooth.disconnect();

    return performConnectionAction(action);
  }, [performConnectionAction, bluetooth]);

  useEffect(() => {
    const unsubscribe = bluetooth.subscribeToConnectionState(
      onConnectionStateChange
    );

    return unsubscribe;
  }, [onConnectionStateChange, bluetooth]);

  return {
    connect,
    disconnect,
    isConnected: connectionState === ConnectionState.CONNECTED,
    inProgress,
    connectionState,
  };
};
