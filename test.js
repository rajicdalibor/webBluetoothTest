var buf = new ArrayBuffer(80); // 2 bytes for each char
var bufView = new DataView(buf);

var str = '00040000000000000000000500010000000000000006000000000000000400070000000900060003';
bufView.setUint16(0, str, false);
// var u8buf = new Uint8Array(buffer);
console.log(bufView);
console.log(b)