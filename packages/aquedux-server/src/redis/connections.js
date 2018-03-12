import redis from 'redis'
import bluebird from 'bluebird'
import omit from 'lodash/omit'
import { v4 } from 'uuid'

import logger from '../utils/logger'

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

let connections = {}

const port = process.env.AQUEDUX_REDIS_PORT || process.env.DB_PORT_6379_TCP_PORT || '6379'
const host = process.env.AQUEDUX_REDIS_HOST || process.env.DB_PORT_6379_TCP_ADDR || '127.0.0.1'

const retry_strategy = options => {
  if (options.attempt > 3) {
    // End reconnecting with built in error
    logger.error({ who: 'redis-driver', what: 'exit process on failed retrials' })
    process.exit(1)
  }
  return Math.min(options.attempt * options.attempt * 100, 3000)
}

const initial = redis.createClient(port, host, {
  retry_strategy
})

const hookOnEvents = connection => {
  connection.on('error', err => {
    logger.error({ who: 'redis-driver', err })
  })
  connection.on('reconnecting', ({ delay, attempt }) =>
    logger.warn({
      who: 'redis-driver',
      what: `attempting reconnection (${attempt}) with delay ${delay}ms`
    })
  )
  connection.on('connect', () => {
    logger.debug({
      who: 'redis-driver',
      what: 'Connected to Redis successfuly'
    })
  })
  connection.on('ready', () => {
    logger.debug({
      who: 'redis-driver',
      what: 'Connection is ready'
    })
  })
}

hookOnEvents(initial)

export function UndefinedConnectionException(message) {
  this.message = message
  this.name = 'UndefinedConnectionException'
}

export const duplicate = store => {
  const next = initial.duplicate()
  hookOnEvents(next)
  const id = v4()
  connections = { ...connections, [id]: next }
  logger.debug({
    who: 'redis-driver',
    what: 'duplicate connection',
    id
  })
  return id
}

export const close = (store, id) => {
  const conn = connections[id]
  if (conn) {
    conn.quit()
    connections = omit(connections, id)
    logger.debug({
      who: 'redis-driver',
      what: 'close connection',
      id
    })
  } else {
    throw new UndefinedConnectionException(id)
  }
}

export const query = callback => {
  logger.trace({
    who: 'redis-driver',
    what: 'querying redis'
  })
  const conn = initial.duplicate()
  callback(conn, () => conn.quit())
}

export const asyncQuery = async query => {
  logger.trace({
    who: 'redis-driver',
    what: 'querying redis'
  })
  try {
    // const connection = initial.duplicate()
    await query(initial)
    // connection.quit()
  } catch (err) {
    logger.error({
      who: 'redis-driver::asyncQuery',
      what: 'catch error while querying redis',
      err
    })
  }
}

export const get = id => {
  const conn = connections[id]
  if (conn) {
    return conn
  } else {
    throw new UndefinedConnectionException(id)
  }
}

export const getPrimary = () => {
  return initial
}
