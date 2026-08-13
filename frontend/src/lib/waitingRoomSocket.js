import { io } from "socket.io-client";

// Same host your axios instance (api.js) points at, just without /api
// and on the dedicated "/waiting-room" namespace.
const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL;

export function createWaitingRoomSocket() {
  const token = localStorage.getItem("token");

  return io(`${SOCKET_BASE_URL}/waiting-room`, {
    auth: { token },
    autoConnect: true,
  });
}
