import React,{useState} from 'react'
import {Link} from 'react-router-dom'
import logo from '../assets/images/logo1_green.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
  <nav class="bg-white shadow-md fixed top-0 left-0 w-full z-50">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    
    {/* <!-- Logo --> */}
    <div class="flex items-center gap-2">
      <img src={logo} alt="EZ MediWay" class="w-auto h-8"></img>
      <span class="text-xl font-bold text-[#0F2A18]">EZ MediWay</span>
    </div>

    {/* <!-- Menu --> */}
    <ul class="hidden md:flex items-center gap-8 font-medium text-[#0F2A18]">
      <li><Link to="/home" class="hover:text-[#0B3D1E]">Home</Link></li>
      <li>< Link to="/about" class="hover:text-[#0B3D1E]">About</Link></li>
      <li>< Link to="/doctors" class="hover:text-[#0B3D1E]">Doctors</Link></li>
      <li>< Link to="/contact" class="hover:text-[#0B3D1E]">Contact</Link></li>
      <li>< Link to="/login" class="hover:text-[#0B3D1E]">Log in</Link></li>

    </ul>

    {/* <!-- CTA Button --> */}
    <div class="hidden md:block">
      <Link to="/CreateAccount" class="bg-[#0B3D1E] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300">
        Create Account
      </Link>
    </div>

    {/* <!-- Mobile Menu Icon --> */}
    <div class="md:hidden">
      <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl text-[#0F2A18]"
          >
            ☰
          </button>
    </div>
  </div>

  {/* <!-- Mobile Menu --> */}
  {isOpen && (
        <div className="md:hidden bg-white px-6 pb-4 text-[#0F2A18]">
          <Link to="/home" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/doctors" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Doctors
          </Link>
          <Link to="/contact" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          <Link to="/login" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Log in
          </Link>

          <Link
            to="/CreateAccount"
            className="block mt-2 bg-[#0B3D1E] text-white text-center py-2 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
            onClick={() => setIsOpen(false)}
          >
            Create Account
          </Link>
        </div>
      )}
</nav>
  )
}

export default Navbar;