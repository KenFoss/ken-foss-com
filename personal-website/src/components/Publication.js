import React from "react";
import '../styling/publication.css'

const Publication = ({pubLink,pubName, pubImgLink}) => {
 return (
  <div className='pub'>
    <a href={pubLink}>
      <img src={pubImgLink} alt="Unavailable"></img>
      <text>{pubName}</text>
    </a>
  </div>
 )  
}

export {Publication}