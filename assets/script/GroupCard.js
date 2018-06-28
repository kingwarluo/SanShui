var Game = require('Game');

cc.Class({
    extends: cc.Component,

    properties: {
        anchorCard : cc.Node,
        cardPrefab : cc.Prefab,
        cardTypePrefab : cc.Prefab,
        cardStartX : cc.Integer,
        cardStartY : cc.Integer,
        cardSpace : cc.Integer,
        cardLineSpace : cc.Integer,
        progress : cc.ProgressBar,
        lblCount : cc.Label,
        duration : {
            default : 30,
            type : 'Float'
        },
        cardTypeScrollView : cc.ScrollView
    },

    onLoad: function () {
        this.originalX = this.cardStartX;
        this.originalY = this.cardStartY;
        this.cardArr = new Array();

        this.exchangeCard = null;
        this.content = this.cardTypeScrollView.content;
    },

    init : function(cards, cardTypes, roundTime){
        //静态调试用，以后可删除
        // this.originalX = this.cardStartX;
        // this.originalY = this.cardStartY;
        // this.cardArr = new Array();

        // this.exchangeCard = null;
        // this.content = this.cardTypeScrollView.content;

        this.originalCards = cards;
        this.initCard();
        this.initCardType(cardTypes);
        this.startCounter(roundTime);
    },

    initCard : function(){
        var self = this;

        //之前选中的牌变原样
        if(this.exchangeCard){
            this.exchangeCard.getComponent("Card").isSelect(false);
            this.exchangeCard = null;
        }
        this.cardStartX = this.originalX;
        this.cardStartY = this.originalY;
        this.anchorCard.removeAllChildren();
        this.cardArr.splice(0, this.cardArr.length);//清空数组

        for(var i=0; i<this.originalCards.length; i++){
            var card = this.originalCards[i];
            var newCard = cc.instantiate(this.cardPrefab);
            var cardNode = newCard.getComponent('Card');
            this.anchorCard.addChild(cardNode.node);
            this.setCardPosition(cardNode.node);
            cardNode.init(card);
            this.cardArr.push(cardNode.node);

            cardNode.node.on('touchstart', function(event){
                if(self.exchangeCard == null){
                    self.exchangeCard = this;
                    self.exchangeCard.getComponent("Card").isSelect(true);
                }else{
                    if(this == self.exchangeCard){
                        self.exchangeCard.getComponent("Card").isSelect(false);
                        self.exchangeCard = null;
                        return;
                    }
                    var moveAction = cc.moveTo(0.2, this.getPosition());
                    self.exchangeCard.runAction(moveAction);
                    var moveAction2 = cc.moveTo(0.2, self.exchangeCard.getPosition());
                    this.runAction(moveAction2);
                    self.exchange(self.exchangeCard, this);
                    self.exchangeCard.getComponent("Card").isSelect(false);
                    self.exchangeCard = null;
                }
            });
        }
    },

    initCardType : function(cardTypes){
        var self = this;
        for(var i=0; i< cardTypes.length; i++){
            var newCardType = cc.instantiate(this.cardTypePrefab);
            var cardTypeNode = newCardType.getComponent('CardType');
            this.content.addChild(cardTypeNode.node);
            cardTypeNode.init(cardTypes[i], i);

            cardTypeNode.node.on('touchstart', function(){
                for(var j=0; j<this.parent.getChildren().length; j++){
                    this.parent.getChildren()[j].getComponent('CardType').toggleSelected(false);
                }
                this.getComponent('CardType').toggleSelected(true);
                var cardTypeWidth = this.getComponent('CardType').node.getContentSize().width;
                //index 从0开始
                var index = this.getComponent('CardType').index;
                // cc.log("index:", index, "x:", cardTypeWidth * (index + 1) + (index * 20));
                self.cardTypeScrollView.scrollToOffset(cc.p(cardTypeWidth * (index + 1) + (index * 20), 0), 1);
                self.originalCards = this.getComponent('CardType').cardList.slice(0);//slice(0)复制数组 并非地址
                self.initCard();
            });
            if(i == 0){
                cardTypeNode.node.emit("touchstart");
            }
        }
    },

    chooseSelected : function(){
        var cardTypeList = this.content.getChildren();
        for(var i=0; i<cardTypeList.length; i++){
            var cardTypeNode = cardTypeList[i];
            if(cardTypeNode.getComponent('CardType').isSelect){
                cardTypeNode.emit('touchstart');
            }
        }
    },

    setCardPosition : function(node){
        node.setPosition(parseInt(this.cardStartX), parseInt(this.cardStartY));
        var cardLength = this.anchorCard.getChildren().length;
        this.cardStartX = parseInt(this.cardStartX) + parseInt(this.cardSpace);
        if(cardLength == 3 || cardLength == 8){
            this.cardStartY -= this.cardLineSpace;
            this.cardStartX = this.originalX;
        }
    },

    exchange : function(card1, card2){
        var index1=0,index2=0;
        for(var i=0; i<this.cardArr.length; i++){
            var card = this.cardArr[i];
            if(card == card1){
                index1 = i;
            }
            if(card == card2){
                index2 = i;
            }
        }
        var ogc1 = this.originalCards[index1];
        var ogc2 = this.originalCards[index2];
        this.originalCards[index1] = ogc2;
        this.originalCards[index2] = ogc1;
    },

    startCounter : function(duration){
        if(duration){
            this.duration = duration;
        }
        this.isCounting = false;
        this.timer = this.duration;
        this.timeShow = this.duration;

        this.isCounting = true;
        this.lblCount.string = this.timeShow;
        this.schedule(this.countDown, 1);
    },

    countDown : function(){
        if(this.timeShow > 0){
            this.timeShow--;
            this.lblCount.string = this.timeShow;
        }else{
            this.unschedule(this.countDown);
        }
    },

    reset : function(){
        this.isCounting = false;
        this.timer = this.duration;
        this.timeShow = this.duration;
        this.anchorCard.removeAllChildren();
        this.content.removeAllChildren();
        this.unschedule(this.countDown);
    },

    update : function(dt){
        if(this.isCounting){
            this.progress.progress = this.timer / this.duration;
            this.timer -= dt;
            if(this.timer <= 0){
                this.progress.progress = 0;
                this.isCounting = false;
                Game.instance.autoFinishGroup();
            }
        }
    }

});
