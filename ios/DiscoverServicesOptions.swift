//
//  DiscoverServicesOptions.swift
//  react-native-bluetooth-lite
//
//  Created by Andrew Tkachuk on 15.01.2024.
//

import CoreBluetooth

class DiscoverServicesOptions: NSObject {
    var services: [CBUUID: [CBUUID]]?
    var duration: Int = Constants.DEFAULT_TIMEOUT
    
    init(options: NSDictionary?) {
        super.init()
        
        if (options == nil) {
            return
        }
        
        duration = options?[keys.duration] as? Int ?? Constants.DEFAULT_TIMEOUT
        services = getServices(options: options!)
    }
    
    func getServices (options: NSDictionary) -> [CBUUID: [CBUUID]]? {
        guard let servicesMap = options[keys.services] as? NSDictionary else {return nil}
        guard let serviceList = servicesMap.allKeys as? [String] else {return nil}
        
        var servicesToDiscover = [CBUUID: [CBUUID]]()
        for service in serviceList {
            guard let characteristics = servicesMap[service] as? [String] else {continue}
            
            if (characteristics.count == 0) {
                servicesToDiscover[CBUUID.init(string: service)] = nil
                continue
            }
            
            servicesToDiscover[CBUUID.init(string: service)] = characteristics.map{CBUUID.init(string: $0)}
        }
        
        return servicesToDiscover
    }
    
    struct keys {
        static let services = "services"
        static let duration = "duration"
    }
}
