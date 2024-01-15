package com.bluetoothlite.constants

import com.bluetoothlite.BluetoothAdapter
import com.bluetoothlite.types.AdapterState

object Constants {
  const val DEFAULT_TIMEOUT = 10

  val AdapterStateMap: HashMap<Int, AdapterState> = HashMap<Int, AdapterState>().apply {
    put(BluetoothAdapter.STATE_OFF, AdapterState.OFF)
    put(BluetoothAdapter.STATE_TURNING_ON, AdapterState.ON)
    put(BluetoothAdapter.STATE_ON, AdapterState.TURNING_ON)
    put(BluetoothAdapter.STATE_TURNING_OFF, AdapterState.TURNING_OFF)
  }
}
