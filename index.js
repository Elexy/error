'use strict'

const env = process.env.NODE_ENV || 'dev'
const Hapi = require('hapi')
const pino = require('pino')
const redis = require('redis')
const conf = {
  pino: {
    level: 'debug'
  },
  port: 8000,
  redisOpts: {}
}
const logger = pino(conf.pino)

if (process.env.REDIS_PWD) {
  conf.redisOpts.password = process.env.REDIS_PWD
}
if (process.env.REDIS_HOST) {
  conf.redisOpts.host = process.env.REDIS_HOST
}
if (process.env.REDIS_PORT) {
  conf.redisOpts.port = process.env.REDIS_PORT
}
conf.redisOpts.tls = process.env.REDIS_TLS || false

function defaultErrorHandler (err) {
  logger.error(err)
}

function initialErrorHandler (err) {
  logger.error(err)
  redisClient.quit()
  process.exit(1)
}

let redisClient = redis.createClient(conf.redisOpts)

redisClient.on('error', initialErrorHandler)
redisClient.on('ready', function () {
  logger.info('redisClient connection created')

  if (redisClient) { // mitigating redisClient set to null
    redisClient.removeListener('error', initialErrorHandler)
    redisClient.on('error', defaultErrorHandler)
    redisClient.on('reconnecting', (obj) => {
      logger.debug(`Redis Reconnecting ${obj.delay}ms attempt: ${obj.attempt}`)
    })
    redisClient.on('end', () => {
      logger.debug(`Redis connection ended`)
      // causing an error here
      redisClient = null
    })
  }
})

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
    redisClient.get('token', (err, result) => {
      if (err || !result) {
        reply(err)
      }
      return redisClient.set('token', true, 'EX', 10, (err, res) => {
        if (err) {
          reply(err)
        }
        reply('hello world')
      })
    })
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri} in ${env} mode`)
})
