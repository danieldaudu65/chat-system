const express = require('express')
const mongoose = require('mongoose')

// server side port
const port = process.env.PORT || 4000

const app = express()
const cors = require('cors')
require('dotenv').config()

// mongoose connect (fixed)
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Failed', err))

// connect to server 
app.use(express.json())   
 
// give access to connect to server
app.use(cors())

// gain access to my routes
// Example: app.use('/api/users', userRoutes);

app.use('auth', require('./routes/auth'))
app.use('profile', require('./routes/profile'))

// server connections
app.listen(port, (error) => {
    if (!error) {
        console.log(`Server connected on PORT ${port}`);
    }
    else {
        console.log(`Error: ${error}`);
    }
})
