var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
    if (totalJobs.length>0) {
        socket.emit("bot_jobs",totalJobs);
    }
    console.log('connect')
});
socket.on('event', function(data){
    console.log('event',data)
});
socket.on('disconnect', function(){
    console.log('disconnect')
});
socket.on('message', function(data){
    console.log(data)
});

socket.on('set_name', function(data){
    myName = data;
});

socket.on('job', function(data){
    execJobs(data)
});

function execJobs(jobs) {
    totalJobs = jobs;
    for(var job of jobs)
        console.log(job);
    setInterval(function(){
            if (jCnt>=totalJobs.length) jCnt = 0;
            console.log('Executing ', totalJobs[jCnt]);
            socket.emit("message",totalJobs[jCnt++]);
        }, Math.random()*2000+3000);
}

var totalJobs = [];
var jCnt = 0;
var myName = '007';