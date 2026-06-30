import React from 'react'
import { Link } from 'react-router-dom'
import back2 from '../assets/images/back2.png'

const About = () => {
  return (
  <div class="bg-linear-to-r from-sky-100 to-blue-200 text-slate-900">

    {/* <!-- About Section --> */}
  <section className="py-16 px-6 bg-[#F7FAF7]">
    <div class="container mx-auto flex flex-col md:flex-row items-center md:gap-12">
      <div class="md:w-1/2 mb-8 md:mb-0">
        <img src={back2} alt="Clinic" class="w-full rounded-xl shadow-md"></img>
      </div>
      <div class="md:w-1/2">
        <h2 class="text-3xl font-bold text-[#0F2A18]">About EZ MediWay</h2>
        <p class="mt-4 text-[#3A4D3E]">
EZMediWay is an online healthcare platform that makes medical services easy, fast, and accessible. Our aim is to help patients find the right doctor anytime, from anywhere, through a simple and user-friendly system.
Patients can search doctors by specialization, view profiles, check availability, and book appointments without visiting hospitals unnecessarily. Any appointment update or cancellation is instantly shown on the patient dashboard for full transparency.
EZMediWay also offers 24/7 support through online chat and live communication, allowing patients to connect with doctors whenever they need medical guidance.
We are committed to providing a reliable digital solution that connects patients and doctors smoothly and efficiently.</p>
      <Link to="/about"
      className="inline-block mt-6 px-6 py-3 bg-[#0B3D1E] text-white rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300">
  More Details
</Link>
      </div>
      
    </div>
  </section>


  {/* <!-- Mini Info Section  --> */}
  <section class="py-16 bg-[#0B3D1E]">
    <div class="container mx-auto text-center">
      {/* <h2 class="text-3xl font-bold text-slate-900">Who We Are</h2> */}
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-[#0F2A18]">Who We Are</h3>
          <p class="mt-2 text-[#3A4D3E]">EZ MediWay is a leading healthcare provider dedicated to ensuring your well-being.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-[#0F2A18]">Our Mission</h3>
          <p class="mt-2 text-[#3A4D3E]">To deliver high-quality healthcare services accessible to everyone, anytime.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-[#0F2A18]">Our Vision</h3>
          <p class="mt-2 text-[#3A4D3E]">To become the most trusted medical service provider for families worldwide.</p>
        </div>
        
      </div>
    </div>
  </section>

  {/* <!-- Medical Services Section --> */}
  <section class="py-16 bg-[#EEF5EF]">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-[#0F2A18]">Our Medical Services</h2>
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 class="font-bold text-xl text-[#0F2A18]">General Checkup</h3>
          <p class="mt-2 text-[#3A4D3E]">Comprehensive health evaluation to keep you in top shape.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 class="font-bold text-xl text-[#0F2A18]">Online Health Care</h3>
          <p class="mt-2 text-[#3A4D3E]">Offers 24/7 support through online chat and live communication between doctors and patients</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <h3 class="font-bold text-xl text-[#0F2A18]">Online Appointment</h3>
          <p class="mt-2 text-[#3A4D3E]">Anyone can book appointments without visiting hospitals unnecessarily</p>
        </div>
        
      </div>
    </div>
  </section>

    </div>
  )
}
export default About