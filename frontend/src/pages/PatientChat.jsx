import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import ChatBox from "../components/ChatBox";

const PatientChat = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [patientRes, doctorRes] = await Promise.all([
          API.get("/users/me", authHeaders),
          API.get(`/doctors/${doctorId}`, authHeaders).catch(() =>
            // /doctors/:id is admin-gated; fall back to the public list if
            // this patient hits a 403 there.
            API.get("/doctors").then((res) => ({
              data: (res.data || []).find((d) => d._id === doctorId),
            }))
          ),
        ]);
        setPatient(patientRes.data);
        setDoctor(doctorRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, token]);

  if (loading) {
    return <p className="text-center text-[#3A4D3E] pt-40">Loading chat...</p>;
  }

  if (error || !patient || !doctor) {
    return <p className="text-center text-red-500 pt-40">{error || "Doctor not found."}</p>;
  }

  return (
    <section className="pt-24 pb-10 px-6 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#0B3D1E] hover:underline mb-6"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-[#0F2A18] mb-6">
          Chat with Dr. {doctor.name}
        </h1>

        <ChatBox doctorId={doctorId} patientId={patient._id} myRole="patient" />
      </div>
    </section>
  );
};

export default PatientChat;