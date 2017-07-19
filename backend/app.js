const port = process.env.PORT || 3000
const express = require('express')
const core = require('./core')

// Require controllers
const StaticDataController = require('./controller/static_data_controller')

const app = express()

const config = {
  riotApiKey: process.env.RIOT_API_KEY || 'RGAPI-9c9bcc19-2c18-4bd5-8dff-184f2608a6d4',
}

// Static data
const staticDataRouter = express.Router()
new StaticDataController(staticDataRouter, config)
app.use('/static', staticDataRouter)

app.listen(port, () => console.log(`Server running on port ${port}`))
