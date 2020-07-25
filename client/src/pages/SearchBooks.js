import React, { useState, useContext } from 'react';
import { Jumbotron, Container, Row, Col, Form, Button, Card, CardColumns } from 'react-bootstrap';

import UserInfoContext from '../utils/UserInfoContext';
import AuthService from '../utils/auth';
import { saveBook, searchGoogleBooks } from '../utils/API';
const SyncData = [
  {
    image:"https://img.youtube.com/vi/uLF6VFME2jc/hqdefault.jpg",
    title:"presentation time!",
    link:"http://localhost:3000/",
    video:"01. Frostpunk Theme - Frostpunk Original Soundtrack"
  },
  
]

function SearchBooks() {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  const userData = useContext(UserInfoContext);

  // create method to search for books and set state on form submit
  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    searchGoogleBooks(searchInput)
      .then(({ data }) => {
        const bookData = data.items.map((book) => ({
          bookId: book.id,
          authors: book.volumeInfo.authors || ['No author to display'],
          title: book.volumeInfo.title,
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
        }));
        console.log(bookData);

        return setSearchedBooks(bookData);
      })
      .then(() => setSearchInput(''))
      .catch((err) => console.log(err));
  };

  // create function to handle saving a book to our database
  const handleSaveBook = (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = AuthService.loggedIn() ? AuthService.getToken() : null;

    if (!token) {
      return false;
    }

    // send the books data to our api
    saveBook(bookToSave, token)
      .then(() => userData.getUserData())
      .catch((err) => console.log(err));
  };
  const publicSyncs = SyncData.map((card) =>{
    return <div className="card col-md-3 float-left px-0 border-dark bg-dark">
     
  
      <img className="card-img-top" src={card.image} alt="Card image cap"style={{width:"100%"}}></img>
  <div className="text-light">
  <h5 className="card-title text-center">{card.title}</h5>
  <p className="card-text font-weight-light"><small>Currently watching: {card.video}</small></p>
  </div>
    </div>
  })
  return (

    <>
      

      <Container className="text-light">
        <h1>Find a Sync</h1>
        <h5>Watch Youtube Videos Together, From Anywhere! (with internet) </h5><hr></hr>
        <h4>Public Syncs:</h4>
        {publicSyncs}
      </Container>
    </>
  );
}

export default SearchBooks;
