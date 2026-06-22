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
    
<div class="bg-linear-to-r from-sky-100 to-blue-200 text-slate-900">


  {/* <!-- Hero Section --> */}
  <section className="relative min-h-screen flex items-center justify-center px-6 py-16 bg-linear-to-r from-sky-100 to-blue-200">
  {/* Background Image */}
  <img
    src={back1}
    alt="Doctors"
    className="absolute inset-0 w-full h-full object-cover rounded-xl brightness-75"
  />

  {/* Overlay Content */}
  <div className="relative z-10 container mx-auto flex flex-col md:flex-row items-center md:justify-between">
    {/* Text + Button */}
    <div className="text-center md:text-left md:w-1/2 mt-8 md:mt-0 text-white">
      <h1 className="text-4xl font-bold">EZ MediWay</h1>
      <h2 className="text-3xl font-bold mt-2">
        Your Partner in <span className="text-gray-200">Health and Wellness</span>
      </h2>
      <p className="mt-4 text-gray-200">
        We are committed to providing you with the best medical and healthcare services to help you live healthier and happier.
        A reliable digital solution that connects patients and doctors smoothly and efficiently.
      </p>
      <Link
        to="/CreateAccount"
        className="inline-block mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"
      >
        Get Started
      </Link>

      {/* Stats Boxes */}
      <div className="flex gap-6 justify-center md:justify-start mt-8">
        <div className="bg-white bg-opacity-80 px-6 py-3 rounded-xl shadow text-center text-slate-900">
          <span className="block font-bold text-xl">150K+</span>
          <p className="text-sm">Patient Recover</p>
        </div>
        <div className="bg-white bg-opacity-80 px-6 py-3 rounded-xl shadow text-center text-slate-900">
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
  <section class="py-16 px-6 bg-sky-100">
    <div class="container mx-auto flex flex-col md:flex-row items-center md:gap-12">
      <div class="md:w-1/2 mb-8 md:mb-0">
        <img src={back2} alt="Clinic" class="w-full rounded-xl shadow-lg"></img>
      </div>
      <div class="md:w-1/2">
        <h2 class="text-3xl font-bold text-slate-900">About EZ MediWay</h2>
        <p class="mt-4 text-slate-700">
EZMediWay is an online healthcare platform that makes medical services easy, fast, and accessible. Our aim is to help patients find the right doctor anytime, from anywhere, through a simple and user-friendly system.
Patients can search doctors by specialization, view profiles, check availability, and book appointments without visiting hospitals unnecessarily. Any appointment update or cancellation is instantly shown on the patient dashboard for full transparency.
EZMediWay also offers 24/7 support through online chat and live communication, allowing patients to connect with doctors whenever they need medical guidance.
We are committed to providing a reliable digital solution that connects patients and doctors smoothly and efficiently.</p>
      <Link to="/about"
      className="inline-block mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition">
  More Details
</Link>
      </div>
      
    </div>
  </section>

  {/* <!-- Medical Services Section --> */}
  <section class="py-16 bg-white">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-slate-900">Our Medical Services</h2>
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-slate-900">General Checkup</h3>
          <p class="mt-2 text-slate-700">Comprehensive health evaluation to keep you in top shape.</p>
        </div>
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-slate-900">Online Health Care</h3>
          <p class="mt-2 text-slate-700">Offers 24/7 support through online chat and live communication between doctors and patients</p>
        </div>
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-slate-900">Online Appointment</h3>
          <p class="mt-2 text-slate-700">Anyone can book appointments without visiting hospitals unnecessarily</p>
        </div>
        
      </div>
    </div>
  </section>

  {/* <!-- Book Appointment Section --> */}
  <section class="py-16 bg-blue-200 text-center">
    <h2 class="text-3xl font-bold text-slate-900">Book an Appointment</h2>
    <p class="mt-4 text-slate-700">Schedule a visit with our expert doctors at your convenience.</p>
    <button class="mt-6 px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition"><Link to="/CreateAccount" >Book Now</Link></button>
  </section>

  {/* <!-- Our Doctors Section --> */}
  <section class="py-16 bg-white">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-slate-900">Our Doctors</h2>
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <img src={doc3} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-lg"></img>
          <h3 class="font-bold text-xl text-slate-900 mt-4">Dr. Forhad Ali</h3>
          <p class="text-slate-700">General Physician</p>
        
        </div>
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <img src={doc1} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-lg"></img>
          <h3 class="font-bold text-xl text-slate-900 mt-4">Dr. Alia Rahman</h3>
          <p class="text-slate-700">Cardiologist</p>
        </div>
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <img src={doc2} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-lg"></img>
          <h3 class="font-bold text-xl text-slate-900 mt-4">Dr. Fatima Noor</h3>
          <p class="text-slate-700">Pediatrician</p>
        </div>
        <div class="col-span-full flex justify-center mt-8">
        <button> <Link to ="/doctors"class="mt-6 px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition">
          More Doctors</Link></button>
         </div>
      </div>
    </div>
  </section>

  {/* <!-- Patients Say Section --> */}
  <section class="py-16 bg-sky-100">
    <div class="container mx-auto text-center">
      <h2 class="text-3xl font-bold text-slate-900">What Our Patients Say</h2>
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow">
            <img src={patient2} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-lg"></img>
          <p class="text-slate-700">"EZ MediWay has transformed my health. The doctors are very caring and professional."</p>
          <span class="mt-4 block font-bold text-slate-900">– Doraemon</span>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
            <img src={patient1} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-lg"></img>
          <p class="text-slate-700">"Amazing service and friendly staff. Highly recommend EZ MediWay!"</p>
          <span class="mt-4 block font-bold text-slate-900">– Tom Holand</span>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
            <img src={patient3} alt="Doctor" class="w-32 h-32 mx-auto rounded-full shadow-lg"></img>
          <p class="text-slate-700">"I trust my family’s health with EZ MediWay. Great experience every time."</p>
          <span class="mt-4 block font-bold text-slate-900">– Judy Hopss</span>
        </div>
      </div>
    </div>
  </section>

</div>
  )
}
export default Home