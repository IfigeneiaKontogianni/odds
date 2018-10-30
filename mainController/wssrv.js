const http = require('http').createServer(),
    io = require('socket.io').listen(http);

http.listen(3000);

var clients = {};

var botActions = {
    bet365: {
        cmds: [
            {a: 'np', loc: 'https://www.bet365.gr'},
            {a: 'gt', loc: 'https://www.bet365.gr/#/AC/B1/C1/D13/E40/F141/'}
        ],
        parsingClass : 'gl-MarketGroup',
        matchesToParse : 5
    },
    matchManager:{
        cmds : [
            {a:'np', loc:'https://www.bet365.gr/en'},
            {a:'gt', loc:'https://www.bet365.gr/#/HO/'},
            {a:'click', loc:'body > div:nth-child(1) > div > div.wc-PageView > div.wc-PageView_Main.wc-HomePage_PageViewMain > div > div.wc-HomePage_ClassificationWrapper.wc-CommonElementStyle_WebNav > div > div > div:nth-child(24)'},
            {a:'click', loc:'body > div:nth-child(1) > div > div.wc-PageView > div.wc-PageView_Main > div > div.wc-CommonElementStyle_PrematchCenter.wc-SplashPage_CenterColumn > div.sm-SplashModule > div.sm-SplashContainer > div:nth-child(2) > div.sm-MarketGroup_Open > div:nth-child(1) > div.sm-MarketContainer.sm-MarketContainer_NumColumns4.sm-Market_Open > div:nth-child(1) > div'}
        ],
        name:'007',
        matchClass:'sl-CouponParticipantWithBookCloses_NameContainer ',
        liveClass:'pi-ScoreVariantCentred_ScoreField ',
    }
};

const config = {
    maxBotInPlayPages:8,
    maxBotPreGamePages:40,
    totalMatches:100,
    totalInPlay:10,
    totalPreGame:30,
    totalOpenedPages:0,
    totalClients:0,
    totalRooms:6
};

var totalMatches=10;
var totalClients=0;
var channels = {};
channels['admins'] = io.of('/admins');
channels['bots'] = io.of('/bots');
channels['errors'] = io.of('/errors');
channels['controllers'] = io.of('/controllers');
channels['fuzzers'] = io.of('/fuzzers');
channels['managers'] = io.of('/managers');

function parseManagersData(data) {

}

channels['managers'].on('connection', function(socket) {
    socket.emit('message', 'hello manager!!');
    socket.emit('message', 'You are connected to admins channel!');
    socket.on('give-jobs', function (data) {
        socket.emit('jobs', botActions.matchManager);
    });
    socket.on('executing', function (data) {
        console.log(data);
    });
    socket.on('error', function (data) {
        console.log(data);
        channels['admins'].emit('error-from-amagers', data);
    });
    socket.on('send-data', function (data) {
        console.log(JSON.stringify(data));
    })

});

channels['bots'].on('connection', function(socket) {
    socket.emit('message', 'hello man!!');
    socket.emit('message', 'You are connected to bots channel!');
    io.emit('message', 'new bot connected');
    socket.emit('set_name', socket.id);
    //socket.broadcast.emit('')
    socket.emit('startingAt', totalClients*5);
    socket.botName = socket.id;
    totalClients++;
    clients[socket.botName] = {
        "socket": socket.id
    };

    socket.on('to-admins', function(data){
        channels['admins'].emit('from-bot', data);
    });


    channels['admins'].emit('message', 'new bot connected '+socket.botName);

    socket.on('bot-exec',function(data){
        channels['controllers'].emit('bot-exec',{bot:socket.id,d:data});
    });

    socket.on('private-message', function(data){
        console.log("Sending: " + data.content + " to " + data.username);
        if (clients[data.username]){
            io.sockets.connected[clients[data.username].socket].emit("add-message", data);
        } else {
            console.log("User does not exist: " + data.username);
        }
    });

    socket.on('message', function(data){
        console.log(new Date().toLocaleTimeString()+": Message from bot : " + socket.botName+ " message ", data );
    });

    socket.on('give-jobs', function () {
        socket.emit('job', botActions.bet365)
    })

    socket.on('bot_jobs', function(data){

    });

    socket.on('send-data', function(data){
        channels['fuzzers'].emit('bot-data',{bot:socket.id,d:data});
    });

    socket.on('disconnect', function() {
        for(var name in clients) {
            if(clients[name].socket === socket.id) {
                delete clients[name];
                break;
            }
        }
        totalClients--;
        console.log('client disconnected')
    })
});

channels['admins'].on('connection', function(socket) {
    console.log('admin connected');
    socket.emit('message', 'hello adminara!!');
    socket.emit('message', 'You are connected to admins channel!');
});

io.sockets.on('connection', function (socket) {

    console.log('A client is connected!');
    socket.on('join-to-channel', (data)=>{
        console.log('redirect request client to channel!', data);
        socket.join(data);
    });
});

console.log('Server up @ port 3000');