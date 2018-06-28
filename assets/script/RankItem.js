cc.Class({
    extends: cc.Component,

    properties: {
        labelPlayerName : cc.Label,
        goldNum : cc.Label,
        playerPhoto : cc.Sprite,
        texPlayerPhoto : {
            default : [],
            type : cc.SpriteFrame
        },
        rankBG : cc.Sprite,
        labelRank : cc.Label,
        texRankBG : {
            default : [],
            type : cc.SpriteFrame
        }
    },

    // use this for initialization
    init: function (rank, player) {
        this.labelPlayerName.string = player.nickName;
        this.goldNum.string = player.mark;
        var self = this;
        cc.loader.load({url : player.headImgUrl, type : "jpg"}, function (err, texture) {
            var frame = new cc.SpriteFrame(texture);
            self.playerPhoto.spriteFrame = frame;
        });

        this.labelRank.node.active = true;
        this.labelRank.string = (rank + 1).toString();
    }
    
});
