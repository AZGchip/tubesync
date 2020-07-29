import React, { useState, useContext } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import WebSocket from "../components/WebSocket"
// import context for global state
import UserInfoContext from '../utils/UserInfoContext';
import { saveBook, searchYoutubeData } from '../utils/API';
import * as API from '../utils/API';
import AuthService from '../utils/auth';
const SyncData = [
  {
    image: "https://img.youtube.com/vi/uLF6VFME2jc/hqdefault.jpg",
    title: "presentation time!",
    link: "http://tubesync.net/watch",
    video: "01. Frostpunk Theme - Frostpunk Original Soundtrack"
  },

]
const key = "AIzaSyDiq2w49wObAXmSH6cFRl09ydu3ckGKNq8"
let vidID;

function SavedBooks() {
  
  const eventhandler = data => vidID = data.match(/(?<=v=)[a-z0-9-_]*/i)[0] ;

  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  const userData = useContext(UserInfoContext);

  // create method to search for books and set state on form submit
  const handleFormSubmit = (event) => {
    if (!vidID) {
      console.log("no vidID")
      return false;
    }
    else {
      console.log("saving vidID", vidID);

      getYoutubeDataAndSave(vidID)
    }
  };
  function getYoutubeDataAndSave(id){
    searchYoutubeData({key,id:id}).then(({data})=>{
     console.log("youtube Data",data)
     const basicInfo = data.items[0].snippet
     const databaseInfo = {
       linkId:id,
       title:basicInfo.localized.title,
       channelName: basicInfo.channelTitle
     }
     handleSaveLink(databaseInfo)
   })
   };
  // create function to handle saving a book to our database
  const handleSaveLink = (bookId) => {
    // find the book in `searchedBooks` state by the matching id


    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    // send the books data to our api
    saveBook(bookId, token)
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };
  const publicSyncs = SyncData.map((card) => {
    return <div className="card col-md-3 float-left px-0 border-dark bg-dark btn">
      <a href={card.link}>

        <img className="card-img-top" src={card.image} alt="Card image cap" style={{ width: "100%" }}></img> </a>
      <div className="text-light">
        <h5 className="card-title text-center">{card.title}</h5>
        <p className="card-text font-weight-light"><small>Currently watching: {card.video}</small></p>
      </div>

    </div>
  })
  // get whole userData state object from App.js

  console.log("this is user data", userData)

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = (bookId) => {
    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }
    API.deleteBook(bookId, token)
      // upon succes, update user data to reflect book change
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };

  return (
    <>

      <Container>

        <WebSocket nameOfUser={userData.username} saveRequest={handleFormSubmit} onChange={eventhandler} />

        {/* <h4>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'No stored links'}
        </h4> */}

        <CardColumns>
          {userData.savedBooks.map((link) => {
            
            console.log("this is link info", link)
            return (
              <div className="card bg-dark">
                <div className="row no-gutters">
                  <div className="col-auto">
                    <img style={{ height: "100px" }} src={"https://img.youtube.com/vi/" + link.linkId + "/hqdefault.jpg"} className="img-fluid" alt=""></img>
                  </div>
                  <div className="col">
                    <div className="card-block px-2">
            <h5 className="card-title text-light">{link.title}</h5>
                      <p className="text-light">
              {link.channelName}
 </p>

                    </div>
                  </div>
                </div>
                <div className="card-footer w-100 text-muted">
                  <button className="btn btn-light" >Load</button>
                </div>
              </div>
              // <Card key={book.bookId} border='dark'>
              //   {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
              //   <Card.Body>
              //     <Card.Title>{book.title}</Card.Title>
              //     <p className='small'>Authors: {book.authors}</p>
              //     <Card.Text>{book.description}</Card.Text>
              //     <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
              //       Delete this Book!
              //     </Button>
              //   </Card.Body>
              // </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
}

export default SavedBooks;
