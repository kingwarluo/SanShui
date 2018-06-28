var Utils = require('Utils');
var Types = require('Types');

cc.Class({
    extends: cc.Component,

    properties: {
        top : cc.Label,
        center : cc.Label,
        bottom : cc.Label,
        bg : cc.Sprite,
        type_selected : cc.Node,
        LabelColor : {
            default : [],
            type : cc.Color
        }
    },

    onLoad : function(){
        this.isSelect = false;
        this.index = 0;
    },

    init : function (cardType, index) {
        this.cardList = cardType.cardList;
        this.index = index;
        this.top.string = Utils.getSimpleCardCH(cardType.firstGroup.type);
        //以后常量化  冲三
        if(cardType.firstGroup.type == 4){
            this.top.node.color = this.LabelColor[1];
        }
        this.center.string = Utils.getSimpleCardCH(cardType.middleGroup.type);
        //以后常量化  葫芦 铁支 同花顺
        if(cardType.middleGroup.type == 7 || cardType.middleGroup.type == 8 || cardType.middleGroup.type == 9){
            this.center.node.color = this.LabelColor[1];
        }
        this.bottom.string = Utils.getSimpleCardCH(cardType.endGroup.type);
        //以后常量化  铁支 同花顺
        if(cardType.endGroup.type == 8 || cardType.endGroup.type == 9){
            this.bottom.node.color = this.LabelColor[1];
        }
    },

    toggleSelected : function(isShow){
        this.isSelect = isShow;
        this.type_selected.active = isShow;
        this.bg.node.active = !isShow;
    }

});
