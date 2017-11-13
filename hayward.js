(function () {

    var gattip = null;

    const SERVICE_UUID = "1234";

    const SHUNT_VOLT_UUID = "1236";
    const BUS_VOLT_UUID = "1237";
    const CURRENT_UUID = "1239";
    const RELAY_UUID = "123B";
    var TEST1 = 'aaaaaa';
    var SENSOR_SERVICE = "00000000-0001-11e1-9ab4-0002a5d5c51b";
    var MICROPHONE_CHAR = "04000000-0001-11e1-ac36-0002a5d5c51b";
    var TEST = "00000000-000e-11e1-9ab4-0002a5d5c51b";
    // var TEST = "generic_attribute";

    var Hayward = function() {
        // constructor() {
            this.connected = false;
            this.isOn1 = false;
            this.isOn2 = false;

            this.haywardUnit = 'mA';
            this.currentValue = 0;
            this.peripherals = {};
            var self = this;
            self.gattip = navigator.bluetooth.gattip;
            console.log(navigator.bluetooth);
            // var options = {filters:[{services:[SENSOR_SERVICE, TEST, 'generic_attribute']}]};
            var s = '';
        console.log(s.length);



        navigator.bluetooth.requestDevice({
            filters: [
                // { services: [BluTerm.terminalServiceUUID] },
                // { services: [BluTerm.oldTerminalServiceUUID] }
                { services: [SENSOR_SERVICE] },
                { services: ['50270001-df25-45b0-8ad9-b27ceba6622f'] }
            ],
            acceptAllDevices: false
        });

        // var options = {filters:[{services:['generic_attribute', 0x1801, SENSOR_SERVICE]}], acceptAllDevices: true};
            // var options = {filters:[]};
        //
        // navigator.bluetooth.requestLEScan(options)
        //     .then(function (device) {
        //         console.log(device);
        //         navigator.bluetooth.addEventListener('advertisementreceived', function (event) {
        //             console.log(event);
        //             var mfrData = event.manufacturerData.get('0201');
        //             if (mfrData) {
        //                 console.log(mfrData);
        //                 var data = mfrData.getUint16(0);
        //                 console.log(data);
        //                 // for(var m=0; m<mfrData.byteLength; m++){
        //                 //     console.log(mfrData.getUint16(m, false));
        //                 // }
        //                 // console.log(data);
        //                 // if (!self.peripherals[peripheral.uuid]) {
        //                 //     self.peripherals[peripheral.uuid] = peripheral;
        //                 //     self.peripherals[peripheral.uuid].trim_uuid = peripheral.uuid.replace(/:/g, '-');
        //                 //
        //                 //     self.peripherals[peripheral.uuid].isFirst = true;
        //                 // }
        //                 //
        //                 // var data = mfrData.getUint16(16, false); //getting the current data from mfr data
        //                 //
        //                 // self.peripherals[peripheral.uuid].currentValue = calcHaywardReading(data) * 0.01;
        //                 // self.updateUI();
        //             }
        //         })
        //     }, function (error) {
        //         console.warn('Service not found. ' + error);
        //     });


            navigator.bluetooth.requestDevice({
                filters: [
                    // { services: [BluTerm.terminalServiceUUID] },
                    // { services: [BluTerm.oldTerminalServiceUUID] }
                    { services: [SENSOR_SERVICE] },
                    { services: ['50270001-df25-45b0-8ad9-b27ceba6622f'] }
                ],
                acceptAllDevices: false
            })
            /* Connecting to the device */
                .then(function (device) {
                    self.bluetoothDevice = device;
                    console.log(device);
                    self.radi = 'povezan';
                    device.watchAdvertisements();
                    device.addEventListener('advertisementreceived', function (event) {
                        console.log(event);
                    });
                    setTimeout(function () {
                        device.unwatchAdvertisements();
                        console.log('zaustavljeno');
                        console.log(device);
                    },30000);

                    return device.gatt.connect();
                })
                .then(function (server) {
                    console.log("Discovering services");
                    self.server = server;
                    console.log(server);
                    self.connected = true;
                    setTimeout(function () {
                    //     // console.log(self.server.disconnect());
                        self.server.disconnect();
                        console.log(self.bluetoothDevice);
                    //     console.log(server);
                    },15000);
                    /* Adding disconnection listener */
                    self.bluetoothDevice.addEventListener("gattserverdisconnected", function () {
                        self.onError('Device disconnected');
                        self.connected = false;
                        console.log('disconnected');
                        console.log(self.bluetoothDevice.gatt.connected);
                        // self.initialize();
                    });
                    var svi = self.server.getSvi();
                    console.log(svi);
                    self.testVrednost = svi;
                //     /* Getting sensor service */
                    return server.getPrimaryService(SENSOR_SERVICE)
                        .then(function (services) {
                            console.log(services);
                            return services.getCharacteristic(MICROPHONE_CHAR)
                                .then(function (char) {
                                    console.log(char);
                                })

                        }
                        , function (error) {
                        console.warn('Service not found. ' + error);
                        self.onError('Timed out');
                        Promise.resolve(true);
                    });
                    // return server.getPrimaryService(SENSOR_SERVICE)
                        // .then(function (service) {
                        //     console.log(service);
                        //         Promise.all([
                        //             /* Getting environmetnal characteristic (ver 1. firmware) */
                        //             service.getCharacteristic(MICROPHONE_CHAR)
                        //                 .then(function (characteristic) {
                        //                     console.log(characteristic);
                        //                     var a =characteristic.getDescriptor(0x2902)
                        //                         .then(function (descriptors) {
                        //                             console.log(descriptors);
                        //                             // var d = descriptors[0];
                        //                             // console.log(d);
                        //                             descriptors.readValue()
                        //                                 .then(function (value) {
                        //                                     console.log(value);
                        //                                     var s = value.getUint8(0) & 0b01;
                        //                                     console.log(s);
                        //                                 })
                        //                         })
                        //                     // console.log(a);
                        //                     return characteristic.stopNotifications()
                        //                         .then(function () {
                        //                             characteristic.addEventListener('characteristicvaluechanged', function (value) {
                        //                                 // extractEnvironmentalData(self, parseResponse(value.target.value.buffer));
                        //                                 // self.updateUI();
                        //                             });
                        //                         });
                        //                 })
                        //         ]).catch(function (err) {
                        //             console.log(err);
                        //         });
                        // });
                    /* Error handling function */
                }, function (error) {
                    console.warn('Service not found ' + error);
                    self.onError('Timed out');
                    Promise.resolve(true);
                })
                    // navigator.bluetooth.addEventListener('advertisementreceived', function(event) {
                    //     console.log('ovde');
                    //     console.log(event);
                    //     console.log(event.manufacturerData.get('004C'));
                    //     var s = event.manufacturerData.get('004C');
                    //     if(s) {
                    //         console.log(s.buffer);
                    //         var g = new ArrayBuffer(s.buffer);
                    //
                    //         for(var j =0; j<s.buffer.byteLength;j++){
                    //             console.log(g[j]);
                    //         }
                    //
                    //         var uuidArray = new Uint8Array(s.buffer, 2, 16);
                    //         var m = s.getUint16(3, false);
                    //         console.log(m);
                    //         console.log(uuidArray);
                    //     }
                    //     // var mfr = event.manufacturerData.get('0201');
                    //     // console.log(mfr);
                    //     // console.log(navigator.bluetooth);
                    //     // var m = mfr.getUint16(20, false);
                    //     // console.log(m);
                    // })
                // })
                // .then(function () {
                //     setTimeout(function () {
                //         console.log('skeniranja');
                //         console.log(navigator.bluetooth.activeScans);
                //         navigator.bluetooth.activeScans[0].stop();
                //         setTimeout(function () {
                //             console.log(navigator.bluetooth.activeScans);
                //         },3000);
                //
                //     },4000);
                // });

            // gattip.once('ready', function (gateway) {
            //     function onScan(peripheral) {
            //         var mfrData;
            //        
            //         mfrData = peripheral.getMfrData('02F4') || peripheral.getMfrData('02f4');
            //        
            //         if (mfrData) {
            //             mfrData = mfrData.toUpperCase();
            //             if (!hayward.peripherals[peripheral.uuid]) {
            //                 hayward.peripherals[peripheral.uuid] = peripheral;
            //                 var trim_uuid = peripheral.uuid.replace(/:/g, '-');
            //                 hayward.peripherals[peripheral.uuid].trim_uuid = trim_uuid;
            //
            //                 hayward.peripherals[peripheral.uuid].isFirst = true;
            //             }
            //
            //             var data = mfrData.substr(16, 4); //getting the current data from mfr data
            //             var currentValue = hayward.calcHaywardReading(data) * 0.01;
            //
            //             hayward.peripherals[peripheral.uuid].currentValue = currentValue;
            //             hayward.updateUI();
            //         }
            //     }
            //
            //     gateway.scan();
            //     gateway.on('scan', onScan);
            // });
            //
            // gattip.on('error', function (err) {
            //     console.log(err);
            // });
        // }

        /* ------- Hayward Handling Functions ------- */
        var calcHaywardReading = function(value){
            var dataR = value;
            if (dataR) {
                var reading = '' + dataR[0] + dataR[1] + dataR[2] + dataR[3];
                var readingValue = parseInt(reading, 16);
                return readingValue;
            }
        }
    }

    window.hayward = new Hayward();
})();