var Game = require('Game');
var Utils = require('Utils');
var Global = require('Global');
var Types = require('Types');

cc.Class({
    extends: cc.Component,

    properties: {
        playerInfo : cc.Node,
        playerName : cc.Label,
        playerPhoto : cc.Sprite,
        playerChips : cc.Label,
        anchor : cc.Node,
        cardPrefab : cc.Prefab,
        //发牌锚点
        anchorCard : cc.Node,
        //比牌锚点
        anchorFirst : cc.Node,
        anchorSecond : cc.Node,
        anchorThird : cc.Node,
        cardSpace : cc.Integer,
        rotateSpace : cc.Integer,
        infoLabel : cc.Label,
        kickBtn : cc.Node,
        readySprite : cc.Sprite,
        groupingSprite : cc.Sprite,
        offlineSprite : cc.Sprite,
        typeSprite : cc.Sprite,
        specialSprite : cc.Sprite,
        typeImages : [cc.SpriteFrame],
        xExpand : cc.Float,
        yExpand : cc.Float,
    },

    init : function (player, playerInfoPos, playerCardPos) {
        this.playerName.string = player.nickName;
        this.playerChips.string = player.mark;
        this.playerMD5Uid = player.playerMD5Uid;
        this.playerName = player.nickName;
        this.isRoomOwner = player.isRoomOwner;
        this.seatIndex = player.seatIndex;
        this.ready = player.ready;
        if(this.ready){
            this.readyState();
        }

        this.readySprite.node.zIndex = 5;
        this.playerInfo.position = playerInfoPos;
        this.anchor.position = playerCardPos;
        this.offlineSprite.node.active = !player.online;

        this.infoLabel.enabled = false;
        this.isLoop = false;
        this.loopCount = 0;
        if(this.seatIndex == 1 || this.seatIndex == 2 || this.seatIndex == 3){
            var readyX = this.readySprite.node.getPosition().x;
            this.readySprite.node.setPosition(-readyX, 0);
        }
        //设置头像图片
        var self = this;
        cc.loader.load({url : player.headImgUrl, type : "jpg"}, function (err, texture) {
            var frame = new cc.SpriteFrame(texture);
            self.playerPhoto.spriteFrame = frame;
        });
        
        //组牌中图片初始位置
        this.originalGroupingPos = this.groupingSprite.node.position;
        //组牌中牌的张数
        this.groupingCardNum = 5;
    },
    
    readyState : function(){
        this.toggleElement('readySprite', true);
        this.toggleElement('specialSprite', false);
    },

    kickOut : function(){
        Game.instance.kickOut(this.playerMD5Uid);
    },
    // 发牌
    onDeal : function(show){
        for(var i=0; i< this.groupingCardNum; i++){
            var newCard = cc.instantiate(this.cardPrefab);
            var cardNode = newCard.getComponent('Card');
            cardNode.node.setScale(0.6);
            this.anchorCard.addChild(cardNode.node);
            cardNode.reveal(show);

            var startPos = cc.p(0, 0);
            var endPos = cc.p(this.cardSpace * i, 0);
            cardNode.node.runAction(cc.moveTo(0.5, endPos));
        }
        this.groupingSprite.node.active = true;
        var groupingX = this.groupingSprite.node.getPosition().x;
        this.groupingSprite.node.setPosition(groupingX + this.cardSpace * 1, 0);
        this.groupingSprite.node.zIndex = 4;
        this.isLoop = true;
        this.schedule(this.loopPoint, 0.5);
    },
    // 给其他玩家发牌
    onDealOther : function(index, show){
        for(var i=0; i< this.groupingCardNum; i++){
            var newCard = cc.instantiate(this.cardPrefab);
            var cardNode = newCard.getComponent('Card');
            cardNode.node.setScale(0.6);
            this.anchorCard.addChild(cardNode.node);
            cardNode.reveal(show);

            var startPos = cc.p(0, 0);
            var endPos = cc.p(this.cardSpace * i, 0);
            cardNode.node.runAction(cc.moveTo(0.5, endPos));
        }
        this.groupingSprite.node.active = true;
        var groupingX = this.groupingSprite.node.getPosition().x;
        if(index == 1 || index == 2 || index == 3){
            if(groupingX > 0)
                this.groupingSprite.node.setPosition(-groupingX - this.cardSpace * 2, 0);
        }else{
            this.groupingSprite.node.setPosition(groupingX + this.cardSpace * 1, 0);
        }
        this.groupingSprite.node.zIndex = 4;
        this.isLoop = true;
        this.schedule(this.loopPoint, 0.5);
    },

    loopPoint : function(){
        if(this.isLoop){
            var pointList = this.groupingSprite.node.children;
            if(this.loopCount >= pointList.length){
                for (let index = 0; index < pointList.length; index++) {
                    const element = pointList[index];
                    element.active = false;
                }
                this.loopCount = 0;
            }else{
                pointList[this.loopCount].active = true;
                this.loopCount++;
            }
        }
    },
    //完成组牌
    finishGroup : function(cardList, reveal){
        this.groupingSprite.node.position = this.originalGroupingPos;
        this.unschedule(this.loopPoint);
        this.removeAllCards();
        this.groupingSprite.node.active = false;
        this.infoLabel.enabled = false;

        var len = cardList?cardList.length : 13;

        var self = this;
        this.anchorFirst.zIndex = 1;
        this.anchorSecond.zIndex = 2;
        this.anchorThird.zIndex = 3;

        for(var i=0; i<len; i++){
            var newCard = cc.instantiate(this.cardPrefab);
            var cardNode = newCard.getComponent('Card');
            cardNode.node.setScale(0.6);

            if(i <= 2){
                this.anchorFirst.addChild(cardNode.node);
                if(i == 2){
                    this.initCardPosAndRotate(this.anchorFirst);
                }
            }else if(i <= 7){
                this.anchorSecond.addChild(cardNode.node);
                if(i == 7){
                    this.initCardPosAndRotate(this.anchorSecond);
                }
            }else if(i <= 12){
                this.anchorThird.addChild(cardNode.node);
                if(i == 12){
                    this.initCardPosAndRotate(this.anchorThird);
                }
            }
            if(cardList) cardNode.init(cardList[i]);
            cardNode.reveal(reveal);

            cardNode.node.on('touchstart', this.tableCardEvent, this);
        }
    },

    tableCardEvent : function(){
        if(Game.instance.userMD5Uid == this.playerMD5Uid){
            var childrenNodes = this.anchorFirst.children;
            childrenNodes = childrenNodes.concat(this.anchorSecond.children);
            childrenNodes = childrenNodes.concat(this.anchorThird.children);
            for (var index = 0; index < childrenNodes.length; index++) {
                var element = childrenNodes[index];
                element.getComponent('Card').reveal(!element.getComponent('Card').isReveal);
            }
        }
    },

    showSpecialUI : function(){
        if(this.seatIndex == 1 || this.seatIndex == 2 || this.seatIndex == 3){
            this.specialSprite.node.x = -150;
        }
        this.specialSprite.node.active = true;
    },

    initCardPosAndRotate(anchor){
        var children = anchor.children;
        if(children.length == 3){
            for (let index = 0; index < children.length; index++) {
                const element = children[index];
                if(index == 0){
                    element.setRotation(-20);
                    element.setPosition(this.rotateSpace * index, -5);
                }else if(index == 1){
                    element.setRotation(-10);
                    element.setPosition(this.rotateSpace * index, 0);
                }else if(index == 2){
                    element.setRotation(10);
                    element.setPosition(this.rotateSpace * index, -8);
                }
            }
        }else{
            for (let index = 0; index < children.length; index++) {
                const element = children[index];
                if(index == 0){
                    element.setRotation(-20);
                    element.setPosition(this.rotateSpace * (index - 1), -10);
                }else if(index == 1){
                    element.setRotation(-10);
                    element.setPosition(this.rotateSpace * (index - 1), -5);
                }else if(index == 2){
                    element.setRotation(-5);
                    element.setPosition(this.rotateSpace * (index - 1), -5);
                }else if(index == 3){
                    element.setRotation(10);
                    element.setPosition(this.rotateSpace * (index - 1), -8);
                }else if(index == 4){
                    element.setRotation(20);
                    element.setPosition(this.rotateSpace * (index - 1), -16);
                }
            }
        }
    },
    //比牌
    compare : function(line, weight){
        this.typeSprite.node.active = true;
        this.typeSprite.node.zIndex = 4;
        var children = null;
        var pos = null;

        var index = Utils.getSimpleCardIndex(line, weight >> 20);
        this.typeSprite.spriteFrame = this.typeImages[index];
        if(line === 1){
            this.actions(this.anchorFirst);
        }else if(line === 2){
            this.actions(this.anchorSecond);
        }else if(line === 3){
            this.actions(this.anchorThird);
        }
    },
    
    actions : function(anchor){
        var cardHeight = 0;
        var cards = anchor.children;
        for(var i=0; i<cards.length; i++){
            cards[i].setRotation(0);
            cards[i].setPosition(cards[i].x, 0);
            cards[i].getComponent('Card').reveal(true);
            cardHeight = cards[i].height * cards[i].scale;
        }
        //0.5秒内，将scale X放大到1.2倍， Y放大到1.5倍
        var actionTo = cc.scaleTo(0.8, this.xExpand, this.yExpand);
        var callBack = cc.callFunc(this.onScaleEnd, this);
        anchor.zIndex += 4;
        anchor.runAction(cc.sequence(actionTo, callBack));
        //sprite移动
        var x = anchor.x;
        var y = anchor.y;
        var spriteHeight = this.typeSprite.node.height * this.typeSprite.node.scale;
        var startY = y + cardHeight / 2 + spriteHeight / 2 + 3;
        var endY = y + cardHeight * this.yExpand / 2 + spriteHeight / 2 + 3;
        this.typeSprite.node.setPosition(parseInt(x)+parseInt(this.cardSpace), startY);
        var moveToA = cc.moveTo(1, cc.p(parseInt(x)+parseInt(this.cardSpace), endY));
        this.typeSprite.node.runAction(moveToA);
    },

    onScaleEnd : function(node){
        node.setScale(1);
        node.zIndex -= 4;
        this.typeSprite.node.active = false;
        this.initCardPosAndRotate(node);
    },

    //特殊牌型比牌
    compareSpecial : function(weight){
        this.infoLabel.enabled = true;
        this.infoLabel.string = Utils.getSpecialCardCH(weight);
        var children = this.anchorFirst.children;
        children = children.concat(this.anchorSecond.children);
        children = children.concat(this.anchorThird.children);
        
        for(var i=0; i<children.length; i++){
            children[i].getComponent('Card').reveal(true);
        }
    },

    showFinalChips : function(mark){
        this.playerChips.string = mark;
    },

    removeAllCards : function(){
        this.anchorCard.removeAllChildren();
        this.anchorFirst.removeAllChildren();
        this.anchorSecond.removeAllChildren();
        this.anchorThird.removeAllChildren();
    },

    online : function(isOnline){
        if(isOnline){
            this.offlineSprite.node.active = false;
        }else{
            this.offlineSprite.node.active = true;
        }
    },

    toggleElement : function(elements, isShow){
        var elementArr = elements.split(",");
        for(var i=0; i<elementArr.length; i++){
            var element = elementArr[i];
            if(element == 'readySprite'){
                this.readySprite.node.active = isShow;
            }else if(element == 'specialSprite'){
                this.specialSprite.node.active = isShow;
            }else if(element == 'kickBtn'){
                this.kickBtn.active = isShow;
            }else if(element == 'anchorCard'){
                this.anchorCard.removeAllChildren();
            }else if(element == 'anchorFirst'){
                this.anchorFirst.removeAllChildren();
            }else if(element == 'anchorSecond'){
                this.anchorSecond.removeAllChildren();
            }else if(element == 'anchorThird'){
                this.anchorThird.removeAllChildren();
            }else if(element == 'infoLabel'){
                this.infoLabel.enabled = isShow;
            }else if(element == 'endLoop'){
                this.isLoop = false;
            }else if(element == 'typeSprite'){
                this.typeSprite.node.active = isShow;
            }else if(element == 'disabledRevealdCard'){
                var childrenNodes = this.anchorFirst.children;
                childrenNodes = childrenNodes.concat(this.anchorSecond.children);
                childrenNodes = childrenNodes.concat(this.anchorThird.children);
                for (var index = 0; index < childrenNodes.length; index++) {
                    var element = childrenNodes[index];
                    element.getComponent('Card').reveal(false);
                    element.getComponent('Card').node.off('touchstart', this.tableCardEvent, this);
                }
            }
        }
    },
    
    // update : function(dt){
    // }
});
