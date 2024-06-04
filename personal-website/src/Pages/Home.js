import React from 'react';
// import Header, { SubHeader } from '../components/Header';
import headshot from '../images/ken_headshot.png'
import Nav from '../components/Nav.js'
import '../styling/Home.css'
import {Container, Row, Col}from 'react-bootstrap';
import { FaGitlab, FaLinkedin  } from "react-icons/fa";
import { SiIeee } from "react-icons/si";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faMedium } from '@fortawesome/free-brands-svg-icons';

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
        } else if (iconState === 3) {
          link = 'https://github.com/KenFoss'
        } else {
          link = 'https://medium.com/@kenfoss0715'
        }

        window.location.href = link;
    }

    return (
        <Container fluid>
            <Row style={{ height: '15vh', marginLeft: '0.2vw' }}>
              <Col xs={{ offset: 0, span: 1 }} sm={{ offset: 0, span: 1 }} md={{ offset: 0, span: 1 }} lg={{ offset: 0, span: 1 }}>
              <Nav className='nav' />
              </Col>
            </Row>
            <Row>
                <Col xs={{ offset: 0, span: 6 }} sm={{ offset: 0, span: 6 }} md={{ offset: 0, span: 7 }} lg={{ offset: 0, span: 6 }}>
                  {/* First Column Content */}
                  <Row>
                      <Col xs={{ offset: 3, span: 5 }} sm={{ offset: 3, span: 5 }} md={{ offset: 4, span: 5 }} lg={{ offset: 4, span: 8}}>
                          <div className='my-headshot'>
                              <img src={headshot} alt="Ken Foss" />
                          </div>
                      </Col>
                  </Row>
                  <Row>
                      <Col xs={{ offset: 1, span: 2 }} sm={{ offset: 1, span: 3 }} md={{ offset: 3, span: 3 }} lg={{ offset: 1, span: 3}}>
                          <div className='small-link' >
                              <SiIeee className="Ieee-Icon" onClick={() => handleClick(2)} />
                          </div>
                      </Col>
                      <Col xs={{ offset: 1, span: 2 }} sm={{ offset: 2, span: 3 }} md={{ offset: 2, span: 3 }} lg={{ offset: 1, span: 2 }}>
                          <div className='medium-link row-1-icon-2'>
                              <FaGitlab className="GitLab-Icon" onClick={() => handleClick(0)} />
                          </div>
                      </Col>
                      <Col  xs={{ offset: 1, span: 3 }} sm={{ offset: 1, span: 3 }} md={{ offset: 3, span: 3 }} lg={{ offset: 2, span: 3}}>
                          <div className='small-link  row-1-icon-2' >
                              <FontAwesomeIcon className="github-icon" icon={faGithub} onClick={() => handleClick(3)}/>
                          </div>
                      </Col>
                  </Row>
                  <Row>
                      <Col  xs={{ offset: 2, span: 3 }} sm={{ offset: 2, span: 3 }} md={{ offset: 2, span: 3 }} lg={{ offset: 2, span: 2 }}>
                          <div className='medium-link row-2-icon-1'>
                            <FontAwesomeIcon className="medium-icon" icon={faMedium} onClick={() => handleClick(4)}/>
                          </div>
                      </Col>
                      <Col xs={{ offset: 5, span: 3 }} sm={{ offset: 5, span: 3 }} md={{ offset: 5, span: 3 }} lg={{ offset: 4, span: 3 }}>
                          <div className='small-link'>
                              <FaLinkedin className="LinkedIn-Icon" onClick={() => handleClick(1)} />
                          </div>
                      </Col>
                  </Row>
                </Col>

                <Col xs={{ offset: 0, span: 5 }} sm={{ offset: 0, span: 5 }} md={{ offset: 0, span: 5 }} lg={{ offset: 0, span: 6 }}>
                    {/* Second Column Content */}
                    <Row className='text-row-one' >
                        <text>
                            I'm Ken Foss
                        </text>
                    </Row>
                    <Row className='text-row-two'>
                        <text>
                            Software Engineer @Budderfly
                        </text>
                    </Row>
                    <Row className='text-row-three'>
                        <text>
                            I started my career garnering experience in embedded systems,
                            Linux, Python, Git and DevOps
                            at General Dynamics Electric Boat.
                        </text>
                    </Row>
                    <Row className='text-row-four'>
                        <text>
                        These days, my primary focus is on web development. At Budderfly, I'm involved in a microservices architecture, 
                        utilizing an Angular front-end and a Java Spring Boot back-end. Additionally, I've delved into writing, 
                        concentrating on React.js and Java, covering various aspects of web development. My content is targetting a late-stage beginner
                        to intermediate audience. Feel free to check out my Medium profile for more!       
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