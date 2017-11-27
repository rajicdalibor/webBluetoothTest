/* Add gateway token */
var token;

// Picking up token from arguments or environment variable
if (!process.env.token) {
    // print process.argv
    process.argv.forEach(function (val, index, array) {
        if (index === 2) {
            token = val;
        }
    });
    if (!token) {
        console.log("Gateway token hasn't been passed. Please pass token as argument or set token in environment variable");
        return;
    }
} else {
    token = process.env.token;
}

/* Web Bluetooth initialization */
var wbp = require('blueapp-wb').init({
    url: 'wss://proxy.blueapp.io',
    token: token,
    trace: false
});

var navigator = wbp.navigator;

// Error handling function
function onError(err) {
    console.error("Bluetooth Error:", err);
    if (err && err.stack) {
        console.error(err.stack);
    }
}

// Helper function for converting data
function arrayBufferToHexString(buffer) {
    var tmpArray = new Uint8Array(buffer);
    var result = '';
    for (var i = 0; i < tmpArray.length; i++) {
        var hex = tmpArray[i].toString(16);
        if (hex.length == 1) {
            hex = '0' + hex;
        }
        result = result + hex;
    }
    return result;
}

// Helper function for extracting single data
function extractOneData(n, multiplier, data_array) {
    var hex_data = data_array[n + 1];
    return data = parseInt(hex_data, 16) * multiplier;
}

// Helper function for extracting triple data
function extractTripletData(n, multiplier, data_array) {
    var counter = n + 1;
    var counter1 = counter + 1;
    var value = [];
    value[0] = parseInt(data_array[counter], 16) * multiplier;
    value[1] = parseInt(data_array[counter1], 16) * multiplier;
    value[2] = parseInt(data_array[++counter1], 16) * multiplier;
    return value;
}

// Helper function for parsing manufacturer data
var getDataFromMfr = function (mfrData) {
    var d = new Date();

    var data_array = mfrData.match(/.{1,2}/g);

    var n = 0;
    var n2 = data_array.length;

    while (n < n2) {

        var n5 = '0x' + data_array[n];
        var rawData = n5 >> 4 & 15;
        var multiplier = Math.pow(2.0, (n5 & 15) - 8);

        switch (rawData) {
            case 1:
            {
                var extractedAcc = extractTripletData(n, multiplier, data_array);
                extractedAcc = extractedAcc.map(function (value) {
                    return value > 127 ? value - 255 : value;
                });
                extractedAcc = extractedAcc.map(function (value) {
                    return (value / 100).toFixed(2);
                });
                console.log('Acceleration = ', extractedAcc);
                break;
            }
            case 2:
            {
                var extractedGyro = extractTripletData(n, multiplier, data_array);
                extractedGyro = extractedGyro.map(function (value) {
                    return value > 127 ? value - 255 : value;
                });
                console.log('Gyroscope = ', extractedGyro);
                break;
            }
            case 3:
            {
                var extractedMag = extractTripletData(n, multiplier, data_array);
                extractedMag = extractedMag.map(function (value) {
                    return value > 127 ? value - 255 : value;
                });
                console.log('Magnetic = ', extractedMag);
                break;
            }
            case 4:
            {
                var extractedLight = extractTripletData(n, multiplier, data_array);
                console.log('Light = ', extractedLight);
                break;
            }
            case 5:
            {
                if (data_array[n] == '58') {
                    var extractedTemp = extractOneData(n, multiplier, data_array);
                    console.log('Temperature = ', extractedTemp);
                }
                break;
            }
            case 10:
            {
                var extractedHum = extractOneData(n, multiplier, data_array);
                console.log('Humidity = ', extractedHum);
                break;
            }
        }
        n = n + 2;
    }
};

// Options for requestDevicex
var options = {
    filters: [{manufacturerData: {0x1019: {}}}],
    acceptAllDevices: false
};

var wbdevice;

if(navigator.bluetooth) {
    // Reading data from device - Web Bluetooth specs
    navigator.bluetooth.requestDevice(options)
        .then(function (device) {
            console.log('> Found ' + device.name + ' matched to', device);
            console.log('Connecting to GATT Server...');
            wbdevice = device;
            // Starting to watch for advertisement
            wbdevice.watchAdvertisements();
            // Listening for event from requested device
            wbdevice.addEventListener('advertisementreceived', function (event) {
                // Getting data from manufacturerData map
                var data = event.manufacturerData.get(0x1019);
                // Converting byte array to hex string
                var result = arrayBufferToHexString(data);
                // Parsing hex string into meaningful data (using sensor's instructions)
                getDataFromMfr(result);
            });
        }).catch(onError);
} else {
    console.log('Bluetooth adapter not available');
}