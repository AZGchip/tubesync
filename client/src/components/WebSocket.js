import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ChatBox from "./Chatbox"
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
var HOST = process.env.WEBSOCKET || 'ws://127.0.0.1:8050';
const client = new W3CWebSocket(HOST);

class WebSocket extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opts: options,
      isPlaying: false,
      videoId: "uLF6VFME2jc",
      player: "",
      videoUrl: "",
      chat: [
        {
          
          user: "bobithy",
          text: "hello world"
        },
        {
          
          user: "bingus",
          text: "hello world"
        },

      ],
      sendchat: "",
      currentUsers: [],
      userActivity: [],
      username: null,
      text: ''
    };
    this.handleInput = this.handleInput.bind(this)
    this.handleChatInput = this.handleChatInput.bind(this)
  }
  logInUser = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      const username = this.props.username || "guest-"+s4();
    
    if (username.trim()) {
      const data = {
        username
      };
      this.setState({
        ...data
      }, () => {
        client.send(JSON.stringify({
          ...data,
          type: "userevent"
        }));
      });
    }
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
  componentDidMount() {
    
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      this.logInUser()
    };
    client.onmessage = (message) => {
      const stateToChange = {}
      const serverData = JSON.parse(message.data);
      if (serverData.type === "userevent") {
        stateToChange.currentUsers = Object.values(serverData.data.users);
      } else if (serverData.type === "contentchange") {
        stateToChange.text = serverData.data.editorContent || "hi";
      }
      stateToChange.userActivity = serverData.data.userActivity;
      this.setState({
        ...stateToChange
      });
      console.log(this.state.username)
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
        break;
        case "chat":
        
        const newarray = this.state.chat.concat(serverData.data)
        
        this.setState({chat:newarray})
      }

      console.log("reply received: ", serverData)
    }

  };


  updateChat() {
    console.log("sending "+ this.state.sendchat)
    client.send(JSON.stringify({
      type: "message",
      action: "chat",
      data: {
        user: this.state.username,
        text: this.state.sendchat
      }
    }));


  }
  _onStateChange(event) {
    console.log(event)
    if (event.data === 5) {
      player.seekTo({ seconds: 1, allowSeekAhead: true })
      player.pauseVideo()
    }
  }
  _onReady(event) {
    player = event.target;



  }
  handleChatInput(event) {
    
    this.setState({ sendchat: event.target.value })
  }
  handleInput(event) {
    this.setState({ videoUrl: event.target.value })
  }
  render() {
    return (

      <div className="container row mt-3">
        <div className="col-md-9 px-0">
          <Youtube
            videoId={this.state.videoId}
            opts={this.state.opts}
            onStateChange={this._onStateChange}
            onReady={this._onReady}
          />
          <input onChange={this.handleInput} />
          <button onClick={() => this.sendVideoSrc()}>load Youtube URL</button>
          <button onClick={() => this.playVideo()}>play video </button>

        </div>
        <div className="col-lg-3 px-0 mx-0">
          <ChatBox chatContents={this.state.chat} />
          <input onChange={this.handleChatInput} />
          <button onClick={() => this.updateChat()}>send</button>
        </div>





      </div>
    );
  }

}
export default WebSocket;

// componentWillMount() {
  //   client.onopen = () => {
  //     console.log('WebSocket Client Connected');
  //   };
  //   client.onmessage = (message) => {
  //     const serverData = JSON.parse(message.data);

  //     switch (serverData.action) {
  //       case "load_and_sync":
  //         console.log("sending load request")
  //         this.setState({ videoId: serverData.data })

  //         break;
  //       case "sync_start":
  //         console.log("syncing")

  //         break;
  //       case "play":
  //         player.playVideo()

  //     }

  //     console.log("reply received: ", serverData)
  //   }

  // };