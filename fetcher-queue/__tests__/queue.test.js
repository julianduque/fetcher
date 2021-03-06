'use strict'

const { Job, Queue } = require('../')

/* eslint-env jest */
beforeEach(() => {
  jest.useFakeTimers()
})

test('Queue#add', async done => {
  const task = Promise.resolve(42)
  const queue = new Queue()

  let count = 0
  queue.on('completed', job => {
    expect(job.id).toBeDefined()
    expect(job.id.length).toBe(36)
    expect(job.status).toBe('completed')
    expect(job.results).toBe(42)
    if (++count === 5) {
      done()
    }
  })

  await queue.add(new Job(task))
  await queue.add(new Job(task))
  await queue.add(new Job(task))
  await queue.add(new Job(task))
  await queue.add(new Job(task))
  jest.runAllTimers()
})

test('Queue#pending', async () => {
  const task = Promise.resolve(42)

  const queue = new Queue()
  const jobs = [
    new Job(task),
    new Job(task),
    new Job(task),
    new Job(task),
    new Job(task)
  ]

  jobs.forEach(job => {
    queue.add(job)
  })
  expect(queue.pending.length).toBe(5)
  expect(queue.pending.every(job => job.status === 'pending')).toBeTruthy()
})
