import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import API from "../api";

// Same host api.js points at, without /api, on the dedicated chat namespace —
// same pattern as lib/waitingRoomSocket.js.
const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL;

// Embeddable chat between a specific doctor+patient pair. Used on both the
// doctor's patient-profile page and the patient's chat page.
// Props: doctorId, patientId, myRole ("doctor" | "patient")
const ChatBox = ({ doctorId, patientId, myRole }) => {
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/messages/${doctorId}/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setMessages(res.data || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.response?.data?.error || "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    start();

    const socket = io(`${SOCKET_BASE_URL}/chat`, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join", { doctorId, patientId });
    });

    socket.on("chat:message", (message) => {
      if (!cancelled) setMessages((prev) => [...prev, message]);
    });

    socket.on("chat:error", (err) => {
      if (!cancelled) setError(err.error || "Chat error");
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, patientId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit("chat:send", { doctorId, patientId, text: text.trim() });
    setText("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md flex flex-col" style={{ height: "480px" }}>
      <div className="border-b border-[#D8E5DA] px-5 py-3">
        <h3 className="font-semibold text-[#0F2A18]">Messages</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-[#6B7B6E] text-sm">Loading messages...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-[#6B7B6E] text-sm">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderRole === myRole;
            return (
              <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? "bg-[#0B3D1E] text-white" : "bg-[#EEF5EF] text-[#0F2A18]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-[#D8E5DA] p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-[#D8E5DA] rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
        />
        <button
          type="submit"
          className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15] transition text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;