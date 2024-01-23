const express = require("express");
const YTDL = express.Router();
const ytdl = require("ytdl-core");
const http = require("http");
const ffmpegStatic = require("ffmpeg-static");
const cp = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegStatic);

YTDL.post('/', async (req, res) => {
    const { URL } = req.body;
    const io = req.app.get('socketio');
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
            "-c:v",
            "libx264",
            "-crf",
            "23",
            "-profile:v",
            "baseline",
            "-level",
            "3.0",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-ac",
            "2",
            "-b:a",
            "128k",
            "-movflags",
            "faststart",
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
    ffmpegProcess.stdio[5].pipe(res);
    let currentDuration = 0;
    ffmpegProcess.stdio[5].on("data", (data) => {
        if (data) {
            currentDuration += data.length;
            console.log(Math.floor((currentDuration / (1024 * 1024))),Math.floor(videoduration))
            // io.emit('data sent', { size: Math.floor((currentDuration / (1024 * 1024))), duration: Math.floor(videoduration) });
        }
    });

    ffmpegProcess.stdio[5].on("end", () => {
        io.emit('download start');
    });
});

module.exports = YTDL;
