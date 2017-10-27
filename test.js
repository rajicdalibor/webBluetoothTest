var div = document.getElementById('test');
div.innerHTML = 'Darko';
var SENSOR_SERVICE = "00000000-0001-11e1-9ab4-0002a5d5c51b";

div.innerHTML = JSON.stringify(navigator.bluetooth);
var bt = navigator.bluetooth;
console.log(bt);
console.log(navigator);
var options = {filters:[{services:[SENSOR_SERVICE, 0x128d]}]};
navigator.bluetooth.requestDevice(options)
/* Connecting to the device */
    .then(function (device) {
        self.bluetoothDevice = device;
        div.innerHTML = 'povezano';
        return device.gatt.connect();
    }, function (error) {
        div.innerHTML = 'nije uspesno';
    })