import React from 'react';

import { StyleSheet, View, Button, Text, SafeAreaView } from 'react-native';
import { useTextStyle } from './hooks/useTextStyle';
import type { ConnectionState } from '../../src/types/types';
import DeviceList from './DeviceList';
import { useBluetooth } from './hooks/useBluetooth';
import { strings } from './constants/strings';
import {
  formatAdapterStatus,
  formatConnectionStatus,
  formatPermissionStatus,
} from './utils/format';

const App = () => {
  const {
    scan,
    connect,
    disconnect,
    selected,
    setSelected,
    isEnabled,
    connectionState,
    isConnected,
    isScanning,
    devices,
    isDeviceSelected,
    isGranted,
  } = useBluetooth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Info
          isPermissionGranted={isGranted}
          isEnabled={isEnabled}
          connectionState={connectionState}
        />
        <DeviceList
          devices={devices}
          selected={selected}
          setSelected={setSelected}
        />
        <Buttons
          connect={connect}
          disconnect={disconnect}
          isConnected={isConnected}
          isScanning={isScanning}
          scan={scan}
          isDeviceSelected={isDeviceSelected}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;

type InfoProps = {
  isEnabled: boolean;
  connectionState: ConnectionState;
  isPermissionGranted: boolean;
};

const Info = ({
  isEnabled,
  connectionState,
  isPermissionGranted,
}: InfoProps) => {
  const textStyle = useTextStyle();

  return (
    <>
      <Text style={textStyle}>
        {formatPermissionStatus(isPermissionGranted)}
      </Text>
      <Text style={textStyle}>{formatAdapterStatus(isEnabled)}</Text>
      <Text style={textStyle}>{formatConnectionStatus(connectionState)}</Text>
    </>
  );
};

type ButtonsProps = {
  scan: () => void;
  connect: () => void;
  disconnect: () => void;
  isScanning: boolean;
  isConnected: boolean;
  isDeviceSelected: boolean;
};

const Buttons = ({
  scan,
  isScanning,
  isConnected,
  disconnect,
  connect,
  isDeviceSelected,
}: ButtonsProps) => (
  <View style={styles.buttonsWrapper}>
    <Button title={strings.SCAN} onPress={scan} disabled={isScanning} />
    <Button
      title={isConnected ? strings.DISCONNECT : strings.CONNECT}
      onPress={isConnected ? disconnect : connect}
      disabled={!isDeviceSelected}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    gap: 16,
    padding: 16,
  },
  deviceList: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
  },
  deviceListContentContainer: {
    padding: 16,
    flexGrow: 1,
    gap: 16,
  },
  buttonsWrapper: {
    marginTop: 16,
    flex: 1,
    gap: 16,
  },
});
