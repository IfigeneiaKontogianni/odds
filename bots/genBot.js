const puppeteer = require('puppeteer');
const socket = require('socket.io-client')('http://localhost:3000/bots');

async function init() {

    var myJobs = [], jCnt = 0, myName = '007', startingAt = 0;
    var pagesToParse = [], parsingClass='';

    socket.on('connect', function(){
        /*if (totalJobs.length>0) {
            socket.emit("bot_jobs",totalJobs);
        }*/
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
         initMatches(startingAt,data.matchesToParse);
        parsingClass = data.parsingClass;
    });

    socket.on('startingAt', function(data){
        startingAt = data;
    });

    console.log('launching...');

    const browser = await puppeteer.launch({
        headless:false,
        defaultViewport:{
            width:1920,
            height:1080
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

    async function click2GameExtraOdds(pg,mid) {
        console.log('mavigating to match ', mid);
        await pg.evaluate((mid) => {
            var matches = document.getElementsByClassName('sl-CouponFixtureLinkParticipant');
            //var tmp = matches[mid-1].getElementsByClassName('sl-CouponFixtureLinkParticipant_Name')[0];
            var tmp = matches[mid].getElementsByClassName('sl-CouponFixtureLinkParticipant_Name')[0];
            tmp.click();
        }, mid);
    };

    async function parsePages(pg , divClass) {
        var ret = await pg.evaluate((divClass) => {
            let domElements = document.getElementsByClassName(divClass);
        var mainobj = {tag:'main', markets:[]};
        for (var el of domElements){
            mainobj.markets.push(translateObj(el));
        }
        socket.emit('to-admins','bot '+socket.id+' dlevo !!');
        var obj = {tag:'main', children:[], html:''};
        function translateObj(domEl){
            for(var chld of domEl.childNodes){
                if(chld.classList && chld.classList.contains('gl-MarketGroupButton') && !chld.classList.contains ('gl-MarketGroup_Open')){
                    console.log('click to open ...');
                    chld.click();
                }
            }
            return {class: domEl?domEl.className:'',
                tagName:domEl.tagName,
                children:[],
                html:domEl.innerText
            };
        };
        return mainobj;
    },divClass);
        return ret;
    };

    var matchesPages = [];

    async function initMatches(start, many) {

        for (var i = 0; i<many; i++) {
            let myObj = {m:i, pages:[]};
            socket.emit('bot-exec', 'initMatches - match #'+i,'Starting @match:'+start);
            console.log('initMatches - match #'+i,'Starting @match:'+start);
            if (i===0) {
                var pg = await execCommand({a:'np',loc:'https://www.bet365.gr/en/'});
                await pg.waitFor(6000);
                await execCommand({a:'gt',loc:'https://www.bet365.gr/#/AC/B1/C1/D13/E40/F141/'}, pg);
                await pg.waitFor(6000);
                myObj.pages.push(pg)
            } else {
                myObj.pages.push(await execCommand({a:'np',loc:'https://www.bet365.gr/#/AC/B1/C1/D13/E40/F141/'}));
                await myObj.pages[myObj.pages.length-1].waitFor(6000);
            }

            console.log('Going to match:'+(start+1));
            await click2GameExtraOdds(myObj.pages[myObj.pages.length-1],(i+start*1));
            await myObj.pages[myObj.pages.length-1].waitFor(2000);
            pagesToParse.push(pg);
            let navBtns = await countNavButtons(myObj.pages[myObj.pages.length-1]);
            for (var j=1; j<navBtns; j++) {
                console.log('making pages for game', i, ' tab ', j);
                myObj.pages.push(await execCommand({a:'np',loc:'https://www.bet365.gr/#/AC/B1/C1/D13/E40/F141/'}));
                await click2GameExtraOdds(myObj.pages[myObj.pages.length-1],(i+start*1));
                await myObj.pages[myObj.pages.length-1].waitFor(4000);
                await gotoNextNavTab(myObj.pages[myObj.pages.length-1],j);
                await myObj.pages[myObj.pages.length-1].waitFor(4000);
                pagesToParse.push(myObj.pages[myObj.pages.length-1]);
            }
            matchesPages.push(myObj);
        }
    }

    async function countNavButtons(page) {
        return await page.evaluate(()=>{
                return document.getElementsByClassName('cl-MarketGroupNavBarButton').length;
                console.log('navbuttons nu'+ document.getElementsByClassName('cl-MarketGroupNavBarButton').length );
        });
    }

    async function gotoNextNavTab(page , num) {
        console.log('going to market group ',num);
        socket.emit('bot-exec', 'going to market group '+num);
       return await page.evaluate((num)=>{
            document.getElementsByClassName('cl-MarketGroupNavBarButton')[num].click();
        },num);
    }

    setInterval(async ()=>{

        for (p of pagesToParse)
        socket.emit('send-data', await parsePages(p, parsingClass))},
    Math.random()*4000);

    async function execJobs(pg, jobs) {
        console.log(jobs);
        myJobs = jobs.cmds;
        var cmdInterv = setInterval(async function(){
            console.log('Executing ', myJobs[jCnt]);
            socket.emit("message",myJobs[jCnt]);
            await execCommand(myJobs[jCnt++]);
            console.log(jCnt, myJobs.length-1);
            if (jCnt === myJobs.length) {
                clearInterval(cmdInterv);
                console.log('# Pages = ',pages.length);
                await click2GameExtraOdds(pages[pages.length-1],1);
                await pages[pages.length-1].waitFor(5000);
            }
        }, Math.random()*2000+14000);
    }

    async function execCommand(cmd, pg) {
        socket.emit('bot-exec', cmd);
        console.log('exec command ',cmd);
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
        } catch(error) {
            //throw(error);
            console.log('error');
            return;
        }
    }
}
init();