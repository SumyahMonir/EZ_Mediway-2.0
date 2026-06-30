import React from 'react'
import {Link} from 'react-router-dom'
const Footer = () => {

  return (
    
  <footer class="py-10 bg-[#0B3D1E] text-white">
    <div class="container mx-auto text-center">
      <h3 class="text-xl font-bold">EZ MediWay</h3>
      <p class="mt-2 text-[#CFE0D3]">Providing compassionate healthcare services since 2026.</p>
      <div class="mt-4 flex justify-center gap-6">
        <Link to="/home" class="hover:underline hover:text-[#9FC3A6]">Home</Link>
        <Link to="/about" class="hover:underline hover:text-[#9FC3A6]">About</Link>
        <Link to="/doctors" class="hover:underline hover:text-[#9FC3A6]">Doctors</Link>
        <Link to="/contact" class="hover:underline hover:text-[#9FC3A6]">Contact</Link>
      </div>
      <p class="mt-6 text-sm text-[#9FC3A6]">&copy; 2026 EZ MediWay 2.0. All rights reserved.</p>
    </div>
  </footer>
  )
}

export default Footer;