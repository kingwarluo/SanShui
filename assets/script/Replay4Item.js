var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    init (player) {
        cc.find("result/first/score", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.topScore);
        cc.find("result/first/specialScore", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.topSpecialScore);
        cc.find("result/second/score", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.centerScore);
        cc.find("result/second/specialScore", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.centerSpecialScore);
        cc.find("result/third/score", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.bottomScore);
        cc.find("result/third/specialScore", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.bottomSpecialScore);
        cc.find("result/total/score", this.node).getComponent(cc.Label).string = Utils.valueWithSymbol(player.score);

        cc.find("player/photo/name", this.node).getComponent(cc.Label).string = player.nickName;
        cc.find("player/id", this.node).getComponent(cc.Label).string = "ID：" + player.number;
        
        if(player.special > 0){
            cc.find("teshupaixing", this.node).active = true;
        }

        var self = this;
        cc.loader.load({url : player.headImgUrl, type : "jpg"}, function (err, texture) {
            var frame = new cc.SpriteFrame(texture);
            cc.find("player/photo", self.node).getComponent(cc.Sprite).spriteFrame = frame;
        });
    },

    // update (dt) {},
});
