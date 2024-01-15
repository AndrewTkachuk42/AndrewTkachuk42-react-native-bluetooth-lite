import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
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
  PermissionResult,
  AdapterState,
  type IosPermissionCalback,
} from '../types/types';
import { DEFAULT_MTU_SIZE, IS_ANDROID } from '../constants/constants';
import {
  checkAndroidPermissions,
  requestAndroidPermissions,
} from '../utils/permissions';

const LINKING_ERROR =
  `The package 'react-native-bluetooth-lite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const getNativeModule = () =>
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

export class Bluetooth {
  private _bluetooth: typeof NativeModules.BluetoothLe;
  private _events: NativeEventEmitter;
  private _activeListeners: BluetoothEvent[] = [];
  private _notificationCallbacks: Record<string, AnyCallback | null> = {};
  private _adapterStateCallback: ((event: AdapterStateEvent) => void) | null =
    null;
  private _iosPermissionCallback: IosPermissionCalback | null = null;

  public _adapterState: AdapterState = AdapterState.UNKNOWN;
  public _isAdapterEnabled: boolean = false;
  public _isPermissionRequested: boolean = false;
  public _permissionStatus: PermissionResult = PermissionResult.NOT_REQUESTED;
  public _isPermissionGranted: boolean = false;

  constructor() {
    this._bluetooth = getNativeModule();
    this._events = new NativeEventEmitter(this._bluetooth);

    this.setAdapterStateListener();
  }

  init(options?: GlobalOptions) {
    options && this._bluetooth.setOptions(options);
  }

  private unsubscribe = (eventType: BluetoothEvent) => {
    this._events.removeAllListeners(eventType);

    this._activeListeners = this._activeListeners.filter(
      (type) => type !== eventType
    );
  };

  private subscribe = (eventType: BluetoothEvent, callback: AnyCallback) => {
    this.unsubscribe(eventType);
    this._events.addListener(eventType, callback);

    this._activeListeners.push(eventType);
  };

  private removeAllListeners = () =>
    this._activeListeners.forEach((eventType) => this.unsubscribe(eventType));

  startScan: StartScan = async (callback, options) => {
    if (callback) {
      this.subscribe(BluetoothEvent.DEVICE_FOUND, callback);
    }

    const result = await this._bluetooth.startScan(options);
    this.unsubscribe(BluetoothEvent.DEVICE_FOUND);

    return result;
  };

  stopScan = () => this._bluetooth.stopScan();

  connect: Connect = (address, options) =>
    this._bluetooth.connect(address, options);

  disconnect = () => this._bluetooth.disconnect();

  isEnabled: isEnabled = () => this._bluetooth.isEnabled();

  isConnected: isConnected = () => this._bluetooth.isConnected();

  getConnectionState: getConnectionState = () =>
    this._bluetooth.getConnectionState();

  writeString = (
    serviceId: string,
    characteristicId: string,
    payload: string
  ): Promise<TransactionResponse> =>
    this._bluetooth.writeString(serviceId, characteristicId, payload);

  writeStringWithoutResponse = (
    serviceId: string,
    characteristicId: string,
    payload: string
  ): Promise<TransactionResponse> =>
    this._bluetooth.writeStringWithoutResponse(
      serviceId,
      characteristicId,
      payload
    );

  write = (
    serviceId: string,
    characteristicId: string,
    payload: number[]
  ): Promise<TransactionResponse> =>
    this._bluetooth.write(serviceId, characteristicId, payload);

  writeWithoutResponse = (
    serviceId: string,
    characteristicId: string,
    payload: number[]
  ): Promise<TransactionResponse> =>
    this._bluetooth.write(serviceId, characteristicId, payload);

  read = (
    serviceId: string,
    characteristicId: string
  ): Promise<TransactionResponse> =>
    this._bluetooth.read(serviceId, characteristicId);

  private onNotification = (notification: Notification) => {
    const { characteristic } = notification;
    const callback = this._notificationCallbacks[characteristic];

    callback?.(notification);
  };

  enableNotifications = async (
    serviceId: string,
    characteristicId: string,
    callback: AnyCallback
  ) => {
    const response = this._bluetooth.enableNotifications(
      serviceId,
      characteristicId
    );

    if (!response?.error) {
      this._notificationCallbacks[this.formatUUID(characteristicId)] = callback;
      this.subscribe(BluetoothEvent.NOTIFICATION, this.onNotification);
    }

    return response;
  };

  disableNotifications = async (
    serviceId: string,
    characteristicId: string
  ) => {
    const response = this._bluetooth.disableNotifications(
      serviceId,
      characteristicId
    );

    if (!response?.error) {
      this._notificationCallbacks = this.removeNotificationCallback(
        this.formatUUID(characteristicId)
      );

      if (!Object.keys(this._notificationCallbacks).length) {
        this.unsubscribe(BluetoothEvent.NOTIFICATION);
      }
    }

    return response;
  };

  removeNotificationCallback = (characteristicId: string) =>
    Object.entries(this._notificationCallbacks).reduce<
      Record<string, AnyCallback | null>
    >((result, [characteristic, callback]) => {
      if (characteristic !== characteristicId) {
        result[characteristic] = callback;
      }
      return result;
    }, {});

  getAdapterState = async (): Promise<AdapterStateEvent> => {
    const response: AdapterStateEvent = await this._bluetooth.getAdapterState();
    this._adapterState = response.adapterState;

    return response;
  };

  private setAdapterStateListener = async () => {
    await this.getAdapterState();

    const onChange = (event: AdapterStateEvent) => {
      const { adapterState } = event;

      this._adapterState = adapterState;
      this._isAdapterEnabled = adapterState === AdapterState.ON;
      this._adapterStateCallback?.(event);

      this.checkIosPermissionStatus(adapterState);
    };

    this.subscribe(BluetoothEvent.ADAPTER_STATE, onChange);
  };

  private checkIosPermissionStatus = (adapterState: AdapterState) => {
    if (IS_ANDROID) {
      return;
    }

    const isPermissionGranted = adapterState !== AdapterState.UNAUTHORIZED;
    this._iosPermissionCallback?.({
      isGranted: isPermissionGranted,
      status: isPermissionGranted
        ? PermissionResult.GRANTED
        : PermissionResult.BLOCKED,
    });
  };

  subscribeToConnectionState = (callback: (event: StateEvent) => any) => {
    this.subscribe(BluetoothEvent.CONNECTION_STATE, (event: StateEvent) =>
      callback?.(event)
    );

    return () => this.unsubscribe(BluetoothEvent.CONNECTION_STATE);
  };

  subscribeToAdapterState = (callback: (event: AdapterStateEvent) => any) => {
    this._adapterStateCallback = callback;

    return () => {
      this._adapterStateCallback = null;
    };
  };

  requestMtu: RequestMtu = (size?: number) =>
    this._bluetooth.requestMtu(size || DEFAULT_MTU_SIZE);

  discoverServices: DiscoverServices = (options) =>
    this._bluetooth.discoverServices(options);

  reset = () => {
    this.removeAllListeners();
  };

  subscribeToIosPermission = (callback: IosPermissionCalback) => {
    if (IS_ANDROID) {
      return null;
    }

    this._iosPermissionCallback = callback;

    return () => {
      this._iosPermissionCallback = null;
    };
  };

  getIosPermissionStatus = async (): Promise<PermissionResult> =>
    this._bluetooth.getPermissionStatus();

  checkIosPermission = async (): Promise<boolean> => {
    const status = await this.getIosPermissionStatus();

    this._isPermissionGranted = status === PermissionResult.GRANTED;
    this._permissionStatus = status;
    this._isPermissionRequested = true;

    return status === PermissionResult.GRANTED;
  };

  checkBluetoothPermission = async (): Promise<boolean> => {
    const check = IS_ANDROID
      ? checkAndroidPermissions
      : this.checkIosPermission;

    this._isPermissionGranted = await check();

    return this._isPermissionGranted;
  };

  requestBluetoothPermission = async (): Promise<PermissionResult> => {
    this._isPermissionRequested = true;

    const getPermissionStatus = IS_ANDROID
      ? requestAndroidPermissions
      : this.getIosPermissionStatus;

    const result = await getPermissionStatus();

    this._permissionStatus = result;
    this._isPermissionGranted = result === PermissionResult.GRANTED;

    return result;
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
    this._bluetooth.destroy();
  };
}
