import { Bluetooth } from './bluetooth';

class BluetoothManager {
  private _instance: Bluetooth | null;

  constructor() {
    this._instance = null;
  }

  getInstance() {
    if (!this._instance) {
      this._instance = new Bluetooth();
    }

    return this._instance;
  }
}

const bluetoothManager = new BluetoothManager();

export default bluetoothManager;
