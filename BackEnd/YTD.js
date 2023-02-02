var YoutubeMp3Downloader = require("youtube-mp3-downloader");


//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
  "ffmpegPath": "./bin/ffmpeg.exe",        // FFmpeg binary location
  "outputPath": "./public",    // Output file location (default: the home directory)
  "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
  "queueParallelism": 2,                  // Download parallelism (default: 1)
  "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
  "allowWebm": false                      // Enable download from WebM sources (default: false)
});


YD.on("finished", function (err, data) {
  console.log(JSON.stringify(data));
});

YD.on("error", function (error) {
  console.log(error);
});

YD.on("progress", function (progress) {
  console.log(JSON.stringify(progress));
  let clients = require("./app");
  clients[0].res.write("data: " + JSON.stringify(progress.progress.percentage.toFixed()) + '\n\n')
});

module.exports = YD