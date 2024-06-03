import React, {useState} from 'react';
import Nav from '../components/Hamburger.js'
import '../styling/Music.css'
import FileUpload from '../components/MusicUpload.js'
// import PlayAudio from '../components/PlayAudio.js'
import {Container, Toast}from 'react-bootstrap';
import {AudioTable, AudioControls, AudioCategorySelector, AudioPagination} from '../components/audioControls.js'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


function Music() {

  const [audio, setAudio] = useState(null); 
  const [categorySelected, setCategorySelected] = useState('all');
  const [pageState, setPageState] = useState(1);
  const [showPermissionDeniedToast, setShowPermissionDeniedToast] = useState(false);

  return (
      <Container fluid>
        <Row className='mt-4' style={{height : '14vh', marginLeft: '0.2vw'}}>
          <Col sm={{offset : 0, span : 1}} md={{offset : 0, span : 1}} lg={{offset : 0, span : 1}} xl={{offset : 0, span : 1}} xxl={{offset : 0, span : 1}}>
            <Nav />
            {/* hello */}
          </Col>
          <Col sm={{offset : 6, span : 5}} md={{offset : 6, span : 5}} lg={{offset : 6, span : 5}}>
            <Toast
              show={showPermissionDeniedToast}
              onClose={() => setShowPermissionDeniedToast(false)}
            >
              <Toast.Header>
                <strong className="mr-auto">Permission Denied</strong>
              </Toast.Header>
              <Toast.Body>
                Upload permission denied. Please check your permissions.
              </Toast.Body>
            </Toast>          
          </Col>
        </Row>
        <Row >
          <Col xs={{offset : 1, span : 10}} sm={{offset : 1, span : 10}} md={{offset : 1, span:10}} lg={{offset : 1, span : 3}} xl={{offset : 1, span : 3}}>
            <FileUpload setShowPermissionDeniedToast={setShowPermissionDeniedToast}/>
          </Col>
          <Col xs={{offset : 1, span : 10}} sm={{offset : 1, span : 10}} md={{offset : 1, span:10}} lg={{offset : 1, span : 6}} xl={{offset : 1, span : 6}}>
            <AudioCategorySelector setAudioCategory={setCategorySelected} audioCategory={categorySelected} />
            <AudioTable className = 'audio-table' currentAudio={audio} setCurrentAudio={setAudio} audioCategory={categorySelected} pageState={pageState}/>
            <div className="d-flex justify-content-center">
              <AudioPagination setPageState={setPageState} pageState={pageState} audioCategory={categorySelected} />
            </div>
          </Col>
          <Col  sm={{offset : 1, span : 10}} md={{offset : 1, span : 10}} lg={{offset : 1, span : 10}} xl={{offset : 1, span : 10}}>
            <AudioControls currentAudio={audio}/>
          </Col>
        </Row>
      </Container>
    );
  }

export default Music