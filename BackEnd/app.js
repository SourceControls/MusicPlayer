var YoutubeMp3Downloader = require("youtube-mp3-downloader");
var cors = require("cors")
//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "./bin/ffmpeg.exe",        // FFmpeg binary location
  "outputPath": "./mp3",    // Output file location (default: the home directory)
  "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
  "queueParallelism": 2,                  // Download parallelism (default: 1)
  "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
  "allowWebm": false                      // Enable download from WebM sources (default: false)
});

//Download video and save as MP3 file

YD.on("finished", function (err, data) {
  console.log(JSON.stringify(data));
});

YD.on("error", function (error) {
  console.log(error);
});

YD.on("progress", function (progress) {
  console.log(JSON.stringify(progress));
  // clients[0].res.write(JSON.stringify(progress) + '\n\n');
  clients[0].res.write("data: " + JSON.stringify(progress.progress.percentage.toFixed()) + '\n\n')
});






const express = require('express')
const app = express()
const port = 3000

app.use(express.static(__dirname + '\\public'))
app.use(cors({
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}));
let clients = [];
app.get('/download', (req, res) => {
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


app.get('/', (req, res) => {
  res.sendFile(__dirname + "\\public\\song.mp3")
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


