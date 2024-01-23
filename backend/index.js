const express = require("express");
const http = require("http");
const ytdl = require("ytdl-core");
const ffmpegStatic = require("ffmpeg-static");
const cp = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const bodyParser = require("body-parser");
const YTDL = require("./routes/YTDL");

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const CorsOption = {
    origin: '*',
    credentials: true
};

app.use(cors(CorsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.post('/', async (req, res) => {
    const { URL } = req.body;
    let videoduration = 0;
    const Video = ytdl(URL, {
        filter: (format) => {
            if (format.quality === "hd1080") {
                videoduration = Math.max(videoduration, format.contentLength / 1024 / 1024);
            }
            return format.quality === "hd1080";
        },
    });

    const Audio = ytdl(URL, {
        filter: (format) => {
            return format.audioQuality === "AUDIO_QUALITY_MEDIUM";
        },
    });

    
    const ffmpegProcess = cp.spawn(
        ffmpegStatic,
        [
            "-loglevel",
            "8",
            "-hide_banner",
            "-i",
            "pipe:3",
            "-i",
            "pipe:4",
            "-map",
            "0:a",
            "-map",
            "1:v",
            "-c",
            "copy",
            "-f",
            "matroska",
            "pipe:5",
        ],
        {
            windowsHide: true,
            stdio: ["inherit", "inherit", "inherit", "pipe", "pipe", "pipe"],
        }
    );

    Audio.pipe(ffmpegProcess.stdio[3]);
    Video.pipe(ffmpegProcess.stdio[4]);
    ffmpegProcess.stdio[5].pipe(res)
    let currentDuration = 0;
    ffmpegProcess.stdio[5].on("data", (data) => {
        currentDuration += data.length
        io.emit('data sent', { size: Math.floor((currentDuration / (1024 * 1024))), duration: Math.floor(videoduration) });
    })

})

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});


