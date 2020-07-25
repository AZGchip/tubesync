import React, { Component, useContext } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ChatBox from "./Chatbox"
import Youtube from "react-youtube";
import UserInfoContext from '../utils/UserInfoContext';


let player;
let video = "";
const options = {
  height: '390',
  width: '100%',
  playerVars: {
    autoplay: 0,
    rel: 0,
    controls: 1,
    modestbranding: 1
  },
};
var HOST = process.env.WEBSOCKET || 'ws://127.0.0.1:8050';
const client = new W3CWebSocket(HOST);

class WebSocket extends Component {

  static contextType = UserInfoContext;
  constructor(props) {
    super(props);
    console.log("props", props)

    this.state = {
      opts: options,
      isPlaying: false,
      videoId: "uLF6VFME2jc",
      player: "",
      videoUrl: "",
      chat: [
      ],
      sendchat: "",
      currentUsers: [],
      userActivity: [],
      username: null,
      text: '',
      textcolor: "",
      chatInput: "",
      host: ""
    };
    this.handleInput = this.handleInput.bind(this)
    this.handleChatInput = this.handleChatInput.bind(this)

  }
  componentWillReceiveProps(nextProps) {
    console.log("will recieve", nextProps)
    this.setState({ username: nextProps.nameOfUser });
    return nextProps
  }
  numberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  //logs user in using login info or generates guest name
  logInUser = (user) => {
    console.log("username", user)
    
    const s4 = () => Math.floor((2 + Math.random()) * 0x10000).toString(16).substring(1);
    const username = this.co || "guest-" + s4();
    
   
    const textcolor = this.numberBetween(0, 50)
    if (username.trim()) {
      const data = {
        username,
        textcolor,
       
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
    if (this.state.videoUrl !== "") {
      const videoId = this.state.videoUrl.match(/(?<=v=)[a-z0-9-_]*/i)
      client.send(JSON.stringify({
        type: "message",
        action: "load_and_sync",
        data: videoId
      }));

      console.log("attempting to send", videoId)
    }
  }
  playVideo = (action) => {

    client.send(JSON.stringify({
      type: "message",
      action: action,
      data: true
    }));
    console.log("attempting to play")
  }
  componentWillMount() {

    console.log("user", this.props)
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      this.logInUser(this.componentWillReceiveProps)
    };

    //when message is recieved
    client.onmessage = (message) => {
      const stateToChange = {}
      const serverData = JSON.parse(message.data);
      if (serverData.type === "userevent") {
        stateToChange.currentUsers = Object.values(serverData.data.users);
        stateToChange.host = Object.values(serverData.data.host)
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
          const oldarray = this.state.chat.reverse()
          const newarray = oldarray.concat(serverData.data).reverse()

          this.setState({ chat: newarray })
          break;
        case "pause":
          player.pauseVideo()



      }

      console.log("reply received: ", serverData)
    }

  };

  //updates chat input
  updateChat() {
    if (this.state.sendchat !== "") {
      console.log("sending " + this.state.sendchat)
      client.send(JSON.stringify({
        type: "message",
        action: "chat",
        data: {
          user: this.state.username,
          text: this.state.sendchat,
          textcolor: this.state.textcolor
        }
      }));
      if (this.state.chatInput !== "") {
        this.state.chatInput.value = ""
        this.setState({ sendchat: "" })
      }
    }

  }

  //logs video player status
  _onStateChange(event) {
    console.log(event)
    if (event.data === 5) {
      player.seekTo({ seconds: 0, allowSeekAhead: true })
      player.pauseVideo()
    }
  }
  _onReady(event) {
    player = event.target;
    player.seekTo({ seconds: 1, allowSeekAhead: true })
    player.pauseVideo()
   

  }
  handleChatInput(event) {

    this.setState({
      sendchat: event.target.value,
      chatInput: event.target
    })
  }
  handleInput(event) {
    this.setState({ videoUrl: event.target.value })
  }
  render() {
    let controls
    //if logged in render player controls
    if (this.props.nameOfUser) {
      controls = <div>
        <div className="input-group col-12 px-0 mb-1">
          <input onChange={this.handleInput} className="form-control" />
          <div className="input-group-append">
            <button onClick={() => this.sendVideoSrc()} className="btn btn-light btn-outline-dark">load Youtube URL</button>
            <button onClick={() => this.sendVideoSrc()} className="btn btn-light btn-outline-dark">Save URL</button>
          </div>

        </div>

        <div className="input-group">
          <button onClick={() => this.playVideo("play")} className="btn btn-light btn-outline-dark ">Play </button>
          <button onClick={() => this.playVideo("pause")} className="btn btn-light btn-outline-dark ">Pause </button>
        </div>
      </div>
    }
    else { controls = <div></div> }
    return (

      <div className="container row mt-3 " >
        <div className="col-md-9 px-0">
          <Youtube
            videoId={this.state.videoId}
            opts={this.state.opts}
            onStateChange={this._onStateChange}
            onReady={this._onReady}
          />
          {controls}
        </div>
        <div className="col-lg-3 px-0 mx-0">
          <ChatBox chatContents={this.state.chat} />
          <div className="input-group">
            <input onChange={this.handleChatInput} className="form-control" />
            <div className="input-group-append">
              <button onClick={() => this.updateChat()} className="btn btn-light btn-outline-dark">send</button>
            </div>
          </div>
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