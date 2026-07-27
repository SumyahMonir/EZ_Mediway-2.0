import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { createWaitingRoomSocket } from "../lib/waitingRoomSocket";

const DoctorWaitingRoom = () => {
  const { doctorId, date, timeSlot } = useParams();
  const decodedTimeSlot = decodeURIComponent(timeSlot);

  const [room, setRoom] = useState(null); // { callLink, callActive, currentPatientId, queue, status }
  const [patientNames, setPatientNames] = useState({}); // patientId -> name
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  // Build a patientId -> name lookup from the doctor's existing appointments endpoint
  useEffect(() => {
    const loadNames = async () => {
      try {
        const res = await API.get("/appointments/doctor/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const map = {};
        (res.data || []).forEach((appt) => {
          if (appt.patientId?._id) map[appt.patientId._id] = appt.patientId.name;
        });
        setPatientNames(map);
      } catch (err) {
        console.error(err);
      }
    };
    loadNames();
  }, [token]);

  // Open (or reopen) the room, then connect the socket
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        setLoading(true);
        await API.post(
          "/waiting-room/open",
          { date, timeSlot: decodedTimeSlot },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const socket = createWaitingRoomSocket();
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("waiting-room:join", {
            doctorId,
            date,
            timeSlot: decodedTimeSlot,
            role: "doctor",
          });
        });

        socket.on("waiting-room:state", (state) => {
          if (!cancelled) setRoom(state);
        });

        socket.on("waiting-room:error", (err) => {
          if (!cancelled) setError(err.error || "Something went wrong");
        });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to open waiting room");
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

  // Prefill the Paste Link box with the current link once it arrives,
  // but only if the doctor hasn't already typed something of their own.
  useEffect(() => {
    if (room?.callLink && !linkInput) setLinkInput(room.callLink);
  }, [room?.callLink]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sends the pasted link to the current patient's Join section — this is
  // what flips callActive to true and triggers the embed on both sides.
  const handleShare = (e) => {
    e.preventDefault();
    if (!linkInput.trim()) return;
    setError("");
    socketRef.current?.emit("waiting-room:set-call-link", { link: linkInput.trim() });
  };

  const handleSkip = () => socketRef.current?.emit("waiting-room:skip");

  // Marks the current patient's appointment as "completed" in the real
  // Appointment record (not just advancing the waiting-room queue), then
  // advances the queue itself.
  const handleComplete = async () => {
    const currentEntry = room?.queue?.find(
      (q) => String(q.patientId) === String(room.currentPatientId)
    );

    if (currentEntry?.appointmentId) {
      try {
        setCompleting(true);
        await API.patch(
          `/appointments/${currentEntry.appointmentId}/status`,
          { status: "completed" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to update appointment status");
      } finally {
        setCompleting(false);
      }
    }

    socketRef.current?.emit("waiting-room:complete");
  };

  const currentName = room?.currentPatientId ? patientNames[room.currentPatientId] : null;
  const waitingQueue = (room?.queue || []).filter((q) => q.status === "waiting");

  if (loading) {
    return <p className="text-center text-[#3A4D3E] mt-20">Opening waiting room...</p>;
  }

  return (
    <section className="pt-24 pb-10 px-6 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0F2A18] mb-1">Waiting Room</h1>
        <p className="text-[#3A4D3E] mb-6">{decodedTimeSlot}</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mb-6">
          <p className="text-lg font-semibold text-[#0F2A18]">
            {currentName ? `Now Serving: ${currentName}` : "No patient currently in queue"}
          </p>
        </div>

        {/* Video call interface — always visible. Shows the doctor's shared
            call link once one has been set; otherwise defaults to the plain
            Jitsi landing page so the doctor can start a room right here and
            copy its URL into the Paste Link box below. */}
        <div
          className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md overflow-hidden mb-6"
          style={{ height: "480px" }}
        >
          <iframe
            src={room?.callLink || "https://meet.jit.si/"}
            title="Consultation call"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>

        {/* Paste + Share — prefilled once a link is set, editable if the
            doctor wants to switch to a different one */}
        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0F2A18] mb-4">
            {room?.callActive ? "Call Link (shared)" : "Paste Link"}
          </h2>
          <form onSubmit={handleShare} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Paste your call link (e.g. https://meet.jit.si/your-room-name)"
              className="flex-1 border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
              required
            />
            <button
              type="submit"
              className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition whitespace-nowrap"
            >
              {room?.callActive ? "Re-share" : "Share"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0F2A18] mb-4">
            Waiting ({waitingQueue.length})
          </h2>
          {waitingQueue.length === 0 ? (
            <p className="text-[#6B7B6E]">No one else is waiting right now.</p>
          ) : (
            <ul className="space-y-2">
              {waitingQueue.map((q, i) => (
                <li key={q.patientId} className="flex justify-between border-b border-[#EEF5EF] py-2">
                  <span className="text-[#0F2A18]">{i + 1}. {patientNames[q.patientId] || "Patient"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleSkip}
            disabled={!room?.currentPatientId}
            className="border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleComplete}
            disabled={!room?.currentPatientId || completing}
            className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition disabled:opacity-50"
          >
            {completing ? "Completing..." : "Completed"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default DoctorWaitingRoom;