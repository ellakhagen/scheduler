import React from 'react';
import {ChakraProvider} from '@chakra-ui/react'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {useEffect} from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import ClassUpload from './pages/Classes'
import Students from './pages/Students'
import Test from './pages/Test'
import AllSchedules from './pages/AllSchedules';
import MySchedule from './pages/MySchedule';
import Customize from './pages/Customize'
import Navbar from './components/Navbar';
import './App.css';

function App() {
  useEffect(() => {
    localStorage.clear();
  }, [])
  return (
    <ChakraProvider>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/classes" element={<ClassUpload/>}/>
          <Route path="/students" element={<Students/>}/>
          <Route path="/test" element={<Test/>}/>
          <Route path="/my_schedule" element={<MySchedule/>}/>
          <Route path="/calc_time" element={<AllSchedules/>}/>
          <Route path="/customize" element={<Customize/>}/>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
