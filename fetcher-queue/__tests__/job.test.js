/* eslint-env jest */
'use strict'

const { Job } = require('../')

test('create a new job', async (done) => {
  const task = new Promise((resolve, reject) => {
    setTimeout(() => resolve(42), 5)
  })

  const job = new Job(task, {
    description: 'resolves in 5 ms'
  })

  job.on('completed', results => {
    expect(results).toBe(42)
    expect(job.status).toBe('completed')
    done()
  })

  expect(job.id).toBeDefined()
  expect(job.id.length).toBe(36)
  expect(job.status).toBe('pending')
  expect(job.description).toBe('resolves in 5 ms')
  expect(job.results).toBeUndefined()

  await job.run()
  expect(job.status).toBe('completed')
  expect(job.results).toBe(42)
  expect(job.error).toBeUndefined()
})

test('create a new job without meta', () => {
  const task = Promise.resolve()
  const job = new Job(task)

  expect(job.id).toBeDefined()
  expect(job.id.length).toBe(36)
  expect(job.status).toBe('pending')
  expect(job.description).toBe('')
})

test('create a failed job', async done => {
  const task = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('oops')), 0)
  })
  const job = new Job(task)

  job.on('error', err => {
    expect(err instanceof Error).toBeTruthy()
    expect(err.message).toBe('oops')
    expect(job.error).toBe(err)
    expect(job.status).toBe('failed')
    done()
  })

  await job.run()
})
