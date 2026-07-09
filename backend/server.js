require('dotenv').config()

const dns = require('node:dns').promises
dns.setServers(['1.1.1.1'])

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

const authRoutes = require('./routes/authRoutes')
const doctorRoutes = require('./routes/doctorRoute')
const userRoutes = require('./routes/userRoute')

const logger = require('./middleware/logger')
const errorHandler = require('./middleware/error')

// CORS must come after app is created, before routes
app.use(cors({
  origin: "http://localhost:5173",
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

// 404 handler — after routes, catches anything unmatched
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' })
})

// Error handler — always last
app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch((error) => { console.log(error) })