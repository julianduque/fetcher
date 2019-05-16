'use strict'

const request = require('request-promise-native')
const { Job } = require('@fetcher/queue')
const { Router } = require('express')

class FetcherAPI {
  /**
   *
   * @param {Database} db Database instance
   * @param {Queue} queue Queue instance
   */
  constructor (db, queue) {
    this._router = new Router()
    this._queue = queue
    this._db = db

    this._setupRoutes()
    this._queue.on('completed', async job => {
      try {
        // Store on DB
        const { id, status, results, error } = job
        if (status === 'error') {
          await this._db.saveResult(id, {
            status, error
          })
          return
        }

        await this._db.saveResult(id, {
          status, results
        })
      } catch (err) {
        console.error(err.message)
      }
    })
  }

  /**
   * Setup Routes
   */
  _setupRoutes () {
    // Endpoint Discovery Route
    this._router.get('/', (req, res) => {
      res.send([
        'POST /job - Creates a Job',
        'GET /job/:jobId - Returns a pending or completed Job',
        'GET /jobs - Returns all pending Jobs'
      ])
    })

    // Create a Job
    this._router.post('/job', async (req, res, next) => {
      const { url } = req.body
      try {
        // Create a Fetcher Promise
        const task = new Promise((resolve, reject) => {
          request.get(url).then(resolve).catch(reject)
        })
        const job = new Job(task, {
          description: `Fetching ${url}`
        })
        this._queue.add(job)
        const { id, status } = job
        res.status(201).send({ id, status })
      } catch (err) {
        next(err)
      }
    })

    // Get a Job result
    this._router.get('/job/:jobId', async (req, res, next) => {
      const { jobId } = req.params
      try {
        let job

        // Check if exists on DB
        job = await this._db.getResult(jobId)
        if (job) {
          res.send({
            id: jobId,
            status: job.status,
            results: job.results
          })
          return
        }

        // Check if exists on the queue
        job = this._queue.get(jobId)
        if (job) {
          res.send({
            id: jobId,
            status: job.status
          })
          return
        }

        // Job not found, sending 404
        res.status(404).send({ status: 'Job not found' })
      } catch (err) {
        next(err)
      }
    })

    // Get all pending jobs
    this._router.get('/jobs', (req, res) => {
      res.send(this._queue.pending)
    })
  }

  /**
   * Returns all the Fetcher API routes
   *
   * @returns {Router} API routes
   */
  getRoutes () {
    return this._router
  }
}

module.exports = FetcherAPI
