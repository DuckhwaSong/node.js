'use strict'

const fp = require('fastify-plugin')
const { fastifySchedule } = require('@fastify/schedule');
const { CronJob, AsyncTask } = require('toad-scheduler'); // toad-scheduler에서 필요한 클래스 임포트

const projectData = require("../project.json");  // projectData JSON 파일 불러오기

module.exports = fp(async function (fastify, opts) {
    // 1. 플러그인 등록
    fastify.register(fastifySchedule);

    // 서버 준비 완료 후 스케줄러에 작업 추가
    fastify.ready().then(() => {

        // --- 작업 1: 매 10초마다 실행  ---
        fastify.scheduler.addCronJob(new CronJob(
            { cronExpression: '*/10 * * * * *', timezone: "Asia/Seoul" }, // 6개 필드: 매 10초
            new AsyncTask('health_check', async () => {
                fastify.log.info('[task 1] 10seconds check.');
            })
        ));
        
        // --- 작업 2: 매일 새벽 3시 30분에 실행 ---    
        fastify.scheduler.addCronJob(new CronJob(
            { cronExpression: '30 3 * * *', timezone: "Asia/Seoul" }, // 5개 필드: 30분 3시 매일 매월 모든 요일
            new AsyncTask('data_backup', async () => {
                fastify.log.warn('[task 2] DB backup + cleaning.');
            })
        ));
  
    });
})
