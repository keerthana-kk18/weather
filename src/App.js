import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Search from './search';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Search/>}></Route>
    </Routes>
    </BrowserRouter>
   
  );
}

export default App;
