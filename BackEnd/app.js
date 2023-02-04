const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage")
const { collection, addDoc, getDocs } = require("firebase/firestore");
const db = require("./firebase.js")
const fs = require("fs")
var https = require('https');

const clients = []

const express = require('express')
const app = express()
const port = 8080
const cors = require("cors")



app.use(express.static(__dirname + '/public'))
app.use(cors({
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}));

// progress info when YD downloading
app.get('/SSE', (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);
  res.write("data: hello word" + '\n\n')
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
});


app.get('/GetListSong', async (req, res) => {
  const querySnapshot = await getDocs(collection(db, "songs"));
  let songs = []
  querySnapshot.forEach((doc) => {
    songs.push({ id: doc.id, ...doc.data() });
    //check song exists
    let songsId = doc.data().id;
    let songName = doc.data().name;
    if (!fs.existsSync(`./public/${songsId}.mp3`)) {
      console.log(`!EXITS ${songName}`);
      // var download = function (url, dest, cb) {
      //   var file = fs.createWriteStream(dest);
      //   https.get(url, function (response) {
      //     response.pipe(file);
      //     file.on('finish', function () {
      //       file.close(cb);
      //     });
      //   });
      // }
    }
  });
  res.send(songs);
})

app.get('/Download', (req, res) => {
  console.log("Download: " + req.query.id);
  YD.download(req.query.id, req.query.id + ".mp3");
})


app.get('/', (req, res) => {
  // response.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + '/public/index.html')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// const fs = require('fs');
const ytdl = require('ytdl-core');
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ', { format: 'mp3', "quality": 'highestaudio', "filter": 'audioonly' })
  .pipe(fs.createWriteStream('video.mp3').on('finish', function (e) {
    console.log('file downloaded' + e);
  }));
// ytdl('https://www.youtube.com/watch?v=Di37yZNNafY', { format: 'mp3', "quality": 'highestaudio', "filter": 'audioonly' })
//   .pipe(fs.createWriteStream('video2.mp3'));
// ytdl('https://www.youtube.com/watch?v=2mjgaDkGccA', { format: 'mp3', "quality": 'highestaudio', "filter": 'audioonly' })
//   .pipe(fs.createWriteStream('video3.mp3'));

module.exports = clients;
