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
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const CorsOption = {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
};

app.set('socketio', io)
app.use(cors(CorsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Add the CORS headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

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


