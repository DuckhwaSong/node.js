'use strict'

const fp = require('fastify-plugin')
const path = require('node:path')

module.exports = fp(async function (fastify, opts) {
  // 1. 쿠키 플러그인 등록
  fastify.register(require('@fastify/cookie'));

  // 2. 세션 플러그인 등록
  fastify.register(require('@fastify/session'), {
    secret: 'your-secret-key-must-be-at-least-thirty-two-characters-long',  // 💡 32자 이상의 무작위 문자열을 사용해야 합니다.
    cookie: {
      // 보안을 위해 HTTPS 환경에서는 true로 설정하는 것이 좋습니다.
      secure: false, 
      maxAge: 86400000 // 세션 만료 시간 (예: 24시간 = 86400000ms)
    },
    // saveUninitialized: true (기본값)는 세션을 수정하지 않아도 저장합니다.
    // EU 쿠키법 준수나 저장 공간 절약을 위해 false로 설정할 수 있습니다.
    saveUninitialized: false, 
  });
})
