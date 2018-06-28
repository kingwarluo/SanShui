var Game = require('Game');
var Types = require('Types');
var Utils = require('Utils');

cc.Class({
    extends: cc.Component,

    properties: {
        roomNum : cc.Label,
        round : cc.Label,
        btnStart : cc.Node,
        btnReady : cc.Node,
        infoLabel : cc.Label,
        groupCard : cc.Node,
        results : [cc.Sprite],
        rankList : cc.Node,
        duration : {
            default : 30,
            type : cc.Float
        },
        counter : cc.Node,
        lblCount : cc.Label,
        progress : cc.ProgressBar,
        animationMgr : cc.Node,
        coinMove : cc.Prefab,
        coinRootNode : cc.Node
    },

    onLoad : function(){
        this.isRoomOwner = false;
        this.totalScore = 0;
        this.currentScore = null;

        this.countType = 0;

        this.movingCount = 0;
        this.stopCount = 0;
        this.coinList = [];
        this.winPlayers = [];
    },
    
    initReadyStateUI : function(isRoomOwner, room){
        this.isRoomOwner = isRoomOwner;
        var roomConfig = room.roomConfig;
        //是房主 且是第一局  显示开始按钮
        if(isRoomOwner && roomConfig.currentRound == 1){
            this.btnStart.active = true;
        }
        if(roomConfig.currentRound >= 2){
            this.btnReady.active = true;
        }
        this.roomBaseInfo(room.roomNum, roomConfig);
    },

    initInGameStateUI : function(isRoomOwner, room){
        this.isRoomOwner = isRoomOwner;
        var roomConfig = room.roomConfig;
        this.roomBaseInfo(room.roomNum, roomConfig);
    },

    initCompareingStateUI : function(isRoomOwner, room){
        this.isRoomOwner = isRoomOwner;
        var roomConfig = room.roomConfig;
        this.roomBaseInfo(room.roomNum, roomConfig);
    },

    roomBaseInfo : function(roomNum, roomConfig){
        this.roomNum.string = "房间号:" + roomNum;
        this.round.string = roomConfig.currentRound + " / " + roomConfig.totalRound + " 局";
        this.totalRound = roomConfig.totalRound;
    },

    onReadyUI : function(){
        this.totalScore = 0;
        this.currentScore = null;
        this.infoLabel.enabled = false;
        this.infoLabel.string = "";

        //隐藏比分结果
        for (var index = 0; index < this.results.length; index++) {
            var element = this.results[index];
            element.node.active = false;
        }
        this.hideAnchorPlayersElement("readySprite,specialSprite,infoLabel,anchorFirst,anchorSecond,anchorThird");
    },

    hideReadyBtn : function(){
        this.btnReady.active = false;
    },

    initCurrentScore : function(score){
        this.currentScore = score;
    },

    init : function(){
        this.btnStart.active = false;
        this.btnReady.active = false;
    },

    initPlayerUI : function(playerNode){
        if(this.isRoomOwner){
            if(playerNode.isRoomOwner){
                playerNode.toggleElement('kickBtn', false);
            }
        }else{
            playerNode.toggleElement('kickBtn', false);
        }
    },

    infoLabelMsg : function(msg){
        this.infoLabel.string = msg;
        this.infoLabel.enabled = true;
    },

    onGameState : function(){
        this.btnStart.active = false;
        this.btnReady.active = false;
        this.infoLabel.enabled = false;
        this.hideAnchorPlayersElement('readySprite,kickBtn');
    },

    playKaishiAnim : function(callback){
        var kaishi = this.animationMgr.getChildByName("kaishi");
        var animation = kaishi.getComponent(cc.Animation);
        animation.play('kaishi');
        var seq = cc.sequence(cc.delayTime(1.4),cc.callFunc(callback));

        kaishi.active = true;
        kaishi.runAction(seq);
    },
    
    onStartGroup : function(){
        this.groupCard.active = true;
    },

    onFinishGroup : function(){
        this.groupCard.active = false;
    },

    beforeCompare : function(){
        var playerPrefab = Game.instance.anchorPlayers[0].getChildByName("playerPrefab");
        if(playerPrefab){
            var playerNode = playerPrefab.getComponent('Player');
            playerNode.toggleElement("disabledRevealdCard", false);
        }
        this.stopCounter();
    },

    onCompare : function(player){
        this.hideAnchorPlayersElement('infoLabel,endLoop,typeSprite');
    },
    
    showResult : function(line, totalScore){
        if(!totalScore){
            var score = 0,specialScore = 0,total = 0;
            if(line == 1){
                score = this.currentScore.topScore;
                specialScore = this.currentScore.topSpecialScore;
            }else if(line == 2){
                score = this.currentScore.centerScore;
                specialScore = this.currentScore.centerSpecialScore;
            }else if(line == 3){
                score = this.currentScore.bottomScore;
                specialScore = this.currentScore.bottomSpecialScore;
            }
            this.totalScore += score;
            this.totalScore += specialScore;
            if(score >= 0) score = "+" + score;
            if(specialScore >= 0) specialScore = "+" + specialScore;
            if(this.totalScore >= 0) {
                total = "+" + this.totalScore;
            }else{
                total = this.totalScore;
            }
    
            var result = this.results[line - 1];
            result.node.getChildByName("score").getComponent(cc.Label).string = score;
            result.node.getChildByName("specialScore").getComponent(cc.Label).string = specialScore;
            this.results[line - 1].node.active = true;
            this.results[3].node.getChildByName("score").getComponent(cc.Label).string = total;
            this.results[3].node.active = true;
        }else {
            this.totalScore = this.totalScore + totalScore;
            if(this.totalScore >= 0) {
                total = "+" + this.totalScore;
            }else{
                total = this.totalScore;
            }
            this.results[3].node.getChildByName("score").getComponent(cc.Label).string = total;
            this.results[3].node.active = true;
        }
    },

    playDaQiangAnim : function(player0, player1){
        // player0打枪player1
        // cc.log(player0, player1);
        Game.instance.audioMgr.playSFX("daqiang.mp3");
        var p0Pos = player0.position;
        var pos = player0.getChildByName("anchorGun").position;

        var daqiang = this.animationMgr.getChildByName("daqiang");
        //设置枪的位置
        daqiang.setPosition(p0Pos.x + pos.x, p0Pos.y + pos.y);
        //设置枪的方向
        var seat0 = player0.getChildByName("playerPrefab").getComponent("Player").seatIndex;
        var seat1 = player1.getChildByName("playerPrefab").getComponent("Player").seatIndex;
        this.setQiangDir(daqiang, seat0, seat1);

        var animation = daqiang.getComponent(cc.Animation);
        daqiang.active = true;
        animation.play('daqiang');

        Game.instance.audioMgr.playSFX("daqiangsheng.mp3");
        //设置弹坑的位置
        var dankeng = this.animationMgr.getChildByName("dankeng");
        var p1Pos = player1.position;
        var pos1 = player1.getChildByName("anchorKeng").position;
        dankeng.setPosition(p1Pos.x + pos1.x, p1Pos.y + pos1.y);
        var animation2 = dankeng.getComponent(cc.Animation);
        dankeng.active = true;
        // cc.log(dankeng);
        animation2.play('dankeng');
    },

    setQiangDir : function(qiang, seat0, seat1){
        // cc.log(qiang, seat0, seat1);
        if(seat0 == 0){
            switch(seat1){
                case 1 :
                    qiang.scaleX = -1;
                    qiang.rotation = 0;
                    break;
                case 2 :
                    qiang.scaleX = -1;
                    qiang.rotation = -15;
                    break;
                case 3 :
                    qiang.scaleX = -1;
                    qiang.rotation = -30;
                    break;
                case 4 :
                    qiang.rotation = 30;
                    break;
                case 5 :
                    qiang.rotation = 30;
                    break;
                case 6 :
                    qiang.rotation = 30;
                    break;
            }
        }else if(seat0 == 1){
            switch(seat1){
                case 0 :
                    qiang.rotation = -90;
                    break;
                case 2 :
                    qiang.scaleX = -1;
                    qiang.rotation = -60;
                    break;
                case 3 :
                    qiang.scaleX = -1;
                    qiang.rotation = -60;
                    break;
                case 4 :
                    qiang.rotation = 30;
                    break;
                case 5 :
                    qiang.rotation = 10;
                    break;
                case 6 :
                    qiang.rotation = -30;
                    break;
            }
        }else if(seat0 == 2){
            switch(seat1){
                case 0 :
                    qiang.rotation = -110;
                    break;
                case 1 :
                    qiang.rotation = -125;
                    break;
                case 3 :
                    qiang.scaleX = -1;
                    qiang.rotation = -60;
                    break;
                case 4 :
                    qiang.rotation = 10;
                    break;
                case 5 :
                    qiang.rotation = -30;
                    break;
                case 6 :
                    qiang.rotation = -90;
                    break;
            }
        }else if(seat0 == 3){
            switch(seat1){
                case 0 :
                    qiang.rotation = -110;
                    break;
                case 1 :
                    qiang.rotation = -125;
                    break;
                case 2 :
                    qiang.rotation = -125;
                    break;
                case 4 :
                    qiang.rotation = -35;
                    break;
                case 5 :
                    qiang.rotation = -90;
                    break;
                case 6 :
                    qiang.rotation = -100;
                    break;
            }
        }else if(seat0 == 4){
            switch(seat1){
                case 0 :
                    qiang.scaleX = -1;
                    qiang.rotation = 120;
                    break;
                case 1 :
                    qiang.scaleX = -1;
                    qiang.rotation = 105;
                    break;
                case 2 :
                    qiang.scaleX = -1;
                    qiang.rotation = 90;
                    break;
                case 3 :
                    qiang.scaleX = -1;
                    qiang.rotation = 35;
                    break;
                case 5 :
                    qiang.scaleX = -1;
                    qiang.rotation = 125;
                    break;
                case 6 :
                    qiang.scaleX = -1;
                    qiang.rotation = 125;
                    break;
            }
        }else if(seat0 == 5){
            switch(seat1){
                case 0 :
                    qiang.scaleX = -1;
                    qiang.rotation = 120;
                    break;
                case 1 :
                    qiang.scaleX = -1;
                    qiang.rotation = 90;
                    break;
                case 2 :
                    qiang.scaleX = -1;
                    qiang.rotation = 30;
                    break;
                case 3 :
                    qiang.scaleX = -1;
                    qiang.rotation = -10;
                    break;
                case 4 :
                    qiang.rotation = 60;
                    break;
                case 6 :
                    qiang.scaleX = -1;
                    qiang.rotation = 125;
                    break;
            }
        }else if(seat0 == 6){
            switch(seat1){
                case 0 :
                    qiang.scaleX = -1;
                    qiang.rotation = 105;
                    break;
                case 1 :
                    qiang.scaleX = -1;
                    qiang.rotation = 30;
                    break;
                case 2 :
                    qiang.scaleX = -1;
                    qiang.rotation = -10;
                    break;
                case 3 :
                    qiang.scaleX = -1;
                    qiang.rotation = -30;
                    break;
                case 4 :
                    qiang.rotation = 50;
                    break;
                case 5 :
                    qiang.rotation = 60;
                    break;
            }
        }
    },

    showFinalScore : function(player){
        this.results[0].node.getChildByName("score").getComponent(cc.Label).string = Utils.valueWithSymbol(player.topScore);
        this.results[0].node.getChildByName("specialScore").getComponent(cc.Label).string = Utils.valueWithSymbol(player.topSpecialScore);
        this.results[0].node.active = true;
        
        this.results[1].node.getChildByName("score").getComponent(cc.Label).string = Utils.valueWithSymbol(player.centerScore);
        this.results[1].node.getChildByName("specialScore").getComponent(cc.Label).string = Utils.valueWithSymbol(player.centerSpecialScore);
        this.results[1].node.active = true;
        
        this.results[2].node.getChildByName("score").getComponent(cc.Label).string = Utils.valueWithSymbol(player.bottomScore);
        this.results[2].node.getChildByName("specialScore").getComponent(cc.Label).string = Utils.valueWithSymbol(player.bottomSpecialScore);
        this.results[2].node.active = true;

        this.results[3].node.getChildByName("score").getComponent(cc.Label).string = Utils.valueWithSymbol(player.lastScore);
        this.results[3].node.active = true;
    },

    playGoldAmin : function(winPlayers, losePlayers){
        this.winPlayers = winPlayers;
        for (let index = 0; index < losePlayers.length; index++) {
            var element = losePlayers[index];
            this.glodOut(element);
        }
    },

    glodOut : function(node){
        // 以秒为单位的时间间隔
        var interval = 0.08;
        // 重复次数
        var repeat = 4;
        // 开始延时
        var delay = 0;
        this.schedule(function(){
            var coin = cc.instantiate(this.coinMove);
            this.coinRootNode.addChild(coin);
            coin.position = node.position;
            
            this.coinList.push(coin);
            
            var dest = cc.p(cc.randomMinus1To1() * 25, cc.randomMinus1To1() * 25);
            var src = coin.position;
            
            var pointList = [];
            pointList.push(src);
            //曲线弧度
            // pointList.push(cc.p(dest.x, (src.y - dest.y) / 2));
            //一定要三个点，直线开放这个
            pointList.push(dest);
            pointList.push(dest);
            var bezire = cc.bezierTo(0.5, pointList);
            coin.runAction(cc.sequence(cc.callFunc(this.moveStart.bind(this)), bezire, cc.callFunc(this.moveEnd.bind(this))));
        }, interval, repeat, delay);
    },
    
    moveStart : function() {
        this.movingCount++;
    },

    moveEnd : function() {
        this.movingCount--;
        if(this.movingCount <= 0){
            this.runGoldIn();
        }
    },

    runGoldIn : function() {
        var goldCount = this.coinList.length / this.winPlayers.length;
        for (let index = 0; index < this.winPlayers.length; index++) {
            const element = this.winPlayers[index];
            var from = 0, to = 0;
            if(index == this.winPlayers.length - 1){
                from = index * goldCount;
                to = this.coinList.length;
            }else{
                from = index * goldCount;
                to = (index + 1) * goldCount;
            }
            this.goldIn(element, from, to);
        }
    },

    goldIn : function(node, from, to) {
        var self = this;

        // 以秒为单位的时间间隔
        var interval = 0.08;
        // 重复次数
        var repeat = to - from - 1;

        var index = from;
        node.getComponent(cc.Label).schedule(function(){
            var element = self.coinList[index];
            var src = element.position;
            var dest = node.position;
            
            var pointList = [];
            pointList.push(src);
            //曲线弧度
            // pointList.push(cc.p(dest.x, (dest.y - src.y) / 2));
            //一定要三个点，直线开放这个
            pointList.push(dest);
            pointList.push(dest);
            var bezire = cc.bezierTo(0.5, pointList);
            element.runAction(cc.sequence(bezire, cc.callFunc(self.hideCoin, self, element)));
            index++;
        }, interval, repeat);
    },

    hideCoin (coin) {
        coin.destroy();
        this.stopCount++;
        if(this.stopCount >= this.coinList.length){
            this.coinList.splice(0, this.coinList.length);//清空数组
            this.stopCount = 0;
            Game.instance.setPlayerFinalScore();
        }
    },

    resetGame : function(round){
        // if(this.isRoomOwner){
        //     //显示开始按钮
        //     this.btnStart.active = true;
        // }else{
            //显示准备按钮
            this.btnReady.active = true;
        // }
        this.round.string = round + " / " + this.totalRound + " 局";
    },

    overGame : function(room){
        this.rankList.active = true;
        Game.instance.rankList.show(room.players);
    },

    hideAnchorPlayersElement : function(element){
        for(var i=0; i<Game.instance.anchorPlayers.length; i++){
            var anchor = Game.instance.anchorPlayers[i];
            var playerPrefab = anchor.getChildByName("playerPrefab");
            if(playerPrefab){
                var playerNode = playerPrefab.getComponent('Player');
                playerNode.toggleElement(element, false);
            }
        }
    },

    startCounter : function(duration, countType){
        //先停止计数器，再启动
        this.stopCounter();

        this.counter.active = true;
        this.countType = countType;
        if(duration){
            this.duration = duration;
        }
        this.isCounting = true;
        this.timer = this.duration;
        this.timeShow = this.duration;
        this.lblCount.string = this.timeShow;
        this.schedule(this.countDown, 1);
    },

    stopCounter : function(){
        this.counter.active = false;
        this.isCounting = false;
        this.timer = 0;
        this.timeShow = 0;
        this.countType = "";
        this.unschedule(this.countDown);
    },

    countDown : function(){
        if(this.timeShow > 0){
            this.timeShow--;
            this.lblCount.string = this.timeShow;
        }else{
            if(this.countType == Types.CountDownType.Start){
                Game.instance.startGame();
            }else if(this.countType == Types.CountDownType.FinishGroup){
                Game.instance.autoSendGrouped();
            }
            this.stopCounter();
        }
    },

    update : function(dt){
        if(this.isCounting){
            this.progress.progress = this.timer / this.duration;
            this.timer -= dt;
            if(this.timer <= 0){
                this.progress.progress = 0;
            }
        }
    }

});
