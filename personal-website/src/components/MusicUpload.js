import React, { useState } from 'react';
import { Container, Form, Col, Row, Button} from 'react-bootstrap';
import { encoded_api_key } from '../api/Key.js';
import '../styling/music_upload.css'
// const dotenv = require('dotenv');

// dotenv.config();

function FileUpload({setShowPermissionDeniedToast}) {
    // store the selected file when the user adds it
    // when useState setSelectedFile method is called it will change
    // the value of selectedFile
    const[selectedFile, setSelectedFile] = useState();

    // In similar matter use useState to trigger the setting of checkbox states
    const [isSong, setIsSong] = useState(false);
    const [isPodcast, setIsPodcast] = useState(false);
    const [isDaily, setIsDaily] = useState(false);
    const [fileName, setFileName] = useState(null);

    const localPort = process.env.REACT_APP_LOCAL_PORT || 8850;
    const databaseIP = process.env.REACT_APP_DATABASE_IP
    const databasePORT = process.env.REACT_APP_DATABASE_PORT

    // This will be triggered by the onChanged element of the checkboxes
    // int the jsx(html) below, when handle checkbox change is
    // called it uses set<STATE_NAME> and sets the value of <STATE_NAME>
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
    
        // Ensure only one checkbox can be selected
        if (name === 'isSong' && checked) {
            setIsPodcast(false);
            setIsSong(true); // Set isSong to true when the checkbox is checked
        } else if (name === 'isPodcast' && checked) {
            setIsSong(false);
            setIsPodcast(true); // Set isPodcast to true when the checkbox is checked
        } else {
            // If neither checkbox is checked, set both to false
            setIsSong(false);
            setIsPodcast(false);
        }

        // Handle change state of the isDaily checkbox
        if (name === 'isDaily' && checked) {
          setIsDaily(true);
        }
    
        // Update the state based on checkbox selection
        if (name === 'isSong') {
          setIsSong(true);
        } else if (name === 'isPodcast') {
          setIsPodcast(true);
        }
      };
    
    const handleNameChange = (event) => {
      setFileName(event.target.value)
    }
    
    // this will be triggered when a file is selected, and use the setSelectedFile 
    // to trigger the handleUpload method via the selectedFile "trigger"
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!process.env.REACT_APP_UPLOAD_TOKEN) {
          setShowPermissionDeniedToast(true);
        } else  if (selectedFile) {
            // Get song of the day and podacast of the day checkbox states, add them to the query.data.
            let fileUploadQueryParams = new URLSearchParams();
            fileUploadQueryParams.append('isPodcast', isPodcast)
            fileUploadQueryParams.append('isSong', isSong);
            fileUploadQueryParams.append('isDaily', isDaily);
            fileUploadQueryParams.append('newName', fileName);

            const formData = new FormData();
            formData.append('mp3File', selectedFile);

            try {
                // This will ping the api on the server side, and upload the audio file (save it there)
                let response = await fetch(`https://${databaseIP}:${databasePORT}/upload?` + fileUploadQueryParams.toString() , {
                    method: 'POST',
                    headers: {
                      'api-key': encoded_api_key
                    },
                    body: formData
                });

                // Ping the api to store the location and some basic information about this file in 
                // the psql database
                let responseJSON = await response.json()

                fileUploadQueryParams.append('location', responseJSON.destination + '/' + responseJSON.filename)

                response = await fetch(`https://${databaseIP}:${databasePORT}/api/storeAudioFile?` + fileUploadQueryParams.toString() , {
                    method: 'POST',
                    headers: {
                      'api-key': encoded_api_key
                    }
                });
        
                if (response.ok) {
                    console.log('File uploaded successfully, logged successfully.');
                } else {
                    console.error('Error uploading file:', response.statusText);
                }
            } catch (error) {
            console.error('Error uploading file:', error);
                }
        } else {
            console.error('No file selected.');
        }
    };
    
    return (
      <Container style={{width: '97%', marginRight:'4%'}}>

        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Control type="file" name="mp3File" accept=".mp3" onChange={handleFileChange} />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col>
              <Form.Check
                type="checkbox"
                label="Song"
                name="isSong"
                checked={isSong}
                onChange={handleCheckboxChange}
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col>
              <Form.Check
                type="checkbox"
                label="Podcast"
                name="isPodcast"
                checked={isPodcast}
                onChange={handleCheckboxChange}
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col>
              <Form.Check
                type="checkbox"
                label="Daily"
                name="isDaily"
                checked={isDaily}
                onChange={handleCheckboxChange}
              />
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col>
              <Button variant="outline-info" onClick={handleUpload}>Upload</Button>
            </Col>
          </Row>
  
          <Row className="mb-3">
            <Col>
              <Form.Control type="text" placeholder="Enter New File Name" onChange={handleNameChange} />
            </Col>
          </Row>
        </Form>
      </Container>
    );
}

export default FileUpload;
