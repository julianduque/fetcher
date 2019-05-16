'use strict'

const { EventEmitter } = require('events')
const Redis = require('ioredis')

/**
 * Database configuration options
 *
 * @typedef {Object} DatabaseOptions
 * @property {Number} port Redis port (Default: 6379)
 * @property {String} host Redis host (Default: 127.0.0.1)
 * @property {String|null} password
 * @property {Number} db Redis database (Default: 0)
 */

/**
* Database class
*
* @typedef {Object} Database
*/

class Database extends EventEmitter {
  /**
   * Creates a new Database instance
   *
   * @param {DatabaseOptions} options Database configuration options
   */
  constructor (options = { port: 6379, host: '127.0.0.1' }) {
    super()
    this._db = new Redis({
      port: options.port,
      host: options.host,
      password: options.password,
      db: options.db || 0
    })

    // Bubble up error event
    this._db.on('error', err => this.emit('error', err))
  }

  async saveResult (id, result) {
    return this._db.set(id, JSON.stringify(result))
  }

  async getResult (id) {
    return JSON.parse(await this._db.get(id))
  }
}

module.exports = Database
