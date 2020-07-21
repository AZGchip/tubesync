import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

import Youtube from "react-youtube";
let player;
let video = "";
const options = {
  height: '390',
  width: '640',
  playerVars: {
    autoplay: 0,
  },
};
const client = new W3CWebSocket('ws://127.0.0.1:8050');

class WebSocket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opts: options,
      isPlaying: false,
      videoId: "1Zrq8FiKS6A",
      player: "",
      videoUrl:"",
    };
    this.handleInput = this.handleInput.bind(this)
  }

  sendVideoSrc = () => {
    const videoId = this.state.videoUrl.match(/(?<=v=)[a-z0-9-]*/i)
    client.send(JSON.stringify({
      type: "message",
      action: "load_and_sync",
      data: videoId
    }));
    
    console.log("attempting to send", videoId)
    
  }
  playVideo = () => {
    
    client.send(JSON.stringify({
      type: "message",
      action: "play",
      data: true
    }));
    console.log("attempting to play")
  }
  componentWillMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const serverData = JSON.parse(message.data);

      switch (serverData.action) {
        case "load_and_sync":
          console.log("sending load request")
          this.setState({ videoId: serverData.data })
          
          break;
        case "sync_start":
          console.log("syncing")
          
          break;
        case "play":
          player.playVideo()

      }

      console.log("reply received: ", serverData)
    }

  };
  _onStateChange(event) {
    console.log(event)
    if (event.data === 5){
    player.seekTo({ seconds: 1, allowSeekAhead: true })
    player.pauseVideo()
  }
  }
  _onReady(event) {
    player = event.target;
    
    

  }
  handleInput(event) {
    this.setState({videoUrl: event.target.value})
  }
  render() {
    return (

      <div>
        <Youtube
          videoId={this.state.videoId}
          opts={this.state.opts}
          onStateChange={this._onStateChange}
          onReady={this._onReady}
        />



        <input  onChange={this.handleInput} />
        <button onClick={() => this.sendVideoSrc()}>load Youtube URL</button>


        <button onClick={() => this.playVideo()}>play video </button>
      </div>
    );
  }
  
}
export default WebSocket;