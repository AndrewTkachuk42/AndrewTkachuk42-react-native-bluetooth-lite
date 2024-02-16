import { Bluetooth } from './bluetooth';

class BluetoothManager {
  static #instance: Bluetooth | null = null;

  get instance() {
    if (!BluetoothManager.#instance) {
      BluetoothManager.#instance = new Bluetooth();
    }

    return BluetoothManager.#instance;
  }

  destroy = () => {
    BluetoothManager.#instance?.destroy();
    BluetoothManager.#instance = null;
  };
}

export const bluetoothManager = new BluetoothManager();
