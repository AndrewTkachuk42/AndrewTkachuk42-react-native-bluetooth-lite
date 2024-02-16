import { NativeModules } from 'react-native';

import { LINKING_ERROR } from '../constants/constants';

export const getNativeModule = () =>
  NativeModules.BluetoothLite
    ? NativeModules.BluetoothLite
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
