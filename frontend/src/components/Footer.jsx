import React from 'react'
import {Link} from 'react-router-dom'
const Footer = () => {

  return (
    
  <footer class="py-10 bg-gray-800 text-white">
    <div class="container mx-auto text-center">
      <h3 class="text-xl font-bold">EZ MediWay</h3>
      <p class="mt-2">Providing compassionate healthcare services since 2026.</p>
      <div class="mt-4 flex justify-center gap-6">
        <Link to="/home" class="hover:underline">Home</Link>
        <Link to="/about" class="hover:underline">About</Link>
        <Link to="/doctors" class="hover:underline">Doctors</Link>
        <Link to="/contact" class="hover:underline">Contact</Link>
      </div>
      <p class="mt-6 text-sm">&copy; 2026 EZ MediWay 2.0. All rights reserved.</p>
    </div>
  </footer>
  )
}

export default Footer