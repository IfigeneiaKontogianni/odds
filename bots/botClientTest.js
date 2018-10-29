const io = require('socket.io-client');
var socketBots = io.connect('http://91.138.138.18:3000/bots');

socketBots.on('connect', function(){
    /*if (totalJobs.length>0) {
        socket.emit("bot_jobs",totalJobs);
    }*/
    socketBots.emit('join-to-channel','bot');
    socketBots.on('message',function(data){
        console.log(data);
    });
    setTimeout(function(){
        socketBots.emit('to-admins','voi8a');
    },10000)

    console.log('connect')
});

