
var fetch = require('node-fetch')
var FormData = require('form-data');
var fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, '\\public\\song.mp3');



fs.readFile(filePath, { encoding: 'base64' }, function (err, data) {
  // console.log(data);
  // var data = new Buffer(data, 'binary').toString('base64');

  const client = require('filestack-js').init('A2e8Q60akQg2yTxbM05GKz');
  client.upload(data).then(data => console.log(data));
})