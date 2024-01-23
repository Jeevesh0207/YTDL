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

app.set('socketio',io)
app.use(cors(CorsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/',YTDL)
server.listen(4000, () => {
    io.on('connection', (socket) => {
        // console.log('New client connected');
        // socket.on('disconnect', () => console.log('Client disconnected'));
    });
    console.log("Server listening on port 4000");
});


