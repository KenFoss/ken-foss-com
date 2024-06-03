// src/components/Header.js

import React from 'react';

function Header({ text }) {
    const headerStyle = {
        backgroundColor: 'lightblue',
        textAlign: 'center',
        padding: '10px'
    };

    const h1Style = {
        color: 'white',
        fontSize: '2vw'
    };

    return (
        <header style={headerStyle}>
            <h1 style={h1Style}>{text}</h1>
        </header>
    );
}

function SubHeader({ text }) {
    const header2Style = {
        backgroundColor: 'lightgray',
        textAlign: 'center',
        padding: '8px'
    };

    const h2Style = {
        color: 'white',
        fontSize: '1vw'
    };

    return (
        <header style={header2Style}>
            <h2 style={h2Style}>{text}</h2>
        </header>
    );
}

export { SubHeader}
export default Header
  