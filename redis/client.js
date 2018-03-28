'use strict'

const redis = require('redis')
const pino = require('pino')
const conf = {
  pino: {
    level: 'debug'
  },
  redisOpts: {}
}
const logger = pino(conf.pino)

let redisClient

function defaultErrorHandler (err) {
  logger.error(err)
}

function getRedisclient (redisOpts, callack) {
  if (redisClient && redisClient.connected) {
    return process.nextTick(() => {
      callack(null, redisClient)
    })
  }

  function initialErrorHandler (err) {
    logger.error(err)
    redisClient.quit()

    callack(err)
  }

  redisClient = redis.createClient(redisOpts)

  redisClient.on('error', initialErrorHandler)
  redisClient.on('ready', function () {
    logger.info('redisClient connection created')

    if (redisClient) { // mitigating redisClient set to null
      // setup a ping every 2 minutes to keep the redis connection alive
      // Hosted Azure Redis closes idle connections after 5 minutes
      setInterval(() => {
        logger.debug('Ping redis server')
        redisClient.ping('keepAlive', redis.print)
      }, 120000)
      redisClient.removeListener('error', initialErrorHandler)
      redisClient.on('error', defaultErrorHandler)
      redisClient.on('reconnecting', (obj) => {
        logger.debug(`Redis Reconnecting ${obj.delay}ms attempt: ${obj.attempt}`)
      })
      redisClient.on('end', () => {
        logger.debug(`Redis connection ended`)
        redisClient = null
      })
    }

    callack(null, redisClient)
  })
}

module.exports = getRedisclient
