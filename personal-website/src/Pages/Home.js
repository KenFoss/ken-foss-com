import React from 'react';
// import Header, { SubHeader } from '../components/Header';
import headshot from '../images/ken_headshot.png'
import Nav from '../components/Hamburger.js'
import '../styling/Home.css'
import {Container, Row, Col}from 'react-bootstrap';
import { FaGitlab, FaLinkedin  } from "react-icons/fa";
import { SiIeee } from "react-icons/si";

function Home() {

    // [count, set count] set count is the function to update the count state, 
    // Calling set count, and therefore a change of count, will trigger re-rendering of this entire component
    // and all child components within

    const handleClick = (iconState) => {
        let link = null;
        if(iconState === 0) {
            link = 'https://gitlab.com/KenFoss'
        } else if (iconState === 1) {
            link = 'https://www.linkedin.com/in/kenneth-foss-933048200/'
        } else if (iconState === 2) {
            link = 'https://ieeexplore.ieee.org/document/9744045'
        }

        window.location.href = link;
    }

    return (
        <Container fluid>
            <Row>
                <Col xs={{ offset: 0, span: 6 }} sm={{ offset: 0, span: 6 }} md={{ offset: 0, span: 7 }} lg={{ offset: 0, span: 7 }}>
                {/* First Column Content */}
                <Row className='mt-4' style={{ height: '15vh', marginLeft: '0.2vw' }}>
                    <Col xs={{ offset: 0, span: 1 }} sm={{ offset: 0, span: 1 }} md={{ offset: 0, span: 1 }} lg={{ offset: 0, span: 1 }}>
                    <Nav className='nav' />
                    </Col>
                </Row>
                <Row>
                    <Col xs={{ offset: 3, span: 5 }} sm={{ offset: 3, span: 5 }} md={{ offset: 4, span: 5 }} lg={{ offset: 4, span: 5 }}>
                        <div className='my-headshot'>
                            <img src={headshot} alt="Ken Foss" />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col className='mt-5'  xs={{ offset: 1, span: 3 }} sm={{ offset: 1, span: 3 }} md={{ offset: 3, span: 3 }} lg={{ offset: 3, span: 3 }}>
                        <div className='small-link' >
                            <SiIeee className="Ieee-Icon" onClick={() => handleClick(2)} />
                        </div>
                    </Col>
                    <Col style={{ marginTop: '5rem' }} xs={{ offset: 2, span: 3 }} sm={{ offset: 2, span: 3 }} md={{ offset: 2, span: 3 }} lg={{ offset: 2, span: 3 }}>
                        <div className='medium-link'>
                            <FaGitlab className="GitLab-Icon" onClick={() => handleClick(0)} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col className='mt-4' xs={{ offset: 5, span: 3 }} sm={{ offset: 5, span: 3 }} md={{ offset: 5, span: 3 }} lg={{ offset: 5, span: 3 }}>
                        <div className='small-link'>
                            <FaLinkedin className="LinkedIn-Icon" onClick={() => handleClick(1)} />
                        </div>
                    </Col>
                </Row>
                </Col>

                <Col xs={{ offset: 0, span: 5 }} sm={{ offset: 0, span: 5 }} md={{ offset: 0, span: 5 }} lg={{ offset: 0, span: 5 }}>
                    {/* Second Column Content */}
                    <Row className='Text-Row-One'>
                        <text>
                            I'm Ken Foss
                        </text>
                    </Row>
                    <Row className='Text-Row-Two'>
                        <text>
                            Software Engineer II
                            <br />
                            General Dynamics Electric Boat
                        </text>
                    </Row>
                    <Row className='Text-Row-Three'>
                        <text>
                            I am a software engineer with over a year of experience in <br />
                            embedded systems, Linux, Podman containerization, and DevOps. <br />
                        </text>
                    </Row>
                    <Row className='Text-Row-Four'>
                        <text>
                            This site is a space for me to experiment as I progress my skills in web development.
                        </text>
                    </Row>
                </Col>
            </Row>
            </Container>



        // <div className='home-page'>
        //     <Nav className='nav' />
        //     <div className='page-content'>
        //         <img className='my-headshot' src={headshot} alt="Ken Foss" />
        //         <h1 className='header-text'>I'm Ken Foss</h1>
        //         <h2 className='subheader'> Tactical Software Engineer at General Dynamics Electric Boat</h2>
        //         <p> 
        //             I am a software engineer with a year of experience in <br />
        //             embedded systems, linux, podman containerization and DevOps. <br /> 
        //             I will use this site as a sandbox for some of my web development, <br />
        //             <br />
        //             Stay tuned! 
        //         </p>
        //     </div>
        // </div>
    );
}

export default Home