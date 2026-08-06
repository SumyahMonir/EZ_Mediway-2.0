import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

import {
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
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorAppointments from "./pages/DoctorAppointments"; // adjust path
import DoctorWaitingRoom from "./pages/DoctorWaitingRoom";
import PatientWaitingRoom from "./pages/PatientWaitingRoom";
import ManageAvailability from "./pages/ManageAvailability";
import AppointmentHistory from "./pages/AppointmentHistory";
import DoctorPatientProfile from "./pages/DoctorPatientProfile";
import PatientChat from "./pages/PatientChat";



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      {/* local host diye gelei ami home pabo */}
      <Route index element={<Home />} /> //local host ee gele ami home page pabo
      <Route path='home' element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='doctors' element={<Doctors />} />

      <Route path="doctors/:slug" element={<DoctorDetails />} />

      <Route path='contact' element={<Contact />} />
      <Route path='CreateAccount' element={<CreateAccount />} />
      <Route path='login' element={<Login />} />
      <Route path="/doctor/appointments" element={<DoctorAppointments />} />


      <Route
        path="doctor/availability"
        element={
          <ProtectedRoute allowedRole="doctor">
            <ManageAvailability />
          </ProtectedRoute>
        }
      />

      {/* Protected routes — require a logged-in user */}
      <Route
        path="book-appointment"
        element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="patient/chat/:doctorId"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientChat />
          </ProtectedRoute>
        }
      />


      <Route
        path="patient/dashboard"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="doctor/waiting-room/:doctorId/:date/:timeSlot"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorWaitingRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="patient/waiting-room/:doctorId/:date/:timeSlot"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientWaitingRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="doctor/dashboard"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />



      <Route
        path="doctor/history"
        element={
          <ProtectedRoute allowedRole="doctor">
            <AppointmentHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="doctor/patients/:patientId"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorPatientProfile />
          </ProtectedRoute>
        }
      />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)