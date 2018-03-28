'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const expect = require('code').expect

const { initialize } = require('../../../server')

let server

lab.experiment('Update profile email', () => {
  lab.before(() => {
    return initialize()
      .then((s) => {
        server = s
        return new Promise((resolve, reject) => {
          const redis = server.plugins.redis.client
          redis.flushdb((err) => {
            if (err) return reject(err)
            resolve()
          })
        })
      })
  })

  lab.after(() => {
    return server && server.stop()
  })

  lab.test('can use cache policy', (done) => {
    const cache = server.cache({
      cache: 'redisCache',
      expiresIn: 20 * 1000,
      segment: 'testSegment'
    })

    cache.set('policy:key', 'testvalue', null, (err) => {
      expect(err).to.be.null()

      cache.get('policy:key', (err, res) => {
        expect(err).to.be.null()
        expect(res).to.equal('testvalue')
        done()
      })
    })
  })
})
