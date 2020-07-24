import React from "react"
const hex = ["blue","green","orange","grey","purple","red"]
class Chat extends React.Component {
    
    render() {
        
        return (<div className="bg-light border border-bottom-0 col-md-12" style={{height:"352px",overflow:"auto",display:"flex",flexDirection:"column-reverse"}}>
            {this.props.chatContents.map((chat) => {
                const textcolor = hex[chat.textcolor]
                const userStyle = {color:textcolor}
                return <div className="row">
                    <div className=""style={userStyle}>{chat.user + ": "}</div>
                    <div className="">{chat.text}</div>
                </div>

            })}</div>)
    }
}







export default Chat