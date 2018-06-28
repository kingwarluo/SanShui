var Net = require('Net');
var Utils = require('Utils');
var Types = require('Types');
var Fsm = require('game-fsm');

var Game = cc.Class({
    extends: cc.Component,

    properties: {
        noPlayerPrefab : cc.Prefab,
        playerPrefab : cc.Prefab,
        anchorPlayers : {
            default : [],
            type : cc.Node
        },
    },

    statics : {
        instance : null
    },

    onLoad: function () {
        Game.instance = this;
        var self = this;
        this.fsm = Fsm;
        //初始化管理器
        this.initHandlers();
        
        this.audioMgr = cc.find('Game/AudioMgr');
        if(this.audioMgr){
            this.audioMgr = this.audioMgr.getComponent('AudioMgr');
        }
        
        this.Alert = cc.find("Canvas/Alert");
        if(this.Alert){
            this.Alert = this.Alert.getComponent("Alert");
        }

        this.Loading = cc.find("Canvas/Loading");
        if(this.Loading){
            this.Loading = this.Loading.getComponent("Loading");
        }

        this.inGameUI = cc.find('Game/InGameUI');
        if(this.inGameUI){
            this.inGameUI = this.inGameUI.getComponent('InGameUI');
        }
        this.inGameUI.init();

        this.groupCard = cc.find('Game/GroupCard');
        if(this.groupCard){
            this.groupCard = this.groupCard.getComponent('GroupCard');
        }
        //静态调试用，以后可删除
        // this.groupCard.show(Types.cardList, Types.cardTypeList, 60);
        // this.initPlayer();
        // this.inGameUI.startCounter(10);

        this.rankList = cc.find('Game/RankList');
        if(this.rankList){
            this.rankList = this.rankList.getComponent('RankList');
        }

        this.playerMap = {};
        this.roomId = "";
        var unionId = cc.sys.localStorage.getItem("uid");
        this.unionId = Utils.decryptData(unionId);
        this.userMD5Uid = "";
        this.seatPosition = 0;
        this.roomConfig = null;

        //比牌时专用属性
        this.comparePlayers = new Array();
        this.specialPlayers = new Array();
        this.normalPlayers = new Array();
        this.connectGameServer({'ip':Utils.clientIp,'port':'9092', 'uid' : this.unionId}, function(){
            Net.send('GET_PLAYER_ROOM_INFO', {}, function(ackData){
                // cc.log(ackData);
                if(ackData){
                    var room = ackData.room;
                    var userMD5Uid = ackData.userMD5Uid;
                    var mbList = ackData.mbList;
                    if(room.roomState == Types.RoomState.Over){
                        self.inGameUI.overGame(room);
                        return;
                    }
                    //设置全局参数
                    self.roomId = room.roomId;
                    self.userMD5Uid = userMD5Uid;
                    self.roomConfig = room.roomConfig;

                    var players = new Array();
                    if(room.roomState == Types.RoomState.Ready){
                        //设置准备阶段UI
                        self.inGameUI.initReadyStateUI(self.userMD5Uid == room.owner.playerMD5Uid, room);
                        players = room.players;
                    }else if(room.roomState == Types.RoomState.InGame){
                        //设置组牌阶段UI
                        self.inGameUI.initInGameStateUI(self.userMD5Uid == room.owner.playerMD5Uid, room);
                        for (let index = 0; index < mbList.length; index++) {
                            const message = mbList[index];
                            var player = message.player;
                            //如果自己已参加这局
                            if(player.playerMD5Uid == userMD5Uid){
                                player.cards = message.cards;
                                player.cardHands = message.cardHands;
                                player.countDown = message.countDown;
                            }
                            players.push(player);
                        }
                    }else if(room.roomState == Types.RoomState.Compareing){
                        //设置比牌阶段UI
                        self.inGameUI.initCompareingStateUI(self.userMD5Uid == room.owner.playerMD5Uid, room);
                        
                        for (let index = 0; index < mbList.length; index++) {
                            const message = mbList[index];
                            var player = message.player;
                            if(player.playerMD5Uid == self.userMD5Uid && player.playing){
                                //如果自己正在玩该局，自动发送比牌完成
                                Net.send('PLAYER_FINISH_COMPARE', {}, function(data){});
                            }
                            player.cards = message.cards;
                            players.push(player);
                        }
                    }

                    var ownerMD5Uid = room.owner.playerMD5Uid;
                    //初始化玩家
                    for (let index = 0; index < self.roomConfig.people; index++) {
                        var hasPeople = false;
                        for(var i=0; i<players.length; i++){
                            var playerVo = players[i];
                            //0号座位是自己的
                            if(index == 0) {
                                if(playerVo.playerMD5Uid == self.userMD5Uid){
                                    self.seatPosition = playerVo.seatPosition;
                                    self.initPlayer(playerVo, room.roomState, playerVo.playerMD5Uid == ownerMD5Uid, index);
                                    hasPeople = true;
                                }
                            }else{
                                var seatIndex = playerVo.seatPosition;
                                if(seatIndex == self.seatPosition){
                                    continue;
                                }else
                                //座位在自己之后的座位号减1
                                if(seatIndex > self.seatPosition){
                                    seatIndex -= 1;
                                }
                                if(seatIndex == index){
                                    self.initPlayer(playerVo, room.roomState, playerVo.playerMD5Uid == ownerMD5Uid, index);
                                    hasPeople = true;
                                }
                            }
                        }
                        if(!hasPeople){
                            self.initNoPlayer(index);
                        }
                    }
                    //测试用
                    // var player0 = self.anchorPlayers[0];
                    // var player1 = self.anchorPlayers[1];
                    // var player2 = self.anchorPlayers[2];
                    // var player3 = self.anchorPlayers[3];
                    // var player4 = self.anchorPlayers[4];
                    // var player5 = self.anchorPlayers[5];
                    // var player6 = self.anchorPlayers[6];
                    // self.inGameUI.playDaQiangAnim(player6, player4);
                }
            });
        });
    },

    initHandlers:function(){
        var self = this;
        //玩家加入房间响应
        Net.addHandler("PLAYER_JOIN" , function(data){
            cc.log('PLAYER_JOIN');
            if(data){
                self.inGameUI.infoLabelMsg(data.nickName + '加入房间');
                self.initPlayer(data, null, false, (data.seatPosition > self.seatPosition)? data.seatPosition - 1: data.seatPosition);
            }
        });
        //玩家准备响应
        Net.addHandler("PLAYER_READY" , function(data){
            cc.log('PLAYER_READY');
            var playerMD5Uid = data.playerMD5Uid;
            var startCount = data.startCount;
            var player = self.getPlayerByMD5Uid(playerMD5Uid);
            player.readyState();
            self.inGameUI.onReadyUI();
            if(startCount >= 2){
                self.inGameUI.startCounter(10, Types.CountDownType.Start);
            }
        });
        //踢出玩家响应
        Net.addHandler("PLAYER_REMOVED" , function(data){
            cc.log('PLAYER_REMOVED');
            if(data == self.userMD5Uid){
                self.inGameUI.infoLabelMsg('您已被请离房间');
            }else{
                var player = self.playerMap[data];
                self.anchorPlayers[player.seatIndex].getChildByName("playerPrefab").removeFromParent(true);
            }
        });
        //完成发牌响应
        Net.addHandler("CARD_ASSIGNED" , function(data){
            cc.log('CARD_ASSIGNED');
            cc.log(data);
            var cardList = data.cards;
            var cardHands = data.cardHands;
            var playerVo = data.player;
            var countDownTime = data.countDown;
            self.inGameUI.onGameState();
            if(cardList){
                //播放开始动画
                self.inGameUI.playKaishiAnim(function(){
                    var player = self.getPlayerByMD5Uid(playerVo.playerMD5Uid);
                    player.onDeal(false);
                    //index从1开始，其他玩家默认盖牌
                    for(var i=1; i<self.anchorPlayers.length; i++){
                        var playerNode = self.getPlayerByAnchorIndex(i);
                        if(playerNode){
                            playerNode.onDealOther(i, false);
                        }
                    }
                    if(playerVo.special > 0){
                        var nameCH = Utils.getSpecialCardCH(playerVo.special);
                        self.Alert.show("当前为特殊牌型(" + nameCH + ")，是否按照特殊牌型计算？", true, function(){
                            self.finishGroup(cardList, 1);
                        }, function(){
                            //用户不按特殊牌型计算
                            if(cardList){
                                //显示组牌面板
                                self.inGameUI.onStartGroup();
                                self.groupCard.getComponent('GroupCard').init(cardList, cardHands, self.roomConfig.roundTime);
                            }
                        });
                    }else{
                        //显示组牌面板
                        self.inGameUI.onStartGroup();
                        self.groupCard.getComponent('GroupCard').init(cardList, cardHands, self.roomConfig.roundTime);
                    }
                    self.inGameUI.startCounter(countDownTime?countDownTime:60, Types.CountDownType.FinishGroup);
                });
            }
        });
        //完成组牌响应
        Net.addHandler("CARD_GROUPED" , function(data){
            cc.log('CARD_GROUPED');
            if(data && data != self.userMD5Uid){
                var player = self.getPlayerByMD5Uid(data);
                player.finishGroup(null, false);
            }
        });
        //开始比牌
        Net.addHandler("START_COMPARE" , function(data){
            cc.log('START_COMPARE');
            //设置其他玩家的牌
            for (var index = 0; index < data.length; index++) {
                var element = data[index];
                var player = element.player;
                var cards = element.cards;
                if(player.playerMD5Uid != self.userMD5Uid){
                    var playerNode = self.getPlayerByMD5Uid(player.playerMD5Uid);
                    playerNode.finishGroup(cards, false);
                }else{
                    self.inGameUI.initCurrentScore(player);
                }
                //是否特殊牌型
                if(player.playerSpecial == 1){
                    var playerNode = self.getPlayerByMD5Uid(player.playerMD5Uid);
                    playerNode.showSpecialUI();
                }
            }
            self.compareCard(data);
        });
        //比牌动画完成，重置界面
        Net.addHandler("RESET_GAME" , function(round){
            cc.log('RESET_GAME');
            self.inGameUI.resetGame(round);
        });
        //所有牌局完成，游戏结束
        Net.addHandler("OVER_GAME" , function(data){
            cc.log('OVER_GAME');
            self.inGameUI.overGame(data);
        });
        //玩家上线
        Net.addHandler("PLAYER_ONLINE" , function(md5uid){
            cc.log('PLAYER_ONLINE');
            var player = self.getPlayerByMD5Uid(md5uid);
            var playerNode = self.getPlayerByAnchorIndex(player.seatIndex);
            playerNode.online(true);
        });
        //玩家离线
        Net.addHandler("PLAYER_OFFLINE" , function(md5uid){
            cc.log('PLAYER_OFFLINE');
            var player = self.getPlayerByMD5Uid(md5uid);
            var playerNode = self.getPlayerByAnchorIndex(player.seatIndex);
            playerNode.online(false);
        });
    },

    getPlayerByMD5Uid : function(playerMD5Uid){
        var player = this.playerMap[playerMD5Uid];
        player = this.anchorPlayers[player.seatIndex].getChildByName("playerPrefab").getComponent('Player');
        return player;
    },

    getPlayerByAnchorIndex : function(index){
        var anchor = this.anchorPlayers[index];
        var playerPrefab = anchor.getChildByName("playerPrefab");
        if(playerPrefab){
            var playerNode = playerPrefab.getComponent('Player');
            return playerNode;
        }
        return null;
    },

    initPlayer : function(player, roomState, isRoomOwner, seatIndex){
        var playerComp = cc.instantiate(this.playerPrefab);
        var anchor = this.anchorPlayers[seatIndex];
        var node = anchor.getChildByName("noPlayerPrefab");
        anchor.removeChild(node);
        anchor.addChild(playerComp);
        this.playerMap[player.playerMD5Uid] = player;

        var playerInfoPos = cc.find('anchorPlayerInfo', anchor).getPosition();
        var playerCardPos = cc.find('anchorCard', anchor).getPosition();
        var playerGunPos = cc.find('anchorGun', anchor).getPosition();
        var playerNode = playerComp.getComponent('Player');
        player.seatIndex = seatIndex;
        player.isRoomOwner = isRoomOwner;
        playerNode.init(player, playerInfoPos, playerCardPos, playerGunPos);
        
        this.inGameUI.initPlayerUI(playerNode);
        if(playerNode.playerMD5Uid == this.userMD5Uid && playerNode.ready){
            this.inGameUI.hideReadyBtn();
        }

        //玩家正在玩
        if(player.playing){
            if(roomState == Types.RoomState.InGame){
                cc.log("InGame");
                //如果是初始化自己，开始组牌
                if(playerNode.seatIndex == 0){
                    //自己是否组好牌
                    if(player.finishGroup){
                        //默认设置好牌组
                        playerNode.finishGroup(player.cards, false);
                    }else{
                        playerNode.onDeal(false);
                        var data = {};
                        data.cards = player.cards;
                        data.cardHands = player.cardHands;
                        data.player = player;
                        data.countDown = player.countDown;
                        this.startGroup(data);
                    }
                }else{
                    //如果初始化别人的牌组
                    if(player.finishGroup){
                        //默认设置好空牌组
                        playerNode.finishGroup("", false);
                    }else{
                        playerNode.onDealOther(playerNode.seatIndex, false);
                    }
                }
            }else if(roomState == Types.RoomState.Compareing){
                cc.log("Compareing");
                //显示玩家组牌信息
                playerNode.finishGroup(player.cards, true);
                if(player.playerMD5Uid == this.userMD5Uid && player.playing){
                    //如果自己正在玩该局，则显示比分结果
                    this.inGameUI.showFinalScore(player);
                }
                playerNode.showFinalChips(player.mark);
            }
        }

        //静态调试用，以后可删除
        // for (let index = 0; index < 7; index++) {
        //     var playerComp = cc.instantiate(this.playerPrefab);
        //     var anchor = this.anchorPlayers[index];
        //     anchor.addChild(playerComp);
        //     var playerNode = playerComp.getComponent('Player');
        //     var anchor = this.anchorPlayers[index];
        //     var playerInfoPos = cc.find('anchorPlayerInfo', anchor).getPosition();
        //     var playerCardPos = cc.find('anchorCard', anchor).getPosition();
        //     var player = {};
        //     player.seatIndex = index;
        //     playerNode.init(player, playerInfoPos, playerCardPos);
        //     playerComp.getComponent('Player').onDealOther(index, false);
        // }
    },

    initNoPlayer : function(index){
        var playerComp = cc.instantiate(this.noPlayerPrefab);
        var anchor = this.anchorPlayers[index];
        anchor.addChild(playerComp);
    },

    ready : function(){
        var self = this;
        Net.send("PLAYER_STATE_CHANGE", {"roomId" : this.roomId, "playerMD5Uid" : this.userMD5Uid, "playerState" : "ready"}, function(){
            self.inGameUI.hideReadyBtn();
        });
    },

    kickOut : function(playerMD5Uid){
        Net.send('REMOVE_PLAYER', {"roomId" : this.roomId, "playerMD5Uid" : playerMD5Uid});
    },
    
    startGame : function(){
        var self = this;
        Net.send('START_GAME', {"roomId" : this.roomId}, function(data){
            if(data){
                self.inGameUI.infoLabelMsg(data);
            }else{
                self.inGameUI.onReadyUI();
            }
        });
    },

    startGroup : function(data){
        var self = this;
        var cardList = data.cards;
        cc.log(cardList);
        var cardHands = data.cardHands;
        var countDownTime = data.countDown;
        var player = data.player;
        this.inGameUI.onGameState();
        if(cardList){
            if(player.special > 0){
                var nameCH = Utils.getSpecialCardCH(player.special);
                this.Alert.show("当前为特殊牌型(" + nameCH + ")，是否按照特殊牌型计算？", true, function(){
                    self.finishGroup(cardList, 1);
                }, function(){
                    //用户不按特殊牌型计算
                    if(cardList){
                        //显示组牌面板
                        self.inGameUI.onStartGroup();
                        self.groupCard.getComponent('GroupCard').init(cardList, cardHands, countDownTime?countDownTime:self.roomConfig.roundTime);
                    }
                });
            }else{
                //显示组牌面板
                self.inGameUI.onStartGroup();
                self.groupCard.getComponent('GroupCard').init(cardList, cardHands, countDownTime?countDownTime:self.roomConfig.roundTime);
            }
            self.inGameUI.startCounter(countDownTime?countDownTime:60, Types.CountDownType.FinishGroup);
        }
    },

    //玩家房间界面，未选择组牌完成,自动完成组牌
    autoFinishGroup : function(){
        var self = this;
        Net.send('CHECK_CARD_VALUE', {"cards" : this.groupCard.originalCards}, function(check, msg){
            if(!check){
                self.groupCard.chooseSelected();
            }
            self.finishGroup();
        });
    },
    //玩家未在房间界面，发送后台自动选择牌型
    autoSendGrouped : function(){
        Net.send('ALL_PLAYER_FINISH_GROUP', {"roomId" : this.roomId}, function(){
            
        });
    },

    finishGroup : function(specialCardList, special){
        var self = this;
        var cardList = null;
        if(specialCardList && specialCardList.length == 13){
            cardList = specialCardList;
        }else{
            cardList = self.groupCard.originalCards;
        }

        if(!special) special = 0;
        Net.send('PLAYER_FINISH_GROUP', {"roomId" : self.roomId, "playerMD5Uid" : self.userMD5Uid, "cards" : cardList, "special" : special}, function(data){
            if(data){
                self.Alert.show(data);
            }else{
                var player = self.getPlayerByMD5Uid(self.userMD5Uid);
                self.inGameUI.onFinishGroup();
                player.finishGroup(cardList);
                self.groupCard.reset();
            }
        });
    },
    //开始比牌
    compareCard : function(messages){
        //等待所有牌都设置
        this.compareCallback = function(){
            var playerNode = this.getPlayerByMD5Uid(this.userMD5Uid);
            if(playerNode.anchorThird.children.length == 5){
                this.inGameUI.beforeCompare();
                
                this.comparePlayers.splice(0, this.comparePlayers.length);//清空数组
                this.specialPlayers.splice(0, this.specialPlayers.length);//清空数组
                this.normalPlayers.splice(0, this.normalPlayers.length);//清空数组
                for (let index = 0; index < messages.length; index++) {
                    const element = messages[index];
                    var player = element.player;
                    if(player.playerSpecial == 1){
                        this.specialPlayers.push(player);
                    }else{
                        this.normalPlayers.push(player);
                    }
                    this.comparePlayers.push(player);
                }
                this.unschedule(this.compareCallback);
                //初始化比牌流程
                this.fsm.init(this);
            }
        }
        this.schedule(this.compareCallback, 1);
    },
    //比牌阶段，普通牌型展示
    onCompareState : function(){
        var self = this;
        var normalPlayers = self.normalPlayers;

        var i=1,j=0;
        this.compareStateCallBack = function(){
            if(i >= 4){
                this.unschedule(this.compareStateCallBack);
                self.fsm.toSpecial();
            }else{
                self.inGameUI.onCompare();
                //第一道
                if(i == 1){
                    //第一道得分从小到大排序
                    normalPlayers.sort(function(a, b){
                        return a.topResult - b.topResult;
                    });
                    var element = normalPlayers[j];
                    var playerNode = self.getPlayerByMD5Uid(element.playerMD5Uid);
                    playerNode.compare(i, element.topResult);
                //第二道
                }else if(i == 2){
                    //第二道得分从小到大排序
                    normalPlayers.sort(function(a, b){
                        return a.centerResult - b.centerResult;
                    });
                    var element = normalPlayers[j];
                    var playerNode = self.getPlayerByMD5Uid(element.playerMD5Uid);
                    playerNode.compare(i, element.centerResult);
                //第三道
                }else if(i == 3){
                    //第三道得分从小到大排序
                    normalPlayers.sort(function(a, b){
                        return a.bottomResult - b.bottomResult;
                    });
                    var element = normalPlayers[j];
                    var playerNode = self.getPlayerByMD5Uid(element.playerMD5Uid);
                    playerNode.compare(i, element.bottomResult);
                }

                if(++j >= normalPlayers.length){
                    self.inGameUI.showResult(i);
                    j=0;
                    i++;
                }
            }
        }
        this.schedule(this.compareStateCallBack, 1);
    },
    //比牌阶段特殊牌型展示
    onSpecialState : function(){
        this.inGameUI.onCompare();
        var specialPlayers = this.specialPlayers;
        if(specialPlayers.length <= 0){
            this.fsm.toDaQiang();
            return;
        }
        //判断是否特殊牌型
        specialPlayers.sort(function(a, b){
            return a.special - b.special;
        });

        var i=0;
        this.specialCallback = function(){
            var element = specialPlayers[i];
            if(!element){
                this.unschedule(this.specialCallback);
                this.fsm.toDaQiang();
                return;
            }
            this.inGameUI.infoLabelMsg(Utils.getSpecialCardCH(element.special));
            //翻牌
            var playerNode = this.getPlayerByMD5Uid(element.playerMD5Uid);
            playerNode.compareSpecial(element.special);
            if(this.userMD5Uid == element.playerMD5Uid){
                this.inGameUI.showResult(0, element.specialScore);
            }else{
                if(this.inGameUI.currentScore.special < element.special){
                    this.inGameUI.showResult(0, -element.specialScore);
                }
            }
            if(++i == specialPlayers.length){
                this.unschedule(this.specialCallback);
                this.fsm.toDaQiang();
            }
        }
        this.specialCallback();
        this.schedule(this.specialCallback, 3);
    },
    //比牌阶段，打枪展示
    onDaQiangState : function(){
        this.inGameUI.onCompare();
        var normalPlayers = this.normalPlayers;
        //判断是否有打枪
        normalPlayers.sort(function(a, b){
            return a.seatPosition - b.seatPosition;
        });

        var i=0,j=0;
        this.callback = function(){
            i = this.getNextDQPlayer(i);
            // cc.log(i, i < normalPlayers.length);
            if(i < normalPlayers.length){
                var element = normalPlayers[i];
                var nickName = element.nickName;
                var playerMD5Uid = element.playerMD5Uid;
                var daqiang = eval(element.daQiang);
                daqiang = Utils.mapToArray(daqiang);

                //如果有打枪
                if(daqiang.length > 0){
                    // cc.log("key:" + daqiang[j].key + ",value:" + daqiang[j].value);

                    var player0 = this.getPlayerByMD5Uid(playerMD5Uid);
                    var player1 = this.getPlayerByMD5Uid(daqiang[j].key);
                    // this.inGameUI.infoLabelMsg(nickName + " 打枪 " + player1.playerName);
                    this.inGameUI.playDaQiangAnim(this.anchorPlayers[player0.seatIndex], this.anchorPlayers[player1.seatIndex]);
                    //如果打枪关联到自己，改变总分
                    if(element.playerMD5Uid == this.userMD5Uid){
                        this.inGameUI.showResult(0, daqiang[j].value);
                    }else if(player1.playerMD5Uid == this.userMD5Uid){
                        this.inGameUI.showResult(0, -daqiang[j].value);
                    }
                    if(++j >= daqiang.length){
                        i++;
                        j = 0;
                    }
                }else{
                    i++;
                }
            }else{
                this.unschedule(this.callback);
                this.fsm.toEnd();
            }
        }
        this.getNextDQPlayer = function(index){
            if(index == normalPlayers.length){
                return normalPlayers.length;
            }
            var element = normalPlayers[index];
            var daqiang = eval(element.daQiang);
            var hasDQ = false;
            for (const key in daqiang) {
                hasDQ = true;
                break;
            }
            if(!hasDQ){
                return this.getNextDQPlayer(++index);
            }else{
                return index;
            }
        }
        this.schedule(this.callback, 2);
    },

    onEndState : function(){
        var self = this;
        var losePlayers = new Array();
        var winPlayers = new Array();
        for (var index = 0; index < self.comparePlayers.length; index++) {
            var element = self.comparePlayers[index];
            if(element.lastScore > 0){
                var player = self.playerMap[element.playerMD5Uid];
                player = this.anchorPlayers[player.seatIndex];
                winPlayers.push(player);
            }
            if(element.lastScore < 0){
                var player = self.playerMap[element.playerMD5Uid];
                player = this.anchorPlayers[player.seatIndex];
                losePlayers.push(player);
            }
        }
        self.inGameUI.playGoldAmin(winPlayers, losePlayers);
    },

    setPlayerFinalScore : function(){
        var self = this;
        //设置玩家最终分数
        for (var index = 0; index < self.comparePlayers.length; index++) {
            var element = self.comparePlayers[index];
            var playerNode = self.getPlayerByMD5Uid(element.playerMD5Uid);
            playerNode.showFinalChips(element.mark);
        }
        //发送客户端完成比牌事件
        Net.send('PLAYER_FINISH_COMPARE', {}, function(data){});
    },

    connectGameServer:function(data, callback){
        Net.ip = data.ip + ":" + data.port;
        Net.uid=data.uid;
        Net.scene="game";
        Net.alert = this.Alert;
        Net.loading = this.Loading;
        console.log(Net.ip);
        var self = this;

        this.Loading.show("正在连接服务器");
        var onConnectOK = function(){
            console.log("onConnectOK");
            self.Loading.hide();
            if(typeof(callback) == "function"){
                callback();
            }
        };
        
        var onConnectFailed = function(){
            console.log("failed.");
        };
        Net.connect(onConnectOK,onConnectFailed);
    },

    backToHall : function(){
        //停止所有任务
        this.unscheduleAllCallbacks();
        Net.close();
        cc.director.loadScene('hall_ss');
    }
});
