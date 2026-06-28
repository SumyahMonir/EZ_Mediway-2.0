import React from 'react'
import back2 from '../assets/images/back2.png'

const About = () => {
  return (
    <div class="bg-linear-to-r from-sky-100 to-blue-200 text-slate-900">

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
</p><p class="mt-4 text-slate-700">
Patients can search doctors by specialization, view profiles, check availability, and book appointments without visiting hospitals unnecessarily. Any appointment update or cancellation is instantly shown on the patient dashboard for full transparency.</p>
<p class="mt-4 text-slate-700">EZMediWay also offers 24/7 support through online chat and live communication, allowing patients to connect with doctors.
</p>
          </div>
        </div>
      </section>


  {/* <!-- Mini Info Section  --> */}
  <section class="py-16 bg-white">
    <div class="container mx-auto text-center">
      {/* <h2 class="text-3xl font-bold text-slate-900">Who We Are</h2> */}
      <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-slate-900">Who We Are</h3>
          <p class="mt-2 text-slate-700">EZ MediWay is a leading healthcare provider dedicated to ensuring your well-being.</p>
        </div>
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-slate-900">Our Mission</h3>
          <p class="mt-2 text-slate-700">To deliver high-quality healthcare services accessible to everyone, anytime.</p>
        </div>
        <div class="bg-sky-50 p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 class="font-bold text-xl text-slate-900">Our Vision</h3>
          <p class="mt-2 text-slate-700">To become the most trusted medical service provider for families worldwide.</p>
        </div>
        
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

    </div>
  )
}
export default About