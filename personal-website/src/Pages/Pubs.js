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
        {
          "pubLink": "https://medium.com/devops-dev/dive-into-csrf-defense-real-attack-demonstrations-safeguards-with-spring-security-69c22b25c322",
          "pubName": "CSRF Forgery Defense with Spring Security",
          "pubImgLink": "https://ken-foss-com-site-resources.s3.amazonaws.com/csrf-forgery.jpg"
        },
        {
          "pubLink": "https://medium.com/devops-dev/local-web-development-setup-with-docker-c666905223c3",
          "pubName": "Local Web Development Setup with Docker",
          "pubImgLink": "https://ken-foss-com-site-resources.s3.amazonaws.com/docker-test-setup.jpg"
        },
        {
          "pubLink": "https://medium.com/javarevisited/lets-get-authenticated-google-sign-in-d4f4d7606ba3",
          "pubName": "Let's Get Authenticated - Google Sign In",
          "pubImgLink": "https://ken-foss-com-site-resources.s3.us-east-1.amazonaws.com/google-oauth-article.jpg"
        },
        {
            "pubLink": "https://medium.com/gitconnected/stop-committing-your-images-to-git-4f5148416c55",
            "pubName": "Stop Committing Your Images to Git!",
            "pubImgLink": "https://ken-foss-com-site-resources.s3.us-east-1.amazonaws.com/stop-committing-img-to-git-article.jpg"
        },
        {
            "pubLink": "https://medium.com/gitconnected/docker-compose-setup-for-a-microservices-architecture-f47902dadcae",
            "pubName": "Docker Compose Setup for a MicroServices Architecture",
            "pubImgLink": "https://ken-foss-com-site-resources.s3.us-east-1.amazonaws.com/docker-compose-setup-microservices.jpg"
        },
        {
            "pubLink": "https://medium.com/gitconnected/keeping-your-microservices-in-sync-with-apache-kafka-and-friends-82c502575828",
            "pubName": "Keeping Your Microservices in Sync with Apache Kafka and Friends",
            "pubImgLink": "https://ken-foss-com-site-resources.s3.us-east-1.amazonaws.com/keeping-microservices-in-sync-article.jpg"
        }
    ])

  }, []);
  

  return (
    <Container fluid>
      <Row >
        <Col >
          <Nav className='nav' />
        </Col>
      </Row>

        <div className={"pubDisplay"}>
            {pubGroups.map((pub, index) => (

                <Publication key={index} pubLink={pub.pubLink} pubName={pub.pubName} pubImgLink={pub.pubImgLink} />

            ))}
        </div>

    </Container>
  );
}

export default Pubs;