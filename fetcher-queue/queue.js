'use strict'

const assert = require('assert')
const { EventEmitter } = require('events')

/**
 * A Queue class
 * @typedef Queue
 * @property {Array} pending Pending Jobs
 * @property {Number} size Queue size
 */

class Queue extends EventEmitter {
  /**
   * Creates a Queue with specified concurrency
   *
   * @param {Number} concurrency Queue concurrerency
   */
  constructor (concurrency = Infinity) {
    super()
    this._queue = []
    this._pending = new Map()
    this._pendingCount = 0
    this._interval = null
    this._concurrency = concurrency
  }

  /**
   * Add a job to the queue
   *
   * @param {Job} job
   */
  async add (job) {
    assert(job, new Error('job is required'))

    this._queue.unshift(job)
    this._pendingCount++

    const { id, status, description } = job
    this._pending.set(job.id, { id, status, description })
    await this._runQueue()
  }

  async _onInterval () {
    if (this._pendingCount === 0) {
      clearInterval(this._interval)
      this._interval = undefined
    }

    // Queue loop
    while (await this._runQueue()) {}
  }

  async _runQueue () {
    if (this._queue.length === 0) {
      clearInterval(this._interval)
      this._interval = undefined
      return false
    }

    // Extract the job
    const job = this._queue.pop()

    // Notify job completion
    const onCompleted = () => {
      this._pendingCount--
      this._pending.delete(job.id)
      this.emit('completed', job)
    }

    job.on('completed', onCompleted)
    job.on('error', onCompleted)

    // Run the job
    try {
      await job.run()
    } catch (err) {}

    // Check if we can run a job concurrently
    if (this._pendingCount < this._concurrency) {
      // Start the queue loop
      if (!this._interval) {
        this._interval = setInterval(() => this._onInterval(), 0)
      }
      return true
    }

    return false
  }

  /**
   * Return a Job from the pending list
   *
   * @param {String} id
   */
  get (id) {
    return this._pending.get(id)
  }

  /**
   * Return the list of pending Jobs
   */
  get pending () {
    return Array.from(this._pending.values()).map(job => ({
      id: job.id,
      status: job.status,
      description: job.description
    }))
  }

  /**
   * Return size of Queue
   */
  get size () {
    return this._queue.length
  }
}

module.exports = Queue
