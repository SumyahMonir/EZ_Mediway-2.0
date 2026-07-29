import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { createWaitingRoomSocket } from "../lib/waitingRoomSocket";

const PatientWaitingRoom = () => {
  const { doctorId, date, timeSlot } = useParams();
  const decodedTimeSlot = decodeURIComponent(timeSlot);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [prescriptionUrl, setPrescriptionUrl] = useState(null);

  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        setLoading(true);

        const profileRes = await API.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        setProfile(profileRes.data);
        const myPatientId = profileRes.data._id;

        const socket = createWaitingRoomSocket();
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("waiting-room:join", {
            doctorId,
            date,
            timeSlot: decodedTimeSlot,
            role: "patient",
          });
        });

        socket.on("waiting-room:state", (state) => {
          if (!cancelled) setRoom(state);
        });

        socket.on("waiting-room:prescription-sent", ({ patientId, pdfUrl }) => {
          if (!cancelled && String(patientId) === String(myPatientId)) {
            setPrescriptionUrl(pdfUrl);
          }
        });

        socket.on("waiting-room:error", (err) => {
          if (!cancelled) setError(err.error || "Something went wrong");
        });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to load waiting room");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date, decodedTimeSlot]);

  const isMyTurn = profile && room?.currentPatientId === profile._id;
  const myPosition = (() => {
    if (!profile || !room) return null;
    const waiting = (room.queue || []).filter((q) => q.status === "waiting" || q.status === "serving");
    const idx = waiting.findIndex((q) => q.patientId === profile._id);
    return idx >= 0 ? idx + 1 : null;
  })();

  const handleLeave = () => {
    socketRef.current?.emit("waiting-room:leave");
    navigate("/patient/dashboard");
  };

  // Once it's this patient's turn AND the doctor has shared a link, the call
  // embeds automatically — no click needed on the patient's side.
  const showCall = isMyTurn && room?.callActive && room?.callLink;

  if (loading) {
    return <p className="text-center text-[#3A4D3E] mt-20">Loading waiting room...</p>;
  }

  return (
    <section className="pt-24 pb-10 px-6 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F2A18] mb-1">Waiting Room</h1>
        <p className="text-[#3A4D3E] mb-6">{decodedTimeSlot}</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {prescriptionUrl && (
          <div className="bg-white rounded-2xl border border-[#0B3D1E] shadow-md p-6 mb-6 text-center">
            <p className="text-lg font-semibold text-[#0B3D1E] mb-3">
              Your prescription is ready
            </p>
            <a
              href={prescriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition"
            >
              View / Download Prescription
            </a>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mb-6 text-center">
          {showCall ? (
            <p className="text-lg font-semibold text-[#0B3D1E]">
              It's your turn — joining the call...
            </p>
          ) : isMyTurn ? (
            <p className="text-lg font-semibold text-[#0F2A18]">
              Please wait a while, the doctor is starting the call...
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-[#0F2A18]">
                Now Serving: another patient
              </p>
              <p className="text-[#3A4D3E] mt-2">
                Kindly wait in the waiting room for your turn.
                {myPosition ? ` You are number ${myPosition} in the queue.` : ""}
              </p>
            </>
          )}
        </div>

        {/* The call itself — appears automatically once shared, same tab */}
        {showCall && (
          <div
            className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md overflow-hidden mb-6"
            style={{ height: "480px" }}
          >
            <iframe
              src={room.callLink}
              title="Consultation call"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: "100%", height: "100%", border: 0 }}
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={handleLeave}
            className="border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition"
          >
            Leave
          </button>
        </div>
      </div>
    </section>
  );
};

export default PatientWaitingRoom;