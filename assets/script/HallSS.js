var Net = require('Net');
var Utils = require('Utils');

var HallSS = cc.Class({
    extends: cc.Component,

    properties: {
        numList : [cc.Label],
        keyBtnList : [cc.Node],
        replay : cc.Node
    },

    statics : {
        instance : null
    },

    // use this for initialization
    onLoad: function () {
        HallSS.instance = this;
        var self = this;
        this.currentNumIndex = 0;
        var unionId = cc.sys.localStorage.getItem("uid");
        this.unionId = Utils.decryptData(unionId);
        this.userMD5Uid = null;
        this.createModal = cc.find('Canvas/createRoom');
        this.roomNumInput = cc.find('Canvas/roomNumInput');
        this.joinConfirm = cc.find('Canvas/joinConfirm');

        this.inHallUI = cc.find('HallSS/InHallUI');
        // cc.log(this.inHallUI.init());
        if(this.inHallUI){
            this.inHallUI = this.inHallUI.getComponent('InHallUI');
        }
        
        this.Alert = cc.find("Canvas/Alert");
        if(this.Alert){
            this.Alert = this.Alert.getComponent("Alert");
        }

        this.Loading = cc.find("Canvas/Loading");
        if(this.Loading){
            this.Loading = this.Loading.getComponent("Loading");
        }

        //加入房间键盘按下事件
        for (let index = 0; index < this.keyBtnList.length; index++) {
            const element = this.keyBtnList[index];
            element.on('click', this.btnCallback, this);
        }
        this.connectGameServer({'ip':Utils.clientIp,'port':'9092', 'uid' : this.unionId}, function(){
            Net.send('GET_HALL_USER_INFO', {}, function(user, userMD5Uid){
                if(user){
                    self.userMD5Uid = userMD5Uid;
                    self.inHallUI.init(user);
                }
            });
        });

        //回放功能使用
        this.replayRoomId = null;
        this.replayRound = null;
    },

    // 创建房间
    createRoom () {
        this.createModal.active = true;
        this.createModal.getChildByName('bg').on('touchstart', function(e){
            e.stopPropagation();
        });
    },

    create () {
        var self = this;
        var roomConfig = this.constructRoomConf();
        // cc.log(roomConfig);
        Net.send('CREATE_NEATLY_ROOM', roomConfig, function(data){
            Net.close();
            cc.director.loadScene('game');
        });
    },

    constructRoomConf: function () {
        var totalRound = this.getSelectedOfRadioGroup('totalRound');
        var roundTime = this.getSelectedOfRadioGroup('roundTime');
        var people = this.getSelectedOfRadioGroup('people');
        var bankerMode = this.getSelectedOfRadioGroup('bankerMode');
        var costMode = this.getSelectedOfRadioGroup('costMode');
        
        var conf = {
            totalRound : totalRound,
            roundTime : roundTime,
            people : people,
            currentRound : 1,
            bankerMode : bankerMode,
            costMode : costMode
        };
        return conf;
    },

    getSelectedOfRadioGroup(groupRoot) {
        var root = cc.find('Canvas/createRoom/create/paramMain');
        var t = root.getChildByName(groupRoot);

        var arr = [];
        for (var i = 0; i < t.children.length; ++i) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                arr.push(n);
            }
        }
        var selectedValue = 0;
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].checked) {
                selectedValue = arr[i].value;
                break;
            }
        }
        return selectedValue;
    },

    closeCreate () {
        this.createModal.active = false;
    },

    // 加入房间
    joinRoom () {
        this.roomNumInput.active = true;
        this.roomNumInput.getChildByName('bg').on('touchstart', function(e){
            e.stopPropagation();
        });
    },

    getRoomNum () {
        var roomNum = "";
        for (let index = 0; index < this.numList.length; index++) {
            const element = this.numList[index];
            roomNum += element.string;
        }
        return roomNum;
    },

    resetNum () {
        for (let index = 0; index < this.numList.length; index++) {
            const element = this.numList[index];
            element.string = "";
        }
        this.currentNumIndex = 0;
    },

    delNum () {
        if(this.currentNumIndex > 0){
            this.numList[--this.currentNumIndex].getComponent(cc.Label).string = "";
        }
    },

    closeJoin () {
        this.resetNum();
        this.roomNumInput.active = false;
    },
    // 房间号回调事件
    btnCallback (event) {
        var self = this;

        if(this.currentNumIndex <= 5){
            var target = event.target;
            var label = target.getChildByName('label').getComponent(cc.Label);
            var num = label.string;
            this.numList[this.currentNumIndex++].getComponent(cc.Label).string = num;
            if(this.currentNumIndex == 6){
                //输入6个数字后，加入房间
                var roomNum = this.getRoomNum();
                cc.log("JOIN_NEATLY_ROOM:" + roomNum);
                Net.send('JOIN_NEATLY_ROOM', roomNum, function(room){
                    if(room.roomId){
                        // 需要确认开启下面代码
                        // if(self.roomNumInput.active){
                        //     self.closeJoin();
                        // }
                        // self.joinConfirmShow();
                        
                        Net.close();
                        //跳转到游戏界面
                        cc.director.loadScene('game');
                    }else{
                        self.Alert.show(room);
                    }
                });
            }
        }
    },

    joinConfirmShow () {
        Net.send('GET_PLAYER_ROOM_INFO', null, function(room, userMD5Uid){
        });
        this.joinConfirm.active = true;
        this.joinConfirm.getChildByName('bg').on('touchstart', function(e){
            e.stopPropagation();
        });
    },

    joinGame () {
        Net.close();
        //跳转到游戏界面
        cc.director.loadScene('game');
    },

    closeConfirm () {
        this.joinConfirm.active = false;
    },

    // --------------------------回放功能开始-----------------------------
    
    showReplay () {
        this.replay.getComponent("Replay").showReplay();
    },

    getUserRoom (callback) {
        Net.send('REPLAY_USER_ROOM', {}, function(rooms){
            callback(rooms);
        });
    },

    getRoomInfo (callback) {
        Net.send('REPLAY_ROOM_INFO', this.replayRoomId, function(room){
            callback(room);
        });
    },

    getRoomRound (callback) {
        Net.send('REPLAY_ROOM_ROUND', this.replayRoomId, function(replayList){
            callback(replayList);
        });
    },
    
    getRoundResult (callback) {
        Net.send('REPLAY_ROUND_RESULT', {"roomId" : this.replayRoomId, "round" : this.replayRound}, function(room){
            callback(room);
        });
    },
    
    // --------------------------回放功能结束-----------------------------

    // 连接服务器
    connectGameServer:function(data, callback){
        Net.ip = data.ip + ":" + data.port;
        Net.uid=data.uid;
        Net.scene="hall_ss";
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

    backToHall : function(){
        Net.close();
        cc.director.loadScene("hall");
    }

});
