'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const multipart = require('@fastify/multipart') // 폼데이터를 사용하기 위함.
const corelib = require('./lib/core.class.js')
const fs = require('fs');

// Pass --options via CLI arguments in command to enable these options.
const options = {}

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // 오토로드 라우트 처리
  /*fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'autoroutes'),
    options: Object.assign({}, opts)
  })*/
  

  // @fastify/view 플러그인 등록
  fastify.register(require('@fastify/view'), {
    engine: { // 사용할 엔진 설정
      ejs: require('ejs'), // EJS 엔진 등록
    },
    root: path.join(__dirname, 'template'), // EJS 템플릿 파일들이 저장된 폴더 경로
    viewExt: 'html', // 기본 확장자 설정 (EJS 파일이 .html 확장자를 가진다고 가정)
    includeViewExtension: true, // 뷰 확장자를 포함할지 여부
  });    

  fastify.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    url: '/data',
    handler: async (request, reply) => {
      return {
        resp: 'route',
        method: request.method,
        path: request.url,
        query: request.query
      };
    }
  });

  // projectData JSON 파일 불러오기
  const projectData = require(path.join(__dirname, "project.json"));
  //console.log(projectData);

  await fastify.register(multipart);  // 폼데이터를 사용하기 위함.

  // fastify.route 정의 외 모든 요청을 처리
  fastify.all("*", async (request, reply) => {
    const parts = request.parts(); // 여러 필드/파일 순회
    const formdatas = {};
    const files = [];
    

    // 폼데이터 처리
    // multipart 인지 확인
    if (request.isMultipart()) {
      for await (const part of parts) {
        // 폼파일처리
        if (part.file) files.push({field: part.fieldname,filename: part.filename,mimetype: part.mimetype});
        else formdatas[part.fieldname] = part.value; // 일반 폼필드 처리
      }
    }

    let replyData={
      resp: 'all',
      method: request.method,
      path: request.url,
      query: request.query,
      body: request.body,
      files: files,
      formdatas: formdatas,
    };
    //return replyData;
    return reply.view('index.html', replyData);

    // 템플릿파일 있는경우 html로 반환
    fs.access(path.join(__dirname, 'template')+request.url+'.html', fs.constants.F_OK, (err) => {
    if (err) {
      console.error('파일이 존재하지 않거나 접근할 수 없습니다:', err);
      // 데이터를 리턴
      return replyData;
    } else {
      console.log('파일이 존재합니다.');
      //return reply.view('index.html', replyData); // template/index.html을 렌더링합니다.
      return replyData;
    }
    });
  });
}

module.exports.options = options
