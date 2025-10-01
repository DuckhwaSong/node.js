'use strict'

module.exports = async function (fastify, opts) {

// '/data'에 대한 POST 요청을 처리하는 라우트 핸들러 정의
fastify.get('/service/user', async (request, reply) => {
  const payload = request.body;
  // 들어오는 데이터 처리
  // 지금은 수신된 데이터를 단순히 에코하겠습니다.
  return { receivedData: payload };
});

  // '/data'에 대한 POST 요청을 처리하는 라우트 핸들러 정의 - http://localhost:3000/service/data/user01
  fastify.get('/service/data/:id', async (request, reply) => {
    const params = request.url.split('?')[1];
    console.log(params);
    const payload = request.body;
    // 들어오는 데이터 처리
    // 지금은 수신된 데이터를 단순히 에코하겠습니다.
    const userId = request.params.id;

    try {
      // 💡 `fastify.mysql.query`를 사용하여 바로 쿼리 실행
      // 커넥션 풀에서 커넥션을 빌려오고 반환하는 과정이 모두 자동입니다.
      const [rows] = await fastify.mysql.query('SELECT * FROM nocode WHERE mid=?',[userId]); 
    
      return rows;
    } catch (err) {
      request.log.error(err);
      reply.status(500).send({ error: '데이터베이스 쿼리 오류' });
    }

    return { userId: userId }
  });

}