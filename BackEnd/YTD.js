var YoutubeMp3Downloader = require("youtube-mp3-downloader");
const { collection, addDoc, getDocs } = require("firebase/firestore");
const db = require("./firebase.js")


//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "./bin/ffmpeg.exe",        // FFmpeg binary location
  "outputPath": "./public",    // Output file location (default: the home directory)
  "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
  "queueParallelism": 2,                  // Download parallelism (default: 1)
  "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
  "allowWebm": false                      // Enable download from WebM sources (default: false)
});


YD.on("finished", async function (err, data) {

  const docRef = await addDoc(collection(db, "songs"), {
    name: data.title,
    youtubeUrl: data.youtubeUrl,
    image: `https://img.youtube.com/vi/${data.videoId}/0.jpg`,
    image_s: data.thumbnail,
    singer: data.artist,
    url: `${data.videoId}.mp3`,
    id: data.videoId
  });
  console.log(JSON.stringify(data));
  var fs = require('fs');
  fs.rename(data.file, `./public/${data.videoId}.mp3`, function (err) {
    if (err) console.log('Rename ERROR: ' + err);
  });
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