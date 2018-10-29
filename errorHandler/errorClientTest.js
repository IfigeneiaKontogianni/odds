const io = require('socket.io-client');
var socketAdmin = io.connect('http://91.138.138.18:3000/admins');

socketAdmin.on('connect', function(){
    /*if (totalJobs.length>0) {
        socket.emit("bot_jobs",totalJobs);
    }*/
    socketAdmin.on('from-bot',function(data){
        console.log('bot needs help ', data);
    });
    socketAdmin.on('message',function(data){
        console.log(data);
    });

    console.log('connect')
});

