# react-native-bluetooth-lite

Easy to use bluetooth low energy library for React Native.

## Installation

```sh
npm install react-native-bluetooth-lite
```

### Android

1. Add bluetooth permissions to your `android/app/src/main/AndroidManifest.xml`. Also, don't forget to add "xmlns:tools" atribute to manifest tag.

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:tools="http://schemas.android.com/tools"> <!-- Add xmlns:tools -->

  <!-- Add this -->

  <uses-permission android:name="android.permission.BLUETOOTH" tools:remove="android:maxSdkVersion" />
  <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" tools:remove="android:maxSdkVersion" />

  <uses-permission-sdk-23 android:name="android.permission.ACCESS_FINE_LOCATION" tools:node="remove"/>
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
  <uses-permission-sdk-23 android:name="android.permission.ACCESS_COARSE_LOCATION" tools:node="remove"/>
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>

  <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
  <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

  <!-- … -->

</manifest>
```

### Ios

1. Add bluetooth usage description to info.plist file:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Bluetooth connection is required to connect to local devices</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Bluetooth connection is required to connect to local devices</string>
```

2. Install pods by running "pod install" in ./ios directory

```sh
cd ios && pod install
```

### Requset bluetooth permission

Bluetoot permission is a runtime permission. So you need to ask user a permission to use bluetooth.
you can import permission related utilities from useBluetoothPermission hook.

```js
import { useBluetoothPermission } from 'react-native-bluetooth-lite';

const App = () => {

  <!-- … -->

  const { isGranted, checkPermission, requestPermission } =
    useBluetoothPermission();

  <!-- … -->

};
```

## Usage

```js
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import {
  useAdapterState,
  useScaner,
  useConnection,
} from 'react-native-bluetooth-lite';

const scanOptions = { duration: 2, name: 'my device', findOne: true };

const App = () => {
  const [deviceAddress, setDeviceAdress] = useState('');

  const { isEnabled } = useAdapterState();
  const { scan, isScanning, devices } = useScaner(scanOptions);
  const { connect, disconnect, isConnected } = useConnection();

  const connectHandler = useCallback(() => {
    if (!deviceAddress) {
      return;
    }

    connect(deviceAddress, { duration: 2 });
  }, [deviceAddress, connect]);

  useEffect(() => {
    const [device] = devices;

    if (!device) {
      return;
    }

    setDeviceAdress(device?.address);
  }, [devices]);

  if (!isEnabled) {
    return (
      <View>
        <Text>Bluetooth adapter is turned off.</Text>
      </View>
    );
  }

  return (
    <View>
      <Button title="scan" onPress={scan} />
      <Button title="connect" onPress={connectHandler} />
    </View>
  );
};

export default App;

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
