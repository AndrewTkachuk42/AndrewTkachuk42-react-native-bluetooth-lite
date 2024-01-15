package com.bluetoothlite

import com.bluetoothlite.GlobalOptions.Companion.Keys.autoDecodeBytes
import com.bluetoothlite.constants.Constants
import com.facebook.react.bridge.ReadableMap

class GlobalOptions(options: ReadableMap?) {
  var autoDecode = false
  var timeoutDuration = Constants.DEFAULT_TIMEOUT

  init {
    if (options != null) {
      autoDecode = getAutoDecode(options)
      timeoutDuration = getTimeout(options)
    }
  }

  private fun getTimeout(options: ReadableMap): Int {
    if (options.hasKey(Keys.timeoutDuration)) {
      return options.getInt(Keys.timeoutDuration)
    }

    return Constants.DEFAULT_TIMEOUT
  }

  private fun getAutoDecode(options: ReadableMap): Boolean {
    if (options.hasKey(autoDecodeBytes)) {
      return options.getBoolean(autoDecodeBytes)
    }

    return false
  }

  companion object {
    object Keys {
      const val autoDecodeBytes = "autoDecodeBytes"
      const val timeoutDuration = "timeoutDuration"
    }
  }
}
