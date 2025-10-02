'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const multipart = require('@fastify/multipart') // 폼데이터를 사용하기 위함.
const corelib = require('./lib/core.class.js')
const fs = require('fs');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const ejs = require('ejs');
const fastify = require('fastify')({ logger: true });


const mysql = require('mysql2');
// 데이터베이스 연결 설정
const pool = mysql.createPool({
  host: 'localhost',      // MySQL 서버 주소
  user: 'nocode',  // 사용자 이름
  password: 'nocode12!@', // 비밀번호
  database: 'nocode', // 사용할 데이터베이스 이름
  waitForConnections: true, // 풀에 연결이 없을 때 대기할지 여부
  connectionLimit: 10,      // ⭐ 최대 연결 개수 (가장 중요한 설정)
  queueLimit: 0,            // 연결 대기 큐의 최대 크기 (0은 무제한)
  port: 3366, // 기본 포트는 생략 가능
});
const promisePool = pool.promise();
module.exports = promisePool;


// Pass --options via CLI arguments in command to enable these options.
const options = {}

// lib 디렉토리의 모든 모듈을 로드함
function moduleLoad(dirPath='lib'){
  const directoryPath = path.join(__dirname, dirPath); // 로드할 디렉터리 경로
  const modules = {}; // 로드된 모듈을 저장할 객체

  try {
    // 디렉터리 내용을 동기적으로 읽기
    const files = fs.readdirSync(directoryPath);

    files.forEach(file => {
      // .js 파일만 필터링
      if (file.endsWith('.js')) {
        const moduleName = path.basename(file, '.js');
        const filePath = path.join(directoryPath, file);
        
        // 런타임에 파일 로드 (require)
        modules[moduleName] = require(filePath);
        
        console.log(`모듈 로드됨: ${moduleName}`);
      }
    });
  } catch (err) {
    console.error('디렉터리 파일을 읽는 중 오류 발생:', err);
  }
  return modules;
}

module.exports = async function (fastify, opts) {
  const libModules = moduleLoad();
  console.log(libModules);

  // projectData JSON 파일 불러오기
  const projectData = require(path.join(__dirname, "project.json"));
    
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
  
  // 서비스 등록
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  })  

  // @fastify/view 플러그인 등록
  fastify.register(require('@fastify/view'), {
    engine: { // 사용할 엔진 설정
      ejs: ejs, // EJS 엔진 등록
    },
    root: path.join(__dirname, 'template'), // EJS 템플릿 파일들이 저장된 폴더 경로
    viewExt: 'html', // 기본 확장자 설정 (EJS 파일이 .html 확장자를 가진다고 가정)
    includeViewExtension: true, // 뷰 확장자를 포함할지 여부
  });  

  // 1. 쿠키 플러그인 등록
  fastify.register(fastifyCookie);

  // 2. 세션 플러그인 등록
  fastify.register(fastifySession, {
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

  // 💡 @fastify/mysql 플러그인 등록
  fastify.register(require('@fastify/mysql'), projectData.database.mysql1);  

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


  await fastify.register(multipart);  // 폼데이터를 사용하기 위함.

  // fastify.route 정의 외 모든 요청을 처리
  fastify.all("*", async (request, reply) => {
    const parts = request.parts(); // 여러 필드/파일 순회
    const formdatas = {};
    const files = [];
    //rawHeaders / referer
    

    // 폼데이터 처리
    // multipart 인지 확인
    if (request.isMultipart()) {
      for await (const part of parts) {
        // 폼파일처리
        if (part.file) files.push({field: part.fieldname,filename: part.filename,mimetype: part.mimetype});
        else formdatas[part.fieldname] = part.value; // 일반 폼필드 처리
      }
    }
    let uriPath=request.url.split('?')[0];  //쿼리를 제외한 path만 처리
    if(uriPath=='/') uriPath='/index';    // url루트로 들어온 경우 index로 치환
    let replyData={
      resp: 'all',
      request : {
        //reqAllData: reqAllData,
        method: request.method,
        path: uriPath,
        referer: request.headers.referer,
        query: request.query,
        //headers: request.headers,
        body: request.body,
        session : request.session,
      },      
      files: files,
      formdatas: formdatas,
    };

    // sql 렌더링 테스트
    //replyData.request.data = ejs.render("sql>SELECT RIGHT(content,1) as NO1 FROM board WHERE seq=<%=params.seq%>", {params: {seq:2}}); 
    
    // 템플릿파일 있는경우 html로 반환 / 없는경우 json 반환
    const templateFile = path.join(__dirname, 'template')+uriPath+'.html';
          console.log(templateFile);

    if (fs.existsSync(templateFile)) {
      replyData=reply.view(uriPath+'.html', replyData); // template/index.html을 렌더링합니다.
    }
        
    return replyData;
  });
}

module.exports.options = options
