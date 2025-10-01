'use strict'

module.exports = async function (fastify, opts) {
  /*fastify.get('/', async function (request, reply) {
    return { root: true }
  });*/

  // '/data'에 대한 POST 요청을 처리하는 라우트 핸들러 정의
  fastify.get('/data/:id', async (request, reply) => {
    const params = request.url.split('?')[1];
    console.log(params);
    const payload = request.body;
    // 들어오는 데이터 처리
    // 지금은 수신된 데이터를 단순히 에코하겠습니다.
    const userId = request.params.id;

    return { userId: userId }
  });

}
