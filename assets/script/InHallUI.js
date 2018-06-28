cc.Class({
    extends: cc.Component,

    properties: {
        userPhoto : cc.Sprite,
        userName : cc.Label,
        userId : cc.Label,
        userCard : cc.Label,
        confirmRound : cc.Label,
        memberList : [cc.Sprite],
    },

    init (user) {
        var self = this;
        this.userName.string = user.nickName;
        this.userId.string = "ID:" + user.number;
        cc.loader.load({url : user.headImgUrl, type : "jpg"}, function (err, texture) {
            var frame = new cc.SpriteFrame(texture);
            self.userPhoto.spriteFrame = frame;
        });
    },

    initConfirm (room) {
        var self = this;
        this.confirmRound.string = room.roomConfig.totalRound;
        var players = room.players;
        for (let index = 0; index < players.length; index++) {
            const element = players[index];
            if(i < self.memberList.length){
                self.memberList[i].node.active = true;
                cc.loader.load({url : element.headImgUrl, type : "jpg"}, function (err, texture) {
                    var frame = new cc.SpriteFrame(texture);
                    self.memberList[i].spriteFrame = frame;
                });
            }
        }
    }

    
});
