'use strict'

const env = process.env.NODE_ENV || 'dev'
const Hapi = require('hapi')
const pino = require('pino')
const conf = {
  pino: {
    level: 'debug'
  },
  port: 8001,
  redisOpts: {}
}
const logger = pino(conf.pino)

process.on('uncaughtException', function (err) {
  logger.error('uncaughtException:', err.message)
  logger.error(err)
  process.exit(1)
})

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({ host: '0.0.0.0', port: conf.port })

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    const redisClient = server.plugins.redis.client

    redisClient.get('token', (err, result) => {
      if (err) {
        logger.error(err)
        reply(err)
      } else {
        return redisClient.set('token', true, 'EX', 10, (err, res) => {
          if (err) {
            reply(err)
          } else {
            reply('hello world')
          }
        })
      }
    })
  }
})

server.register([
  { register: require('./redis'), options: conf.redis },
  { register: require('hapi-pino'), options: conf.pino }
]).then(() => {
  server.start((err) => {
    if (err) {
      throw err
    }
    console.log(`Server running at: ${server.info.uri} in ${env} mode`)
  })
})
  .catch(err => {
    logger.error(err)
    process.exit(1)
  })
