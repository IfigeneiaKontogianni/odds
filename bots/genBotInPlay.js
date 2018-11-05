const puppeteer = require('puppeteer');
const socket = require('socket.io-client')('http://localhost:3000/bots');

async function init() {

    var myJobs = [], jCnt = 0, myName = '007', startingAt = 0;
    var pagesToParse = [], parsingClass = '';

//   function initSockets() {
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
            console.log('jobs ok ',data);
            initMatches( data);
            //parsingClass = data.pages.parsingClass;
        });

    // }
    //
    // initSockets();

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
            '--window-size=1920x1080'
        ]
    });
    socket.emit('get-jobs', 'bet365inPlay');

    async function click2GameExtraOdds(pg, event, parsingClasses) {
        console.log('navigating to match ', event);
        await pg.evaluate((data) => {
            let cnt=0;
            for (let event of document.getElementsByClassName(data.pClasses.teams)){
                if (event.innerText.indexOf(data.ev.h) >= 0 && event.innerText.indexOf(data.ev.g)>=0){
                    document.getElementsByClassName(data.pClasses.extraodds)[cnt].click();
                    break;
                }
                cnt++;
            }
        },{ev:event, pClasses:parsingClasses});
    }

    async function parsePages(pageToPatse) {
        let pg = pageToPatse.p;
        let divClass = pageToPatse.pc;
        var ret = await pg.evaluate((divClass) => {
            let domElements = document.getElementsByClassName(divClass.parsingClass);
            var mainobj = {tag: 'main', markets: []};
            for (var el of domElements) {
                mainobj.markets.push(translateObj(el));
            }
            var obj = {tag: 'main', html: ''};

            function translateObj(domEl) {
                for (var chld of domEl.childNodes) {
                    if (chld.classList && chld.classList.contains(divClass.group) && !chld.classList.contains(divClass.groupOpen)) {
                        chld.click();
                    }
                }
                for (var all of document.getElementsByClassName(divClass.allOddsButton))
                    all.click();
                return {
                    //class: domEl ? domEl.className : '',
                    //tagName: domEl.tagName,
                    data: domEl.innerText
                };
            }

            return mainobj;
        }, divClass);
        return ret;
    }

    async function gotoLiveMatch(event, cmds) {
        var pg = await execCommand(cmds.np);
        for(let cmd of cmds.beforeParse){
            await execCommand(cmd,pg);
            await pg.waitFor(2000);
        }
        await click2GameExtraOdds(pg, event, cmds.parsingClasses);
        await pg.waitFor(2000);
        return pg
    }

    async function initMatches(events) {
        console.log('data jobs get ',events);
        for (var i = 0; i < events.eventsToParse.length; i++) {
            console.log('init event ',events.eventsToParse[i]);
            socket.emit('bot-exec', 'init event '+events.eventsToParse[i]);
            let pg = await gotoLiveMatch(events.eventsToParse[i],events.pages[0]);
            pagesToParse.push({p:pg, pc:events.pages[0].parsingClasses});
            //matchesPages.push(pg);
        }
    }

    setInterval(async () => {
            for (p of pagesToParse){
                let ret= await parsePages(p)
                socket.emit('send-data', ret);
                console.log('send data ', ret);
            }

        },
        Math.random() * 4000);

    async function execCommand(cmd, pg) {
        socket.emit('bot-exec', cmd);
        console.log('exec command ', cmd);
        try {
            switch (cmd.a) {
                case 'np' :
                    let npg = await browser.newPage();
                    await npg.goto(cmd.loc);
                    await npg.waitFor(8000);
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
            console.log('error', error);
            return;
        }
    }
}
init();