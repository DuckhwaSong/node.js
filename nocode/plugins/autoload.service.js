'use strict'

const fp = require('fastify-plugin')
const path = require('node:path')

module.exports = fp(async function (fastify, opts) {
  // 오토로드 서비스
  fastify.register(require('@fastify/autoload'), {
    dir: path.join(__dirname, '../services'),
    options: Object.assign({}, opts)
  })  
})
