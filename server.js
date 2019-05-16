'use strict'

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const config = require('@fetcher/config')
const { Database } = require('@fetcher/db')
const { Queue } = require('@fetcher/queue')
const FetcherAPI = require('@fetcher/api')

const server = http.createServer(app)
const db = new Database(config.db)
const queue = new Queue(8)
const api = new FetcherAPI(db, queue)

app.use(bodyParser.json())
app.use('/', api.getRoutes())
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.message)
    res.status(500).send({ error: err.message })
    return
  }
  next()
})

module.exports = server

if (!module.parent) {
  server.listen(config.server.port, () => {
    console.log(`Fetcher listening on http://localhost:${config.server.port}`)
  })

  const exitHandler = (code, reason) => err => {
    if (err instanceof Error) {
      console.error(`${reason} - ${err.message}`)
    } else {
      console.error(`Process Exited: ${err}`)
    }

    // If in 500ms isn't done, let's force
    setTimeout(() => {
      console.error('Shutdown tiemout: Forcing')
      process.exit(code)
    }, 500).unref()

    // Graceful shutdown
    server.close(() => {
      process.exit(code)
    })
  }

  // Register Global Signal Handlers
  process.on('SIGTERM', exitHandler(0))
  process.on('SIGINT', exitHandler(0))

  // Register Global Error Handlers
  process.on('uncaughtException', exitHandler(1, 'Uncaught Exception'))
  process.on('unhandledRejection', exitHandler(1, 'Unhandled Rejection'))
}
