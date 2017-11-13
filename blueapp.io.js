require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//# browser shim for navigator
(function () {
    var match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, " "));
        },
        query = window.location.search.substring(1);

    var urlParams = {};
    var scanIndicTimeOut;
    var scanned_perips = {};

    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);

    var gatewayToken = urlParams['token'];
    var deviceUUID = urlParams['uuid'];
    var proxyUrl = urlParams['proxyUrl'];
    var cordovaApp = urlParams['app'] == 'true';

    var updateUI = function (peripheral) {
        clearTimeout(scanIndicTimeOut);
        scanned_perips[peripheral.uuid] = peripheral;
        var mytable = "<table cellpadding=\"0\" cellspacing=\"0\"><tbody><tr>";
        for (var uuid in scanned_perips) {
            mytable += "</tr><tr onclick='onPeripheralSelect(" + '"' + uuid + '"' + ")'>";
            mytable += "<td>" + scanned_perips[uuid].name + "</td>";
        }
        document.getElementById("peripheral").innerHTML = mytable;
    };

    window.wbDialogCancel = function (msg, timeout, onReject) {
        var modal = document.getElementById('picker');
        if(modal){
            modal.style.display = "none";
        }
        if(timeout){
            clearTimeout(timeout);
        }
        if(onReject){
            onReject(msg);
        }
    };

    var showScanPickerDialog = function (onSelect, onReject) {
        var peripheralDiv = document.createElement('div');
        peripheralDiv.setAttribute('id','peripheral');
        var scanDialogDiv = document.createElement('div');
        scanDialogDiv.setAttribute('id', 'scanDialog');
        var pickerDiv = document.createElement('div');
        pickerDiv.setAttribute('id', 'picker');
        pickerDiv.appendChild(peripheralDiv);
        document.body.appendChild(scanDialogDiv);
        document.body.appendChild(pickerDiv);

        scanned_perips = {};

        window.onPeripheralSelect = function (uuid) {
            var modal = document.getElementById('picker');
            modal.style.display = "none";
            onSelect(scanned_perips[uuid]);
        };

        scanIndicTimeOut = setTimeout(function () {
            console.log('Requested device not found :(');
            window.wbDialogCancel('Requested device not found!', scanIndicTimeOut, onReject);
        }, 60000);

        document.getElementById('scanDialog').innerHTML = '<style>' +
            '.modal {' +
            '    display: block;' +
            '    position: fixed;' +
            '    z-index: 1;' +
            '    padding-top: 100px;' +
            '    left: 0;' +
            '    width: 100%;' +
            '    height: 100%;' +
            '    overflow: auto;' +
            '    background-color: rgb(0, 0, 0);' +
            '    background-color: rgba(0, 0, 0, 0.4);' +
            '}' +
            '' +
            '.modal-content {' +
            '    background-color: #fefefe;' +
            '    margin: auto;' +
            '    padding: 20px;' +
            '    border: 1px solid #888;' +
            '    width: 80%;' +
            '}' +
            '' +
            '.spacing-table td {' +
            '    border-width: 3px 0;' +
            '    padding: 10px 10px;' +
            '' +
            '}' +
            '' +
            '.div-border {' +
            '    border-collapse: collapse;' +
            '    border: 1px solid #b5aeae;;' +
            '}' +
            '' +
            'tr:hover {' +
            '   background: #dddddd !important;' +
            '}' +
            '' +
            '</style>' +
            '<div id= "picker" style= "z-index: 100;" class= "modal">' +
            '    <div class= "modal-content">' +
            '       <div style="font-size: 15px; padding-bottom: 10px; color: black"> App wants to pair with : </div>' +
            '        <div class= "spacing-table div-border" style="color: black" id=\'peripheral\'>' +
            '        </div>' +
            '        <div style="text-align: right; margin-top: 10px; font-size: 14px;">' +
            '        <button type= "button" onclick= "window.wbDialogCancel(\'Scan stopped!\')" style="padding: 4px;">Cancel</button>' +
            '    </div>' +
            '    </div>' +
            '</div>';
    };

    var dataResponse = function (data) {
        if(data.peripheral){
            updateUI(data.peripheral);
        } else {
            showScanPickerDialog(data.select, data.reject);
        }
    };

    var getBlueAppBluetoothObject = function () {

        if (typeof window.bawb === 'object') {
            return window.bawb;
        }

        //should we move the blueapp stream here?
        var stream;
        if (cordovaApp) {
            var returnDataCallback = dataResponse;
            stream = {};
            var onerror = function (error) {
                if (stream.onerror) {
                    stream.onerror(error);
                }
            };
            var onmessage = function (data) {
                if (data && stream.onmessage) {
                    var message = {data: data};
                    stream.onmessage(message);
                }
            };
            stream.close = function () {
                blueappio.request('close', undefined, onmessage, onerror);
            };
            stream.send = function (data) {
                blueappio.request('message', data, onmessage, onerror);
            };
            blueappio.request('init', {}, onmessage, onerror);
        }

        window.bawb = require('blueapp-wb').init({
            url: proxyUrl,
            token: gatewayToken,
            scanFilters: {uuids: [deviceUUID]}, //is this ok? we are sending as device uuid
            stream: stream,
            returnData: returnDataCallback,
            errorCallback: window.wbDialogCancel
        }).navigator.bluetooth;

        return window.bawb;
    };

    function loadBluetooth() {
        if (Object.defineProperty) {
            Object.defineProperty(navigator, "bluetooth", {
                get: getBlueAppBluetoothObject
            });
        } else if (Object.prototype.__defineGetter__) {
            navigator.__defineGetter__("bluetooth", getBlueAppBluetoothObject);
        }

        var x = navigator.bluetooth; //trigger the init of the web bluetooth init
    }

    if (typeof navigator === 'object') {
        if (cordovaApp) {
            document.addEventListener("deviceready", loadBluetooth, false); //wait for device ready to load
        } else if (!gatewayToken) {
            //don't do anything if we don't have these values
        } else {
            loadBluetooth()
        }
    } else {
        console.log('Browser does not support the navigator object');
    }
})();
},{"blueapp-wb":5}],2:[function(require,module,exports){
/**

 Example code:

 function MyEmitter() {
    module.exports.instantiateEmitter(this);

}
 module.exports.makeEmitter(MyEmitter);

 const myEmitter = new MyEmitter();
 myEmitter.on('event', function (arg) {
    console.log('an event occurred!', arg);
});
 myEmitter.emit('event', 'foo');
 */

// we are in node
var EventEmitter = require('events');
var util = require('util');

module.exports.makeEmitter = function (contructor) {
        // we are in node
        util.inherits(contructor, EventEmitter);
};

module.exports.instantiateEmitter = function (object) {
        // we are in node
        EventEmitter.call(object);
};
},{"events":17,"util":37}],3:[function(require,module,exports){
var util = require('./util');

module.exports.nameFilter = function(filter, peripheral) {
    if (filter.name) {
        return (filter.name === peripheral.name)
    } else {
        return true;
    }
};

module.exports.namePrefixFilter = function(filter, peripheral) {
    if (filter.namePrefix) {
        return (peripheral.name.indexOf(filter.namePrefix) > -1)
    } else {
        return true;
    }
};

module.exports.servicesFilter = function(gattip, filter, peripheral) {
    if (filter.services) {
        var servicesMatch = true;
        for (var i = 0; i < filter.services.length; i++) {
            var a = util.toVensiUUID(gattip.BluetoothUUID.getService(filter.services[i]));
            if (peripheral.serviceUUIDs.indexOf(util.toVensiUUID(gattip.BluetoothUUID.getService(filter.services[i]))) === -1) {
                servicesMatch = false;
            }
        }
        return servicesMatch;
    } else {
        return true;
    }
};

module.exports.manufacturerDataFilter = function(filter, peripheral) {
    if (filter.manufacturerData) {
        var peripheralMfrData = peripheral.getAllMfrData();
        if (util.isEmpty(filter.manufacturerData)) {
            return false;
        } else {
            for (var key in filter.manufacturerData) {
                if (filter.manufacturerData.hasOwnProperty(key)) {
                    if (!peripheralMfrData.hasOwnProperty(key)) {
                        return false;
                    }
                    if (!util.isEmpty(filter.manufacturerData[key]) && 'mask' in filter.manufacturerData[key]) {
                        if (checkMfrMask(peripheralMfrData[key], filter.manufacturerData[key].dataPrefix, filter.manufacturerData[key].mask) == false) {
                            return false;
                        }
                    } else {
                        var stringFromUintArray = util.uintArrayToString(filter.manufacturerData[key].dataPrefix);
                        if (peripheralMfrData[key].indexOf(stringFromUintArray) != 0) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    } else {
        return true;
    }
};

module.exports.serviceDataFilter = function(filter, peripheral) {
    if (filter.serviceData) {
        var peripheralSvcData = peripheral.getAllSvcData();
        if (util.isEmpty(filter.serviceData)) {
            return false;
        } else {
            for (var key in filter.serviceData) {
                if (filter.serviceData.hasOwnProperty(key)) {
                    if (!peripheralSvcData.hasOwnProperty(key)) {
                        return false;
                    } else if (!util.isEmpty(filter.serviceData[key])) {
                        return false;
                    }
                }
            }
        }
        return true;
    } else {
        return true;
    }
};

function checkMfrMask(peripheralMfrData, dataPrefix, mask) {
    var mfrDataArray = peripheralMfrData.match(/.{1,2}/g);
    if (mfrDataArray.length >= dataPrefix.length) {
        for (var i = 0; i < dataPrefix.length; i++) {
            if ((dataPrefix[i] & mask[i]) != (mfrDataArray[i] & mask[i])) {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
}
},{"./util":7}],4:[function(require,module,exports){
var util = require('./util');
var errors = require('./wb-errors');
var errorMessages = require('./wb-errors').errors;

function isServiceValid(g, service) {
    var isValid = true;
    if (typeof service == 'string') {
        if (!util.isHex(service)) {
            if (!util.toVensiUUID(g.BluetoothUUID.getService(service))) {
                isValid = false;
            }
        } else if (!util.isLowercase(service)) {
            isValid = false;
        }
    } else if (typeof service == 'number' && !util.toVensiUUID(g.BluetoothUUID.getService(service))) {
        isValid = false;
    } else {
        isValid = false;
    }
    return isValid;
}

function checkValidMfrData(filter) {
    for (var key in filter.manufacturerData) {
        if (filter.manufacturerData.hasOwnProperty(key)) {
            if(util.stringIsInteger(key) && key != undefined && key>0 && key<65535) {
                if (typeof filter.manufacturerData[key] == 'object' && (util.isEmpty(filter.manufacturerData[key]) || 'dataPrefix' in filter.manufacturerData[key])) {
                    if ('dataPrefix' in filter.manufacturerData[key]) {
                        if (filter.manufacturerData[key].dataPrefix instanceof Uint8Array == false) {
                            return false;
                        } else if ('mask' in filter.manufacturerData[key]) {
                            if (filter.manufacturerData[key].mask instanceof Uint8Array == false) {
                                return false;
                            } else if (filter.manufacturerData[key].dataPrefix.byteLength != filter.manufacturerData[key].mask.byteLength) {
                                return false;
                            }
                        }
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

function checkValidFilterServiceData(filter) {
    for (var key in filter.serviceData) {
        if (filter.serviceData.hasOwnProperty(key)) {
            if (!util.isEmpty(filter.serviceData[key])) {
                return false;
            }
        }
    }
    return true;
}

function validateServices(g, currentFilter) {
    var response = {};
    if (currentFilter.services.length != 0) {
        for (var j = 0; j < currentFilter.services.length; j++) {
            var serviceUUID = currentFilter.services[j];
            if (!isServiceValid(g, serviceUUID)) {
                response = {error: true, message: errors.invalidServiceUUIDMessage(serviceUUID)};
                return response;
            }
        }
    } else {
        response = {error: true, message: "Illegal filter object"};
    }
    return response;
}

function validateManufacturerData(currentFilter) {
    if (typeof currentFilter.manufacturerData != 'object' || util.isEmpty(currentFilter.manufacturerData) || !checkValidMfrData(currentFilter)) {
        return {error: true, message: errorMessages.INVALID_MFR_DATA_FORMAT};
    }
    return {};
}

function validateServiceData(currentFilter) {
    if (typeof currentFilter.serviceData != 'object' || util.isEmpty(currentFilter.serviceData) || !checkValidFilterServiceData(currentFilter)) {
        return {error: true, message: errorMessages.INVALID_SERVICE_DATA_FORMAT};
    }
    return {};
}

function validateName(currentFilter) {
    if (typeof currentFilter.name != 'string' || util.getUTF8Length(currentFilter.name) > 248) {
        return {error: true, message: errorMessages.INVALID_NAME_ERROR_MESSAGE};
    }
    return {};
}

function validateNamePrefix(currentFilter) {
    if(currentFilter.namePrefix.length == 0 || typeof currentFilter.namePrefix != 'string' || util.getUTF8Length(currentFilter.namePrefix)>248){
        return {error: true, message: errorMessages.INVALID_NAME_PREFIX_ERROR_MESSAGE};
    }
    return {};
}

function checkPassedOptions(filters, acceptAllDevices, optionalServices, rdScan) {
    if(filters && acceptAllDevices){
        if (!rdScan) {
            return {error: true, message: errorMessages.INVALID_LESCAN_OPTIONS_ERROR_MESSAGE};
        } else {
            return {error: true, message: errorMessages.INVALID_OPTIONS_ERROR_MESSAGE};
        }
    } else if (filters && filters.length == 0) {
        return {error: true, message: errorMessages.EMPTY_FILTER_ERROR_MESSAGE};
    } else if ((!filters || filters.length == 0) && acceptAllDevices) {
        return {error: false, isFiltering: false};
    } else {
        return {error: false, isFiltering: true};
    }
}

module.exports.validateFilters = function (g, filters, acceptAllDevices, optionalServices) {
    var response = {};
    var rdScan = arguments.length == 4;
    var checkedOptions = checkPassedOptions(filters, acceptAllDevices, optionalServices, rdScan);
    if(checkedOptions.error){
        return checkedOptions;
    } else if (checkedOptions.isFiltering) {
        for (var i = 0; i < filters.length; i++) {
            var currentFilter = filters[i];
            for (var key in currentFilter) {
                if (currentFilter.hasOwnProperty(key) && currentFilter[key] != undefined) {
                    var checkedValue;
                    switch (key) {
                        case 'services':
                            checkedValue = validateServices(g, currentFilter);
                            break;
                        case 'name':
                            checkedValue = validateName(currentFilter);
                            break;
                        case 'namePrefix':
                            checkedValue = validateNamePrefix(currentFilter);
                            break;
                        case 'manufacturerData':
                            checkedValue = validateManufacturerData(currentFilter);
                            break;
                        case 'serviceData':
                            checkedValue = validateServiceData(currentFilter);
                            break;
                        default:
                            checkedValue = {error: true, message: "Illegal filter object"};
                    }
                    if (checkedValue.error) {
                        return checkedValue;
                    }
                }
            }
        }
    }

    if(optionalServices){
        var checkedOptionalServices = validateServices(g, optionalServices);
        if (checkedOptionalServices.error){
            return checkedOptionalServices;
        }
    }
    
    return checkedOptions;
};
},{"./util":7,"./wb-errors":12}],5:[function(require,module,exports){
"use strict";
var GATTIP = require('gatt-ip').GATTIP;
var util = require('./util.js');
var thirdparty = require('./thirdparty');
var BluetoothDevice = require('./wb-device').BluetoothDevice;
var filtersLib = require('./wb-filters');
var filterValidation = require('./filter-validation');
var advEvents = require('./wb-advertisement');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var BluetoothRemoteGATTServer = require('./wb-server').BluetoothRemoteGATTServer;

var config;

module.exports.navigator = undefined;

function BlueAppWebBluetooth(g) {
    //expose the g as gateway
    this.gateway = g;
    this.activeScans = [];
    this.foundDevices = [];
}

BlueAppWebBluetooth.prototype.requestLEScan = function (scanOptions) {
    var self = this;
    var g = this.gateway;
    var filters = [];
    if (scanOptions.filters && scanOptions.filters.length > 0) {
        for (var i=0; i<scanOptions.filters.length; i++){
            filters.push(new filtersLib.BluetoothLEScanFilterInit(scanOptions.filters[i]));
        }
    }

    return util.errorLoggingPromise(function (fulfill, reject) {
        if (g.getGateway()) {
            fulfill(g.getGateway());
        } else {
            g.once('ready', function (gateway) {
                fulfill(gateway);
            });
        }
    }).then(function () {
        return util.errorLoggingPromise(function (fulfill, reject) {
            var timeout = setTimeout(function () {
                if (config.errorCallback) {
                    config.errorCallback({error: 'Timed out'});
                } else {
                    reject (new DOMException('No devices found.', 'NotFoundError'));
                }
            }, 30000);
            var validScanFilters = filterValidation.validateFilters(g, filters, scanOptions.acceptAllAdvertisements);
            var isFiltering;

            if (validScanFilters.error) {
                reject(new TypeError(validScanFilters.message));
                return;
            } else {
                isFiltering = validScanFilters.isFiltering;
            }

            var gw = g.getGateway();
            if (gw) {
                fulfill(new BluetoothLEScan(self, g, isFiltering, scanOptions));
            }
        });
    });
};

BlueAppWebBluetooth.prototype.requestDevice = function (requestDeviceOptions) {
    var optionalServices;
    var matchedFilter;
    var acceptAllDevices = requestDeviceOptions.acceptAllDevices;
    optionalServices = requestDeviceOptions.optionalServices;
    var filters = [];
    if (requestDeviceOptions.filters && requestDeviceOptions.filters.length > 0) {
        for (var i=0; i<requestDeviceOptions.filters.length; i++){
            filters.push(new filtersLib.BluetoothLEScanFilterInit(requestDeviceOptions.filters[i]));
        }
    }

    var g = this.gateway;

    return util.errorLoggingPromise(function (fulfill, reject) {
        if (g.getGateway()) {
            fulfill(g.getGateway());
        } else {
            g.once('ready', function (gateway) {
                fulfill(gateway);
            });
        }
    }).then(function () {
        return util.errorLoggingPromise(function (fulfill, reject) {
            var timeout = setTimeout(function () {
                if (config.errorCallback) {
                    config.errorCallback({error: 'Timed out'});
                    reject (new DOMException('No devices found.', 'NotFoundError'));
                } else {
                    reject('Timed out');
                }
            }, 30000);

            var validFiltersObj = filterValidation.validateFilters(g, filters, acceptAllDevices, optionalServices);

            var isFiltering;

            if (validFiltersObj.error) {
                reject(new TypeError(validFiltersObj.message));
                return;
            } else {
                isFiltering = validFiltersObj.isFiltering;
            }
            var gw = g.getGateway();

            var options = {
                connectScan: true
            };

            function onScan(peripheral) {
                clearTimeout(timeout);
                var foundPeripheral;
                if (isFiltering) {
                    var filteredDevice = filtersLib.filterScan(g, peripheral, filters);
                    foundPeripheral = filteredDevice.peripheral;
                    matchedFilter = filteredDevice.filter;
                } else {
                    matchedFilter = undefined;
                }
                if (config.returnData) {
                    if (isFiltering) {
                        if (foundPeripheral) {
                            config.returnData({peripheral: foundPeripheral});
                        }
                        // Nothing to return
                    } else {
                        config.returnData({peripheral: peripheral});
                    }
                } else {
                    if (isFiltering) {
                        if (foundPeripheral) {
                            gw.removeListener('scan', onScan);
                            onSelect(foundPeripheral);
                        }
                    } else {
                        onSelect(peripheral);
                    }
                }
            }

            function onSelect(peripheral) {
                gw.stopScan(function () {
                    gw.removeListener('scan', onScan);
                    console.log('Scan stopped');
                    console.log("FOUND", peripheral.name);
                    var dev = new BluetoothDevice(g, peripheral, filtersLib, optionalServices, matchedFilter);
                    matchedFilter = undefined;
                    // dev.gatt = new BluetoothRemoteGATTServer(dev, g, peripheral);
                    // dev.gatt = dev;
                    fulfill(dev);
                });
            }

            function onReject(msg) {
                gw.stopScan(function () {
                    console.log('Scan stopped');
                });
                reject(msg);
            }

            g.on('state', function (bluetoothPower) {
                if (!bluetoothPower) {
                    reject('Bluetooth is off');
                }
            });

            gw.scan(function () {
                if (config.returnData) {
                    config.returnData({select: onSelect, reject: onReject});
                    // scanDialog(onSelect, onReject);
                }
                gw.on('scan', onScan);
            });
        });
    });
};

var BluetoothLEScan = function (btObj, g, isFiltering, scanOptions) {
    var self = this;
    self.active = false;
    self.filters = scanOptions.filters;
    self.keepRepeatedDevices = scanOptions.keepRepeatedDevices;
    self.acceptAllAdvertisements = scanOptions.acceptAllAdvertisements;
    var webBluetoothObj = btObj;
    var gw = g.getGateway();

    function onScan(peripheral) {
        var foundPeripheral;
        if (isFiltering) {
            foundPeripheral = filtersLib.filterScan(g, peripheral, self.filters).peripheral;
        } else {
            foundPeripheral = peripheral;
        }

        if (self.keepRepeatedDevices == false) {
            foundPeripheral = checkForSavedPeripherals(webBluetoothObj.foundDevices, foundPeripheral);
        }

        if (foundPeripheral) {
            foundPeripheral.manufacturerData = util.mfrDataToMap(foundPeripheral);
            webBluetoothObj.foundDevices[foundPeripheral.uuid] = foundPeripheral;
            eventEmitter.emit('advertisementreceived', new advEvents.BluetoothAdvertisingEvent(foundPeripheral));
        }
    }

    gw.scan(function () {
        self.active = true;
        webBluetoothObj.activeScans.push(self);
        gw.on('scan', onScan);
    });

    self.stop = function () {
        gw.stopScan(function () {
            self.active = false;
            var i = webBluetoothObj.activeScans.indexOf(self);
            webBluetoothObj.activeScans.splice(i, 1);
            console.log('Scan stopped');
        });
    }
};

BlueAppWebBluetooth.prototype.addEventListener = function (eventName, cb) {
    eventEmitter.on(eventName, cb);
};

BlueAppWebBluetooth.prototype.removeEventListener = function (eventName, cb) {
    eventEmitter.removeListener(eventName, cb);
};

module.exports.init = function (configObj) {
    if (!configObj) {
        config = {};
    } else {
        config = configObj;
    }

    var g = new GATTIP();
    g.BluetoothUUID = thirdparty.BluetoothUUID;

    var navigator = {};
    navigator.bluetooth = new BlueAppWebBluetooth(g);

    if (config.token) {
        navigator.bluetooth.referringDevice = {dummy: 'this is a dummy device', id: config.deviceUUID};
    }

    navigator.bluetooth.gattip = g;

    g.open(config);

    g.on('error', function (error) {
        console.error("Service Error:", error.message);
        if (error.stack) {
            console.error("Error Stack:", error.stack);
        }
    });

    return {
        navigator: navigator
    };
};

},{"./filter-validation":4,"./thirdparty":6,"./util.js":7,"./wb-advertisement":8,"./wb-device":11,"./wb-filters":13,"./wb-server":14,"events":17,"gatt-ip":"gatt-ip"}],6:[function(require,module,exports){
/**
 *
 Copyright 2014 Google Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.


 This work is a derivative of https://github.com/WebBluetoothCG/chrome-app-polyfill/
 */

var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function canonicalUUID (uuidAlias) {
    uuidAlias >>>= 0;  // Make sure the number is positive and 32 bits.
    var strAlias = "0000000" + uuidAlias.toString(16);
    strAlias = strAlias.substr(-8);
    return strAlias + "-0000-1000-8000-00805f9b34fb"
}

function ResolveUUIDName(tableName) {
    var table = module.exports.BluetoothUUID[tableName];
    return function(name) {
        if(typeof name === "string") {
            name = name.toLowerCase();
        }

        if (typeof name==="number") {
            return canonicalUUID(name);
        } else if (uuidRegex.test(name)) {
            return name;
        } else if (table.hasOwnProperty(name)) {
            return table[name];
        } else {
            return false;
            // throw new NamedError('SyntaxError', '"' + name + '" is not a known '+tableName+' name.');
        }
    }
}

module.exports.BluetoothUUID={};
module.exports.BluetoothUUID.canonicalUUID = canonicalUUID;
module.exports.BluetoothUUID.service = {
    alert_notification: canonicalUUID(0x1811),
    automation_io: canonicalUUID(0x1815),
    battery_service: canonicalUUID(0x180F),
    blood_pressure: canonicalUUID(0x1810),
    body_composition: canonicalUUID(0x181B),
    bond_management: canonicalUUID(0x181E),
    continuous_glucose_monitoring: canonicalUUID(0x181F),
    current_time: canonicalUUID(0x1805),
    cycling_power: canonicalUUID(0x1818),
    cycling_speed_and_cadence: canonicalUUID(0x1816),
    device_information: canonicalUUID(0x180A),
    environmental_sensing: canonicalUUID(0x181A),
    generic_access: canonicalUUID(0x1800),
    generic_attribute: canonicalUUID(0x1801),
    glucose: canonicalUUID(0x1808),
    health_thermometer: canonicalUUID(0x1809),
    heart_rate: canonicalUUID(0x180D),
    human_interface_device: canonicalUUID(0x1812),
    immediate_alert: canonicalUUID(0x1802),
    indoor_positioning: canonicalUUID(0x1821),
    internet_protocol_support: canonicalUUID(0x1820),
    link_loss: canonicalUUID(0x1803 ),
    location_and_navigation: canonicalUUID(0x1819),
    next_dst_change: canonicalUUID(0x1807),
    phone_alert_status: canonicalUUID(0x180E),
    pulse_oximeter: canonicalUUID(0x1822),
    reference_time_update: canonicalUUID(0x1806),
    running_speed_and_cadence: canonicalUUID(0x1814),
    scan_parameters: canonicalUUID(0x1813),
    tx_power: canonicalUUID(0x1804),
    user_data: canonicalUUID(0x181C),
    weight_scale: canonicalUUID(0x181D)
};


module.exports.BluetoothUUID.characteristic = {
    "aerobic_heart_rate_lower_limit": canonicalUUID(0x2A7E),
    "aerobic_heart_rate_upper_limit": canonicalUUID(0x2A84),
    "aerobic_threshold": canonicalUUID(0x2A7F),
    "age": canonicalUUID(0x2A80),
    "aggregate": canonicalUUID(0x2A5A),
    "alert_category_id": canonicalUUID(0x2A43),
    "alert_category_id_bit_mask": canonicalUUID(0x2A42),
    "alert_level": canonicalUUID(0x2A06),
    "alert_notification_control_point": canonicalUUID(0x2A44),
    "alert_status": canonicalUUID(0x2A3F),
    "altitude": canonicalUUID(0x2AB3),
    "anaerobic_heart_rate_lower_limit": canonicalUUID(0x2A81),
    "anaerobic_heart_rate_upper_limit": canonicalUUID(0x2A82),
    "anaerobic_threshold": canonicalUUID(0x2A83),
    "analog": canonicalUUID(0x2A58),
    "apparent_wind_direction": canonicalUUID(0x2A73),
    "apparent_wind_speed": canonicalUUID(0x2A72),
    "gap.appearance": canonicalUUID(0x2A01),
    "barometric_pressure_trend": canonicalUUID(0x2AA3),
    "battery_level": canonicalUUID(0x2A19),
    "blood_pressure_feature": canonicalUUID(0x2A49),
    "blood_pressure_measurement": canonicalUUID(0x2A35),
    "body_composition_feature": canonicalUUID(0x2A9B),
    "body_composition_measurement": canonicalUUID(0x2A9C),
    "body_sensor_location": canonicalUUID(0x2A38),
    "bond_management_control_point": canonicalUUID(0x2AA4),
    "bond_management_feature": canonicalUUID(0x2AA5),
    "boot_keyboard_input_report": canonicalUUID(0x2A22),
    "boot_keyboard_output_report": canonicalUUID(0x2A32),
    "boot_mouse_input_report": canonicalUUID(0x2A33),
    "gap.central_address_resolution_support": canonicalUUID(0x2AA6),
    "cgm_feature": canonicalUUID(0x2AA8),
    "cgm_measurement": canonicalUUID(0x2AA7),
    "cgm_session_run_time": canonicalUUID(0x2AAB),
    "cgm_session_start_time": canonicalUUID(0x2AAA),
    "cgm_specific_ops_control_point": canonicalUUID(0x2AAC),
    "cgm_status": canonicalUUID(0x2AA9),
    "csc_feature": canonicalUUID(0x2A5C),
    "csc_measurement": canonicalUUID(0x2A5B),
    "current_time": canonicalUUID(0x2A2B),
    "cycling_power_control_point": canonicalUUID(0x2A66),
    "cycling_power_feature": canonicalUUID(0x2A65),
    "cycling_power_measurement": canonicalUUID(0x2A63),
    "cycling_power_vector": canonicalUUID(0x2A64),
    "database_change_increment": canonicalUUID(0x2A99),
    "date_of_birth": canonicalUUID(0x2A85),
    "date_of_threshold_assessment": canonicalUUID(0x2A86),
    "date_time": canonicalUUID(0x2A08),
    "day_date_time": canonicalUUID(0x2A0A),
    "day_of_week": canonicalUUID(0x2A09),
    "descriptor_value_changed": canonicalUUID(0x2A7D),
    "gap.device_name": canonicalUUID(0x2A00),
    "dew_point": canonicalUUID(0x2A7B),
    "digital": canonicalUUID(0x2A56),
    "dst_offset": canonicalUUID(0x2A0D),
    "elevation": canonicalUUID(0x2A6C),
    "email_address": canonicalUUID(0x2A87),
    "exact_time_256": canonicalUUID(0x2A0C),
    "fat_burn_heart_rate_lower_limit": canonicalUUID(0x2A88),
    "fat_burn_heart_rate_upper_limit": canonicalUUID(0x2A89),
    "firmware_revision_string": canonicalUUID(0x2A26),
    "first_name": canonicalUUID(0x2A8A),
    "five_zone_heart_rate_limits": canonicalUUID(0x2A8B),
    "floor_number": canonicalUUID(0x2AB2),
    "gender": canonicalUUID(0x2A8C),
    "glucose_feature": canonicalUUID(0x2A51),
    "glucose_measurement": canonicalUUID(0x2A18),
    "glucose_measurement_context": canonicalUUID(0x2A34),
    "gust_factor": canonicalUUID(0x2A74),
    "hardware_revision_string": canonicalUUID(0x2A27),
    "heart_rate_control_point": canonicalUUID(0x2A39),
    "heart_rate_max": canonicalUUID(0x2A8D),
    "heart_rate_measurement": canonicalUUID(0x2A37),
    "heat_index": canonicalUUID(0x2A7A),
    "height": canonicalUUID(0x2A8E),
    "hid_control_point": canonicalUUID(0x2A4C),
    "hid_information": canonicalUUID(0x2A4A),
    "hip_circumference": canonicalUUID(0x2A8F),
    "humidity": canonicalUUID(0x2A6F),
    "ieee_11073-20601_regulatory_certification_data_list": canonicalUUID(0x2A2A),
    "indoor_positioning_configuration": canonicalUUID(0x2AAD),
    "intermediate_blood_pressure": canonicalUUID(0x2A36),
    "intermediate_temperature": canonicalUUID(0x2A1E),
    "irradiance": canonicalUUID(0x2A77),
    "language": canonicalUUID(0x2AA2),
    "last_name": canonicalUUID(0x2A90),
    "latitude": canonicalUUID(0x2AAE),
    "ln_control_point": canonicalUUID(0x2A6B),
    "ln_feature": canonicalUUID(0x2A6A),
    "local_east_coordinate.xml": canonicalUUID(0x2AB1),
    "local_north_coordinate": canonicalUUID(0x2AB0),
    "local_time_information": canonicalUUID(0x2A0F),
    "location_and_speed": canonicalUUID(0x2A67),
    "location_name": canonicalUUID(0x2AB5),
    "longitude": canonicalUUID(0x2AAF),
    "magnetic_declination": canonicalUUID(0x2A2C),
    "magnetic_flux_density_2D": canonicalUUID(0x2AA0),
    "magnetic_flux_density_3D": canonicalUUID(0x2AA1),
    "manufacturer_name_string": canonicalUUID(0x2A29),
    "maximum_recommended_heart_rate": canonicalUUID(0x2A91),
    "measurement_interval": canonicalUUID(0x2A21),
    "model_number_string": canonicalUUID(0x2A24),
    "navigation": canonicalUUID(0x2A68),
    "new_alert": canonicalUUID(0x2A46),
    "gap.peripheral_preferred_connection_parameters": canonicalUUID(0x2A04),
    "gap.peripheral_privacy_flag": canonicalUUID(0x2A02),
    "plx_continuous_measurement": canonicalUUID(0x2A5F),
    "plx_features": canonicalUUID(0x2A60),
    "plx_spot_check_measurement": canonicalUUID(0x2A5E),
    "pnp_id": canonicalUUID(0x2A50),
    "pollen_concentration": canonicalUUID(0x2A75),
    "position_quality": canonicalUUID(0x2A69),
    "pressure": canonicalUUID(0x2A6D),
    "protocol_mode": canonicalUUID(0x2A4E),
    "rainfall": canonicalUUID(0x2A78),
    "gap.reconnection_address": canonicalUUID(0x2A03),
    "record_access_control_point": canonicalUUID(0x2A52),
    "reference_time_information": canonicalUUID(0x2A14),
    "report": canonicalUUID(0x2A4D),
    "report_map": canonicalUUID(0x2A4B),
    "resting_heart_rate": canonicalUUID(0x2A92),
    "ringer_control_point": canonicalUUID(0x2A40),
    "ringer_setting": canonicalUUID(0x2A41),
    "rsc_feature": canonicalUUID(0x2A54),
    "rsc_measurement": canonicalUUID(0x2A53),
    "sc_control_point": canonicalUUID(0x2A55),
    "scan_interval_window": canonicalUUID(0x2A4F),
    "scan_refresh": canonicalUUID(0x2A31),
    "sensor_location": canonicalUUID(0x2A5D),
    "serial_number_string": canonicalUUID(0x2A25),
    "gatt.service_changed": canonicalUUID(0x2A05),
    "software_revision_string": canonicalUUID(0x2A28),
    "sport_type_for_aerobic_and_anaerobic_thresholds": canonicalUUID(0x2A93),
    "supported_new_alert_category": canonicalUUID(0x2A47),
    "supported_unread_alert_category": canonicalUUID(0x2A48),
    "system_id": canonicalUUID(0x2A23),
    "temperature": canonicalUUID(0x2A6E),
    "temperature_measurement": canonicalUUID(0x2A1C),
    "temperature_type": canonicalUUID(0x2A1D),
    "three_zone_heart_rate_limits": canonicalUUID(0x2A94),
    "time_accuracy": canonicalUUID(0x2A12),
    "time_source": canonicalUUID(0x2A13),
    "time_update_control_point": canonicalUUID(0x2A16),
    "time_update_state": canonicalUUID(0x2A17),
    "time_with_dst": canonicalUUID(0x2A11),
    "time_zone": canonicalUUID(0x2A0E),
    "true_wind_direction": canonicalUUID(0x2A71),
    "true_wind_speed": canonicalUUID(0x2A70),
    "two_zone_heart_rate_limit": canonicalUUID(0x2A95),
    "tx_power_level": canonicalUUID(0x2A07),
    "uncertainty": canonicalUUID(0x2AB4),
    "unread_alert_status": canonicalUUID(0x2A45),
    "user_control_point": canonicalUUID(0x2A9F),
    "user_index": canonicalUUID(0x2A9A),
    "uv_index": canonicalUUID(0x2A76),
    "vo2_max": canonicalUUID(0x2A96),
    "waist_circumference": canonicalUUID(0x2A97),
    "weight": canonicalUUID(0x2A98),
    "weight_measurement": canonicalUUID(0x2A9D),
    "weight_scale_feature": canonicalUUID(0x2A9E),
    "wind_chill": canonicalUUID(0x2A79)
};

module.exports.BluetoothUUID.descriptor = {
    "gatt.characteristic_extended_properties": canonicalUUID(0x2900),
    "gatt.characteristic_user_description": canonicalUUID(0x2901),
    "gatt.client_characteristic_configuration": canonicalUUID(0x2902),
    "gatt.server_characteristic_configuration": canonicalUUID(0x2903),
    "gatt.characteristic_presentation_format": canonicalUUID(0x2904),
    "gatt.characteristic_aggregate_format": canonicalUUID(0x2905),
    "valid_range": canonicalUUID(0x2906),
    "external_report_reference": canonicalUUID(0x2907),
    "report_reference": canonicalUUID(0x2908),
    "value_trigger_setting": canonicalUUID(0x290A),
    "es_configuration": canonicalUUID(0x290B),
    "es_measurement": canonicalUUID(0x290C),
    "es_trigger_setting": canonicalUUID(0x290D)
};

module.exports.BluetoothUUID.getService = ResolveUUIDName('service');
module.exports.BluetoothUUID.getCharacteristic = ResolveUUIDName('characteristic');
module.exports.BluetoothUUID.getDescriptor = ResolveUUIDName('descriptor');

},{}],7:[function(require,module,exports){
var SHORT_UUID_SUFFFIX = '-0000-1000-8000-00805F9B34FB';
function toShortUUID(uuidStr) {
    if (uuidStr.indexOf(SHORT_UUID_SUFFFIX) == 8) {
        if (uuidStr.indexOf('0000') == 0) {
            return uuidStr.substring(4, 8);
        } else {
            return uuidStr.substring(0, 8);
        }
    } else {
        return uuidStr;
    }
}
module.exports.toVensiUUID = function (uuid) {
    switch (typeof uuid) {
        case 'string':
            return toShortUUID(uuid.toUpperCase());
            break;
        case 'number':
            return Number(uuid).toString(16).toUpperCase();
            break;
        default:
            console.warn('Unable to convert uuid ' + uuid + ' to hex string');
            return undefined;
    }
};

module.exports.toWbUUID = function (uuid) {
    if (uuid) {
        uuid = uuid.toLowerCase();
    }
    return uuid;
};

module.exports.hexAsArray = function (hex) {
    var bytes = [];
    if (hex.length % 2 == 1) {
        hex = "0" + hex;
    }
    for (var i = 0; i < hex.length - 1; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
};

module.exports.arrayAsHex = function (array) {
    var ret = '';
    for (var i in array) {
        byte = array[i];
        var value = (byte & 0xFF).toString(16);
        if (value.length == 1) {
            value = '0' + value;
        }
        ret += value;
    }
    return ret.toUpperCase();
};

module.exports.isHex = function (h) {
    var validRegEx = /^[A-Fa-f0-9-x]+$/;
    return h.toString().match(validRegEx) != null;
};

module.exports.isLowercase = function (str) {
    return str.toLowerCase() == str;
};

module.exports.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)){
            return false;
        }
    }
    return true;
};

module.exports.stringIsInteger = function (value) {
    var number = parseInt(value);
    var string = number.toString();
    return value === string;
};

module.exports.uintArrayToString = function(uintArray) {
    var stringFromUintArray = uintArray.toString();
    var arrayFromString = stringFromUintArray.split(',');
    for (var i=0; i<arrayFromString.length; i++){
        if(arrayFromString[i].length == 1){
            arrayFromString[i] = '0'+arrayFromString[i];
        }
    }
    return arrayFromString.join('');
};

module.exports.uncaughtError = function (error) {
    console.error("Uncaught error:", error, error.stack);
};

module.exports.gattIpRequestPromise = function (func) {
    return new Promise(function (fulfill, reject) {
        try {
            func(fulfill, reject);
        } catch (error) {
            module.exports.uncaughtError(error);
            throw error;
        }
    });
};

module.exports.errorLoggingPromise = function (func) {
    return new Promise(function (fulfill, reject) {
        try {
            func(fulfill, reject);
        } catch (error) {
            module.exports.uncaughtError(error);
            throw error;
        }
    });
};

module.exports.mfrDataToMap = function (peripheral) {
    var manufacturerData = new Map();
    var allMfrData = peripheral.getAllMfrData();

    for (var key in allMfrData) {
        if (allMfrData.hasOwnProperty(key)) {
            var arr = module.exports.hexAsArray(allMfrData[key]);
            var dView = new DataView(new Uint8Array(arr).buffer);
            manufacturerData.set(key, dView);
        }
    }
    return manufacturerData;
};

module.exports.getUTF8Length = function(string) {
    var utf8length = 0;
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utf8length++;
        }
        else if((c > 127) && (c < 2048)) {
            utf8length = utf8length+2;
        }
        else {
            utf8length = utf8length+3;
        }
    }
    return utf8length;
};

module.exports.removeNotificationListeners = function(peripheral) {
    var services = peripheral.getAllServices();
    for (var sUUID in services) {
        var characteristics = services[sUUID].getAllCharacteristics();
        for (var cUUID in characteristics) {
            if (characteristics[cUUID].wbCharacteristic) {
                console.log('removing the listeners for characteristic :' + cUUID);
                characteristics[cUUID].wbCharacteristic.removeAllListeners();
            }
        }
    }
};
},{}],8:[function(require,module,exports){
"use strict";
var util = require('./util.js');

var BluetoothAdvertisingEvent = function(peripheral) {
    var self = this;
    Object.defineProperty(self, "device", {
        get: function () {
            return peripheral;
        }
    });
    Object.defineProperty(self, "uuids", {
        get: function () {
            return peripheral.serviceUUIDs;
        }
    });
    Object.defineProperty(self, "name", {
        get: function () {
            return peripheral.name;
        }
    });
    Object.defineProperty(self, "appearance", {
        get: function () {
            return undefined;
        }
    });
    Object.defineProperty(self, "txPower", {
        get: function () {
            return peripheral.txPowerLevel;
        }
    });
    Object.defineProperty(self, "rssi", {
        get: function () {
            return peripheral.rssi;
        }
    });
    Object.defineProperty(self, "manufacturerData", {
        get: function () {
            return util.mfrDataToMap(peripheral);
        }
    });
    Object.defineProperty(self, "serviceData", {
        get: function () {
            return undefined;
        }
    });
    
    return self;
};

var Advertisement = function (_gattIp, device) {
    var self = this;
    var gw = _gattIp.getGateway();
    var onScan = function (peripheral) {
        if(peripheral.uuid = device.id ){
            device.emit('advertisementreceived', new BluetoothAdvertisingEvent(peripheral));
        }
    };

    self.watchAdv = function () {
        device.watchingAdvertisements = true;
        return util.errorLoggingPromise(function (fulfill, reject) {
            gw.scan(function () {
                gw.on('scan', onScan);
                fulfill(undefined);
            });
        });
    };

    self.unwatchAdv = function () {
        gw.stopScan(function () {
            gw.removeListener('scan', onScan);
            console.log('scan stopped');
        });
        device.watchingAdvertisements = false;
    };
};

module.exports.Advertisement = Advertisement;
// module.exports.BluetoothAdvertisingEvent = BluetoothAdvertisingEvent;
},{"./util.js":7}],9:[function(require,module,exports){
var util = require('./util.js');
var ee = require('./event-emitter');
var BluetoothRemoteGATTDescriptor = require('./wb-descriptor').BluetoothRemoteGATTDescriptor;

var WB_PROPERTIES = ['broadcast', 'read', 'writeWithoutResponse', 'write', 'notify', 'indicate', 'authenticatedSignedWrites', 'reliableWrite', 'writableAuxiliaries'];

function BluetoothRemoteGATTCharacteristic(webBluetoothService, gattip, gattipCharacteristic) {
    ee.instantiateEmitter(this);
    var self = this;

    function onCharChanged(char, value) {
        var arr = util.hexAsArray(value);
        _value = new DataView(new Uint8Array(arr).buffer);
        self.emit('characteristicvaluechanged', {target: self});
    }

    var _gattIp = gattip;
    var _service = webBluetoothService;
    var _gattipCharacteristic = gattipCharacteristic;
    gattipCharacteristic.wbCharacteristic = this;
    var _properties = new BluetoothCharacteristicProperties(_gattipCharacteristic.allProperties());
    var _value = null;

    Object.defineProperty(this, "uuid", {
        get: function () {
            return util.toWbUUID(_gattipCharacteristic.uuid)
        }
    });
    Object.defineProperty(this, "service", {
        get: function () {
            return _service
        }
    });
    Object.defineProperty(this, "properties", {
        get: function () {
            return _properties
        }
    });
    Object.defineProperty(this, "value", {
        get: function () {
            return _value
        }
    });

    this.getDescriptors = function (descriptorUuid) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            var descriptors = _gattipCharacteristic.getAllDescriptors();
            var descriptorsArray = Object.values(descriptors);
            if (descriptorUuid) {
                var convertedUuid = util.toVensiUUID(_gattIp.BluetoothUUID.getDescriptor(descriptorUuid));
                if (descriptorsArray.indexOf(convertedUuid) > -1) {
                    fulfill([new BluetoothRemoteGATTDescriptor(self, _gattIp, convertedUuid)]);
                } else {
                    reject("Unable to find descriptor with requested UUID " + descriptorUuid);
                }
            } else {
                var responseArray = [];
                for (var i = 0; i < descriptorsArray.length; i++) {
                    responseArray.push(new BluetoothRemoteGATTDescriptor(self, _gattIp, descriptorsArray[i]));
                }
                fulfill(responseArray);
            }
        });
    };

    this.getDescriptor = function (descriptorUuid) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            var vensiUuid = util.toVensiUUID(_gattIp.BluetoothUUID.getDescriptor(descriptorUuid));
            if ('undefined' == typeof vensiUuid) {
                reject("Unable to find descriptor with requested UUID " + descriptorUuid)
            } else {
                var desc = _gattipCharacteristic.findDescriptor(vensiUuid);
                if (desc) {
                    fulfill(new BluetoothRemoteGATTDescriptor(self, _gattIp, desc));
                } else {
                    reject("Descriptor " + descriptorUuid + " not found");
                }
            }
        });
    };

    this.readValue = function () {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            _gattipCharacteristic.readValue({
                fulfill: function (desc, value) {
                    var arr = util.hexAsArray(value);
                    fulfill(new DataView(new Uint8Array(arr).buffer));
                },
                reject: reject
            });
        });
    };

    this.writeValue = function (newValue) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            _gattipCharacteristic.writeValue({
                    fulfill: fulfill,
                    reject: reject
                },
                util.arrayAsHex(Array.prototype.slice.call(newValue))
            )
        });
    };

    this.startNotifications = function () {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            if (self._isNotifying) {
                reject("Already notifying");
                return;
            }
            _gattipCharacteristic.enableNotifications({
                    fulfill: function (char, isNotifying) {
                        if (isNotifying) {
                            self._isNotifying = true;
                            char.on('valueChange', onCharChanged);
                            fulfill(self);
                        } else {
                            reject("Did not receive expected response from the gateway");
                        }
                    },
                    reject: reject
                },
                true
            )
        });
    };

    this.stopNotifications = function () {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            if (!self._isNotifying) {
                reject("Was not notifying");
                return;
            }
            _gattipCharacteristic.enableNotifications({
                    fulfill: function (char, isNotifying) {
                        if (!isNotifying) {
                            self._isNotifying = false;
                            char.removeListener('valueChange', onCharChanged);
                            fulfill(self);
                        } else {
                            reject("Did not receive expected response from the gateway");
                        }
                    },
                    reject: reject
                },
                false
            )
        });
    };

    this.addEventListener = function (eventName, cb) {
        this.on(eventName, cb);
    };

    this.removeEventListener = function (eventName, cb) {
        this.removeListener(eventName, cb);
    };

}
module.exports.BluetoothRemoteGATTCharacteristic = BluetoothRemoteGATTCharacteristic;
ee.makeEmitter(BluetoothRemoteGATTCharacteristic);

function BluetoothCharacteristicProperties(gattIpProperties) {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // TODO: Implement WB spec 5.4.1. What to do about differences like missing reliableWrite or writableAuxiliaries, or the missing  NotifyEncryptionRequired etc.
    for (var i in WB_PROPERTIES) {
        wbPropName = WB_PROPERTIES[i];
        var gattIpPropName = capitalizeFirstLetter(wbPropName);
        if ('object' == typeof gattIpProperties[gattIpPropName]) {
            //noinspection JSUnfilteredForInLoop
            this[wbPropName] = (gattIpProperties[gattIpPropName].enabled == 1);
        } else if (wbPropName == 'reliableWrite' || wbPropName == 'writableAuxiliaries') {
            if (gattIpProperties['ExtendedProperties'] && (1 === gattIpProperties['ExtendedProperties'].enabled)) {
                console.error('WB spec 5.4.1 section not fully implemented.');
                //noinspection JSUnfilteredForInLoop
                this[wbPropName] = false;
            } else {
                //noinspection JSUnfilteredForInLoop
                this[wbPropName] = false;
            }
        }
    }
}




},{"./event-emitter":2,"./util.js":7,"./wb-descriptor":10}],10:[function(require,module,exports){
var util = require('./util');

function BluetoothRemoteGATTDescriptor(webBluetoothCharacteristic, gattIp, gattIpDescriptor) {
    var self = this;
    var _gattIp = gattIp;
    var _characteristic = webBluetoothCharacteristic;
    var _gattIpDescriptor = gattIpDescriptor;
    var _value = null;
// }

// BluetoothRemoteGATTDescriptor.prototype = {

    Object.defineProperty(self, "uuid", {
        get: function () {
            return util.toWbUUID(_gattIpDescriptor.uuid);
        }
    });

    Object.defineProperty(self, "characteristic", {
        get: function () {
            return _characteristic;
        }
    });

    Object.defineProperty(self, "value", {
        get: function () {
            return _value;
        }
    });

    // get uuid() {
    //     return util.toWbUUID(_gattIpDescriptor.uuid);
    // },
    // get characteristic() {
    //     return this._characteristic;
    // },
    // get value() {
    //     return this._value;
    // },
    var readValue = function () {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            _gattIpDescriptor.readValue({
                fulfill: function (desc, value) {
                    var arr = util.hexAsArray(value);
                    fulfill(new DataView(new Uint8Array(arr).buffer));
                },
                reject: reject
            });
        });
    };
    
    var writeValue = function (newValue) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            _gattIpDescriptor.writeValue({
                    fulfill: fulfill,
                    reject: reject
                },
                util.arrayAsHex(Array.prototype.slice.call(newValue))
            )
        });
    }
}

module.exports.BluetoothRemoteGATTDescriptor = BluetoothRemoteGATTDescriptor;

},{"./util":7}],11:[function(require,module,exports){
var util = require('./util.js');
var ee = require('./event-emitter');
var BluetoothRemoteGATTServer = require('./wb-server').BluetoothRemoteGATTServer;
var Advertisement = require('./wb-advertisement').Advertisement;

function BluetoothDevice(gattIp, gattIpPeripheral, filtersLib, optionalServices, filter) {
    ee.instantiateEmitter(this);

    var self = this;
    var _gattIp = gattIp;
    var _gattIpPeripheral = gattIpPeripheral;
    var advertisementObject = new Advertisement(_gattIp, this);
    self.gatt = new BluetoothRemoteGATTServer(self, gattIp, gattIpPeripheral, filtersLib, optionalServices, filter);
    self.watchAdvertisements = false;

    self.addEventListener = function (eventName, cb) {
        this.on(eventName, cb);
    };

    self.removeEventListener = function (eventName, cb) {
        this.removeListener(eventName, cb);
    };
    
    function onDisconnected(peripheral) {
        self.gatt.connected = false;
        util.removeNotificationListeners(peripheral);
        self.emit('gattserverdisconnected', {target: self});
    }
    
    _gattIpPeripheral.once('disconnected', onDisconnected);

    Object.defineProperty(this, "name", {
        get: function () {
            return _gattIpPeripheral.name;
        }
    });
    Object.defineProperty(this, "id", {
        get: function () {
            return _gattIpPeripheral.uuid;
        }
    });
    
    self.watchAdvertisements = advertisementObject.watchAdv;
    self.unwatchAdvertisements = advertisementObject.unwatchAdv;
}

module.exports.BluetoothDevice = BluetoothDevice;
ee.makeEmitter(BluetoothDevice);
},{"./event-emitter":2,"./util.js":7,"./wb-advertisement":8,"./wb-server":14}],12:[function(require,module,exports){
var errorMessages = {
    INVALID_OPTIONS_ERROR_MESSAGE: "Either 'filters' should be present or 'acceptAllDevices' should be true, but not both.",
    INVALID_LESCAN_OPTIONS_ERROR_MESSAGE: "Either 'filters' should be present or 'acceptAllAdvertisements' should be true, but not both.",
    EMPTY_FILTER_ERROR_MESSAGE: "'filters' member must be non-empty to find any devices.",
    INVALID_MFR_DATA_FORMAT: 'Invalid manufacturerData format',
    INVALID_SERVICE_DATA_FORMAT: 'Invalid serviceData format',
    INVALID_NAME_ERROR_MESSAGE: 'Invalid name format',
    INVALID_NAME_PREFIX_ERROR_MESSAGE: 'Invalid name prefix'
};


module.exports.invalidServiceUUIDMessage = function (uuid) {
    return "Invalid Service name: '" + uuid + "'. It must be a valid UUID alias (e.g. 0x1234), UUID (lowercase hex characters e.g. '00001234-0000-1000-8000-00805f9b34fb'), or recognized standard name from https://www.bluetooth.com/specifications/gatt/services e.g. 'alert_notification'.";
};

module.exports.errors = errorMessages;
},{}],13:[function(require,module,exports){
var util = require('./util');
var filterUtil = require('./filter-util');

function commonServices(gattip, passedUUIDs, allUUIDs) {
    var services = [];
    for (var i = 0; i < allUUIDs.length; i++) {
        var currentFromAllUUIDs = util.toVensiUUID(gattip.BluetoothUUID.getService(allUUIDs[i]));
        for (var j = 0; j < passedUUIDs.length; j++) {
            var currentFromPassedUUIDs = util.toVensiUUID(gattip.BluetoothUUID.getService(passedUUIDs[j]));
            if ((currentFromAllUUIDs == currentFromPassedUUIDs) && services.indexOf(currentFromPassedUUIDs) == -1) {
                services.push(currentFromPassedUUIDs);
            }
        }
    }
    return services;
}

var getFilteredServices = function (gattip, allServiceUUIDs, filter) {
    if (filter.hasOwnProperty('services')) {
        return commonServices(gattip, filter.services, allServiceUUIDs);
    } else {
        return [];
    }
};

module.exports.getOptionalServices = function (gattip, allServicesUUIDs, optionalServices) {
    if (optionalServices && optionalServices.length > 0) {
        return commonServices(gattip, optionalServices, allServicesUUIDs)
    } else {
        return [];
    }
};

module.exports.getAllSupportedServices = function (gattip, allServices, filter, optionalServices) {
    var supportedServices = [];
    var supportedFilter = getFilteredServices(gattip, allServices, filter);
    var supportedOptional = module.exports.getOptionalServices(allServices, optionalServices);
    supportedServices = supportedFilter.concat(supportedOptional);
    return supportedServices;
};

module.exports.filterScan = function (gattip, peripheral, filters) {
    if (peripheral.advdata && peripheral.advdata.serviceUUIDs.length > 0) {
        peripheral.serviceUUIDs = peripheral.advdata.serviceUUIDs;
    } else {
        peripheral.serviceUUIDs = peripheral.getAllAdvertisedServiceUUIDs();
    }

    // Checking filters
    for (var i = 0; i < filters.length; i++) {
        var nameMatch = filterUtil.nameFilter(filters[i], peripheral);
        var prefixMatch = filterUtil.namePrefixFilter(filters[i], peripheral);
        var servicesMatch = filterUtil.servicesFilter(gattip, filters[i], peripheral);
        var manufacturerDataMatch = filterUtil.manufacturerDataFilter(filters[i], peripheral);
        var serviceDataMatch = filterUtil.serviceDataFilter(filters[i], peripheral);
        if (nameMatch && prefixMatch && servicesMatch && manufacturerDataMatch && serviceDataMatch) {
            return {peripheral: peripheral, filter: filters[i]};
        }
    }
    return false;
};

module.exports.BluetoothLEScanFilterInit = function (filters) {
    var self = this;
    self.services = undefined;
    self.name = undefined;
    self.namePrefix = undefined;
    self.manufacturerData = undefined;
    self.serviceData = undefined;

    for(var i in filters){
        if (filters.hasOwnProperty(i)) {
            if(i in self) {
                self[i] = filters[i];
            } else {
                throw new Error('Illegal filter property');
            }
        }
    }
    return this;
};
},{"./filter-util":3,"./util":7}],14:[function(require,module,exports){
var util = require('./util.js');
var BluetoothRemoteGATTService = require('./wb-service').BluetoothRemoteGATTService;
var ee = require('./event-emitter');

function BluetoothRemoteGATTServer(device, gattIp, gattIpPeripheral, filtersLib, optionalServices, filter) {
    ee.instantiateEmitter(this);

    var self = this;
    self.device = device;
    self.connected = false;
    var _gattIp = gattIp;
    var _gattIpPeripheral = gattIpPeripheral;

    self.connect = function () {
        var self = this;
        return new Promise(function (fulfill, reject) {
            _gattIpPeripheral.connect({
                    fulfill: function (peripheral) {
                        // console.error("Hack alert:  _gattIpPeripheral reset");
                        _gattIpPeripheral = peripheral;
                        self.connected = true;
                        fulfill(self);
                    },
                    reject: reject
                }
            )
        });
    };

    self.disconnect = function () {
        var self = this;
        if (self.connected) {
            _gattIpPeripheral.disconnect(
                function (peripheral) {
                    self.device.emit('gattserverdisconnected', {target: self});
                    util.removeNotificationListeners(peripheral);
                    self.device = null;
                    self.connected = false;
                }
            );
        }
    };

    function getPeripheralSupportedServices() {
        var allServicesObj = _gattIpPeripheral.getAllServices();
        var allServicesArray = Object.keys(allServicesObj);
        for (var i = 0; i < allServicesArray.length; i++) {
            if (typeof allServicesArray[i] == 'string' && allServicesArray[i].length == 4) {
                allServicesArray[i] = parseInt(allServicesArray[i], 16);
            }
        }
        if (filter) {
            return filtersLib.getAllSupportedServices(_gattIp, allServicesArray, filter, optionalServices);
        } else {
            return filtersLib.getOptionalServices(_gattIp, allServicesArray, optionalServices);
        }
    }

    function getAllServices(serviceUuid) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            var supportedServices = getPeripheralSupportedServices();
            if (serviceUuid) {
                var vensiUuid = util.toVensiUUID(_gattIp.BluetoothUUID.getService(serviceUuid));
                if (supportedServices.indexOf(vensiUuid) > -1) {
                    fulfill([new BluetoothRemoteGATTService(self.device, _gattIp, vensiUuid)]);
                } else {
                    reject("Service " + serviceUuid + " not found");
                }
            } else {
                var servicesArray = [];
                for (var i = 0; i < supportedServices.length; i++) {
                    servicesArray.push(new BluetoothRemoteGATTService(self.device, _gattIp, supportedServices[i]));
                }
                fulfill(servicesArray);
            }
        });
    }
    
    var getSvi = function () {
        return getPeripheralSupportedServices();
    };

    function getService(serviceUuid) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            var vensiUuid = util.toVensiUUID(_gattIp.BluetoothUUID.getService(serviceUuid));
            if (getPeripheralSupportedServices().indexOf(vensiUuid) != -1) {
                if ('undefined' == typeof vensiUuid) {
                    reject("Unable to find service with requested UUID " + serviceUuid)
                } else {
                    var svc = _gattIpPeripheral.findService(vensiUuid);
                    if (svc) {
                        fulfill(new BluetoothRemoteGATTService(self.device, _gattIp, svc));
                    } else {
                        svc = _gattIpPeripheral.findService(serviceUuid);
                        if (svc) {
                            console.error("Hack alert: Fix VensiUUID ");
                            fulfill(new BluetoothRemoteGATTService(self.device, _gattIp, svc));
                        } else {
                            reject("Service " + serviceUuid + " not found");
                        }
                    }
                }
            } else {
                reject('Service not supported');
            }
        });
    }

    self.getPrimaryService = getService;
    self.getPrimaryServices = getAllServices;
    self.getSvi = getSvi;
}
module.exports.BluetoothRemoteGATTServer = BluetoothRemoteGATTServer;

ee.makeEmitter(BluetoothRemoteGATTServer);
},{"./event-emitter":2,"./util.js":7,"./wb-service":15}],15:[function(require,module,exports){
var util = require('./util.js');
var BluetoothRemoteGATTCharacteristic = require('./wb-characteristic').BluetoothRemoteGATTCharacteristic;

function BluetoothRemoteGATTService(device, gattIp, gattipService) {
    var self = this;
    var _gattIp = gattIp;
    var _device = device;
    var _gattIpService = gattipService;

    Object.defineProperty(self, "uuid", {
        get: function () {
            return util.toWbUUID(_gattIpService.uuid);
        }
    });

    Object.defineProperty(self, "isPrimary", {
        get: function () {
            // TODO: Implement included services
            return true;
        }
    });

    Object.defineProperty(self, "device", {
        get: function () {
            return self._device;
        }
    });

    self.getCharacteristic = function (characteristicUuid) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            var vensiUuid = util.toVensiUUID(_gattIp.BluetoothUUID.getCharacteristic(characteristicUuid));
            if ('undefined' == typeof vensiUuid) {
                reject("Unable to find characteristic with requested UUID " + characteristicUuid)
            } else {
                // TODO: Implement the object instantiation
                var char = _gattIpService.findCharacteristic(vensiUuid);
                if (char) {
                    fulfill(new BluetoothRemoteGATTCharacteristic(self, _gattIp, char));
                } else {
                    char = _gattIpService.findCharacteristic(characteristicUuid);
                    if (char) {
                        console.error("Hack alert: Fix VensiUUID ");
                        fulfill(new BluetoothRemoteGATTCharacteristic(self, _gattIp, char));
                    } else {
                        reject("Characteristic " + characteristicUuid + " not found");
                    }
                }
            }
        });
    };

    self.getCharacteristics = function (characteristicUuid) {
        var self = this;
        return util.errorLoggingPromise(function (fulfill, reject) {
            var allCharacteristicObj = _gattIpService.getAllCharacteristics();
            var allCharacteristicsArray = Object.values(allCharacteristicObj);
            if(characteristicUuid) {
                var vensiUuid = util.toVensiUUID(_gattIp.BluetoothUUID.getService(characteristicUuid));
                var char = _gattIpService.findCharacteristic(vensiUuid);
                if(char){
                    fulfill([new BluetoothRemoteGATTCharacteristic(self, _gattIp, char)]);
                } else {
                    reject("Characteristic " + characteristicUuid + " not found");
                }
            } else {
                var characteristicArray = [];
                for(var i=0; i<allCharacteristicsArray.length; i++){
                    characteristicArray.push(new BluetoothRemoteGATTCharacteristic(self, _gattIp, allCharacteristicsArray[i]));
                }
                fulfill(characteristicArray);
            }
        });
    };

    self.getIncludedService = function (serviceUuid) {
        return util.errorLoggingPromise(function (fulfill, reject) {
            // TODO
            reject("Not implemented");
        });
    };
}

module.exports.BluetoothRemoteGATTService = BluetoothRemoteGATTService;

},{"./util.js":7,"./wb-characteristic":9}],16:[function(require,module,exports){

},{}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],18:[function(require,module,exports){
var C = require("./lib/constants.js").C;
var helper = require('./lib/message-helper');
var ee = require("./lib/event-emitter");
var Descriptor = require("./descriptor").Descriptor;

// TODO: Errors if not connected
function Characteristic(service, uuid, props) {
    ee.instantiateEmitter(this);
    var self = this;
    var peripheral = service.peripheral();
    var gattip = peripheral.gattip();
    var descriptors = {};
    var properties = {};

    helper.requireUUID('Characteristic', 'uuid', uuid);
    this.uuid = uuid;
    if (!props) {
        props = {};
    }
    properties = props;
    this.type = 'c';

    //this.value = undefined;
    this.isNotifying = false;

    this.gattip = function () {
        return gattip;
    };
    this.peripheral = function () {
        return peripheral;
    };
    this.service = function () {
        return service;
    };
    this.getAllDescriptors = function () {
        return descriptors;
    };
    this.findDescriptor = function (uuid) {
        return descriptors[uuid];
    };
    this.addDescriptorWithUUID = function (descriptorUUID) {
        var descriptor = new Descriptor(self, descriptorUUID);
        return descriptors[descriptorUUID] = descriptor;
    };
    this.addDescriptor = function (descriptor) {
        return descriptors[descriptor.uuid] = descriptor;
    };
    // TODO: Explain properties
    this.hasProperty = function (type) {
        return (properties[type] && properties[type].enabled);
    };
    this.setProperty = function (type, value) {
        return (properties[type] = value);
    };
    this.allProperties = function () {
        return properties;
    };


    // REQUESTS =================================================

    this.readValue = function (callback) {
        var params = helper.populateParams(self);
        gattip.request(C.kGetCharacteristicValue, params, callback, function (params) {
            helper.requireFields('Value', params, [C.kValue], []);
            self.value = params[C.kValue];
            gattip.fulfill(callback, self, self.value);
        });
    };

    this.writeValue = function (callback, value) {
        helper.requireHexValue('writeValue', 'value', value);
        var params = helper.populateParams(self);
        params[C.kValue] = value;
        gattip.request(C.kWriteCharacteristicValue, params, callback, function (params) {
            self.value = value;
            gattip.fulfill(callback, self);
        });
    };

    this.enableNotifications = function (callback, isNotifying) {
        helper.requireBooleanValue('enableNotifications', 'isNotifying', isNotifying);
        var params = helper.populateParams(self);
        params[C.kIsNotifying] = isNotifying;
        gattip.request(C.kSetValueNotification, params, callback, function (params) {
            self.isNotifying = isNotifying;
            gattip.fulfill(callback, self, isNotifying);
        });
    };


    // INDICATIONS ==============================================

    this.handleValueNotification = function (params) {
        self.value = params[C.kValue];
        self.emit('valueChange', self, self.value);
    };


    // SERVER RESPONSES/INDICATIONS  ============================

    this.respondToReadRequest = function (cookie, value) {
        helper.requireHexValue('respondToReadRequest', 'value', value);
        var params = helper.populateParams(self);
        params[C.kValue] = value;
        cookie.result = C.kGetCharacteristicValue;
        gattip.respond(cookie, params);
    };

    this.respondToWriteRequest = function (cookie) {
        var params = helper.populateParams(self);
        cookie.result = C.kWriteCharacteristicValue;
        gattip.respond(cookie, params);
    };

    this.respondToChangeNotification = function (cookie, isNotifying) {
        var params = helper.populateParams(self);
        helper.requireBooleanValue('respondToChangeNotification', 'value', isNotifying);
        params[C.kIsNotifying] = isNotifying;
        this.isNotifying = isNotifying;
        cookie.result = C.kSetValueNotification;
        gattip.respond(cookie, params);
    };

    this.indicateValueChange = function (value) {
        helper.requireHexValue('writeValue', 'value', value);
        var params = helper.populateParams(self);
        params[C.kValue] = value;
        gattip.sendIndications(C.kSetValueNotification, params);
    };

}
ee.makeEmitter(Characteristic);

module.exports.Characteristic = Characteristic;

},{"./descriptor":19,"./lib/constants.js":23,"./lib/event-emitter":24,"./lib/message-helper":27}],19:[function(require,module,exports){
var C = require("./lib/constants.js").C;
var helper = require('./lib/message-helper');

// TODO: Errors if not connected
function Descriptor(characteristic, uuid) {
    var self = this;
    var service = characteristic.service();
    var peripheral = service.peripheral();
    var gattip = peripheral.gattip();

    helper.requireUUID('Descriptor', 'uuid', uuid);
    this.uuid = uuid;
    this.type = 'd';

    //this.value = undefined;
    this.characteristic = function () {
        return characteristic;
    };
    this.service = function () {
        return service;
    };
    this.peripheral = function () {
        return peripheral;
    };
    this.gattip = function () {
        return gattip;
    };

    // REQUESTS =================================================

    this.readValue = function (callback) {
        var params = helper.populateParams(self);
        gattip.request(C.kGetDescriptorValue, params, callback, function (params) {
            helper.requireFields('readValue', params, [C.kValue], []);
            self.value = params[C.kValue];
            gattip.fulfill(callback, self, self.value);
        });
    };

    //TODO: Nake sure it's not longer than 20 bytes
    this.writeValue = function (callback, value) {
        var params = helper.populateParams(self);
        helper.requireHexValue('writeValue', 'value', value);
        gattip.request(C.kWriteDescriptorValue, params, callback, function (params) {
            self.value = value;
            gattip.fulfill(callback, self);
        });
    };


    // SERVER RESPONSES/INDICATIONS  ============================

    this.respondToReadRequest = function (cookie, value) {
        var params = helper.populateParams(self);
        helper.requireHexValue('respondToReadRequest', 'value', value);
        params[C.kValue] = value;
        gattip.respond(cookie, params);
    };

    this.respondToWriteRequest = function (cookie) {
        var params = helper.populateParams(self);
        gattip.respond(cookie, params);
    };
}


module.exports.Descriptor = Descriptor;


},{"./lib/constants.js":23,"./lib/message-helper":27}],20:[function(require,module,exports){
//TODO: Review which ones application errorrs, which ones are internal (gateway protocol not understood oro something went wrong) and which ones are errors from Gateway/Bluetooth

module.exports.ApplicationError = function (message) {
    this.message = "Application Error:" + message;
    Error.captureStackTrace(this, module.exports.ApplicationError);

};

module.exports.InternalError = function (message) {
    this.message = "Application Error:" + message;
    Error.captureStackTrace(this, module.exports.InternalError);
};

module.exports.GatewayError = function (params) {
    if (typeof params == 'object') {
        this.message = "Gateway Error:";
        if (params.message) {
            this.message += " " + params.message;
        }
        if (params.code) {
            this.message += " Code:" + params.code;
        }
        if (0 == this.message.length) {
            this.message = "Unknown Gateway Error"
        }
    } else {
        this.message = params;
    }
    Error.captureStackTrace(this, module.exports.GatewayError);
};

},{}],21:[function(require,module,exports){
var C = require('./lib/constants').C;
var helper = require('./lib/message-helper');
var Peripheral = require('./peripheral').Peripheral;
var Stream = require('./stream').Stream;
var InternalError = require('./errors').InternalError;
var ApplicationError = require('./errors').ApplicationError;
var ee = require("./lib/event-emitter");
var GatewayError = require("./errors").GatewayError;

function Gateway(gattip, scanFilters) {
    ee.instantiateEmitter(this);
    var self = this;
    var peripherals = {};
    var objectsByObjectId = {};

    this.isScanning = false;

    this.isPoweredOn = function () {
        return self.state == C.kPoweredOn;
    };

    // REQUESTS =================================================
    this._authenticate = function (callback, token, version) {
        var params = {};
        params[C.kDeviceAccessToken] = token;
        params[C.kGetVersionInfo] = version;
        gattip.request(C.kOpen, params, callback, function (params) {
            if (params && params.isAuthenticated === false) {
                gattip.reject(callback, new GatewayError("Authentication failed"))
            } else {
                gattip.fulfill(callback, self);
            }
        });
    };

    this.scan = function (callback, scanOptions) {
        var params = {};
        if (scanOptions) {
            if ('boolean' == typeof scanOptions.scanDuplicates) {
                params[C.kScanOptionAllowDuplicatesKey] = scanOptions.scanDuplicates;
            }
            if ('object' == typeof scanOptions.services) {
                params[C.kServiceUUIDs] = scanOptions.services;
            }
        }

        gattip.request(C.kScanForPeripherals, params, callback, function (params) {
            self.isScanning = true;
            gattip.fulfill(callback, self);
        });
    };

    // TODO: Unregister all on scan event handlers
    this.stopScan = function (callback) {
        gattip.request(C.kStopScanning, {}, callback, function (params) {
            self.isScanning = false;
            gattip.fulfill(callback, self);
        });
    };

    this.centralState = function (callback) {
        var params = {};

        gattip.request(C.kCentralState, {}, callback, function (params) {
            self.state = params[C.kState];
            gattip.fulfill(callback, self);
        });
    };

    this.configure = function (callback, pwrAlert, centralID) {
        var params = {};
        if (typeof pwrAlert != 'undefined') {
            params[C.kShowPowerAlert] = pwrAlert;
        }
        if (typeof centralID != 'undefined') {
            params[C.kIdentifierKey] = centralID;
        }

        gattip.request(C.kConfigure, {}, callback, function (params) {
            gattip.fulfill(callback, self);
        });
    };

    this.openStream = function (callback, streamPath, options) {
        var params = {};
        if (!options) {
            options = {};
        }
        if (typeof options.speed == 'number') {
            params[C.kSpeed] = options.speed;
        }
        if (typeof options.force == 'boolean') {
            params[C.kForce] = options.force;
        }
        var streamObjectId = params[C.kObjectId] = streamPath;
        helper.requireFields('objectId', params, [C.kObjectId]);

        gattip.request(C.kOpenStream, params, callback, function (params) {
            if (typeof params[C.kObjectId] == "string") {
                // if the response contains a new object ID, replace it
                streamObjectId = params[C.kObjectId];
            }
            var stream = new Stream(this, streamObjectId);
            objectsByObjectId[streamObjectId] = stream;
            gattip.fulfill(callback, stream);
        });
    };
    //
    this.closeStream = function (callback, objectId) {
        var params = {};
        var streamObjectId = params[C.kObjectId] = objectId;
        helper.requireFields('objectId', params, [C.kObjectId]);

        gattip.request(C.kCloseStream, params, callback, function (params) {
            var stream = objectsByObjectId[streamObjectId];
            delete objectsByObjectId[streamObjectId];
            gattip.fulfill(callback, stream);
        });
    };
    //

    this.handleScanIndication = function(params) {
        var peripheralUUID = params[C.kPeripheralUUID];
        if (!peripheralUUID) {
            throw new InternalError('Peripheral UUID is not availabvle');
        }
        if (scanFilters && scanFilters.uuids) {
            for (var i = 0; i < scanFilters.uuids.length; i++) {
                var uuid = scanFilters.uuids[i];
                if (uuid && uuid.length) {
                    if (uuid != peripheralUUID) {
                        return;
                    }
                }
            }
        }

        var peripheral = self.getPeripheral(peripheralUUID);
        if (!peripheral) {
            peripheral = self.addPeripheral(new Peripheral(
                gattip,
                peripheralUUID,
                params[C.kPeripheralName],
                params[C.kRSSIkey],
                params[C.kCBAdvertisementDataTxPowerLevel],
                params[C.kCBAdvertisementDataIsConnectable],
                params[C.kCBAdvertisementDataServiceUUIDsKey],
                params[C.kCBAdvertisementDataManufacturerDataKey],
                params[C.kCBAdvertisementDataServiceDataKey],
                params[C.kAdvertisementDataKey],
                params[C.kScanRecord])
            );
        } else {
            peripheral._updateFromScanData(
                params[C.kPeripheralName],
                params[C.kRSSIkey],
                params[C.kCBAdvertisementDataTxPowerLevel],
                params[C.kCBAdvertisementDataIsConnectable],
                params[C.kCBAdvertisementDataServiceUUIDsKey],
                params[C.kCBAdvertisementDataManufacturerDataKey],
                params[C.kCBAdvertisementDataServiceDataKey],
                params[C.kAdvertisementDataKey],
                params[C.kScanRecord]
            );
        }
        self.emit('scan', peripheral);

    };

    // PERIPHERAL MANAGEMENT ETC. ======================================

    this.addPeripheralWithValues = function (uuid, name, RSSI, txPwr, serviceUUIDs, mfrData, scvData, connectable) {
        if (!uuid) {
            throw new InternalError('Attempting to add an empty peripheral');
        }
        var peripheral = self.addPeripheral(new Peripheral(gattip, uuid, name, RSSI, txPwr, connectable, serviceUUIDs, mfrData, scvData));
        peripherals[uuid] = peripheral;
        return peripheral;
    };

    this.addPeripheral = function (peripheral) {
        if (!peripheral || !peripheral.uuid) {
            throw new InternalError('Attempting to add an empty peripheral');
        }
        peripherals[peripheral.uuid] = peripheral;
        return peripheral;
    };
    this.addStream = function (objectId) {
        var stream  =new Stream(this, objectId);
        objectsByObjectId[objectId] = stream;
        return stream;
    };

    this.removePeripheral = function (peripheral) {
        if (!peripheral || !peripheral.uuid) {
            throw new InternalError('Attempting to remove an empty peripheral');
        }
        delete peripherals[peripheral.uuid];
    };

    this.getPeripheral = function (peripheralUUID) {
        return peripherals[peripheralUUID];
    };

    this.getObject = function (objectId) {
        return objectsByObjectId[objectId];
    };
    this.removeObject = function (objectId) {
        delete objectsByObjectId[objectId];
    };

    this.getPeripheralOrDie = function (peripheralUUID) {
        var peripheral = peripherals[peripheralUUID];
        if (!peripheral) {
            throw new InternalError('Unable to find peripheral with UUID ' + peripheralUUID);
        }
        return peripheral;
    };

    this.getObjects = function(type, peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID) {
        var resultObj = {};
        resultObj.peripheral = peripherals[peripheralUUID];
        if (resultObj.peripheral) {
            if (type === 'p') {
                return resultObj;
            }
            resultObj.service = resultObj.peripheral.findService(serviceUUID);
            if (resultObj.service) {
                if (type === 's') {
                    return resultObj;
                }
                resultObj.characteristic = resultObj.service.findCharacteristic(characteristicUUID);
                if (resultObj.characteristic) {
                    if (type === 'c') {
                        return resultObj;
                    }
                    resultObj.descriptor = resultObj.characteristic.findDescriptor(descriptorUUID);
                    if (resultObj.descriptor) {
                        if (type === 'd') {
                            return resultObj;
                        } else {
                            throw new InternalError('_getObjects: Argument "type" is required');
                        }
                    } else {
                        throw new ApplicationError('Descriptor "'+ descriptorUUID + '" not found in the service table');
                    }
                } else {
                    throw new ApplicationError('Characteristic "'+ characteristicUUID + '" not found in the service table');
                }
            } else {
                throw new ApplicationError('Service "'+ serviceUUID + '" not found in the service table');
            }
        } else {
            throw new ApplicationError('Peripheral with id '+ peripheralUUID + ' not found');
        }
    };


    this.getObjectsFromMessage = function(type, params) {
        if (!params) {
            throw new InternalError("Message parameters are missing");
        }
        try {
            return self.getObjects(type, params[C.kPeripheralUUID], params[C.kServiceUUID], params[C.kCharacteristicUUID], params[C.kDescriptorUUID] );
        } catch (error) {
            throw new InternalError(error.message, error.detail);
        }
    };

}
ee.makeEmitter(Gateway);
module.exports.Gateway = Gateway;

},{"./errors":20,"./lib/constants":23,"./lib/event-emitter":24,"./lib/message-helper":27,"./peripheral":31,"./stream":33}],22:[function(require,module,exports){
var ee = require("./lib/event-emitter");
var InternalError = require("./errors").InternalError;
var ApplicationError = require("./errors").ApplicationError;
var GatewayError = require("./errors").GatewayError;
var MessageHandler = require("./lib/message-handler").MessageHandler;
var MessageProcessor = require('./lib/message-processor').MessageProcessor;
var Gateway = require("./gateway").Gateway;
var helper = require('./lib/message-helper');
var ServerMessageHandler = require("./lib/server-message-handler").ServerMessageHandler;

var NODE_CLIENT_SOCKET_CONFIG = {
    keepalive:true,
    dropConnectionOnKeepaliveTimeout:true,
    keepaliveInterval:10000, // ping every 10 seconds
    keepaliveGracePeriod:10000 // time out if pong is not received after 10 seconds
};

function GATTIP() {
    ee.instantiateEmitter(this);


    this.traceEnabled = false;
    var self = this;
    var stream;
    var processor;
    var mh;
    var smh;
    var gateway;
    this.getGateway = function() {
        return gateway;
    };

    this.traceMessage = function(message, prefix) {
        if (self.traceEnabled) {
            if ('object' == typeof message) {
                message = JSON.stringify(message);
            }
            console.log(prefix? prefix : "", message);
        }
    };

    function sendError(err) {
        self.emit('error', err);
    }

    this.getServerMessageHandler = function() {
        if(!smh) {
            sendError(new GatewayError("Server Message Handler is not Ready"));
        }
        return smh;
    };

    /** callback handling helpers */
    this.fulfill = function (cb, arg1, arg2, arg3, arg4, arg5) {
        if (typeof cb == 'object' && typeof cb.fulfill == 'function') {
            cb.fulfill(arg1, arg2, arg3, arg4, arg5);
        } else if (typeof cb == 'function') {
            cb(arg1, arg2, arg3, arg4, arg5);
        } // else no callback needed.
    };
    this.reject = function (cb, error) {
        if (typeof cb == 'object' && typeof cb.reject == 'function') {
            cb.reject(error);
        } else {
            sendError(error);
        }
    };

    function guardedProcessMessage(doParse, message, handlerFunc) {
        try {
            if (doParse) {
                message = JSON.parse(message);
            }
            handlerFunc(message);
        } catch (error) {
            sendError(error);
        }
    }

    /**
     * Opens a connection to the gateway, given the configuration parameters
     * @param config
     *  url: WebSocket URL to open. This or stream is required to issue an open()
     *  stream: Stream object implementing send() and close(), onMessage()
     */
    this.open = function (config) {
        var gw = new Gateway(this, config.scanFilters);
        processor = new MessageProcessor(this);
        mh = new MessageHandler(this, gw);
        smh = new ServerMessageHandler(this, gw);

        function waitReady(config) {
            if (config.isServer) {
                processor.on('request', function (message) {
                    self.traceMessage(message, '<req:');
                    guardedProcessMessage(false, message, smh.processMessage)
                });
                processor.on('indication', function (message) {
                    sendError(new ApplicationError("Received an indication on a server stream:" + JSON.stringify(message)));
                });
                gateway = gw;
                self.emit('ready', gw);
            } else if (config.isPassThrough) {
                emitGateway();
            } else {
                gw.configure(function () {
                    gw.centralState(function () {
                        if (!gw.isPoweredOn()) {
                            console.log('Bluetooth not power on :(');
                            self.emit('state', gw.isPoweredOn());
                            var statePoll = setInterval(function() {
                                gw.centralState(function () {
                                    if (gw.isPoweredOn()) {
                                        self.emit('state', gw.isPoweredOn());
                                        clearInterval(statePoll);
                                        emitGateway();
                                    }
                                });
                            },500);
                        }else if(gw.isPoweredOn()){
                            emitGateway();
                        }
                    });
                });
            }
        }

        function emitGateway(){
            processor.on('indication', function (message) {
                self.traceMessage(message, '<ind:');
                guardedProcessMessage(false, message, mh.handleIndication)
            });
            processor.on('request', function (message) {
                sendError(new InternalError("Received a request on a client stream:" +  JSON.stringify(message)));
            });
            gateway = gw;
            self.emit('ready', gw);
        }

        function doOpen(config) {
            if (config.token) {
                gw._authenticate(function () {
                    waitReady(config);
                }, config.token,
                config.version);
            } else {
                waitReady(config);
            }
        }

        if (config.trace === true) {
            self.traceEnabled = true;
        }
        if (config.url) {
            var WebSocket;
            if (typeof window == 'object') {
                WebSocket = window.WebSocket;
            } else {
                WebSocket = require('websocket').w3cwebsocket;                
            }
            stream = new WebSocket(config.url, undefined, undefined, undefined, undefined, NODE_CLIENT_SOCKET_CONFIG);            
            stream.onopen = function () {
                doOpen(config);
            };
            stream.onclose = function (error) {
                self.emit('onclose', error);
            };
            stream.onerror = function (error) {
                self.emit('onerror', error);
            };

        } else if (config.stream) {
            stream = config.stream;
            doOpen(config);
        } else {
            throw new ApplicationError("URL or stream implementing a socket interface is required");
        }

        stream.onmessage = function (streamMessage) {
            guardedProcessMessage(true, streamMessage.data, processor.onMessageReceived);
        };

        processor.on('response', function (message, ctxt) {
            self.traceMessage(message, '<rsp:');
            try {
                if (message.error) {
                    self.reject(ctxt.cb, new GatewayError(message.error));
                } else {
                    if (ctxt.handler) {
                        // handler is responsible to fulfill
                        ctxt.handler(message.params);
                    } else {
                        self.fulfill(ctxt.cb);
                    }
                }
            } catch (error) {
                self.reject(ctxt.cb, error);
            }
        });

        processor.on('error', function (error) {
            self.emit('error', error);
        });
    };

    this.close = function () {
        if (stream) {
            stream.close();
        }
    };

    // AKA socket (as opposed to gattip stream)
    this.getCommunicationStream = function () {
        return stream;
    };


    // INTERNAL ONLY

    this.request = function (method, params, userCb, handler) {
        var ctxt = mh.createUserContext(method, params, userCb, handler);
        var msg = ctxt.originalMessage;
        processor.register(msg, ctxt);
        self.traceMessage(msg, '>req:');
        stream.send(JSON.stringify(msg));
    };

    this.respond = function (cookie, params) {
        var msg = mh.wrapResponse(cookie, params);
        self.traceMessage(msg, '>rsp:');
        stream.send(JSON.stringify(msg));
    };

    this.sendIndications = function (result, params){
        var mesg = {
            params: params,
            jsonrpc: "2.0"
        };
        mesg.result = result;
        mesg.params = params;
        self.traceMessage(mesg, '>rsp:');
        stream.send(JSON.stringify(mesg));
    };

    this.sendError = function (mesg){
        mesg.jsonrpc = "2.0";
        self.traceMessage(mesg, '>rsp:');
        stream.send(JSON.stringify(mesg));
    };
}


ee.makeEmitter(GATTIP);
module.exports.GATTIP = GATTIP;

},{"./errors":20,"./gateway":21,"./lib/event-emitter":24,"./lib/message-handler":26,"./lib/message-helper":27,"./lib/message-processor":28,"./lib/server-message-handler":29,"websocket":16}],23:[function(require,module,exports){
var C = {
    // TODO: When we are done, clean up all unsupported constancts

    // make default timeout a tad longer than whatever the longest gateway timeout may be
    // client should pass adequate timeouts
    DEFAULT_MESSAGE_TIMEOUT_MS: 61000,
    MAX_PENDING_MESSAGES: 200, // maximum number of pending requests (in message-processor)
    NUM_CONNECT_ATTEMPTS: 3,

    /* BEGIN new constants with gattip 2.0 */
    kMessageId                  : "id",
    kSessionId                  : "session_id",
    kObjectId                   : "oid",

    kAuthenticate               : 'aut',
    kOpen                       : 'opn',
    kDeviceAccessToken          : 'dat',
    kGetVersionInfo             : 'vif',
    kOpenStream                 : 'ops',
    kCloseStream                : 'cls',
    kStreamClosedIndication     : 'cis',
    kWriteStreamData            : 'wsd',
    kStreamDataIndication       : 'sdi',

    kVal                        : 'val',
    kSpeed                      : 'spd',
    kForce                      : 'frc',

    /* END new constants with gattip 2.0 */
    kError: "error",
    kCode: "code",
    kMessageField: "message",
    kMethod:'method',
    kResult: "result",
    kIdField: "id",
    kConfigure: "aa",
    kScanForPeripherals: "ab",
    kStopScanning: "ac",
    kConnect: "ad",
    kDisconnect: "ae",
    kCentralState: "af",
    kGetConnectedPeripherals: "ag",
    kGetPerhipheralsWithServices: "ah",
    kGetPerhipheralsWithIdentifiers: "ai",
    kGetServices: "ak",
    kGetIncludedServices: "al",
    kGetCharacteristics: "am",
    kGetDescriptors: "an",
    kGetCharacteristicValue: "ao",
    kGetDescriptorValue: "ap",
    kWriteCharacteristicValue: "aq",
    kWriteDescriptorValue: "ar",
    kSetValueNotification: "as",
    kGetPeripheralState: "at",
    kGetRSSI: "au",
    kInvalidatedServices: "av",
    kPeripheralNameUpdate: "aw",
    kMessage: "zz",
    kCentralUUID: "ba",
    kPeripheralUUID: "bb",
    kPeripheralName: "bc",
    kPeripheralUUIDs: "bd",
    kServiceUUID: "be",
    kServiceUUIDs: "bf",
    kPeripherals: "bg",
    kIncludedServiceUUIDs: "bh",
    kCharacteristicUUID: "bi",
    kCharacteristicUUIDs: "bj",
    kDescriptorUUID: "bk",
    kServices: "bl",
    kCharacteristics: "bm",
    kDescriptors: "bn",
    kProperties: "bo",
    kValue: "bp",
    kState: "bq",
    kStateInfo: "br",
    kStateField: "bs",
    kWriteType: "bt",
    kRSSIkey: "bu",
    kIsPrimaryKey: "bv",
    kIsBroadcasted: "bw",
    kIsNotifying: "bx",
    kShowPowerAlert: "by",
    kIdentifierKey: "bz",
    kScanOptionAllowDuplicatesKey: "b0",
    kScanOptionSolicitedServiceUUIDs: "b1",
    kAdvertisementDataKey: "b2",
    kCBAdvertisementDataManufacturerDataKey: "mfr",
    kCBAdvertisementDataServiceUUIDsKey: "suu",
    kCBAdvertisementDataServiceDataKey: "sdt",
    kCBAdvertisementDataOverflowServiceUUIDsKey: "b6",
    kCBAdvertisementDataSolicitedServiceUUIDsKey: "b7",
    kCBAdvertisementDataIsConnectable: "cbl",
    kCBAdvertisementDataTxPowerLevel: "txp",
    kPeripheralBtAddress: "c1",
    kRawAdvertisementData: "c2",
    kScanRecord: "c3",
    kCBCentralManagerRestoredStatePeripheralsKey: "da",
    kCBCentralManagerRestoredStateScanServicesKey: "db",
    kWriteWithResponse: "cc",
    kWriteWithoutResponse: "cd",
    kNotifyOnConnection: "ce",
    kNotifyOnDisconnection: "cf",
    kNotifyOnNotification: "cg",
    kDisconnected: "ch",
    kConnecting: "ci",
    kConnected: "cj",
    kUnknown: "ck",
    kResetting: "cl",
    kUnsupported: "cm",
    kUnauthorized: "cn",
    kPoweredOff: "co",
    kPoweredOn: "cp",
    kErrorPeripheralNotFound: "-32001",
    kErrorServiceNotFound: "-32002",
    kErrorCharacteristicNotFound: "-32003",
    kErrorDescriptorNotFound: "-32004",
    kErrorPeripheralStateIsNotValid: "-32005",
    kErrorNoServiceSpecified: "-32006",
    kErrorNoPeripheralIdentiferSpecified: "-32007",
    kErrorStateRestorationNotValid: "-32008",
    kInvalidRequest: "-32600",
    kMethodNotFound: "-32601",
    kInvalidParams: "-32602",
    kError32603: "-32603",
    kParseError: "-32700",
    kGAP_ADTYPE_FLAGS: "01",
    kGAP_ADTYPE_INCOMPLETE_16BIT_SERVICEUUID: "02",
    kGAP_ADTYPE_COMPLETE_16BIT_SERVICEUUID: "03",
    kGAP_ADTYPE_INCOMPLETE_32BIT_SERVICEUUID: "04",
    kGAP_ADTYPE_COMPLETE_32BIT_SERVICEUUID: "05",
    kGAP_ADTYPE_INCOMPLETE_128BIT_SERVICEUUID: "06",
    kGAP_ADTYPE_COMPLETE_128BIT_SERVICEUUID: "07",
    kGAP_ADTYPE_POWER_LEVEL: "0A",
    kGAP_ADTYPE_MANUFACTURER_SPECIFIC: "FF",
    kGAP_ADTYPE_16BIT_SERVICE_DATA: "16",
    id: 1,
    authenticate: 'authenticate',
    AllProperties: ["Broadcast", "Read", "WriteWithoutResponse", "Write", "Notify", "Indicate", "AuthenticatedSignedWrites", "ExtendedProperties", "NotifyEncryptionRequired", "IndicateEncryptionRequired"]
};

module.exports.C = C;

},{}],24:[function(require,module,exports){
/**

 Example code:

 function MyEmitter() {
    module.exports.instantiateEmitter(this);

}
 module.exports.makeEmitter(MyEmitter);

 const myEmitter = new MyEmitter();
 myEmitter.on('event', function (arg) {
    console.log('an event occurred!', arg);
});
 myEmitter.emit('event', 'foo');
 */


var EventEmitter = require('events');
var util = require('util'); // this is node util
module.exports.makeEmitter = function (contructor) {
    util.inherits(contructor, EventEmitter);
};
module.exports.instantiateEmitter = function (object) {
    EventEmitter.call(object);
};


},{"events":17,"util":37}],25:[function(require,module,exports){
var C = require('./constants').C;
function getDiscoverable(advdata, advArray) {
    var discoverableDataLength = parseInt(advArray[0], 16);
    if (parseInt(advArray[2], 16) >= 1) {
        advdata.connectable = "true";
    } else
        advdata.connectable = "false";
    advArray.splice(0, discoverableDataLength + 1);
}

function getTXLevel(advdata, advArray) {
    var txlevelDataLength = parseInt(advArray[0], 16);
    advdata.txPowerLevel = parseInt(advArray[2]);
    advArray.splice(0, txlevelDataLength + 1);
}

function getManufacturerData(advdata, advArray) {
    var manufacturerDataLength = parseInt(advArray[0], 16);
    if (manufacturerDataLength > 2) {
        var mfrKey = advArray[3] + advArray[2];
        var mfrData = '';
        for (var k = 4; k <= manufacturerDataLength; k++) {
            mfrData += advArray[k];
        }
        advdata.manufacturerData[mfrKey] = mfrData;
    }
    advArray.splice(0, manufacturerDataLength + 1);
}

function getServiceUUIDs(advdata, advArray) {
    var service16bitDataLength = parseInt(advArray[0], 16);
    var reverse16bitUUID = '';
    for (var i = service16bitDataLength; i >= 2; i--) {
        reverse16bitUUID += advArray[i];
    }
    advdata.serviceUUIDs = reverse16bitUUID;
    advArray.splice(0, service16bitDataLength + 1);
}

function get128bitServiceUUIDs(advdata, advArray) {
    var service128bitDataLength = parseInt(advArray[0], 16);
    var reverse128bitUUID = '';
    for (var i = service128bitDataLength; i >= 2; i--) {
        reverse128bitUUID += advArray[i];
        if (i == 14 || i == 12 || i == 10 || i == 8) {
            reverse128bitUUID += "-";
        }
    }
    advdata.serviceUUIDs = reverse128bitUUID;
    advArray.splice(0, service128bitDataLength + 1);
}

function getServiceData(advdata, advArray) {
    var serviceDataLength = parseInt(advArray[0], 16);
    var eddystoneServiceUUID = '';
    for (var i = 3; i >= 2; i--) {
        eddystoneServiceUUID += advArray[i];
    }
    if (eddystoneServiceUUID == 'FEAA') {
        if (parseInt(advArray[4], 16) === 0) {
            getUID(advdata);
        } else if (parseInt(advArray[4], 16) == 16) {
            getURL(advdata);
        } else if (parseInt(advArray[4], 16) == 32) {
            getTLM(advdata);
        }
    }
    advArray.splice(0, serviceDataLength + 1);
}

function getUID(advdata, advArray) {
    advdata.frameType = 'UID';
    advdata.nameSpace = '';
    advdata.instanceID = '';
    advdata.txPowerLevel = parseInt(advArray[5], 16);
    for (var i = 6; i < 16; i++) {
        advdata.nameSpace += advArray[i];
    }
    for (var j = 16; j < 22; j++) {
        advdata.instanceID += advArray[j];
    }
    advdata.reserved = advArray[22];
    advdata.reserved += advArray[23];
}

function getURL(advdata, advArray) {
    advdata.frameType = 'URL';
    advdata.txPowerLevel = parseInt(advArray[5]);
    for (var protocol in C.AllProtocols) {
        if (advArray[6] == protocol)
            advdata.url = C.AllProtocols[protocol];
    }
    for (var i = 7; i < advArrayLength; i++) {
        advdata.url += String.fromCharCode(parseInt(advArray[i], 16));
    }
    for (var domain in C.AllDomains) {
        if (advArray[advArrayLength] == domain)
            advdata.url += C.AllDomains[domain];
    }
}

function getTLM(advdata, advArray) {
    advdata.frameType = 'TLM';
    advdata.advPacketCount = '';
    advdata.timeInterval = '';
    advdata.batteryVoltage = '';
    advdata.eddyVersion = parseInt(advArray[5], 16);
    for (var i = 6; i < 8; i++) {
        advdata.batteryVoltage += advArray[i];
    }
    advdata.batteryVoltage = parseInt(advdata.batteryVoltage, 16);
    advdata.temperature = Math.ceil(parseInt(advArray[8], 16));
    advdata.temperature += '.';
    var temp = Math.ceil(((1 / 256) * parseInt(advArray[9], 16)));
    if (temp.length > 2)
        advdata.temperature += temp.toString().substring(0, 2);
    else
        advdata.temperature += temp;
    for (var j = 10; j < 14; j++) {
        advdata.advPacketCount += advArray[j];
    }
    advdata.advPacketCount = parseInt(advdata.advPacketCount, 16);
    for (var k = 14; k < 18; k++) {
        advdata.timeInterval += advArray[k];
    }
    advdata.timeInterval = Math.ceil(parseInt(advdata.timeInterval, 16) * 0.1);
    advdata.timePeriod = '';
    if (advdata.timeInterval >= 60) {
        var days = Math.floor(advdata.timeInterval / 86400);
        if (days > 0) {
            advdata.timePeriod += days < 10 ? days + 'day ' : days + 'days ';
            advdata.timeInterval -= days * 24 * 60 * 60;
        }
        var hours = Math.floor(advdata.timeInterval / 3600);
        if (hours > 0) {
            advdata.timePeriod += hours < 10 ? '0' + hours + ':' : hours + ':';
            advdata.timeInterval -= hours * 60 * 60;
        } else
            advdata.timePeriod += '00:';
        var min = Math.floor(advdata.timeInterval / 60);
        if (min > 0) {
            advdata.timePeriod += min < 10 ? '0' + min + ':' : min + ':';
            advdata.timeInterval -= min * 60;
            advdata.timePeriod += advdata.timeInterval < 10 ? '0' + advdata.timeInterval : advdata.timeInterval;
            advdata.timePeriod += ' secs';
            advdata.timeInterval = 0;
        } else {
            advdata.timePeriod += '00:' + advdata.timeInterval;
            advdata.timeInterval = 0;
        }
    } else if (advdata.timeInterval > 0 && advdata.timeInterval < 60) {
        advdata.timePeriod += advdata.timeInterval < 10 ? '00:00:0' + advdata.timeInterval : '00:00:' + advdata.timeInterval;
        advdata.timePeriod += ' secs';
    }
}

module.exports.parseAdvArray = function (peripheral, rawAdvertisingData) {
    if (!peripheral.advdata) {
        peripheral.advdata = {};
    }
    var advdata = peripheral.advdata;
    if(!advdata.manufacturerData){
        advdata.manufacturerData = {};
    }
    if(!advdata.serviceUUIDs){
        advdata.serviceUUIDs = [];
    }
    if (!rawAdvertisingData) {
        return [];
    }
    var advArray = [];
    if (rawAdvertisingData.length % 2 === 0) {
        for (var i = 0; i < rawAdvertisingData.length; i = i + 2) {
            advArray[i / 2] = rawAdvertisingData.charAt(i) + rawAdvertisingData.charAt(i + 1);
        }
    } else {
        for (var j = 0; j < rawAdvertisingData.length; j++) {
            advArray[j] = rawAdvertisingData.charAt(2 * j) + rawAdvertisingData.charAt(2 * j + 1);
        }
    }

    do {
        var type = advArray[1];
        if (type == C.kGAP_ADTYPE_FLAGS) {
            getDiscoverable(advdata, advArray);
        } else if (type == C.kGAP_ADTYPE_POWER_LEVEL) {
            getTXLevel(advdata, advArray);
        } else if (type == C.kGAP_ADTYPE_INCOMPLETE_16BIT_SERVICEUUID || type == C.kGAP_ADTYPE_COMPLETE_16BIT_SERVICEUUID) {
            getServiceUUIDs(advdata, advArray);
        } else if (type == C.kGAP_ADTYPE_INCOMPLETE_32BIT_SERVICEUUID || type == C.kGAP_ADTYPE_COMPLETE_32BIT_SERVICEUUID) {
            getServiceUUIDs(advdata, advArray);
        } else if (type == C.kGAP_ADTYPE_INCOMPLETE_128BIT_SERVICEUUID || type == C.kGAP_ADTYPE_COMPLETE_128BIT_SERVICEUUID) {
            get128bitServiceUUIDs(advdata, advArray);
        } else if (type == C.kGAP_ADTYPE_MANUFACTURER_SPECIFIC) {
            getManufacturerData(advdata, advArray);
        } else if (type == C.kGAP_ADTYPE_16BIT_SERVICE_DATA) {
            getServiceData(advdata, advArray);
        } else if (type == "00") {
            advArray.splice(0, 1);
        } else {
            var advArrayLength = parseInt(advArray[0], 16);
            advArray.splice(0, advArrayLength + 1);
        }
        if (advArray.length === 0) {
            break;
        }
    } while (true);
};
},{"./constants":23}],26:[function(require,module,exports){
var C = require('./constants').C;
var helper = require('./message-helper');
var InternalError = require('./../errors').InternalError;
var ApplicationError = require('./../errors').ApplicationError;

module.exports.MessageHandler = function (gattip, gateway) {
    var self = this;

    this.createUserContext = function (method, params, userCallback, handler) {
        var mesg = {
            method: method,
            params: params,
            jsonrpc: "2.0"
        };
        return {originalMessage: mesg, cb:userCallback, handler:handler};
    };
    this.wrapResponse = function (cookie, params) {
        var mesg = {
            params: params,
            jsonrpc: "2.0"
        };
        helper.requireAndPopulateFieldsFromCookie('wrapResponse', cookie, mesg);
        // console.log('Wrote', JSON.stringify(params));
        return mesg;
    };

    this.handleIndication = function (response) {
        if (response.error) {
            throw new ApplicationError(JSON.stringify(response));
        }

        var params = response.params;
        switch (response.result) {
            case C.kScanForPeripherals:
                var peripheral = gateway.handleScanIndication(params);
                break;
            case C.kDisconnect:
                (function () {
                    helper.requireFields('Disconnect indication', params, [C.kPeripheralUUID]);
                    var peripheral = gateway.getPeripheral(params[C.kPeripheralUUID]);
                    if (peripheral) {
                        peripheral.handleDisconnectIndication(peripheral);
                    } else {
                        console.warn("Received disconnect indication for an unknown peripheral with UUID", params[C.kPeripheralUUID]);
                    }
                })();
                break;
            case C.kSetValueNotification:
                (function () {
                    helper.requireFields('Disconnect indication', params, [C.kPeripheralUUID]);
                    var peripheral = gateway.getPeripheral(params[C.kPeripheralUUID]);
                    if (peripheral) {
                        helper.requireFields('Value notification', params, [C.kPeripheralUUID, C.kServiceUUID, C.kCharacteristicUUID, C.kValue]);
                        var objs = gateway.getObjectsFromMessage('c', response.params);
                        objs.characteristic.handleValueNotification(params);
                    } else {
                        console.warn("Received value notification for an unknown peripheral with UUID", params[C.kPeripheralUUID]);
                    }
                })();
                break;
            case C.kStreamDataIndication:
                (function () {
                    helper.requireFields('Object ID for stream data', params, [C.kObjectId]);
                    var stream = gateway.getObject(params[C.kObjectId]);
                    if (stream) {
                        stream.handleDataIndication(params);
                    } else {
                        console.warn("Received stream data indication for unknown stream", params[C.kObjectId]);
                    }
                })();
                break;
            case C.kStreamClosedIndication:
                (function () {
                    helper.requireFields('Object ID for stream close', params, [C.kObjectId]);
                    var stream = gateway.getObject(params[C.kObjectId]);
                    if (stream) {
                        stream.handleDataIndication(params);
                    } else {
                        console.warn("Received stream closed indication for unknown stream", params[C.kObjectId]);
                    }
                })();
                break;
            default:
                (function () {
                    throw new InternalError('Unknown indication received from the gateway:', JSON.stringify(response));
                })();
                break;
        }
    };
};
},{"./../errors":20,"./constants":23,"./message-helper":27}],27:[function(require,module,exports){
var C = require('./constants').C;
var constantNames = {};
var InternalError = require('./../errors').InternalError;
var ApplicationError = require('./../errors').ApplicationError;

for (var name in C) {
    //noinspection JSUnfilteredForInLoop
    var code = C[name];
    //noinspection JSUnfilteredForInLoop
    if (name.indexOf('k') == 0) {
        //noinspection JSUnfilteredForInLoop
        name = name.substring(1, name.length);
        constantNames[code] = name;
    }
}

module.exports.isEmpty = function (obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
};

module.exports.arrayAsHex = function (array, pretty) {
    var ret = (pretty ? '0x' : '');
    for (var i in array) {
        //noinspection JSUnfilteredForInLoop
        var value = (array[i] & 0xFF).toString(16);
        if (value.length == 1) {
            value = '0' + value;
        }
        ret += value;
    }
    return ret;
};

function recursiveToString(obj) {
    var ret = '';
    if (typeof obj == 'object') {
        if (Array.isArray(obj)) {
            var val = '';
            for (var i in obj) {
                if (0 != i) {
                    ret += ' ,';
                }
                ret += obj[i];
            }
        }
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                var value = obj[name];
                var constantName = constantNames[name];
                if (!constantName) {
                    constantName = name;
                }
                if ('object' == typeof value) {
                    if (Array.isArray(value)) {
                        ret += ' ' + constantName + ':[' + recursiveToString(value) + ']';
                    } else {
                        ret += ' ' + constantName + ':{' + recursiveToString(value) + '}';
                    }
                } else {
                    ret += ' ' + constantName + '=' + value;
                }
            }
        }
    }
    return ret;
}

module.exports.toString = function (message) {
    return recursiveToString(message.params).trim();
};

/**
 * Just a meaningful name because the requireFields function can handle
 */
module.exports.requireAndAssignParameters = function (callDescription, object, fields, values) {
    module.exports.requireFields(callDescription + " call parameters ", object, fields, values);
};


module.exports.requireBooleanValue = function (description, parameterName, value) {
    if (typeof value != 'boolean') {
        throw new ApplicationError(description + ' missing parameter ' + parameterName);
    }
};
module.exports.requireHexValue = function (description, parameterName, value) {
    if (typeof value != 'string') {
        throw new ApplicationError(description + ' missing parameter ' + parameterName);
    }
    if (value.length > 0 && (value.length % 2 != 0 || !(/^[0-9a-fA-F]+$/.test(value)))) {
        throw new ApplicationError(description + ' value ' + parameterName + ' is not a valid hex string');
    }
};
module.exports.requireUUID = function (description, parameterName, value) {
    if (typeof value != 'string') {
        throw new ApplicationError(description + ' missing parameter ' + parameterName);
    }
    if (value.length < 4 ||!(/^[0-9A-F-]+$/.test(value))) {
        throw new ApplicationError(description + ' value ' + parameterName + ' is not a valid UUID');
    }
};
module.exports.requireHexValues = function (description, parameterNames, hexValues) {
    var missingFields = [];
    if (!Array.isArray(parameterNames) || !Array.isArray(hexValues)) {
        throw new InternalError("Illegal use of requireHexValues");
    }
    for (var i = 0; i < parameterNames.length; i++) {
        var pName = parameterNames[i];
        var value = hexValues[i];

        if (typeof value != 'string' || value.length < 2 || value.length % 2 != 0 || !/^#[0-9A-F]$/i.test(value)) {
            missingFields.push(pName);
        }
    }

    if (missingFields) {
        throw new ApplicationError(description + ' missing parameters ' + missingFields);
    }
};

module.exports.requireFields = function (description, object, fields, defaultsOrValues) {
    var missingFields = [];
    if (!defaultsOrValues) {
        defaultsOrValues = {};
    }
    if (!object) {
        throw new InternalError(description + 'Object is undefined');
    }
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (typeof object[field] == undefined) {
            if (typeof defaultsOrValues[i] == undefined) {
                missingFields.push(fields);
            } else {
                object[field] = defaultsOrValues[i];
            }
        }
    }
    if (missingFields.length) {
        throw new InternalError(description + ' missing ' + missingFields);
    }
};

module.exports.requireAndPopulateFieldsFromCookie = function (callDescription, cookie, message) {
    if (!cookie) {
        throw new ApplicationError('Error: "' + callDescription + ' is missing the cookie');
    }
    if (!cookie.original.id) {
        throw new ApplicationError('Error: "' + callDescription + ' is missing the cookie ID');
    }
    if (!cookie.original.session_id) {
        throw new ApplicationError('Error: "' + callDescription + ' is missing the cookie session ID');
    }
    if (!cookie.original.method) {
        throw new ApplicationError('Error: "' + callDescription + ' is missing the cookie request');
    }

    message[C.kMessageId] = cookie.original.id;
    message[C.kSessionId] = cookie.original.session_id;
    message.result = cookie.result;
};

module.exports.populateParams = function (serviceTableObject, params) {
    if (!params) {
        params = {};
    }
    if (!serviceTableObject) {
        throw new InternalError('populateParams: service object is undefined');
    }

    var p;
    var s;
    var c;
    var d;
    var remainingParts = 23132;
    switch (serviceTableObject.type) {
        case 'd':
            remainingParts = 4;
            d = serviceTableObject;
            break;
        case 'c':
            remainingParts = 3;
            c = serviceTableObject;
            break;
        case 's':
            remainingParts = 2;
            s = serviceTableObject;
            break;
        case 'p':
            remainingParts = 1;
            p = serviceTableObject;
            break;
        default:
            throw new InternalError('type must be one of: "s", "c" or "d"');
            break;
    }

    function storeField(field, obj) {
        remainingParts--;
        var uuid = obj.uuid;
        if (!uuid) {
            throw new InternalError('UUID for object of type "' + obj.type + '" is missing');
        }
        params[field] = uuid;
    }

    if (d) {
        storeField(C.kDescriptorUUID, d);
        c = d.characteristic();
    }
    if (c) {
        storeField(C.kCharacteristicUUID, c);
        s = c.service();
    }
    if (s) {
        storeField(C.kServiceUUID, s);
        p = c.peripheral();
    }
    if (p) {
        storeField(C.kPeripheralUUID, p);
    }
    if (remainingParts != 0) {
        throw new InternalError('Expected ' + remainingParts + ' more parts when constructing params of ' + serviceTableObject.type);
    }
    return params;
};


},{"./../errors":20,"./constants":23}],28:[function(require,module,exports){
var ee = require('./event-emitter');
var C = require('./constants').C;
var ApplicationError = require('./../errors').ApplicationError;

var id = 1;

var hackAlert1Sent = false;
var hackAlert2Sent = false;

function MessageContext(processor, msg, userContext, timeoutMs) {
    this.msg = msg;
    this.userContext = userContext;
    if ('undefined' == typeof msg.id) {
        msg.id = Number(id++).toString();
    }
    this.id = msg.id;
    if (!timeoutMs) {
        timeoutMs = C.DEFAULT_MESSAGE_TIMEOUT_MS;
    }
    var self = this;
    this.timeout = setTimeout(function () {
            delete self.timeout;
            console.warn("Timeout occurred for message", JSON.stringify(msg));
            processor.emit('error', new ApplicationError("Timed out : "+ JSON.stringify(msg)), self.userContext.cb);
        },
        timeoutMs
    );

}

function MessageProcessor() {
    ee.instantiateEmitter(this);
    var self = this;
    var pendingMessages = {};


    /**
     *     Registers a message with ID and callback into the message queue so that we can correspond it when we get the callback and and then invoke the callback
     * @param msg Message to send
     * @param userContext an arbitrary context that will be stored and returned when the response is received
     * @param timeoutMs Optional timeout for the message response to be received
     * @returns {*}
     */
    this.register = function (msg, userContext, timeoutMs) {
        if (Object.keys(pendingMessages).length > C.MAX_PENDING_MESSAGES) {
            throw new ApplicationError("Message queue is full", msg);
        }
        var entry = new MessageContext(self, msg, userContext, timeoutMs);
        pendingMessages[entry.id] = entry;
        return entry.msg;
    };

    this.hasMessage = function (msgId) {
        var entry = pendingMessages['' + msgId];
        return !!entry;
    };

    this.onMessageReceived = function (msg) {
        var entry;
        if (msg.params && msg.params.id) {
            console.warn("HACK ALERT: ID is in params!?!");
            msg.id = msg.params.id;
        }
        if (msg.id) {
            entry = pendingMessages['' + msg.id];
        }
        if (!entry) {
            if (!msg.id) {
                if (msg.result == C.kMessage) {
                    if (!hackAlert1Sent) {
                        hackAlert1Sent = true;
                        console.warn("HACK ALERT: Hacking the authenticate message");
                    }
                    msg.id = '1';
                    entry = pendingMessages['1'];
                } else {
                    self.emit('indication', msg);
                    return;
                }
            } else {
                if (msg.result == C.kScanForPeripherals && msg.params && msg.params.bb) {
                    if (!hackAlert2Sent) {
                        hackAlert2Sent = true;
                        console.warn("HACK ALERT: Scan response has an ID");
                    }
                    self.emit('indication', msg);
                    return;
                }
                self.emit('request', msg);
                return;
            }
        }
        if (entry.timeout) {
            clearTimeout(entry.timeout);
        }
        delete pendingMessages[msg.id];
        self.emit('response', msg, entry.userContext, entry.msg);
    };
}

ee.makeEmitter(MessageProcessor);
module.exports.MessageProcessor = MessageProcessor;

},{"./../errors":20,"./constants":23,"./event-emitter":24}],29:[function(require,module,exports){
var C = require('./constants.js').C;
var ee = require('./event-emitter');
var helper = require('./message-helper');

function ServerMessageHandler(gattip, gateway) {
    ee.instantiateEmitter(this);
    var self = this;

    this.processMessage = function (message) {
        var obj;

        if ((typeof message === 'undefined') || (!message)) {
            console.warn("Got unknown message from client", mesg.data);
            return;
        }

        if (message.error) {
            console.warn('Error in the Request', mesg.error);
            return;
        }

        // MESSAGE IS VALID

        if (message.result && ( (message.result == C.kMessage) || (message.result == C.kAuthenticate) ) ){
            var authenticated = false;
            if (!message.error && typeof message.params == 'object' && message.params[C.kAuthenticate] === true) {
                authenticated = true;
            }
            self.emit('authenticated', authenticated);
            return;
        }

        if (message.method && message.method == C.kAuthenticate) {
            // this is so that clients can talk to us directly, bypassing the proxy. If someone has access to the port, they should authenticate?
            console.log("Client requested to authenticate with us. Allowing the client");
            var params = {};
            params[C.kAuthenticate] = true;
            var response = {};
            response.result = C.kAuthenticate;
            response.params = params;
            response[C.kIdField] = message[C.kIdField];
            response = JSON.stringify(response);
            self.send(response);
            return;
        }

        // TODO work out some more invalid message cases....

        var cookie = {original:message};
        var p = message.params;

        function getObject() {
            var objId = p[C.kObjectId];
            var retObj;
            if (typeof objId != 'string') {
                self.sendErrorResponse(cookie, 400, 'Object ID is required');
                throw new Error('Object ID is required');
            }

            retObj = gateway.getObject(objId);
            if (typeof retObj != 'object') {
                self.sendErrorResponse(cookie, 404, 'Object with ID ' +  objId + ' not found');
                throw new Error('Object with ID ' +  objId + ' not found');
            }
            return retObj;
        }
        function getObjects(type) {
            var peripheralUUID = p[C.kPeripheralUUID];
            var resultObj = {};

            resultObj.peripheral = gateway.getPeripheral(peripheralUUID);
            if (resultObj.peripheral && resultObj.peripheral.uuid) {
                if (type === 'p') {
                    return resultObj;
                }
                var serviceUUID = p[C.kServiceUUID];
                resultObj.service = resultObj.peripheral.findService(serviceUUID);
                if (resultObj.service && resultObj.service.uuid) {
                    if (type === 's') {
                        return resultObj;
                    }
                    var characteristicUUID = p[C.kCharacteristicUUID];
                    resultObj.characteristic = resultObj.service.findCharacteristic(characteristicUUID);
                    if (resultObj.characteristic && resultObj.characteristic.uuid) {
                        if (type === 'c') {
                            return resultObj;
                        }
                        var descriptorUUID = p[C.kDescriptorUUID];
                        resultObj.descriptor = resultObj.characteristic.findDescriptor(descriptorUUID);
                        if (resultObj.descriptor && resultObj.descriptor.uuid) {
                            return resultObj;
                        } else {
                            self.sendErrorResponse(cookie, 404, 'Descriptor not found in the service database');
                            throw new Error('Descriptor not found');
                        }
                    } else {
                        self.sendErrorResponse(cookie, 404, 'Characteristic not found in the service database');
                        throw new Error('Characteristic not found');
                    }
                } else {
                    self.sendErrorResponse(cookie, 404, 'Service not found in the service database');
                    throw new Error('Service not found');
                }
            } else {
                self.sendErrorResponse(cookie, 404, 'Peripheral not found in the service database');
                throw new Error('Peripheral not found');
            }
        }

        switch (message.method) {
            case C.kConfigure:
                self.emit('configure', cookie, p[C.kShowPowerAlert], p[C.kIdentifierKey]);
                break;
            case C.kScanForPeripherals:
                self.emit('scan', cookie, p[C.kScanOptionAllowDuplicatesKey], p[C.kServiceUUIDs]);
                break;
            case C.kStopScanning:
                self.emit('stopScan', cookie);
                break;
            case C.kCentralState:
                self.emit('getCentralState', cookie);
                break;
            case C.kConnect:
                try {
                    obj = getObjects('p');
                    self.emit('connect', cookie, obj.peripheral.uuid);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kDisconnect:
                try {
                    obj = getObjects('p');
                    self.emit('disconnect', cookie, obj.peripheral.uuid);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kGetCharacteristicValue:
                try {
                    obj = getObjects('c', cookie);
                    self.emit('readCharacteristic', cookie, obj.peripheral.uuid, obj.service.uuid, obj.characteristic.uuid);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kWriteCharacteristicValue:
                try {
                    obj = getObjects('c', cookie);
                    self.emit('writeCharacteristic', cookie, obj.peripheral.uuid, obj.service.uuid, obj.characteristic.uuid, p[C.kValue]);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kSetValueNotification:
                try {
                    obj = getObjects('c', cookie);
                    self.emit('enableNotifications', cookie, obj.peripheral.uuid, obj.service.uuid, obj.characteristic.uuid, p[C.kIsNotifying]);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kGetDescriptorValue:
                try {
                    obj = getObjects('d', cookie);
                    self.emit('readDescriptor', cookie, obj.peripheral.uuid, obj.service.uuid, obj.characteristic.uuid, obj.descriptor.uuid);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kWriteDescriptorValue:
                try {
                    obj = getObjects('d', cookie);
                    self.emit('writeDescriptor', cookie, obj.peripheral.uuid, obj.service.uuid, obj.characteristic.uuid, obj.descriptor.uuid, message.params[C.kValue]);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kOpenStream:
                try {
                    self.emit('openStream', cookie, p[C.kObjectId], {speed:p[C.kSpeed], force:p[C.kForce]});
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kCloseStream:
                try {
                    obj = getObject();
                    self.emit('closeStream', cookie, obj);
                } catch (ex) {
                    console.error(ex);
                }
                break;
            case C.kWriteStreamData:
                try {
                    obj = getObject();
                    self.emit('writeStreamData', cookie, obj, p[C.kVal]);
                } catch (ex) {
                    console.error(ex);
                }
                break;

            default:
                console.log('invalid request: ' + message.method);
                self.sendErrorResponse(cookie, C.kInvalidRequest, 'Request not handled by server');
                return;
        }
    };

    self.sendErrorResponse = function (cookie, errorId, errMessage) {
        var mesg = {}, error = {};
        error[C.kCode] = errorId;
        error[C.kMessageField] = errMessage;
        mesg[C.kError] = error;
        if(cookie && cookie.original) {
            mesg.result = cookie.original.method
            mesg[C.kMessageId] = cookie.original.id;
            mesg[C.kSessionId] = cookie.original.session_id;
        }
        gattip.sendError(mesg);
    };

    self.configureResponse = function (cookie) {
        cookie.result = C.kConfigure;
        gattip.respond(cookie, {});
    };

    self.centralStateResponse = function (cookie, state) {
        var params = {};
        params[C.kState] = state;
        cookie.result = C.kCentralState;
        gattip.respond(cookie, params);
    };

    self.stopScanResponse = function (cookie) {
        cookie.result = C.kStopScanning;
        gattip.respond(cookie, {});
    };

    self.disconnectResponse = function (cookie, peripheral) {
        var params = {};
        params[C.kPeripheralUUID] = peripheral.uuid;
        params[C.kPeripheralName] = peripheral.name;

        cookie.result = C.kDisconnect;
        gattip.respond(cookie, params);
    };

    self.disconnectIndication = function (peripheral) {
        var params = {};
        params[C.kPeripheralUUID] = peripheral.uuid;
        params[C.kPeripheralName] = peripheral.name;

        gattip.sendIndications(C.kDisconnect, params);
    };

    self.scanResponse = function(cookie) {
        cookie.result = C.kScanForPeripherals;
        gattip.respond(cookie, {});
    };

    self.scanIndication = function(uuid, name, rssi, txPwr, serviceUUIDs, mfrData, svcData, isConnectable) {
        var params = {};
        var manufactData;
        var serviceData;

        if (!helper.isEmpty(mfrData)) {
            manufactData = {};
            for (var mk in mfrData) {
                //noinspection JSUnfilteredForInLoop
                var mkey = mk.toUpperCase();
                //noinspection JSUnfilteredForInLoop
                manufactData[mkey] = helper.arrayAsHex(mfrData[mk]).toUpperCase();
            }
        }
        if (!helper.isEmpty(svcData)) {
            serviceData = {};
            for (var sk in svcData) {
                //noinspection JSUnfilteredForInLoop
                var skey = sk.toUpperCase();
                //noinspection JSUnfilteredForInLoop
                serviceData[skey] = helper.arrayAsHex(svcData[sk]).toUpperCase();
            }
        }

        params[C.kPeripheralName] = name;
        params[C.kPeripheralUUID] = uuid;
        params[C.kRSSIkey] = rssi;
        params[C.kCBAdvertisementDataTxPowerLevel] = txPwr;
        params[C.kCBAdvertisementDataIsConnectable] = isConnectable;
        params[C.kCBAdvertisementDataServiceUUIDsKey] = ((serviceUUIDs && serviceUUIDs.length > 0) ? serviceUUIDs : undefined);
        params[C.kCBAdvertisementDataManufacturerDataKey] = manufactData;
        params[C.kCBAdvertisementDataServiceDataKey] = serviceData;

        gattip.sendIndications(C.kScanForPeripherals, params);
    };

    self.openStreamResponse = function (cookie, streamObjectId) {
        var params = {};
        params[C.kObjectId] = streamObjectId;
        cookie.result = C.kOpenStream;
        gattip.respond(cookie, params);
    };

    self.closeStreamResponse = function (cookie, streamObjectId) {
        var params = {};
        params[C.kObjectId] = streamObjectId;
        cookie.result = C.kCloseStream;
        gattip.respond(cookie, params);
    };

}

/* The following define the flags that are valid with the SecurityProperties */
this.GATM_SECURITY_PROPERTIES_NO_SECURITY = 0x00000000;
this.GATM_SECURITY_PROPERTIES_UNAUTHENTICATED_ENCRYPTION_WRITE = 0x00000001;
this.GATM_SECURITY_PROPERTIES_AUTHENTICATED_ENCRYPTION_WRITE = 0x00000002;
this.GATM_SECURITY_PROPERTIES_UNAUTHENTICATED_ENCRYPTION_READ = 0x00000004;
this.GATM_SECURITY_PROPERTIES_AUTHENTICATED_ENCRYPTION_READ = 0x00000008;
this.GATM_SECURITY_PROPERTIES_UNAUTHENTICATED_SIGNED_WRITES = 0x00000010;
this.GATM_SECURITY_PROPERTIES_AUTHENTICATED_SIGNED_WRITES = 0x00000020;

/* The following define the flags that are valid with the CharacteristicProperties */
this.GATM_CHARACTERISTIC_PROPERTIES_BROADCAST = 0x00000001;
this.GATM_CHARACTERISTIC_PROPERTIES_READ = 0x00000002;
this.GATM_CHARACTERISTIC_PROPERTIES_WRITE_WO_RESP = 0x00000004;
this.GATM_CHARACTERISTIC_PROPERTIES_WRITE = 0x00000008;
this.GATM_CHARACTERISTIC_PROPERTIES_NOTIFY = 0x00000010;
this.GATM_CHARACTERISTIC_PROPERTIES_INDICATE = 0x00000020;
this.GATM_CHARACTERISTIC_PROPERTIES_AUTHENTICATED_SIGNED_WRITES = 0x00000040;
this.GATM_CHARACTERISTIC_PROPERTIES_EXT_PROPERTIES = 0x00000080;

/* The following define the flags that are valid with the DescriptorProperties */
this.GATM_DESCRIPTOR_PROPERTIES_READ = 0x00000001;
this.GATM_DESCRIPTOR_PROPERTIES_WRITE = 0x00000002;

ee.makeEmitter(ServerMessageHandler);
module.exports.ServerMessageHandler = ServerMessageHandler;

},{"./constants.js":23,"./event-emitter":24,"./message-helper":27}],30:[function(require,module,exports){
var C = require('./constants').C;
var Service = require('./../service').Service;
var Characteristic = require('./../characteristic').Characteristic;
var Descriptor = require('./../descriptor').Descriptor;

function parseDescriptorFromScanResponse(characteristic, params) {
    var duuid = params[C.kDescriptorUUID];

    var descriptor = characteristic.findDescriptor(duuid);
    if (!descriptor) {
        descriptor = new Descriptor(characteristic, duuid);
        characteristic.addDescriptor(descriptor);
    }

    descriptor.value = params[C.kValue];
}
function parseCharacteristicFromScanResponse(service, params) {
    var cuuid = params[C.kCharacteristicUUID];

    var characteristic = service.findCharacteristic(cuuid);
    if (!characteristic) {
        characteristic = new Characteristic(service, cuuid);
        service.addCharacteristic(characteristic);
    }

    characteristic.value = params[C.kValue];

    var cprops = params[C.kProperties];

    if (typeof cprops === 'object') {
        for (var flag in cprops) {
            characteristic.setProperty(
                flag,
                {
                    enabled: cprops[flag].enabled,
                    name: cprops[flag].name
                }
            );
        }
    } else {
        for (var apindex in C.AllProperties) {
            characteristic.setProperty(
                [C.AllProperties[apindex]],
                {
                    enabled: (cprops >> apindex) & 1,
                    name: C.AllProperties[apindex]
                }
            );
        }
    }
    characteristic.isNotifying = false;

    var descriptors = params[C.kDescriptors];
    if (descriptors) {
        for (var didx in descriptors) {
            var dparams = descriptors[didx];
            parseDescriptorFromScanResponse(characteristic, dparams);
        }
    }


}
function parseServiceFromScanResponse(peripheral, params) {
    var suuid = params[C.kServiceUUID];
    var service = peripheral.findService(suuid);
    if (!service) {
        service = new Service(peripheral, suuid);
        peripheral.addService(service);
    }

    var characteristics = params[C.kCharacteristics];
    if (characteristics) {
        for (var cidx in characteristics) {
            var cparams = characteristics[cidx];
            parseCharacteristicFromScanResponse(service, cparams);
        }
    }
}

module.exports.parseServiceRecord = function(peripheral, params) {
    var services = params[C.kServices];
    if (services) {
        for (var sidx in services) {
            var sparams = services[sidx];
            parseServiceFromScanResponse(peripheral, sparams)
        }
    }
};

//Parse the peripheral object & get the service DB.
function getDescriptorJsonFromCharacteristicObject(myCharacteristic) {
    var descriptor_db = {};

    if (myCharacteristic && myCharacteristic.getAllDescriptors()) {
        for (var uuid in myCharacteristic.getAllDescriptors()) {
            var temp_descriptor = {};
            temp_descriptor[C.kDescriptorUUID] = uuid;
            temp_descriptor[C.kValue] = myCharacteristic.findDescriptor(uuid).value;
            temp_descriptor[C.kProperties] = myCharacteristic.findDescriptor(uuid).properties;
            temp_descriptor[C.kIsNotifying] = myCharacteristic.findDescriptor(uuid).isNotifying;

            descriptor_db[uuid] = temp_descriptor;
        }
    }

    return descriptor_db;
}
function getCharacteristicJsonFromServiceObject(myService) {
    var characteristic_db = {};

    if (myService && myService.getAllCharacteristics()) {
        for (var uuid in myService.getAllCharacteristics()) {
            var temp_characteristic = {};
            temp_characteristic[C.kCharacteristicUUID] = uuid;
            temp_characteristic[C.kValue] = myService.findCharacteristic(uuid).value;
            temp_characteristic[C.kProperties] = myService.findCharacteristic(uuid).allProperties();
            temp_characteristic[C.kIsNotifying] = myService.findCharacteristic(uuid).isNotifying;
            temp_characteristic[C.kDescriptors] = getDescriptorJsonFromCharacteristicObject(myService.findCharacteristic(uuid));

            characteristic_db[uuid] = temp_characteristic;
        }
    }

    return characteristic_db;
}

module.exports.getServiceJsonFromPeripheralObject = function(myPeripheral) {
    var service_db = {};

    if (myPeripheral && myPeripheral.getAllServices()) {
        for (var uuid in myPeripheral.getAllServices()) {
            var temp_service = {};
            temp_service[C.kServiceUUID] = uuid;
            temp_service[C.kIsPrimaryKey] = myPeripheral.findService(uuid).isPrimary;
            temp_service[C.kCharacteristics] = getCharacteristicJsonFromServiceObject(myPeripheral.findService(uuid));

            service_db[uuid] = temp_service;
        }
    }

    return service_db;
};


},{"./../characteristic":18,"./../descriptor":19,"./../service":32,"./constants":23}],31:[function(require,module,exports){
var C = require('./lib/constants.js').C;
var helper = require('./lib/message-helper');
var advDataParser = require('./lib/message-advdata-parser');
var ee = require("./lib/event-emitter");
var serviceTable = require("./lib/service-table");
var Service = require("./service").Service;

function pushUnique(array, item) {
    if (array.indexOf(item) == -1) {
        array.push(item);
        return true;
    }
    return false;
}


// TODO: Errors if not connected
function Peripheral(gattip, uuid, name, rssi, txPwr, connectable, serviceUuids, mfrData, svcData) {
    ee.instantiateEmitter(this);
    var self = this;
    this.type = 'p';
    this.uuid = uuid;
    this.isConnected = false;
    var services = {};
    var manufacturerData = {};
    var serviceData = {};
    var serviceUUIDs = [];
    // constructor continues below
    this._updateFromScanData = function (name, rssi, txPwr, connectable, serviceUuids, mfrData, svcData, addata, scanData) {
        this.name = name;
        this.rssi = rssi;
        this.txPowerLevel = txPwr;
        this.connectable = connectable;
        var advertisementData = addata;
        var scanData = scanData;

        if (mfrData) {
            for (var mfrId in mfrData) {
                //TODO: Once we have 2.0, then we can remove toUpperCase()
                //noinspection JSUnfilteredForInLoop
                var id = mfrId.toUpperCase();
                //noinspection JSUnfilteredForInLoop
                manufacturerData[id] = mfrData[mfrId].toUpperCase();
            }
        }
        if (svcData) {
            for (var serUUID in svcData) {
                //noinspection JSUnfilteredForInLoop
                serviceData[serUUID] = svcData[serUUID];
            }
        }
        if (serviceUuids) {
            for (var sidx = 0; sidx < serviceUuids.length; sidx++) {
                pushUnique(serviceUUIDs, serviceUuids[sidx]);
            }
        }
        if (addata) {
            advDataParser.parseAdvArray(self, addata.c2);
            if(self.advdata.connectable){
                self.connectable = self.advdata.connectable === 'true';
            }
            if(self.advdata.txPowerLevel){
                this.txPowerLevel = self.advdata.txPowerLevel;
            }
            if(self.advdata.manufacturerData && !helper.isEmpty(self.advdata.manufacturerData)){
                for(var mfrKey in self.advdata.manufacturerData){
                    //noinspection JSUnfilteredForInLoop
                    var mKey = mfrKey.toUpperCase();
                    //noinspection JSUnfilteredForInLoop
                    manufacturerData[mKey] = self.advdata.manufacturerData[mfrKey].toUpperCase();
                }
            }
            // Thinking that always will get only one service UUID from the adv data.
            if(self.advdata.serviceUUIDs && self.advdata.serviceUUIDs.length > 0){
                pushUnique(serviceUUIDs, self.advdata.serviceUUIDs);
            }
        }

    };
    this.findService = function (uuid) {
        return services[uuid];
    };
    this.getMfrData = function (mfrId) {
        // id as hex string
        return manufacturerData[mfrId];
    };
    this.getSvcData = function (svcId) {
        // id as hex string
        return serviceData[svcId];
    };
    this.hasAdvertisedServiceUUID = function (serviceUUID) {
        return (serviceUUIDs.indexOf(serviceUUID) >= 0);
    };
    this.getAllServices = function () {
        return services;
    };
    this.getAllMfrData = function () {
        return manufacturerData;
    };
    this.getAllSvcData = function () {
        return serviceData;
    };
    this.getAllAdvertisedServiceUUIDs = function () {
        return serviceUUIDs;
    };
    this.addServiceWithUUID = function (serviceUUID) {
        var service = new Service(self, serviceUUID);
        return services[serviceUUID] = service;
    };
    this.addService = function (service) {
        return services[service.uuid] = service;
    };
    this.gattip = function () {
        return gattip;
    };


    // SERVER RESPONSES/INDICATIONS  ============================

    this.connectOnce = function (callback) {
        // TODO: Error if already connected
        var params = helper.populateParams(self);
        gattip.request(C.kConnect, params, callback, function (params) {
            serviceTable.parseServiceRecord(self, params);
            self.isConnected = true;
            gattip.fulfill(callback, self);
        });
    };


    /**
     * Attempts to connect to the peripheral
     * @param callback
     * @param config Optional object with numConnectAttempts. This value defaults to 3,
     * but may change to 1 in the future
     */
    this.connect = function (callback, config) {
        // TODO: Error if already connected

        var fullfillCb = (typeof callback == 'object' ? callback.fulfill : callback);

        var tries = C.NUM_CONNECT_ATTEMPTS;

        if (config && typeof config.numConnectAttempts == 'number') {
            tries = config.numConnectAttempts;
        }
        function tryConnect(error) {
            if (error) {
                console.log("Failed to connect. Error was", error, "Attempting", tries, "more times");
            }
            tries--;
            if (tries >= 0) {
                self.connectOnce({fulfill: fullfillCb, reject: tryConnect});
            } else {
                gattip.reject(callback, error)
            }
        }

        tryConnect();
    };

    this.disconnect = function (callback) {
        // TODO: Error if not connected
        var params = helper.populateParams(self);
        gattip.request(C.kDisconnect, params, callback, function (params) {
            self.isConnected = false;
            gattip.fulfill(callback, self);
        });
    };

    this.respondToConnectRequest = function (cookie) {
        var peripheral_db = {};
        peripheral_db[C.kPeripheralUUID] = this.uuid;
        peripheral_db[C.kPeripheralName] = this.name;

        var service_db;
        service_db = serviceTable.getServiceJsonFromPeripheralObject(this);
        peripheral_db[C.kServices] = service_db;

        cookie.result = C.kConnect;
        gattip.respond(cookie, peripheral_db);
    };

    this.handleDisconnectIndication = function () {
        self.isConnected = false;
        self.emit('disconnected', self);
    };

    this._updateFromScanData(name, rssi, txPwr, connectable, serviceUuids, mfrData, svcData);
}

ee.makeEmitter(Peripheral);

module.exports.Peripheral = Peripheral;

},{"./lib/constants.js":23,"./lib/event-emitter":24,"./lib/message-advdata-parser":25,"./lib/message-helper":27,"./lib/service-table":30,"./service":32}],32:[function(require,module,exports){
var helper = require('./lib/message-helper');
var Characteristic = require('./characteristic').Characteristic;

function Service(peripheral, uuid) {
    var self = this;
    var gattip = peripheral.gattip();
    var characteristics = {};

    helper.requireUUID('Service', 'uuid', uuid);
    this.uuid = uuid;
    this.type = 's';

    this.isPrimary = true; //TODO: read from remote
    // TODO: this.includedServices = {};

    this.peripheral = function () {
        return peripheral;
    };
    this.gattip = function () {
        return gattip;
    };
    this.getAllCharacteristics = function () {
        return characteristics;
    };
    this.findCharacteristic = function (uuid) {
        return characteristics[uuid];
    };
    this.addCharacteristicWithUUID = function (characteristicUUID, properties) {
        var characteristic = new Characteristic(self, characteristicUUID, properties);
        return characteristics[characteristicUUID] = characteristic;
    };

    this.addCharacteristic = function (characteristic) {
        characteristics[characteristic.uuid] = characteristic;
    };
}

exports.Service = Service;


},{"./characteristic":18,"./lib/message-helper":27}],33:[function(require,module,exports){
var C = require('./lib/constants.js').C;
var helper = require('./lib/message-helper');
var advDataParser = require('./lib/message-advdata-parser');
var ee = require("./lib/event-emitter");
var serviceTable = require("./lib/service-table");
var Service = require("./service").Service;


function Stream(gattip, objectId) {
    ee.instantiateEmitter(this);
    var self = this;

    this._objectId = objectId;

    this.getObjectId = function () {
        return self._objectId;
    };


    // REQUESTS =================================================

    this.writeData = function (callback, data) {
        helper.requireHexValue('writeData', 'data', data);
        var params = {};
        params[C.kObjectId] = self._objectId;
        params[C.kVal] = data;
        gattip.request(C.kWriteStreamData, params, callback, function (params) {
            gattip.fulfill(callback, self);
        });
    };

    this.closeStream = function (callback) {
        var params = {};
        params[C.kObjectId] = self._objectId;
        gattip.request(C.kCloseStream, params, callback, function (params) {
            gattip.fulfill(callback, self);
        });
    };
    // INDICATIONS ==============================================

    this.handleDataIndication = function (params) {
        self.emit('streamData', self, params[C.kValue]);
    };

    this.handleClosedIndication = function (params) {
        self.emit('streamClosed', self);
    };

    // SERVER RESPONSES/INDICATIONS  ============================

    this.indicateStreamData = function (data) {
        helper.requireHexValue('indicateStreamData', 'data', data);
        var params = {};
        params[C.kObjectId] = self._objectId;
        params[C.kVal] = data;
        gattip.sendIndications(C.kStreamDataIndication, params);
    };

    this.writeDataResponse = function (cookie) {
        var params = {};
        params[C.kObjectId] = self._objectId;
        cookie.result = C.kWriteStreamData;
        gattip.respond(cookie, params);
    };

    this.closeStreamResponse = function(cookie){
        var params = {};
        params[C.kObjectId] = self._objectId;
        cookie.result = C.kCloseStream;
        gattip.respond(cookie, params);
    };
}

ee.makeEmitter(Stream);

module.exports.Stream = Stream;




},{"./lib/constants.js":23,"./lib/event-emitter":24,"./lib/message-advdata-parser":25,"./lib/message-helper":27,"./lib/service-table":30,"./service":32}],34:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],35:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],36:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],37:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":36,"_process":34,"inherits":35}],"gatt-ip":[function(require,module,exports){
module.exports.GATTIP = require('./gattip').GATTIP;
module.exports.C = require('./lib/constants').C;

},{"./gattip":22,"./lib/constants":23}]},{},[1]);
