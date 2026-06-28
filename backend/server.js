require('dotenv').config()

const dns = require('node:dns').promises

dns.setServers(['1.1.1.1'])

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const PORT = process.env.PORT || 3000
const doctorRoutes = require('./routes/doctorRoute')
const userRoutes = require('./routes/userRoute')

// Logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})

//cors add na korle frontend add e error ashbe..ekn alada port e cholle problem nai
const cors = require("cors");

app.use(cors());

// Parse JSON bodies (useful to add early)
app.use(express.json())

app.use('/api/doctors',doctorRoutes)
app.use('/api/users',userRoutes)

mongoose.connect(process.env.MONGO_URI).then(()=>{
// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
}).catch((error)=>{console.log(error)})

