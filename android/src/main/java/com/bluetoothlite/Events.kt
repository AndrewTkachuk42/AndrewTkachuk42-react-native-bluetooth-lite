package com.bluetoothlite

import android.bluetooth.BluetoothGattCharacteristic
import com.bluetoothlite.types.AdapterState
import com.bluetoothlite.types.ConnectionState
import com.bluetoothlite.types.EventType
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class Events (private val reactContext: ReactApplicationContext) {

  private fun sendEvent(eventName: EventType, params: WritableMap?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName.toString(), params)
  }

  fun emitStateChangeEvent(newState: ConnectionState) {
    val params = Arguments.createMap().apply {
      putString(Strings.connectionState, newState.toString())
    }

    sendEvent(EventType.CONNECTION_STATE, params)
  }

  fun emitAdapterStateChangeEvent(newState: AdapterState) {
    val params = Arguments.createMap().apply {
      putString(Strings.adapterState, newState.toString())
    }

    sendEvent(EventType.ADAPTER_STATE, params)
  }

  fun emitDeviceFoundEvent(deviceScanData: WritableMap) {
    sendEvent(EventType.DEVICE_FOUND, deviceScanData)
  }

  fun emitNotificationEvent(data: WritableMap) {
    sendEvent(EventType.NOTIFICATION, data)
  }
}
