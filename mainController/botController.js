'use strict';
const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8081 });
wss.on('connection', ((ws) =gt; {
    ws.on('message', (message) =gt; {
    console.log(`received: ${message}`);
});
ws.on('end', () =gt; {
    console.log('Connection ended...');
});
ws.send('Hello Client');
}));