import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
   <>
      <Navbar/>
      <main className="mt-6">
      <Outlet />   {/* ekhane eketa route onujai page render hobe */}
      </main>
      <Footer/>
  </>
  )
}

export default App