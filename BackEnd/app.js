const db = require("./firebase.js")
const { collection, addDoc, getDocs } = require("firebase/firestore");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage")
var cors = require("cors")
const YD = require("./YTD")


const express = require('express')
const app = express()
const port = 8080

app.use(express.static(__dirname + '/public'))
app.use(cors({
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}));


var clients = []
module.exports = clients;
app.get('/download', (req, res) => {
  console.log("download: " + req.query.id);
  YD.download(req.query.id);
})

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
  });
  res.send(songs);
})


app.get('/AddSong', async (req, res) => {
  // const docRef = await addDoc(collection(db, "users"), {
  //   first: "Ada",
  //   last: "Lovelace",
  //   born: 1815
  // });
  // console.log("Document written with ID: ", docRef.id);
})


app.get('/', (req, res) => {
  // response.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + '/public/index.html')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



