const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage")
const { collection, doc, setDoc, getDocs, getDoc, deleteDoc, Timestamp, updateDoc } = require("firebase/firestore");
const db = require("./firebase.js")
const songRef = collection(db, "songs");
const configRef = collection(db, "config");
const fs = require("fs")
const ytdl = require('ytdl-core');

const clients = []

const express = require('express')
const app = express()
const port = 8080
const cors = require("cors");
const { async } = require("@firebase/util");
const path = require("path");

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
    clients.splice(clients.indexOf(clientId), 1);
  });
});

app.get('/GetListSong', async (req, res) => {
  const queryDocs = await getDocs(songRef);
  let songs = []

  queryDocs.forEach((doc) => {
    let id = doc.id;
    songs.push({ id, ...doc.data() });
    //if song !exits, then redownload it

    if (!fs.existsSync(`${__dirname}/public/songs/${id}.mp3`)) {
      console.log(`!EXITS ${doc.data().name}`);
      download(id)
    }
  });

  songs.sort((a, b) => b.createdTimestamp.seconds - a.createdTimestamp.seconds);
  res.send(songs);
})

app.get('/Download', async (req, res) => {
  //check permission
  let permission = await getDoc(doc(db, "config", "end-user-config"));
  if (!permission.data().download) {
    res.send("Chức năng download hiện đang khóa! Liên hệ để mở")
    return;
  }
  //check exist songs
  let vidId = req.query.id
  let queryDoc = await getDoc(doc(db, "songs", vidId))
  if (queryDoc.exists()) {
    res.send("Songs already exists!")
    return;
  }
  let vidLength = (await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${vidId}`)).videoDetails.lengthSeconds
  let maxVidLength = 7200 //2 hours
  if (vidLength > maxVidLength) {
    res.send(`Video too long, max: ${maxVidLength / 3600}hours`)
    return;
  }
  download(vidId)
  res.send('Done download!')
})

app.get('/Delete', async (req, res) => {
  //check permissions
  let permission = await getDoc(doc(db, "config", "end-user-config"));
  if (!permission.data().delete) {
    res.send("Chức năng xóa hiện đang khóa! Liên hệ để mở")
    return;
  }

  let id = req.query.id;
  await fs.rmSync(`public/songs/${id}.mp3`, {
    force: true,
  });
  await deleteDoc(doc(db, "songs", id));
  console.log("delete: " + id);
  reloadClient();
})

app.get('/', (req, res) => {
  // response.setHeader("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + '/public/index.html')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


async function download(vidId) {
  //start downloading
  let url = `http://www.youtube.com/watch?v=${vidId}`
  let options = { format: 'mp3', "quality": 'highestaudio', "filter": 'audioonly' }
  let songPath = `${__dirname}/public/songs/${vidId}.mp3`
  console.log("Start download: " + vidId);
  ytdl(url, options)
    .pipe(fs.createWriteStream(songPath).on('finish', async () => {
      //save to firestore
      let vidInf = (await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${vidId}`)).videoDetails
      let songInf = {
        title: vidInf.title,
        authorName: vidInf.author.name,
        authorChannel: vidInf.author.channel_url,
        length: vidInf.lengthSeconds,
        thumbnail_s: vidInf.thumbnails[1].url,
        thumbnail_l: vidInf.thumbnails[vidInf.thumbnails.length - 1].url,
        youtubeUrl: vidInf.video_url,
        songPath: `/songs/${vidId}.mp3`,
        createdTimestamp: Timestamp.now()
      }
      await setDoc(doc(db, "songs", vidId), songInf)
      console.log('Downloaded: ' + url);

      reloadClient();
    }));
}
//dùng cho dev
// updateAll()
async function updateAll() {
  const queryDocs = await getDocs(songRef);
  queryDocs.forEach((e) => {
    let id = e.id;
    updateDoc(doc(db, "songs", id), {
      createdTimestamp: Timestamp.now()
    });
  });
}

function reloadClient() {
  //reload clients
  clients.forEach(e => {
    e.res.write("data: reload" + '\n\n')
  });
}


// setDoc(doc(db, "songs", "LA1"), { name: 1 }).then(doc => console.log(doc));
// getDoc(doc(db, "songs", "LA")).then(doc => console.log(doc.exists()));
module.exports = clients;



