const express = require('express');
const path = require('path');
const get_requests = require('./src/api/get.js');
const post_requests = require('./src/api/post.js');
const dotenv = require('dotenv').config();

// dotenv.config({path: './.env'});

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/Home', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/Music', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.REACT_APP_LOCAL_PORT || 8850;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// console.log(process.env)

// app.get('/api/users', get_requests.getUsers)
// app.post('/api/createPassingStats', post_requests.createPassingStats)
// // This will log the audio file that has been uploaded to the database
// // it takes 5 query parameters, isPodcast(boolean), isSong(boolean),
// // isDaily(boolean), newName(string) and location(string)
// app.post('/api/storeAudioFile', post_requests.addAudioFile)
// // This will delete the audio file of the associated audio_id that will 
// // be passed as a query parameter
// app.post('/api/deleteAudio', post_requests.removeAudioFile)
// app.get('/api/getAudio', get_requests.getAudioFiles)
// app.get('/api/getAudioLength', get_requests.getAudioLength)