
import Header, { SubHeader } from './components/Header';
import Music from './Pages/Music'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Pages/Home'

function App() {
  
  return (
    <BrowserRouter>          
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Music" element={<Music />} />
        {/* <Route component={App} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
