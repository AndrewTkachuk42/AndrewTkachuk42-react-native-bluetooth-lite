import { NativeModules, NativeEventEmitter } from 'react-native';
import {
  BluetoothEvent,
  type AnyCallback,
  type StateEvent,
  type StartScan,
  type Connect,
  type Notification,
  type AdapterStateEvent,
  type GlobalOptions,
  type isEnabled,
  type isConnected,
  type getConnectionState,
  type TransactionResponse,
  type DiscoverServices,
  type RequestMtu,
  AdapterState,
  type Disconnect,
} from '../types/types';
import { DEFAULT_MTU_SIZE, IS_ANDROID } from '../constants/constants';
import { getNativeModule } from '../utils/nativeModule';

export class Bluetooth {
  #bluetooth: typeof NativeModules.BluetoothLite;
  #events: NativeEventEmitter;
  #activeListeners: BluetoothEvent[] = [];
  #notificationCallbacks: Record<string, AnyCallback | null> = {};
  #adapterStateCallback: ((event: AdapterStateEvent) => void) | null = null;

  isEnabled: boolean = false;

  constructor() {
    this.#bluetooth = getNativeModule();
    this.#events = new NativeEventEmitter(this.#bluetooth);

    this.#setAdapterStateListener();
  }

  init(options?: GlobalOptions) {
    options && this.#bluetooth.setOptions(options);
  }

  #unsubscribe = (eventType: BluetoothEvent) => {
    this.#events.removeAllListeners(eventType);

    this.#activeListeners = this.#activeListeners.filter(
      (type) => type !== eventType
    );
  };

  #subscribe = (eventType: BluetoothEvent, callback: AnyCallback) => {
    this.#unsubscribe(eventType);
    this.#events.addListener(eventType, callback);

    this.#activeListeners.push(eventType);
  };

  #removeAllListeners = () =>
    this.#activeListeners.forEach((eventType) => this.#unsubscribe(eventType));

  startScan: StartScan = async (callback, options) => {
    if (callback) {
      this.#subscribe(BluetoothEvent.DEVICE_FOUND, callback);
    }

    const result = await this.#bluetooth.startScan(options);
    this.#unsubscribe(BluetoothEvent.DEVICE_FOUND);

    return result;
  };

  stopScan = () => this.#bluetooth.stopScan();

  connect: Connect = (address, options) =>
    this.#bluetooth.connect(address, options);

  disconnect: Disconnect = () => this.#bluetooth.disconnect();

  isAdapterEnabled: isEnabled = () => this.#bluetooth.isEnabled();

  isConnected: isConnected = () => this.#bluetooth.isConnected();

  getConnectionState: getConnectionState = () =>
    this.#bluetooth.getConnectionState();

  writeString = (
    serviceId: string,
    characteristicId: string,
    payload: string
  ): Promise<TransactionResponse> =>
    this.#bluetooth.writeString(serviceId, characteristicId, payload);

  writeStringWithoutResponse = (
    serviceId: string,
    characteristicId: string,
    payload: string
  ): Promise<TransactionResponse> =>
    this.#bluetooth.writeStringWithoutResponse(
      serviceId,
      characteristicId,
      payload
    );

  write = (
    serviceId: string,
    characteristicId: string,
    payload: number[]
  ): Promise<TransactionResponse> =>
    this.#bluetooth.write(serviceId, characteristicId, payload);

  writeWithoutResponse = (
    serviceId: string,
    characteristicId: string,
    payload: number[]
  ): Promise<TransactionResponse> =>
    this.#bluetooth.write(serviceId, characteristicId, payload);

  read = (
    serviceId: string,
    characteristicId: string
  ): Promise<TransactionResponse> =>
    this.#bluetooth.read(serviceId, characteristicId);

  #onNotification = (notification: Notification) => {
    const { characteristic } = notification;
    const callback = this.#notificationCallbacks[characteristic];

    callback?.(notification);
  };

  enableNotifications = async (
    serviceId: string,
    characteristicId: string,
    callback: (data: Notification) => any
  ) => {
    const response = this.#bluetooth.enableNotifications(
      serviceId,
      characteristicId
    );

    if (!response?.error) {
      this.#notificationCallbacks[this.formatUUID(characteristicId)] = callback;
      this.#subscribe(BluetoothEvent.NOTIFICATION, this.#onNotification);
    }

    return response;
  };

  disableNotifications = async (
    serviceId: string,
    characteristicId: string
  ) => {
    const response = this.#bluetooth.disableNotifications(
      serviceId,
      characteristicId
    );

    if (!response?.error) {
      this.#notificationCallbacks = this.#removeNotificationCallback(
        this.formatUUID(characteristicId)
      );

      if (!Object.keys(this.#notificationCallbacks).length) {
        this.#unsubscribe(BluetoothEvent.NOTIFICATION);
      }
    }

    return response;
  };

  #removeNotificationCallback = (characteristicId: string) =>
    Object.entries(this.#notificationCallbacks).reduce<
      Record<string, AnyCallback | null>
    >((result, [characteristic, callback]) => {
      if (characteristic !== characteristicId) {
        result[characteristic] = callback;
      }
      return result;
    }, {});

  getIsAdapterEnabled = async (): Promise<boolean> => {
    const isEnabled: boolean = await this.#bluetooth.isEnabled();
    this.isEnabled = isEnabled;

    return isEnabled;
  };

  #setAdapterStateListener = async () => {
    await this.getIsAdapterEnabled();

    const onChange = (event: AdapterStateEvent) => {
      const { adapterState } = event;

      this.isEnabled = adapterState === AdapterState.ON;
      this.#adapterStateCallback?.(event);
    };

    this.#subscribe(BluetoothEvent.ADAPTER_STATE, onChange);
  };

  subscribeToConnectionState = (callback: (event: StateEvent) => any) => {
    this.#subscribe(BluetoothEvent.CONNECTION_STATE, (event: StateEvent) =>
      callback?.(event)
    );

    return () => this.#unsubscribe(BluetoothEvent.CONNECTION_STATE);
  };

  subscribeToAdapterState = (callback: (event: AdapterStateEvent) => any) => {
    this.#adapterStateCallback = callback;

    return () => {
      this.#adapterStateCallback = null;
    };
  };

  requestMtu: RequestMtu = (size?: number) =>
    this.#bluetooth.requestMtu(size || DEFAULT_MTU_SIZE);

  discoverServices: DiscoverServices = (options) =>
    this.#bluetooth.discoverServices(options);

  reset = () => {
    this.#removeAllListeners();
  };

  bytesToString = (bytes: number[] | null) =>
    bytes?.map?.((byte) => String.fromCharCode(byte)).join('') || '';

  stringToBytes = (str: string) =>
    Array.from(str, (char) => char.charCodeAt(0));

  formatUUID = (uuid: string) => {
    if (!IS_ANDROID) {
      return uuid.toUpperCase();
    }

    return uuid.toLocaleLowerCase();
  };

  destroy = () => {
    this.reset();
    this.#bluetooth.destroy();
  };
}
