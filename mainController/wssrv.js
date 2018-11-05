const http = require('http').createServer(),
    io = require('socket.io').listen(http);
http.listen(3000);

const clients = {};
const botActions = require('./config/botsActions.js')();
//const config = require('./config/config.json');
const channels = {
    admins: {totalClients: 0, path: '/admins', channel: io.of('/admins')},
    bots: {totalClients: 0, path: '/bots', channel: io.of('/bots')},
    errors: {totalClients: 0, path: '/errors', channel: io.of('/errors')},
    controllers: {totalClients: 0, path: '/controllers', channel: io.of('/controllers')},
    fuzzers: {totalClients: 0, path: '/fuzzers', channel: io.of('/fuzzers')},
    managers: {totalClients: 0, path: '/managers', channel: io.of('/managers')},
    totalClients: 0
};

/**
 * Initializind Clients with socket.id and type and
 * push them into clients dictionary. Also put on socket the default listeners.
 * On every channel connection we must call this function.
 *
 * @param socket is the client socket
 * @param type the type of the client (bot, admin, fuzzer, ...)
 */
function initClientConnection(socket, type) {
    socket.clientID = socket.id;
    socket.type = type;
    clients[socket.clientID] = {
        socket: socket.id,
        name: '',
        type: type,
        actions: {},
        lastError: ''
    };

    channels[type].totalClients++;
    channels.totalClients++;
    socket.emit('message', 'hello.');
    socket.emit('message', 'You are connected as ' + socket.id);
    io.emit('message', 'new client connected with ID : ' + socket.id);

    socket.on('disconnect', function (socket) {
        closeClientConnection(socket)
    });
    socket.on('error', function (data) {
        channels['error'].channel.emit('error', data);
        console.log(data);
    });
}

/**
 * Closing the connection and delete client from the clients dictionary
 *
 * @param socket is the client socket :P
 */
function closeClientConnection(socket) {
    //channels[socket.type].totalClients--;
    channels.totalClients--;
    //delete clients[name];
    console.log('client disconnected');
    io.emit('message', 'client disconnected ID : ', socket.id);
}

/**
 * Managers channel administration
 */
channels['managers'].channel.on('connection', function (socket) {
    socket.on('give-jobs', function (data) {
        socket.emit('jobs', botActions.matchManager);
    });
    socket.on('executing', function (data) {
        console.log(data);
    });
    socket.on('error', function (data) {
        console.log(data);
        channels['admins'].channel.emit('error-from-amagers', data);
    });
    socket.on('send-data', function (data) {
        console.log(JSON.stringify(data));
    });

});

/**
 * Bots channel administration
 */
channels['bots'].channel.on('connection', function (socket) {
    initClientConnection(socket, 'bots');
    socket.emit('startingAt', clients.totalClients);

    socket.on('to-admins', function (data) {
        channels['admins'].channel.emit('from-bot', data);
    });

    channels['admins'].channel.emit('message', 'new bot connected ' + socket.botName);

    socket.on('bot-exec', function (data) {
        channels['controllers'].channel.emit('bot-exec', {bot: socket.id, d: data});
        channels['admins'].channel.emit('bot-exec', {bot: socket.id, d: data});
        console.log(data);
    });

    socket.on('message', function (data) {
        console.log(new Date().toLocaleTimeString() + ": Message from bot : " + socket.botName + " message ", data);
    });

    socket.on('get-jobs', function (data) {
        socket.emit('jobs', botActions.soccer[data]);

    });

    socket.on('send-data', function (data) {
        channels['fuzzers'].channel.emit('bot-data', {bot: socket.id, d: data});
        console.log(data);

    });
});

/**
 * Admins channel administration
 */
channels['admins'].channel.on('connection', function (socket) {
    initClientConnection(socket, 'admin');
    console.log('admin connected');
    socket.emit('message', 'hello adminara!!');
    socket.emit('message', 'You are connected to admins channel!');
    socket.on('get-channels', function (fn) {
        fn(channels);
    });
});

io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');
    socket.on('join-to-channel', (data) => {
        console.log('redirect request client to channel!', data);
        socket.join(data);
    });
});

console.log('Server up @ port 3000');