'use strict'

const server = {
  port: +process.env.PORT || 3000
}

const db = {
  port: +process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || '127.0.0.1',
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DATABASE || 0
}

module.exports = {
  server,
  db
}
