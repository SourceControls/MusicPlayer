var YoutubeMp3Downloader = require("youtube-mp3-downloader");
const { collection, addDoc, getDocs } = require("firebase/firestore");
const db = require("./firebase.js")


//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "./bin/ffmpeg.exe",        // FFmpeg binary location
  "outputPath": "./public",    // Output file location (default: the home directory)
  "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
  "queueParallelism": 1,                  // Download parallelism (default: 1)
  "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
  "allowWebm": false                      // Enable download from WebM sources (default: false)
});


YD.on("finished", async function (err, data) {


  //save file to cloud storage
  const storageRef = ref(getStorage(), 'song.mp3');
  const metadata = {
    contentType: 'audio/mpeg',
  };
  var file = await require('fs').readFileSync('song.mp3');
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  uploadTask.on('state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    },
    (error) => {
      console.log(error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
      });

      const docRef = await addDoc(collection(db, "songs"), {
        name: data.title,
        youtubeUrl: data.youtubeUrl,
        serverUrl: `${data.videoId}.mp3`,
        cloudUrl: `${data.videoId}.mp3`,
        image: `https://img.youtube.com/vi/${data.videoId}/0.jpg`,
        image_s: data.thumbnail,
        singer: data.artist,
        id: data.videoId
      });
      console.log(JSON.stringify(data));
    });

  YD.on("error", function (error) {
    console.log(error);
  });

  YD.on("progress", function (progress) {
    console.log(JSON.stringify(progress));
    let clients = require("./app");
    clients.forEach(e => {
      e.res.write("data: " + progress.progress.percentage.toFixed() + '\n\n')
    });
  });

  module.exports = YD