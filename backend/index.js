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
const server = http.createServer(app) || "https://ytdl-mu.vercel.app/";
const { Server } = require('socket.io')
const io = new Server(server)
// const io = require('socket.io')(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//       transports: ['websocket', 'polling'],
//       credentials: true
//     },
//     allowEIO3: true,
//   });


const CorsOption = {
    origin: '*',
    credentials: true
};

app.set('socketio', io)
app.use(cors(CorsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', YTDL)

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('message', (ms) => {
        io.emit('message', ms);
    });
});

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});


