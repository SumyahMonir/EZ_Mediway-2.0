import React from 'react'
import {Link} from 'react-router-dom'
import back1 from '../assets/images/back1.jpeg'
import back2 from '../assets/images/back2.png'
import doc1 from '../assets/images/doc1.png'
import doc2 from '../assets/images/doc2.png'
import doc3 from '../assets/images/doc3.png'

export const Doctors = () => {
  return (
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
  );
};
export default Doctors;