/* eslint-env jest */
'use strict'

const request = require('supertest')
const server = require('../server')

jest.mock('@fetcher/db', () => {
  return {
    Database: jest.fn().mockImplementation(() => {
      return {
        saveResult: jest.fn(),
        getResult: jest.fn()
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce({
            id: '2c93f1b8-25ab-4401-b378-f249607a86cb',
            status: 'pending'
          })
      }
    })
  }
})

// Last tick as work-around for left open handles
afterAll(() => setImmediate(() => {}))

test('POST /job', done => {
  request(server)
    .post('/job')
    .send({
      url: 'https://google.com'
    })
    .expect('Content-Type', /json/)
    .expect(201)
    .end((err, res) => {
      if (err) return done(err)
      const body = res.body
      expect(body.id).toBeDefined()
      expect(body.id.length).toBe(36)
      expect(body.status).toBeDefined()
      expect(body.status).toBe('pending')
      done()
    })
})

test('GET /job/not-found', done => {
  request(server)
    .get('/job/not-found')
    .expect('Content-Type', /json/)
    .expect(404)
    .end((err, res) => {
      if (err) return done(err)
      const body = res.body
      expect(body.status).toBeDefined()
      expect(body.status).toBe('Job not found')
      done()
    })
})

test('GET /job/ with valid Job', done => {
  request(server)
    .get('/job/2c93f1b8-25ab-4401-b378-f249607a86cb')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) return done(err)
      const body = res.body
      expect(body.status).toBeDefined()
      expect(body.id).toBe('2c93f1b8-25ab-4401-b378-f249607a86cb')
      expect(body.status).toBe('pending')
      done()
    })
})

test('GET /jobs', done => {
  request(server)
    .get('/jobs')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      if (err) return done(err)
      const body = res.body
      expect(body).toBeDefined()
      expect(Array.isArray(body)).toBeTruthy()
      expect(body.length).toBe(1)
      done()
    })
})
