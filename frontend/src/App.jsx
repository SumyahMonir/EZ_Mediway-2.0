import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatDrawer from './components/ChatDrawer';

const App = () => {
  return (
   <>
      <Navbar/>
      <main className="mt-6">
      <Outlet />
      </main>
      <Footer/>
      <ChatDrawer />
  </>
  )
}

export default App