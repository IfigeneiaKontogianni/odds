const puppeteer = require('puppeteer');
const socket = require('socket.io-client')('http://localhost:3000/managers');

async function init() {
    var myJobs = [], jCnt = 0, myName = '007', startingAt = 0;
    var matchClass = '', liveClass = '';
    var pagesToParse = [], parsingClass = '';
    var runningMatchesInPlay = [];
    var runningMatchesPreGame = [];


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
    socket.on('jobs', function (data) {
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

    async function parsePages(pg, matchClass, liveClass) {
        var ret = await pg.evaluate((matchClass, liveClass) => {
            let domElements = document.getElementsByClassName(matchClass);
            var mainobj = {
                matches: {inPlay: [], preGame: [], totalMatches: 0, totalInPlay: 0, totalPreGame: 0},
                changes: {added: {inPlay: [], preGame: []}, deleted: {inPlay: [], preGame: []}}
            };

            for (var el of domElements) {
                mainobj.matches.totalMatches++;
                if (el.getElementsByClassName(liveClass).length > 0) {
                    mainobj.matches.totalInPlay++;
                    mainobj.matches.inPlay.push({name: el.innerText.split('\n')[0] + ' v ' + el.innerText.split('\n')[2]});
                } else {
                    mainobj.matches.totalPreGame++;
                    mainobj.matches.preGame.push({name: el.innerText.split('\n')[0]});
                }
            }

            return mainobj;

        }, matchClass, liveClass);
        return ret;
    }

    function makeData(mainobj) {
        for (let rm of runningMatchesInPlay) rm.old = true;
        for (let rm of runningMatchesPreGame) rm.old = true;

        for (let mo of mainobj.matches.inPlay) {
            console.log(mo.name);
            if (!runningMatchesInPlay[mo.name]) {
                mainobj.changes.added.inPlay.push(mo);
            }
            runningMatchesInPlay[mo.name] = mo;
        }

        for (let rm of runningMatchesInPlay) {
            if (mo.old) {
                mainobj.changes.deleted.inPlay.push(rm);
                delete rm;
            }
        }

        for (let mo of mainobj.matches.preGame) {
            if (!runningMatchesPreGame[mo.name]) {
                mainobj.changes.added.preGame.push(mo);
            }
            runningMatchesPreGame[mo.name] = mo;
        }

        for (let rm of runningMatchesPreGame) {
            if (mo.old) {
                mainobj.changes.deleted.preGame.push(rm);
                delete rm;
            }
        }


        return mainobj;
    }

    function startParsing() {

        setInterval(async () => {
                for (p of pagesToParse) {
                    // console.log('runningMatchesInPlay  : ', runningMatchesInPlay);
                    // console.log('sending data ...', tmp);
                    var mArray = await parsePages(p, matchClass, liveClass);
                    socket.emit('send-data', makeData(mArray));
                    console.log('runningMatchesInPlay  : ', runningMatchesInPlay);
                    console.log('runningMatchesPreGame  : ', runningMatchesPreGame);
                }
            },
            Math.random() * 4000);
    }

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
                startParsing();
            }
        }, Math.random() * 2000 + 8000);
    }

    async function execCommand(cmd) {
        socket.emit('bot-exec', cmd);
        console.log('exec command ', cmd);
        pg = pagesToParse[pagesToParse.length - 1];
        try {
            switch (cmd.a) {
                case 'np' :
                    let npg = await browser.newPage();
                    await npg.goto(cmd.loc);
                    await npg.waitFor(4000);
                    npg.on('console', consoleObj => console.log(consoleObj.text()));
                    pagesToParse.push(npg);
                    return npg;
                    break;
                case 'gt' :
                    await pg.goto(cmd.loc);
                    await pg.waitFor(4000);
                    break;
                case 'click' :
                    await pg.click(cmd.loc);
                    await pg.waitFor(6000);
                    break;
            }
        } catch (error) {
            //throw(error);
            socket.emit('error', error);
            console.log('error');
            return;
        }
    }
}

init();