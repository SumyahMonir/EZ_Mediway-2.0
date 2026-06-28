import React from 'react'
import {Link} from 'react-router-dom'
import DoctorCard from "../components/DoctorCard";

import back1 from '../assets/images/back1.jpeg'
import back2 from '../assets/images/back2.png'
import doc1 from '../assets/images/doc1.png'
import doc2 from '../assets/images/doc2.png'
import doc3 from '../assets/images/doc3.png'

export const Doctors = () => {
  return (

    <section class="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center text-slate-900">
          Our Doctors
        </h2>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">

    <DoctorCard
        id={1}
        image={doc1}
        name="Dr. Forhad Ali"
        specialization="General Physician"
        experience="8 Years Experience"
        hospital="Apollo Hospital"
        fee={800}
    />

    <DoctorCard
        id={2}
        image={doc2}
        name="Dr. Alia Rahman"
        specialization="Cardiologist"
        experience="10 Years Experience"
        hospital="Square Hospital"
        fee={1200}
    />

    <DoctorCard
        id={3}
        image={doc3}
        name="Dr. Fatima Noor"
        specialization="Pediatrician"
        experience="6 Years Experience"
        hospital="Evercare Hospital"
        fee={700}
    />

</div>

  </section>
  );
};
export default Doctors;