//
//  ConnectionOptions.swift
//  react-native-bluetooth-lite
//
//  Created by Andrew Tkachuk on 15.01.2024.
//

class ConnectionOptions: NSObject {
    var duration: Int = Constants.DEFAULT_TIMEOUT
    
    init(options: NSDictionary?) {
        if (options == nil) {
            return
        }
        
        duration = options?[keys.duration] as? Int ?? Constants.DEFAULT_TIMEOUT
    }
    
    struct keys {
        static let duration = "duration"
    }
}
