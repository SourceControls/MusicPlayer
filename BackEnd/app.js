const db = require("./firebase.js")
const { collection, addDoc, getDocs } = require("firebase/firestore");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage")
var cors = require("cors")
const YD = require("./YTD")


const express = require('express')
const app = express()
const port = 8080

app.use(express.static(__dirname + '\\public'))
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

  // const docRef = await addDoc(collection(db, "users"), {
  //   first: "Ada",
  //   last: "Lovelace",
  //   born: 1815
  // });
  // console.log("Document written with ID: ", docRef.id);


  const querySnapshot = await getDocs(collection(db, "songs"));
  let songs = []
  querySnapshot.forEach((doc) => {
    songs.push({ id: doc.id, ...doc.data() });
  });
  res.send(songs);
})



app.get('/', (req, res) => {
  // response.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile('index.html')
})




//save file to cloud storage
// const storageRef = ref(getStorage(), 'song.mp3');
// const metadata = {
//   contentType: 'audio/mpeg',
// };
// var file = await require('fs').readFileSync('song.mp3');
// const uploadTask = uploadBytesResumable(storageRef, file, metadata);

// uploadTask.on('state_changed',
//   (snapshot) => {
//     // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//     console.log('Upload is ' + progress + '% done');
//     switch (snapshot.state) {
//       case 'paused':
//         console.log('Upload is paused');
//         break;
//       case 'running':
//         console.log('Upload is running');
//         break;
//     }
//   },
//   (error) => {
//     console.log(error);
//   },
//   () => {
//     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//       console.log('File available at', downloadURL);
//     });
//   }
// );
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



