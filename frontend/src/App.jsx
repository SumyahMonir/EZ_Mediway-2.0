import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
   <>
      <Navbar/>
      <main className="mt-6">
      <Outlet />   {/* Navbar theke ami jkhane jete chacchi oita tokn ekhane render hbe route onujai*/}
      </main>
      <Footer/>
  </>
  )
}

export default App
