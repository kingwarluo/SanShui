var Net = require('Net');
var Utils = require('Utils');

cc.Class({
    extends: cc.Component,

    properties: {
        userPhoto : cc.Sprite,
        userName : cc.Label,
        userId : cc.Label,
        userCard : cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        var unionId = cc.sys.localStorage.getItem("uid");
        this.unionId = Utils.decryptData(unionId);

        this.Alert = cc.find("Canvas/Alert");
        if(this.Alert){
            this.Alert = this.Alert.getComponent("Alert");
        }

        this.Loading = cc.find("Canvas/Loading");
        if(this.Loading){
            this.Loading = this.Loading.getComponent("Loading");
        }

        this.connectGameServer({'ip':Utils.clientIp,'port':'9092', 'uid' : this.unionId}, function(){
            Net.send('GET_HALL_USER_INFO', {}, function(user){
                cc.log(user);
                if(user){
                    self.init(user);
                }
            });
        });
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

    sanshui () {
        Net.close();
        cc.director.loadScene('hall_ss');
    },
    
    moregame () {
        this.Alert.show("shoadfad");
    },

    moregame2 () {
        this.Alert.show("当前为特殊牌型(三同花)，是否按照特殊牌型计算？", true, function(){
            cc.log("true");
        }, function(){
            cc.log("false");
        });
    },

    // 连接服务器
    connectGameServer (data, callback) {
        Net.ip = data.ip + ":" + data.port;
        Net.uid=data.uid;
        Net.scene="hall";
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

});
