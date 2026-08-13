const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const Users = require("../models/userModel");

const roomKey = (doctorId, patientId) => `${doctorId}_${patientId}`;

function initChatSocket(io) {
  const nsp = io.of("/chat");

  // Same JWT-based handshake auth pattern as the waiting room socket
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
    socket.on("chat:join", async ({ doctorId, patientId }) => {
      try {
        const hasHistory = await Appointment.findOne({ doctorId, patientId });
        if (!hasHistory) {
          return socket.emit("chat:error", {
            error: "No appointment history between this doctor and patient",
          });
        }

        const doctor = await Doctor.findOne({ UserAuthId: socket.userAuthId });
        const patient = await Users.findOne({ UserAuthId: socket.userAuthId });

        const isThisDoctor = doctor && String(doctor._id) === String(doctorId);
        const isThisPatient = patient && String(patient._id) === String(patientId);

        if (!isThisDoctor && !isThisPatient) {
          return socket.emit("chat:error", { error: "Not authorized for this conversation" });
        }

        socket.senderRole = isThisDoctor ? "doctor" : "patient";
        socket.roomKey = roomKey(doctorId, patientId);
        socket.join(socket.roomKey);
      } catch (err) {
        socket.emit("chat:error", { error: err.message });
      }
    });

    socket.on("chat:send", async ({ doctorId, patientId, text }) => {
      if (!socket.roomKey || socket.roomKey !== roomKey(doctorId, patientId)) {
        return socket.emit("chat:error", { error: "Join the conversation before sending" });
      }
      if (typeof text !== "string" || !text.trim()) return;

      try {
        const message = await Message.create({
          doctorId,
          patientId,
          senderRole: socket.senderRole,
          text: text.trim(),
        });

        nsp.to(socket.roomKey).emit("chat:message", message);
      } catch (err) {
        socket.emit("chat:error", { error: err.message });
      }
    });
  });
}

module.exports = { initChatSocket };