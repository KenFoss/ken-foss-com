import React , { useState } from 'react';
import '../styling/nav.css'; // Import your CSS file
import '../styling/hamburgers.css'; // Make sure to provide the correct path to the hamburgers.css file
import { Collapse, Container, Dropdown } from 'react-bootstrap';
import { FiAlignJustify } from "react-icons/fi";

const Nav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="custom-dropdown">
      {/* Hamburger Icon */}
      <div className={`hamburger-icon ${isDropdownOpen ? 'open' : ''}`} onClick={toggleDropdown}>
        <FiAlignJustify />
      </div>

      {/* Dropdown Content */}
      {/* {isDropdownOpen && ( */}
        < Collapse in={isDropdownOpen}>
          <div className="dropdown-content">
            {/* Navigation */}
            <ul>
              <li><a href="/Home">Home</a></li>
              <li><a href="/Music">Music</a></li>
            </ul>
          </div>
        </Collapse>
      {/* // )} */}
    </div>
  );
};

export default Nav