require('dotenv').config()

const dns = require('node:dns').promises
dns.setServers(['1.1.1.1'])

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const PORT = process.env.PORT || 3000

const authRoutes = require('./routes/authRoutes')
const doctorRoutes = require('./routes/doctorRoute')
const userRoutes = require('./routes/userRoute')
const adminRoutes = require('./routes/adminRoute')
const appointmentRoutes = require('./routes/appointmentRoute')
const waitingRoomRoutes = require('./routes/waitingroomRoute')
const prescriptionRoutes = require('./routes/prescriptionRoute')
const availabilityRoutes = require('./routes/availabilityRoute')
const messageRoutes = require('./routes/messageRoute')
const paymentRoutes = require("./routes/paymentRoutes");

const logger = require('./middleware/logger')
const errorHandler = require('./middleware/error')

const { initWaitingRoomSocket } = require('./sockets/waitingroomSocket')
const { initChatSocket } = require('./sockets/chatSocket')

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://192.168.1.105:5173",
  "https://ez-mediway-2-0.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

// Logger middleware
app.use(logger)

// Parse JSON bodies
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/waiting-room', waitingRoomRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/availability', availabilityRoutes)
app.use("/api/payment", paymentRoutes);
app.use('/api/messages', messageRoutes)

// 404 handler — after routes, catches anything unmatched
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' })
})

// Error handler — always last
app.use(errorHandler)

// Wrap Express in a plain http server so Socket.IO can share the same port
const httpServer = http.createServer(app)


const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})

initWaitingRoomSocket(io)
initChatSocket(io)

mongoose.connect(process.env.MONGO_URI).then(() => {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch((error) => { console.log(error) })