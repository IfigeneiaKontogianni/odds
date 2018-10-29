const io = require('socket.io-client');
var socket = io.connect('http://91.138.138.18:3000/fuzzers');

socket.on('connect', function(){
    /*if (totalJobs.length>0) {
        socket.emit("bot_jobs",totalJobs);
    }*/
    socket.on('bot-data',function(data){
        console.log('bot sending data ', data);
    });
    socket.on('message',function(data){
        console.log(data);
    });

    console.log('connect')
});

