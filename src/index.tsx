import { useAdapterState as useAdapterStateHook } from './hooks/useAdapterState';
import { useBluetoothPermission as useBluetoothPermissionHook } from './hooks/useBluetoothPermission';
import { useConnectionState as useConnectionStateHook } from './hooks/useConnectionState';
import { useScaner as useScanerHook } from './hooks/useScanner';
import { Bluetooth as BluetoothModule } from './services/bluetooth';
import bluetoothManagerSingleton from './services/bluetoothManager';

export default bluetoothManagerSingleton;

export const Bluetooth = BluetoothModule;

export const useBluetoothPermission = useBluetoothPermissionHook;
export const useScaner = useScanerHook;
export const useConnectionState = useConnectionStateHook;
export const useAdapterState = useAdapterStateHook;
