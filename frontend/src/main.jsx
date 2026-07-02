import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

import{
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Doctors from './pages/Doctors.jsx'
import Contact from './pages/Contact.jsx'
import CreateAccount from './pages/CreateAccount.jsx'
import Login from './pages/Login.jsx'
import DoctorDetails from "./pages/DoctorDetails";
import BookAppointment from "./pages/BookAppointment";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Profile from "./pages/Profile";




const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App/>}>
      <Route index element={<Home />} /> //local host diye gelei ami home pabo
      <Route path='home' element={<Home/>}/>
      <Route path ='about' element={<About/>} />
      <Route path ='doctors' element={<Doctors/>} />

      <Route path="doctors/:id" element={<DoctorDetails />} />

      <Route path ='contact' element={<Contact/>} />
      <Route path ='CreateAccount' element={<CreateAccount/>} />
      <Route path ='login' element={<Login/>} />
      <Route path="book-appointment" element={<BookAppointment />} />
      <Route path="patient/dashboard" element={<PatientDashboard />} />
      <Route path="doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="profile" element={<Profile />} />

    </Route>

  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
