module.exports = function () {
    return {
        soccer: {
            bet365inPlay: {
                pages: [
                    {
                        np: {a: 'np', loc: 'https://www.bet365.gr/en'},
                        type: 'Bet365InPlay',
                        beforeParse: [
                            {a: 'gt', loc: 'https://www.bet365.gr/#/IP/'}
                        ],
                        parsingClasses: {
                            parsingClass: 'gl-MarketGroup',
                            groupOpen:'gl-MarketGroup_Open',
                            group:'gl-MarketGroupButton',
                            teams:'ipo-TeamStack',
                            allOddsButton:'gl-MarketGroup_BBarItem',
                            moreOdds:'ipo-FixtureEventCountButton_EventCountWrapper',
                            extraodds: 'ipo-FixtureEventCountButton_EventCountWrapper '
                        }
                    }
                ],
                eventsToParse: [{h:'Panachaiki',g:'AE Sparti'},{h:'Godoy Cruz Reserves',g:'Atletico Tucuman Reserves'}],
                maxEventsToParse: 5
            },
            bet365preGame: {
                pages: [
                    {
                        np: {a: 'np', loc: 'https://www.bet365.gr'},
                        beforeParse: [
                            {a: 'gt', loc: 'https://www.bet365.gr/#/AC/B1/C1/D13/E40/F141/'}
                        ],
                        parsingClasses: {
                            parsingClass: 'gl-MarketGroup',
                            extraodds: 'ipo-FixtureEventCountButton_EventCountWrapper '
                        }
                    }
                ],
                eventsToParse: [],
                maxEventsToParse: 5
            },
            eventManager: {
                pages: [
                    {
                        np: {a: 'np', loc: 'https://www.bet365.gr/en'},
                        beforeParse: [
                            {a: 'gt', loc: 'https://www.bet365.gr/#/HO/'},
                            //{a: 'gt', loc: 'https://www.bet365.gr/#/AS/B1/'},
                            {
                                a: 'click',
                                loc: 'body > div:nth-child(1) > div > div.wc-PageView > div.wc-PageView_Main.wc-HomePage_PageViewMain > div > div.wc-HomePage_ClassificationWrapper.wc-CommonElementStyle_WebNav > div > div > div:nth-child(24)'                            // body > div:nth-child(1) > div > div.wc-PageView > div.wc-PageView_Main.wc-HomePage_PageViewMain > div > div.wc-CommonElementStyle_WebNav.wc-HomePage_ClassificationWrapper > div > div > div:nth-child(23)
                            },
                            {
                                a: 'click',
                                loc: 'body > div:nth-child(1) > div > div.wc-PageView > div.wc-PageView_Main > div > div.wc-CommonElementStyle_PrematchCenter.wc-SplashPage_CenterColumn > div.sm-SplashModule > div.sm-SplashContainer > div:nth-child(2) > div.sm-MarketGroup_Open > div:nth-child(1) > div.sm-MarketContainer.sm-MarketContainer_NumColumns4.sm-Market_Open > div:nth-child(1) > div'
                            }
                        ],
                        parsingClasses: {
                            matchClass: 'sl-CouponParticipantWithBookCloses_NameContainer ',
                            liveClass: 'pi-ScoreVariantCentred_ScoreField '
                        }
                    },
                ],
            }
        }
    }
};
