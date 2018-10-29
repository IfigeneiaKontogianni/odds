const puppeteer = require('puppeteer');
const socket = require('socket.io-client')('http://91.138.138.18:3000/matchmanagers');

function socketInit() {

}

async function init() {
    var myJobs = [], jCnt = 0, myName = '007', startingAt = 0;
    var matchClass = '', liveClass = '';
    var pagesToParse = [], parsingClass = '';


    socket.on('connect', function () {
        console.log('connect')
    });
    socket.on('event', function (data) {
        console.log('event', data)
    });
    socket.on('disconnect', function () {
        console.log('disconnect')
    });
    socket.on('message', function (data) {
        console.log(data)
    });
    socket.on('set_name', function (data) {
        myName = data;
    });
    socket.on('job', function (data) {
        execJobs(data);
    });

    socket.on('startingAt', function (data) {
        startingAt = data;
    });

    console.log('launching...');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
        ]
    });
    socket.emit('give-jobs');

    async function parsePages(pg) {
        var ret = await pg.evaluate(() => {
            let domElements = document.getElementsByClassName(matchClass);
            var mainobj = {
                header: {totalMatches: 0, inPlay: 0, preGame: 0},
                matches: {inplay: [], preGame: []},
                changes: {added: [], deleted: []}
            };

            for (var el of domElements) {
                mainobj.totalMatches++;
                mainobj.markets.push(translateObj(el));
            }

            return mainobj;
        });
        return ret;
    };

    var matchesPages = [];

    setInterval(async () => {
            for (p of pagesToParse)
                socket.emit('send-data', await parsePages(p))
        },
        Math.random() * 4000);

    async function execJobs(jobs) {
        myJobs = jobs.cmds;
        matchClass = jobs.matchClass;
        liveClass = jobs.liveClass;
        var cmdInterv = setInterval(async function () {
            console.log('Executing ', myJobs[jCnt]);
            socket.emit("executing", myJobs[jCnt]);
            await execCommand(myJobs[jCnt++]);
            console.log(jCnt, myJobs.length - 1);
            if (jCnt === myJobs.length) {
                clearInterval(cmdInterv);
            }
        }, Math.random() * 2000 + 14000);
    }

    async function execCommand(cmd, pg) {
        socket.emit('bot-exec', cmd);
        console.log('exec command ', cmd);
        try {
            switch (cmd.a) {
                case 'np' :
                    let npg = await browser.newPage();
                    await npg.goto(cmd.loc);
                    await npg.waitFor(8000);
                    pagesToParse.push(npg);
                    return npg;
                    break;
                case 'gt' :
                    await pg.goto(cmd.loc);
                    await pg.waitFor(8000);
                    break;
                case 'click' :
                    await pg.click(cmd.loc);
                    break;
            }
        } catch (error) {
            //throw(error);
            socket.emit('error', error);
            console.log('error');
            return;
        }
    }
};
init();