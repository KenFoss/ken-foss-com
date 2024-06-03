import React, { useState, useEffect } from 'react';
import { ToggleButton, ToggleButtonGroup, Pagination, ProgressBar, Row, Col, Container} from 'react-bootstrap'
import '../styling/audio_controls.css'
import { BsPlay, BsStop } from 'react-icons/bs'; 
import { encoded_api_key } from '../api/Key.js';

const databaseIP = process.env.REACT_APP_DATABASE_IP;
const databasePort = process.env.REACT_APP_DATABASE_PORT;
const port = process.env.REACT_APP_LOCAL_PORT;


const AudioControls = ({ currentAudio }) => {
  // State to track the progress of the audio playback
  const [progress, setProgress] = useState(0);
  const [barPercentage, setBarPercentage] = useState(0);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Effect to update the progress based on the timeupdate event of the audio
  useEffect(() => {
    // Function to update the progress bar
    const updateProgressBar = () => {
      if (currentAudio) {
        // Calculate the percentage of playback progress
        const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
        setBarPercentage(percentage)
        // Update the progress state
        setProgress(currentAudio.currentTime);
      }
    };

    // Add an event listener to the audio element for time updates
    if (currentAudio) {
      currentAudio.addEventListener('timeupdate', updateProgressBar);
    }

    // Cleanup: remove the event listener when the component is unmounted
    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener('timeupdate', updateProgressBar);
      }
    };
  }, [currentAudio]);

  const handlePlay = () => {
    if (currentAudio) {
      currentAudio.play();
    }
  };

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause();
    }
  };

  const handleProgressBarClick = (e) => {
    if (currentAudio) {
      const progressBar = e.currentTarget;
      const clickPosition = e.nativeEvent.offsetX;
      const percentage = (clickPosition / progressBar.offsetWidth) * 100;
      const newTime = (percentage / 100) * currentAudio.duration;
      currentAudio.currentTime = newTime;
    }
  };

  return (
    <div className="audio_controls">
      {currentAudio && (
        <Container fluid className='mt-4'>
          <Row>
            <Col xs={{ offset: 4, span: 2 }} s={{ offset: 4, span: 2 }} md={{ offset: 5, span: 1 }} lg={{ offset: 4, span: 2 }} xl={{ offset: 4, span: 2 }} style ={{cursor:'pointer'}}>
              <BsPlay className='play-button' onClick={handlePlay}/>
            </Col>
            <Col xs={{ offset: 0, span: 2 }} s={{ offset: 1, span: 2 }} md={{ offset: 0, span: 1 }} lg={{ offset: 1, span: 2 }} xl={{ offset: 1, span: 2 }} style ={{cursor:'pointer'}}>
              <BsStop className='stop-button' onClick={handleStop}/>
            </Col>
          </Row>
          <Row>
            <Col className="mt-4" xs={{ span: 12 }} s={{ span: 12 }} md={{ span: 12 }} lg={{ span: 12 }} xl={{ span: 12 }}>
              <ProgressBar animated now={barPercentage} max={100} label={`${formatTime(progress)}`} onClick={handleProgressBarClick} />
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

const AudioCategorySelector = ({setAudioCategory, audioCategory}) => {
  
  return (
    <ToggleButtonGroup name = "AudioCategory" defaultValue={audioCategory}  style={{ width: '97%' }}>
      <ToggleButton variant="outline-info" id="allCategoryToggle" value={'all'} onChange={() => setAudioCategory('all')}>
        All
      </ToggleButton>
      <ToggleButton variant="outline-info" id="songCategoryToggle" value={'song'} onChange={() => setAudioCategory('song')}>
        Songs
      </ToggleButton>
      <ToggleButton variant="outline-info" id="podcastCategoryToggle" value={'podcast'} onChange={() => setAudioCategory('podcast')}>
        Podcasts
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

const AudioPagination = ({ setPageState, pageState, audioCategory}) => {
  const [rowCount, setRowCount] = useState(null);
  const [paginationItems, setPaginationItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://${databaseIP}:${databasePort}/api/getAudioLength?category=${audioCategory}`, {
          headers: {
            'api-key': encoded_api_key
          }
        });
        const responseData = await response.json();
        const fetchedRowCount = responseData['result']['rows'][0]['count'];

        setRowCount(fetchedRowCount);

        // Assuming you want to display 5 items per page
        const itemsPerPage = 5;

        // Calculate the total number of pages
        const totalPages = Math.ceil(fetchedRowCount / itemsPerPage);

        // Generate pagination items
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
          items.push(
            <Pagination.Item 
              key={i} 
              active={i === pageState} 
              onClick={() => setPageState(i)}
            >
              {i}
            </Pagination.Item>
          );
        }

        setPaginationItems(items);
      } catch (error) {
        console.error('Error fetching length of audio files stored in database:', error);
      }
    };

    fetchData();
  }, [pageState, audioCategory]); // Include pageState in the dependency array if needed

  // Now you can use paginationItems in your Pagination component
  return (
    <Pagination>
      {paginationItems}
    </Pagination>
  );
};

const AudioTable = ({currentAudio, setCurrentAudio, audioCategory, pageState}) => {
    const [audioData, setAudioData] = useState([{ id: '', name: '', location: '' }]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`https://${databaseIP}:${databasePort}/api/getAudio?audioCategory=${audioCategory}&page=${pageState}`, {
                  headers: {
                    'api-key': encoded_api_key
                  }
                })
                const data = await response.json()
                setAudioData(data["data"]);
            } catch (error) {
                console.error('Error fetching audio data: ', error)
            }
        }

        fetchFiles();
    }, [pageState, audioCategory])

    useEffect( () => {
      // whenever currentAudio changes we have selected a new track, we will always want this to play
      // this will ensure the new track is set whenever handlePlay changes the audio and attempts
      // to play it (before it would play the old track or exception because the currentAudio)
      // object had not switched over yet
      if(currentAudio) {
        currentAudio.play()
      }
    
    }, [currentAudio])

    const handlePlay = (location) => {
        // statically serving directory whith subdirectories of music or podcasts, not the whole thing
        // this is the last two parts of the location
        const new_loc = location.split('/')
        const fileName = new_loc.pop()
        const fileLoc = new_loc.pop()
        const newAudio = new Audio(`https://${databaseIP}:${databasePort}/audio/${fileLoc}/${fileName}`)

        // stop the past audio from playing before setting the new audio
        if (currentAudio) {
          currentAudio.pause()
        }

        setCurrentAudio(newAudio);
    };

    const handleDelete = async (id, location, category) => {

        const fileName = location.split('/').pop()

        let fileRemoveQueryParams = new URLSearchParams();
        fileRemoveQueryParams.append('filename', fileName);
        fileRemoveQueryParams.append('isSong', category == 'song')
        fileRemoveQueryParams.append('isPodcast', category == 'podcasts')

        try {
          
          let response = await fetch(`https://${databaseIP}:${databasePort}/delete_audio?${fileRemoveQueryParams.toString()}`, {
            method:'DELETE',
            headers: {
              'api-key': encoded_api_key
            }
          });

          if(response.ok) {
            console.log('File deleted from server storage successfully');
          } else {
            console.log('Unsuccessful file deletion from server storage');
          }

          fileRemoveQueryParams = new URLSearchParams();
          fileRemoveQueryParams.append('audio_id', id);

          response = await fetch(`https://${databaseIP}:${databasePort}/api/removeAudio?${fileRemoveQueryParams.toString()}`, { 
            method:'POST',
            headers: {
              'api-key': encoded_api_key
            }
          });
          const responseData = await response.json()

          if(response.ok) {
            console.log(responseData.message);
          } else {
            console.log(responseData.message);
          }

          window.location.reload()
        } catch (error) {
          console.error('Error deleting audio file: '. error)
        }
    };

    return (
      <table className="table"  style={{ width: '97%' }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Play</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {(audioData && audioData.length > 0) ? (
          audioData.map((thisAudioData) => (
            <tr key={thisAudioData.id}>
              <td>{thisAudioData.name}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handlePlay(thisAudioData.location)}
                >
                  Play
                </button>
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(thisAudioData.id, thisAudioData.location, thisAudioData.category)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No audio data available.</td>
          </tr>
        )}
      </tbody>
    </table>
      );
    };
    
    export {AudioTable, AudioControls, AudioCategorySelector, AudioPagination};