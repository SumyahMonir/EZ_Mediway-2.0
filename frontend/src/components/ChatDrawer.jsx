import React, { useEffect, useState } from "react";
import API from "../api";
import ChatBox from "./ChatBox";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Self-contained: renders its own floating toggle button + the sliding
// drawer. Mount once at the app root (App.jsx) so it's available on every
// page — it reads role/login state from localStorage itself, same as
// Navbar.jsx, and renders nothing for logged-out users or admins.
const ChatDrawer = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ownId, setOwnId] = useState(null);
  const [activeOther, setActiveOther] = useState(null); // { id, name } | null

  // Load the current user's own id (doctorId or patientId) once — needed
  // by ChatBox regardless of which conversation gets opened.
  useEffect(() => {
    if (!token || (role !== "doctor" && role !== "patient")) return;

    const loadOwnId = async () => {
      try {
        const endpoint = role === "doctor" ? "/doctors/me" : "/users/me";
        const res = await API.get(endpoint, authHeaders);
        setOwnId(res.data._id);
      } catch (err) {
        console.error(err);
      }
    };
    loadOwnId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/messages/conversations", authHeaders);
      setConversations(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setActiveOther(null);
      loadConversations();
    }
  };

  if (!token || (role !== "doctor" && role !== "patient")) return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-40 bg-[#0B3D1E] text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-[#082B15] transition"
        aria-label="Open chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.62 1.34 4.96 3.44 6.56L4.5 21.5c-.1.32.2.6.5.48l4.6-1.86c.76.16 1.56.24 2.4.24 5.52 0 10-3.94 10-8.8S17.52 2 12 2z" />
        </svg>
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />

          <div className="relative bg-[#F7FAF7] w-full sm:w-[420px] h-full shadow-2xl flex flex-col">
            <div className="bg-white border-b border-[#D8E5DA] px-5 py-4 flex justify-between items-center">
              {activeOther ? (
                <button
                  onClick={() => setActiveOther(null)}
                  className="text-[#0B3D1E] font-medium hover:underline flex items-center gap-1"
                >
                  &larr; {activeOther.name}
                </button>
              ) : (
                <h2 className="text-lg font-bold text-[#0F2A18]">Messages</h2>
              )}
              <button onClick={() => setIsOpen(false)} className="text-[#3A4D3E] hover:text-[#0F2A18] text-2xl leading-none">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeOther ? (
                ownId ? (
                  <div className="p-4 h-full">
                    <ChatBox
                      doctorId={role === "doctor" ? ownId : activeOther.id}
                      patientId={role === "patient" ? ownId : activeOther.id}
                      myRole={role}
                    />
                  </div>
                ) : (
                  <p className="text-center text-[#6B7B6E] p-6">Loading...</p>
                )
              ) : (
                <div className="overflow-y-auto h-full">
                  {loading ? (
                    <p className="text-center text-[#6B7B6E] p-6">Loading conversations...</p>
                  ) : error ? (
                    <p className="text-center text-red-500 p-6">{error}</p>
                  ) : conversations.length === 0 ? (
                    <p className="text-center text-[#6B7B6E] p-6">
                      No conversations yet. Start one from a patient or doctor profile.
                    </p>
                  ) : (
                    conversations.map((c) => (
                      <button
                        key={c.otherId}
                        onClick={() =>
                          setActiveOther({
                            id: c.otherId,
                            name: c.other?.name || (role === "doctor" ? "Patient" : "Doctor"),
                          })
                        }
                        className="w-full text-left px-5 py-4 border-b border-[#EEF5EF] hover:bg-[#EEF5EF] transition flex items-center gap-3"
                      >
                        <img
                          src={
                            c.other?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(c.other?.name || "?")}&background=0B3D1E&color=ffffff`
                          }
                          alt={c.other?.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#D8E5DA]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-[#0F2A18] truncate">
                              {role === "doctor" ? c.other?.name : `Dr. ${c.other?.name || ""}`}
                            </p>
                            <span className="text-xs text-[#6B7B6E] whitespace-nowrap ml-2">
                              {timeAgo(c.lastMessageAt)}
                            </span>
                          </div>
                          <p className="text-sm text-[#6B7B6E] truncate">{c.lastMessage}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDrawer;