'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const expect = require('code').expect

const startServer = require('../../../server')

let server

lab.experiment('Update profile email', () => {
  lab.before(() => {
    return startServer()
      .then((s) => {
        server = s
      })
  })

  lab.after(() => {
    return server && server.stop()
  })

  lab.test('has exposed redis', (done) => {
    const redisClient = server.plugins.redis.client
    expect(redisClient).to.exist()

    done()
  })

  lab.test('can set and read key', (done) => {
    const redisClient = server.plugins.redis.client
    redisClient.set('test:key', 'testvalue', (err) => {
      expect(err).to.be.null()

      redisClient.get('test:key', (err, value) => {
        expect(err).to.be.null()
        expect(value).to.equal('testvalue')
        done()
      })
    })
  })
})
