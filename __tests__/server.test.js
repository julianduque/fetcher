/* eslint-env jest */
'use strict'

const request = require('supertest')
const server = require('../server')

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
