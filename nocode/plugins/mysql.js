'use strict'

const fp = require('fastify-plugin')
const projectData = require("../project.json");  // projectData JSON 파일 불러오기

module.exports = fp(async function (fastify, opts) {
  // 💡 @fastify/mysql 플러그인 등록
  fastify.register(require('@fastify/mysql'), projectData.database.mysql1);  
})
