'use strict'

const getRedisclient = require('./client')
const config = { redis: {} }

const register = (server, opts, next) => {
  getRedisclient(config.redis, (err, redisClient) => {
    if (err) return next(err)

    server.expose('client', redisClient)

    server.ext('onPreStop', (server, next) => {
      redisClient.quit(next)
    })

    next()
  })
}

register.attributes = {
  name: 'redis'
}

module.exports = register
