const jwt = require("jsonwebtoken");
const WaitingRoom = require("../models/waitingroomModel");
const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const Users = require("../models/userModel");

// How long we wait after a socket disconnects before actually removing the
// patient from the queue — tolerates brief internet drops / page refreshes.
const DISCONNECT_GRACE_MS = 8000;

// key: `${roomId}:${patientId}` -> setTimeout handle
const disconnectTimers = new Map();

const normalizeDate = (date) => {
  // Must match UTC midnight — see the identical comment in
  // waitingRoomController.js for why setHours() is wrong here.
  const iso = new Date(date).toISOString().slice(0, 10);
  return new Date(`${iso}T00:00:00.000Z`);
};

const serializeRoom = (room) => ({
  roomId: room._id,
  status: room.status,
  callLink: room.callLink,
  callActive: room.callActive,
  currentPatientId: room.currentPatientId,
  queue: room.queue.map((q) => ({
    patientId: q.patientId,
    appointmentId: q.appointmentId,
    status: q.status,
    joinedAt: q.joinedAt,
  })),
});

// Advances currentPatientId to the next "waiting" entry, if any.
const promoteNext = (room) => {
  const next = room.queue.find((q) => q.status === "waiting");
  room.currentPatientId = next ? next.patientId : null;
  if (next) next.status = "serving";
};

// Removes a patient's queue entry entirely and re-broadcasts state.
// Guards against a patient who reconnected during the grace window.
const finalizeDisconnect = async (nsp, roomId, patientId) => {
  const room = await WaitingRoom.findById(roomId);
  if (!room) return;

  const entry = room.queue.find((q) => String(q.patientId) === patientId);
  if (!entry || entry.status !== "disconnected") return; // they came back — nothing to do

  const wasCurrent = String(room.currentPatientId) === patientId;
  room.queue = room.queue.filter((q) => String(q.patientId) !== patientId);
  if (wasCurrent) promoteNext(room);

  await room.save();
  nsp.to(roomId).emit("waiting-room:state", serializeRoom(room));
};

function initWaitingRoomSocket(io) {
  const nsp = io.of("/waiting-room");

  // Auth handshake — same JWT used for the REST API
  nsp.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const { id } = jwt.verify(token, process.env.SECRET);
      socket.userAuthId = id;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  nsp.on("connection", (socket) => {
    socket.on("waiting-room:join", async ({ doctorId, date, timeSlot, role }) => {
      try {
        const room = await WaitingRoom.findOne({
          doctorId,
          date: normalizeDate(date),
          timeSlot,
        });

        if (!room || room.status !== "live") {
          return socket.emit("waiting-room:error", { error: "Waiting room is not open yet" });
        }

        const socketRoom = String(room._id);
        socket.join(socketRoom);
        socket.roomId = socketRoom;

        if (role === "doctor") {
          const doctor = await Doctor.findOne({ UserAuthId: socket.userAuthId });
          if (!doctor || String(doctor._id) !== String(doctorId)) {
            return socket.emit("waiting-room:error", { error: "Not authorized for this room" });
          }
          socket.isDoctor = true;
        } else {
          const patient = await Users.findOne({ UserAuthId: socket.userAuthId });
          if (!patient) {
            return socket.emit("waiting-room:error", { error: "Patient profile not found" });
          }

          const appt = await Appointment.findOne({
            doctorId,
            timeSlot,
            date: normalizeDate(date),
            patientId: patient._id,
            status: "Confirmed",
          });
          if (!appt) {
            return socket.emit("waiting-room:error", { error: "No confirmed appointment for this slot" });
          }

          socket.patientId = String(patient._id);

          // Reconnect case — cancel any pending removal from a recent disconnect
          const timerKey = `${socketRoom}:${socket.patientId}`;
          if (disconnectTimers.has(timerKey)) {
            clearTimeout(disconnectTimers.get(timerKey));
            disconnectTimers.delete(timerKey);
          }

          const existing = room.queue.find((q) => String(q.patientId) === socket.patientId);
          if (!existing) {
            room.queue.push({
              patientId: patient._id,
              appointmentId: appt._id,
              status: "waiting",
              joinedAt: new Date(),
            });
          } else if (existing.status === "disconnected") {
            existing.status = String(room.currentPatientId) === socket.patientId ? "serving" : "waiting";
          }

          if (!room.currentPatientId) promoteNext(room);

          await room.save();
        }

        nsp.to(socketRoom).emit("waiting-room:state", serializeRoom(room));
      } catch (err) {
        socket.emit("waiting-room:error", { error: err.message });
      }
    });

    // Explicit Leave button — skip the grace period, remove immediately
    socket.on("waiting-room:leave", async () => {
      if (!socket.roomId || !socket.patientId) return;

      const timerKey = `${socket.roomId}:${socket.patientId}`;
      if (disconnectTimers.has(timerKey)) {
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
      }

      const room = await WaitingRoom.findById(socket.roomId);
      if (!room) return;
      const entry = room.queue.find((q) => String(q.patientId) === socket.patientId);
      if (entry) entry.status = "disconnected"; // reuse finalizeDisconnect's guard
      await room.save();

      await finalizeDisconnect(nsp, socket.roomId, socket.patientId);
    });

    // DOCTOR — pastes their own call link. This is what makes Join available
    // to whichever patient is currently up in the queue.
    socket.on("waiting-room:set-call-link", async ({ link }) => {
      if (!socket.roomId || !socket.isDoctor) return;

      if (typeof link !== "string" || !link.trim()) {
        return socket.emit("waiting-room:error", { error: "A valid call link is required" });
      }
      try {
        new URL(link.trim());
      } catch {
        return socket.emit("waiting-room:error", { error: "That doesn't look like a valid link" });
      }

      const room = await WaitingRoom.findById(socket.roomId);
      if (!room) return;
      room.callLink = link.trim();
      room.callActive = true;
      await room.save();
      nsp.to(socket.roomId).emit("waiting-room:state", serializeRoom(room));
    });

    // DOCTOR — relays "a prescription was sent" to everyone in the room.
    // The room only has this doctor + whichever patients are connected, so
    // broadcasting is fine — each patient's client filters for their own
    // patientId before showing anything.
    socket.on("waiting-room:prescription-sent", ({ patientId, pdfUrl }) => {
      if (!socket.roomId || !socket.isDoctor) return;
      nsp.to(socket.roomId).emit("waiting-room:prescription-sent", { patientId, pdfUrl });
    });

    // DOCTOR — finished with the current patient, advance the queue
    socket.on("waiting-room:complete", async () => {
      await advanceQueue(nsp, socket, "completed");
    });

    // DOCTOR — current patient isn't responding, send them to the back
    socket.on("waiting-room:skip", async () => {
      await advanceQueue(nsp, socket, "skipped");
    });

    socket.on("disconnect", async () => {
      if (!socket.roomId || !socket.patientId) return;

      const room = await WaitingRoom.findById(socket.roomId);
      if (!room) return;
      const entry = room.queue.find((q) => String(q.patientId) === socket.patientId);
      if (!entry) return;

      entry.status = "disconnected";
      await room.save();
      nsp.to(socket.roomId).emit("waiting-room:state", serializeRoom(room));

      const timerKey = `${socket.roomId}:${socket.patientId}`;
      const timeout = setTimeout(() => {
        finalizeDisconnect(nsp, socket.roomId, socket.patientId);
        disconnectTimers.delete(timerKey);
      }, DISCONNECT_GRACE_MS);
      disconnectTimers.set(timerKey, timeout);
    });
  });
}

// Shared logic for both "completed" and "skipped" doctor actions.
async function advanceQueue(nsp, socket, action) {
  if (!socket.roomId || !socket.isDoctor) return;

  const room = await WaitingRoom.findById(socket.roomId);
  if (!room || !room.currentPatientId) return;

  const currentId = String(room.currentPatientId);
  const current = room.queue.find((q) => String(q.patientId) === currentId);

  if (current) {
    if (action === "completed") {
      current.status = "completed"; // kept in the array for the visit record
    } else {
      // Skipped — goes back to "waiting" at the end of the queue
      current.status = "waiting";
      current.joinedAt = new Date();
      room.queue = room.queue.filter((q) => String(q.patientId) !== currentId);
      room.queue.push(current);
    }
  }

  promoteNext(room);
  await room.save();

  nsp.to(socket.roomId).emit("waiting-room:state", serializeRoom(room));
}

module.exports = { initWaitingRoomSocket };