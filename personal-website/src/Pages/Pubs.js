import React from "react";
import { Container, Row, Col } from 'react-bootstrap';
import Nav from '../components/Nav.js'
import { useState, useEffect } from "react";
import  {Publication}  from '../components/Publication.js'
import '../styling/publication.css'

const Pubs = () => {

  // will load from table eventually
  let [pubGroups, setPubGroups] = useState([]);

  useEffect(() => {

    setPubGroups([
      [{ 
        "pubLink": "https://medium.com/devops-dev/dive-into-csrf-defense-real-attack-demonstrations-safeguards-with-spring-security-69c22b25c322",
        "pubName": "CSRF Forgery Defense with Spring Security",
        "pubImgLink": "https://ken-foss-com-site-resources.s3.amazonaws.com/csrf-forgery.jpg"
      },
      { 
        "pubLink": "https://medium.com/devops-dev/local-web-development-setup-with-docker-c666905223c3",
        "pubName": "Local Web Development Setup with Docker",
        "pubImgLink": "https://ken-foss-com-site-resources.s3.amazonaws.com/docker-test-setup.jpg"
      }]
    ])

  }, []);
  

  return (
    <Container fluid>
      <Row >
        <Col >
          <Nav className='nav' />
        </Col>
      </Row>

      {pubGroups.map((pubGroup, index) => (
        <Row key={`row-${index}`}>
          {pubGroup.map((pub, innerIndex) => (
            <Col key={`col-${innerIndex}`} 
            xs={{offset:innerIndex == 0? 1 : 0, span:5}} 
            sm={{offset:innerIndex == 0? 1 : 0, span:5}}  
            md={{offset:innerIndex == 0? 1 : 0, span:5}} 
            lg={{offset:innerIndex == 0? 2 : 0, span:4}}
            xl={{offset:innerIndex == 0? 2 : 0, span:4}}>
              <Publication pubLink={pub.pubLink} pubName={pub.pubName} pubImgLink={pub.pubImgLink} />
            </Col>
          ))}
        </Row>
      ))}

    </Container>
  );
}

export default Pubs;