import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import ChatBox from "../components/ChatBox";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  if (status === "Cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Read-only, doctor-facing view of a patient — NOT the patient's own
// dashboard (that route is locked to allowedRole="patient" and would
// reject a doctor). This shows the same underlying info, scoped to this
// doctor's own appointment history with the patient.
const DoctorPatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [patient, setPatient] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [patientRes, apptRes, doctorRes] = await Promise.all([
          API.get(`/users/${patientId}`, authHeaders),
          API.get("/appointments/doctor/me", authHeaders),
          API.get("/doctors/me", authHeaders),
        ]);
        setPatient(patientRes.data);
        setDoctorProfile(doctorRes.data);

        const withThisDoctor = (apptRes.data || [])
          .filter((a) => (a.patientId?._id || a.patientId) === patientId)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(withThisDoctor);
      } catch (err) {
        console.error(err);
        setError("Failed to load patient profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, token]);

  if (loading) {
    return <p className="text-center text-[#3A4D3E] pt-40">Loading patient profile...</p>;
  }

  if (error || !patient) {
    return <p className="text-center text-red-500 pt-40">{error || "Patient not found."}</p>;
  }

  return (
    <section className="pt-24 pb-10 px-6 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#0B3D1E] hover:underline mb-6"
        >
          &larr; Back
        </button>

        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-8 mb-8 flex items-center gap-6">
          <img
            src={patient.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0B3D1E&color=ffffff`}
            alt={patient.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#D8E5DA]"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#0F2A18]">{patient.name}</h1>
            <p className="text-[#3A4D3E]">{patient.gender} &bull; {patient.bloodGroup}</p>
            <p className="text-[#3A4D3E]">{patient.phone}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
          <h2 className="text-xl font-bold text-[#0F2A18] mb-4">Appointment History With You</h2>

          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments with this patient yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D8E5DA]">
                  <th className="py-3 text-[#0F2A18]">Date</th>
                  <th className="text-[#0F2A18]">Time</th>
                  <th className="text-[#0F2A18]">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id || appt.id} className="border-b border-[#EEF5EF]">
                    <td className="py-3 text-[#3A4D3E]">{formatDate(appt.date)}</td>
                    <td className="text-[#3A4D3E]">{appt.timeSlot}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[appt.status] || "bg-gray-100 text-gray-700"}`}>
                        {formatStatus(appt.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {doctorProfile?._id && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#0F2A18] mb-4">Chat With {patient.name}</h2>
            <ChatBox doctorId={doctorProfile._id} patientId={patientId} myRole="doctor" />
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorPatientProfile;