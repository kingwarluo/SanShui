
cc.Class({
    extends: cc.Component,

    properties: {
    },

    init (player, room) {
        cc.find("name", this.node).getComponent(cc.Label).string = player.nickName;
        cc.find("id", this.node).getComponent(cc.Label).string = "ID：" + player.number;
        cc.find("jifen", this.node).getComponent(cc.Label).string = (player.mark > 0)?"+"+player.mark:player.mark;
        //是否展示房主图标
        if(player.playerMD5Uid != room.owner.playerMD5Uid){
            cc.find("owner_top", this.node).active = false;
        }
        var self = this;
        cc.loader.load({url : player.headImgUrl, type : "jpg"}, function (err, texture) {
            var frame = new cc.SpriteFrame(texture);
            cc.find("range/head", self.node).getComponent(cc.Sprite).spriteFrame = frame;
        });
    },

    // update (dt) {},
});
