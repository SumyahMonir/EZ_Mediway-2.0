import React from 'react'
import {Link} from 'react-router-dom'
import back1 from '../assets/images/back1.jpeg'
import back2 from '../assets/images/back2.png'
import doc1 from '../assets/images/doc1.png'
import doc2 from '../assets/images/doc2.png'
import doc3 from '../assets/images/doc3.png'
import patient1 from '../assets/images/patient1.jpeg'
import patient2 from '../assets/images/patient2.jpeg'
import patient3 from '../assets/images/patient3.jpeg'

const Home = () => {
  return (
    
<div class="bg-white text-[#0F2A18]">


  {/* <!-- Hero Section --> */}
  <section className="relative min-h-screen flex items-center justify-center px-6 py-16 bg-white">
  {/* Background Image */}
  <img
    src={back1}
    alt="Doctors"
    className="absolute inset-0 w-full h-full object-cover rounded-xl brightness-90"
  />
  <div className="absolute inset-0 bg-linear-to-r from-[#0B3D1E]/80 to-[#0B3D1E]/40 rounded-xl"></div>

  {/* Overlay Content */}
  <div className="relative z-10 container mx-auto flex flex-col md:flex-row items-center md:justify-between">
    {/* Text + Button */}
    <div className="text-center md:text-left md:w-1/2 mt-8 md:mt-0 text-white">
      <h1 className="text-4xl font-bold">EZ MediWay</h1>
      <h2 className="text-3xl font-bold mt-2">
        Your Partner in <span className="text-[#E8F0EA]">Health and Wellness</span>
      </h2>
      <p className="mt-4 text-[#E8F0EA]">
        We are committed to providing you with the best medical and healthcare services to help you live healthier and happier.
        A reliable digital solution that connects patients and doctors smoothly and efficiently.
      </p>
      <Link
        to="/CreateAccount"
        className="inline-block mt-6 px-6 py-3 bg-white text-[#0B3D1E] rounded-lg shadow-md hover:bg-[#E8F0EA] transition-all duration-300 font-semibold"
      >
        Get Started
      </Link>

      {/* Stats Boxes */}
      <div className="flex gap-6 justify-center md:justify-start mt-8">
        <div className="bg-white/95 px-6 py-3 rounded-xl shadow-sm text-center text-[#0F2A18] border border-[#0B3D1E]/15">
          <span className="block font-bold text-xl">150K+</span>
          <p className="text-sm">Patient Recover</p>
        </div>
        <div className="bg-white/95 px-6 py-3 rounded-xl shadow-sm text-center text-[#0F2A18] border border-[#0B3D1E]/15">
          <span className="block font-bold text-xl">870+</span>
          <p className="text-sm">Doctors</p>
        </div>
      </div>
    </div>

    {/* Optional: Hero Image (hidden on smaller screens, overlay used instead) */}
    <div className="md:w-1/2 hidden md:block"></div>
  </div>
</section>


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

  {/* <!-- Medical Services Section --> */}
  <section class="py-16 bg-[#0B3D1E]">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-white">Our Medical Services</h2>
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

  {/* <!-- Book Appointment Section --> */}
  <section class="py-16 bg-[#EDF2EC] text-center">
    <h2 class="text-3xl font-bold text-[#0F2A18]">Book an Appointment</h2>
    <p class="mt-4 text-[#3A4D3E]">Schedule a visit with our expert doctors at your convenience.</p>
    <button class="mt-6 px-8 py-3 bg-[#0B3D1E] text-white rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"><Link to="/CreateAccount" >Book Now</Link></button>
  </section>

  {/* <!-- Our Doctors Section --> */}
  <section className="py-16 bg-[#FAFCFA]">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-[#0F2A18]">Our Doctors</h2>
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#D8E5DA]">
          <img src={doc3} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-md"></img>
          <h3 class="font-bold text-xl text-[#0F2A18] mt-4">Dr. Forhad Ali</h3>
          <p class="text-[#3A4D3E]">General Physician</p>
        
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#D8E5DA]">
          <img src={doc1} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-md"></img>
          <h3 class="font-bold text-xl text-[#0F2A18] mt-4">Dr. Alia Rahman</h3>
          <p class="text-[#3A4D3E]">Cardiologist</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#D8E5DA]">
          <img src={doc2} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-md"></img>
          <h3 class="font-bold text-xl text-[#0F2A18] mt-4">Dr. Fatima Noor</h3>
          <p class="text-[#3A4D3E]">Pediatrician</p>
        </div>
        <div class="col-span-full flex justify-center mt-8">
        <button> <Link to ="/doctors"class="mt-6 px-8 py-3 bg-[#0B3D1E] text-white rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300">
          More Doctors</Link></button>
         </div>
      </div>
    </div>
  </section>

  {/* <!-- Patients Say Section --> */}
  <section className="py-16 bg-[#EEF5EF]">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-[#0F2A18]">What Our Patients Say</h2>
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#D8E5DA]">
            <img src={patient2} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-md"></img>
          <p class="text-[#3A4D3E]">"EZ MediWay has transformed my health. The doctors are very caring and professional."</p>
          <span class="mt-4 block font-bold text-[#0F2A18]">– Doraemon</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#D8E5DA]">
            <img src={patient1} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-md"></img>
          <p class="text-[#3A4D3E]">"Amazing service and friendly staff. Highly recommend EZ MediWay!"</p>
          <span class="mt-4 block font-bold text-[#0F2A18]">– Tom Holand</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#D8E5DA]">
            <img src={patient3} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-md"></img>
          <p class="text-[#3A4D3E]">"I trust my family’s health with EZ MediWay. Great experience every time."</p>
          <span class="mt-4 block font-bold text-[#0F2A18]">– Judy Hopss</span>
        </div>
      </div>
    </div>
  </section>

</div>
  )
}
export default Home;