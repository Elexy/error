'use strict'

const env = process.env.NODE_ENV || 'dev'
const Hapi = require('hapi')
const pino = require('pino')
const conf = {
  pino: {
    level: 'warn'
  },
  port: 8000
}
const logger = pino(conf.pino)

// const redisPlugin = {
//   name: 'redisPlugin',
//   version: '1.0.0',
//   register: async function (server, options) {
//     function initialErrorHandler (err) {
//       logger.error(err)
//       redisClient.quit()

//       callack(err)
//     }

//     redisClient = redis.createClient(redisOpts)

//     redisClient.on('error', initialErrorHandler)
//     redisClient.on('ready', function () {
//       logger.info('redisClient connection created')

//       if (redisClient) { // mitigating redisClient set to null
//         redisClient.removeListener('error', initialErrorHandler)
//         redisClient.on('error', defaultErrorHandler)
//         redisClient.on('reconnecting', (obj) => {
//           logger.debug(`Redis Reconnecting ${obj.delay}ms attempt: ${obj.attempt}`)
//         })
//         redisClient.on('end', () => {
//           logger.debug(`Redis connection ended`)
//           // causing an error here
//           redisClient = null
//         })
//       }

//       callack(null, redisClient)
//     })
//   }
// }

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({ host: 'localhost', port: conf.port })

// Add the route
server.route({
  method: 'GET',
  path: '/hello',
  handler: function (request, h) {
    return 'hello world'
  }
})

server.start()
  .then(s => {
    logger.info(`Server started on port ${conf.port}, in  ${env} mode`)
  })
  .catch(err => {
    logger.error('uncaughtException:', err.message)
    logger.error(err)
    process.exit(1)
  })
