import React from "react"
class Chat extends React.Component {

    render() {
        return (<div className="bg-secondary" style={{float:"bottom",paddingBottom:"100%"}}>
            {this.props.chatContents.map((chat) => {
                return <div className="row col-12">
                    <div className="text-info">{chat.user + ":"}</div>
                    <div className="">{chat.text}</div>
                </div>

            })}</div>)
    }
}







export default Chat