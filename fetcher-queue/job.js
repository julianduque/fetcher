'use strict'

const assert = require('assert')
const { EventEmitter } = require('events')
const uuid = require('uuid')

/**
 * Optional metadata for the Job
 *
 * @typedef {Object} JobMeta
 * @property {String} name
 * @property {String} description
 */

/**
 * Job representing an asynchronous task to run in a queue
 *
 * @typedef {Object} Job
 * @property {String} id Job ID
 * @property {String} status Job status - pending, complete
 * @property {any} results Job results
 * @property {Error} error Job error (if it failed)
 * @property {String|undefined} description Job description
 */

class Job extends EventEmitter {
  /**
   * Creates a new Job
   *
   * @param {Promise<any>} task Task to run
   * @param {JobMeta|null} meta Job metadata
   */
  constructor (task, meta = {}) {
    super()
    assert(task, new Error('task is required'))
    this._task = task
    this._status = 'pending'
    this._results = undefined
    this._error = undefined
    this._id = uuid.v4()
    this._meta = meta
  }

  async run () {
    try {
      this._results = await this._task
      this._status = 'completed'
      this.emit('completed', this._results)
    } catch (err) {
      this._error = err
      this._status = 'failed'
      this.emit('error', err)
    }
  }

  get id () {
    return this._id
  }

  get status () {
    return this._status
  }

  get description () {
    return this._meta.description ? this._meta.description : ''
  }

  get results () {
    return this._results
  }

  get error () {
    return this._error
  }
}

module.exports = Job
