# Visible Things Demo App

##Basic Overview
Visible Things is application based on BlueApp platform for demonstration and testing purposes for developers who use BlueApp Web Bluetooth library for discovering and reading data from BLE device.


## Getting Started

There are few prerequisites for using and testing this app. Since it's based on BlueApp platform, we need to get some information about gateway that we want to use for communication between our app and particular device.

For that we want to use [BlueApp](http://blueapp.io) portal for managing gateways and devices.
For using and testing this app there are few prerequisites that you must fulfill.

### Prerequisites

For communication between our application and BLE devices via gateway we are using node BlueApp Web Bluetooth library based on GATT-IP protocol. Blueapp-wb is based on official Web Bluetooth specs.

### Installing

Download blueapp-wb npm package by running:

```
npm install blueapp-wb
```

or

```
npm install
```

because it's already in package.json.

### Blueapp account setup

In order to get this app working, we need to provide it with some information about gateway. In order to get some information first we need to open account on BlueApp.io webpage:

![alt text](https://github.com/rajicdalibor/webBluetoothTest/blob/master/images/mainpage.JPG =100x20 "Blueapp main page")

After getting new account, we are able to open just our new organization, but at this point we are unable to see any of the gateways assigned to that organization. For testing purposes we can switch to some existing organization with already attached gateway with nearby bluetooth devices.
In order to enter to particular organization, we need owner's invitation. Please send email for invitation request with requesting email address on kranti@vensi.com, and you will get one in short term.

Now, with gateway available, we can test some of the applications listed in main application menu. Eventually we can add our new application to our organization and use it with our gateways.

For development and testing our new app on local machine, we need gateway's token, which tells application to which gateway it should connect for scanning for BLE devices.
Selecting My Devices tab you can check all the gateways that are connected to particular organization. When we select the gateway we want to use, we can see gateway's details, where we can find Client Token that we need for our app.

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Gateway details")


## Starting the app

Now we have our app setup and our gateway's token, and we can start the app and test it.
Since it's node application, we are starting it by with command node vt-demo.js. There are two ways we can pass gateway's token that we get from Blueapp. One is storing gateway's token into environment variable as "token", or passing token argument when starting the app (node vt-demo.js gatewaytoken).


## Code details


Application stared, and hopefully we can see data readouts in our console. But how are we getting data from sensor?

### Requesting device
The main part of the application starts with navigator.bluetooth.requestDevice() promise function. According to Web Bluetooth we are using this function to search for devices that matches option parameters passed. In this case we passed manufacturerData that we want to match.

```
var options = {
    filters: [{manufacturerData: {0x1019:{}}}],
    acceptAllDevices: false
};
```

We can also pass the name, namePrefix, serviceData or services in filters object. Because we are listening for data advertisement, all this data that we want to match must be advertised by the device without connecting to it. We can also set acceptAllDevices to true, if we want to get first device that we get advertisement from.

### Watch for advertisement

As a return from requestDevice(), if gateway finds device that is matching with passed options we get device object. Getting that, we can connect to that device (if that is available) with device.gatt.connect() function, or we can continuously listen for advertisement from that particular device with device.watchAdvertisements() function. Following that, we have to subscribe to "advertisementreceived" event, and as a return, every time device emits new advertisement we are catching it.

From the device as a return we get manufacturerData, and it's in ByteArray format. So we need to add some parsing function to get some meaningful data. In this case we have our helper function for that (getDataFromMfr()).

In case we want to stop watching for advertisement we can call unwatchAdvertisements() function.

### Supported features

Some Bluetooth devices have connecting ability. When connected we are able to read data from device that are not available on advertisement.

For connecting to BLE device we can use device.gatt.connect() promise function. In return, if connected, we should get gatt server, which we can use to get services.

With service, we can check for characteristics, and read their values.

### Connect to device example

In this example we are connecting to BLE device, getting service and characteristic. Then we can read characteristic value or we can subscribe to "characteristicvaluechanged" event, and listen for new values.


```
...
navigator.bluetooth.requestDevice(options)
        .then(function(device) {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            wbdevice = device;
            // Connecting on device
            return wbdevice.gatt.connect()
                .then(function (server) {
                    // Getting primary service from device with passed uuid
                    return server.getPrimaryService(CURRENT_SERVICE_UUID)
                        .then(function (service) {
                            // Getting characteristic from service with passed uuid
                            return service.getCharacteristic(CURRENT_UUID)
                                .then(function (characteristic) {
                                    // Starting notifications on characteristic
                                    return characteristic.startNotifications()
                                        .then(function () {
                                            // Listening for event
                                            characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                var readoutBuffer = event.target.value.buffer;
                                                // Parsing readout data
                                                var readoutValue = parseCharacteristicValue(readoutBuffer);
                                                console.log(readoutValue);
                                            });
                                        });
                                })
                        })
...
```

### Adding application to Blueapp

When we get our application ready we can add it on Blueapp portal in our organization.

Let's open our organization in organizations tab. There we can see all the organization that we are subscribed to, and we can list organization's apps.

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Organization details")

Before we can add app to our organization, we have to post our app on some domain service, and set application's url to applications page. (You can upload it on your github account)

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Application setup")

It's also required to add some device filter (uuid or name).

Now we can see our application listed on main page and use from there.

## More information

For more GATT protocol detailed information check [GATT]().



