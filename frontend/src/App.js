import React, { useState, useEffect } from "react";
import axios from "axios";
import io from 'socket.io-client';

function App() {
  const [videoURL, setVideoURL] = useState('');
  const [isDownload, SetisDownload] = useState(false);
  const [currentDuration, SetcurrentDuration] = useState(0);
  const [TotalDuration, SetTotalDuration] = useState(0);

  const socket = io("http://localhost:4000/");
  // const socket = io("https://ytdl-r9rl.onrender.com");

  useEffect(() => {
    socket.on('data sent', (data) => {
      SetcurrentDuration(data.size);
      SetTotalDuration(data.duration);
      // console.log(data.size,data.duration)
    });

    socket.on('download start', () => {
      console.log("DownLoad")
    });

    return () => {
      socket.off('data sent');
      socket.off('download start');
    };
  }, []);

  const DownLoadVideo = (blob) => {
    if (blob) {
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'Video.mp4';
      downloadLink.click();
      SetisDownload(false);
      socket.close()
    } else {
      console.error('Blob is null or undefined');
    }
  }

  const YTDLDownload = async () => {
    SetisDownload(true);
    socket.connect()
    const data = {
      URL: videoURL,
    };

    try {
      const response = await axios.post("http://localhost:4000", data, {
        headers: {
          "Content-Type": "application/json",
        },
        responseType:'blob'
      });

      if (response) {
        const blob = await response.data
        DownLoadVideo(blob);
      } else {
        console.error("Failed to merge videos");
      }

    } catch (error) {
      console.error(`Failed to merge videos: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <input type="text" onChange={(e) => setVideoURL(e.target.value)} />
      {
        (isDownload) && <p>Downloading...</p>
      }
      {
        <p>{currentDuration + '/' + TotalDuration}</p>
      }
      <button onClick={YTDLDownload}>Submit</button>
    </div>
  );
}
export default App;
