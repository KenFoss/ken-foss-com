import React , { useState } from 'react';
import '../styling/nav.css'; // Import your CSS file
// import '../styling/hamburgers.css'; // Make sure to provide the correct path to the hamburgers.css file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faHouse } from '@fortawesome/free-solid-svg-icons';
import { Column, Row } from'react-bootstrap';

const Nav = () => {

  return (
    <div className="nav-bar">
      <div>
        <a href="/home"> <FontAwesomeIcon icon={faHouse} /> </a>
        {/* <a href="/Pubs">Publications</a> */}
        <a href="/publications"> <FontAwesomeIcon icon={faBook} /> </a>
      </div>
    </div>
  )
}

export default Nav