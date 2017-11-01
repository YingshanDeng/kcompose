'use strict'

/**
 * Expose compositor.
 */
module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */
function compose (middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  return function (context, next) {
    next = next || (() => {})
    var i = 0
    var fn = middleware.reduceRight((pre, cur, index, array) => {
      return async () => {
        return await cur(context, () => {
          if (++i > array.length) {
            throw new Error('next() called multiple times')
          }
          return pre(context, array[index+1] || (() => {}))
        })
      }
    }, next)
    return fn()
  }
}
