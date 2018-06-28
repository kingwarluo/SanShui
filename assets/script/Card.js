var Types = require('Types');

cc.Class({
    extends: cc.Component,

    properties: {
        mainPic : cc.Sprite,
        point : cc.Label,
        suitSp : cc.Sprite,
        cardBg : cc.Sprite,
        pointColorRed : cc.Color.WHITE,
        pointColorBlack : cc.Color.WHITE,
        texFrontBg : cc.SpriteFrame,
        texBackBg : cc.SpriteFrame,
        texCardFaces : {
            default : [],
            type : cc.SpriteFrame
        },
        texSuitBig : {
            default : [],
            type : cc.SpriteFrame
        },
        texSuitSmall : {
            default : [],
            type : cc.SpriteFrame
        },
        number : cc.Integer,
        suit : cc.Integer,
        selected : cc.Node,
        isBlackSuit : {
            get : function(){
               return this.suit === Types.Suit.Spade || this.suit === Types.Suit.Club;
            }
        },
        isRedSuit : {
            get : function(){
               return this.suit === Types.Suit.Heart || this.suit === Types.Suit.Diamond;
            }
        }
    },

    init : function(card){
        // cc.log(card);
        if(card){
            this.number = card.number;
            this.suit = card.suit;

            var A2_10JQK = 'NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
            
            var isFaceCard = card.number > 10;
            if(isFaceCard){
                var faceIndex = card.number - 10 - 1;
                this.mainPic.node.setPosition(0, -5);
                this.mainPic.node.setContentSize(100, 130);
                if(this.isRedSuit){
                    faceIndex += 3;
                }
                this.mainPic.spriteFrame = this.texCardFaces[faceIndex];
            }else{
                this.mainPic.spriteFrame = this.texSuitBig[card.suit - 1];
            }
            
            //for jsb
            this.point.string = A2_10JQK[card.number];
            // cc.log("isRedSuit", this.isRedSuit, "cardNum:", card.number);
            if(this.isRedSuit){
                this.point.node.color = this.pointColorRed;
            }else{
                this.point.node.color = this.pointColorBlack;
            }
            this.suitSp.spriteFrame = this.texSuitSmall[card.suit - 1];

            this.mainPic.node.zIndex = 1;
            this.selected.zIndex = 2;
        }
    },

    reveal : function(isFaceUp){
        this.isReveal = isFaceUp;
        this.point.node.active = isFaceUp;
        this.suitSp.node.active = isFaceUp;
        this.mainPic.node.active = isFaceUp;
        this.cardBg.spriteFrame = isFaceUp ? this.texFrontBg : this.texBackBg;
    },

    isSelect : function(isShow){
        this.selected.active = isShow;
    }

});
