import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Pages/Home'
import Pubs from './Pages/Pubs'


function App() {
  
  return (
    <BrowserRouter>          
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/publications" element={<Pubs />} />
        {/* <Route component={App} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
