var Types = require("Types");
var HallSS = require("HallSS");
var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        content : cc.Node,
        replayItem : cc.Prefab,
        content2 : cc.Node,
        replay2Item : cc.Prefab,
        content3 : cc.Node,
        replay3Item : cc.Prefab,
        content4 : cc.Node,
        replay4Item : cc.Prefab,
        cardPrefab : cc.Prefab,
    },

    onLoad () {
        this.replayIndex = 0;
        this.activeReplay = null;

        this.rotateSpace = 30;
    },

    showReplay (index) {
        if(!index) index = this.replayIndex;
        var replays = this.node.children;
        for (let i = 0; i < replays.length; i++) {
            const element = replays[i];
            if(i == index){
                this.replayIndex = index;
                this.activeReplay = element;
                element.active = true;
                
                element.getChildByName('mask').on('touchstart', function(e){
                    e.stopPropagation();
                });
            }else{
                element.active = false;
            }
        }
        this.loadData();
    },

    close () {
        // this.reset();
        if(this.replayIndex == 0){
            this.activeReplay.active = false;
        }else{
            this.showReplay(--this.replayIndex);
        }
    },

    loadData () {
        //加载时都让滚动条在最上方
        var scrollView = cc.find("main/scrollView", this.activeReplay);
        if(scrollView){
            scrollView.getComponent(cc.ScrollView).scrollToTop();
        }
        if(this.replayIndex == 0){
            this.content.removeAllChildren();
            HallSS.instance.getUserRoom((rooms) => {
                if(rooms.length > 0){
                    //按照创建时间倒叙排列
                    rooms.sort(function(a, b){
                        return b.createdDate - a.createdDate;
                    });
                    for (let index = 0; index < rooms.length; index++) {
                        const element = rooms[index];
                        var itemPrefab = cc.instantiate(this.replayItem);
                        this.content.addChild(itemPrefab);
                        this.initItem1(itemPrefab, element);
                    }
                    cc.find("no_replay", this.activeReplay).active = false;
                }else{
                    cc.find("no_replay", this.activeReplay).active = true;
                }
            });
        }else if(this.replayIndex == 1){
            this.content2.removeAllChildren();
            HallSS.instance.getRoomInfo((room) => {
                this.initItem2(room);
            });
        }else if(this.replayIndex == 2){
            this.content3.removeAllChildren();
            HallSS.instance.getRoomRound((replayList) => {
                for (let index = 0; index < replayList.length; index += 2) {
                    const element = replayList[index];
                    const element2 = replayList[parseInt(index) + 1];

                    var itemPrefab = cc.instantiate(this.replay3Item);
                    this.content3.addChild(itemPrefab);
                    this.initItem3(itemPrefab, element, element2);
                }
            });
        }else if(this.replayIndex == 3){
            this.content4.removeAllChildren();
            HallSS.instance.getRoundResult((replay) => {
                this.initItem4(replay);
            });
        }
    },

    initItem1 (item, room) {
        var roomConfig = room.roomConfig;
        cc.find("jushu/num", item).getComponent(cc.Label).string = roomConfig.totalRound;
        cc.find("roomNum/num", item).getComponent(cc.Label).string = room.roomNum;
        cc.find("time/num", item).getComponent(cc.Label).string = Utils.formatDateTime(room.createdDate);
        for (let index = 0; index < room.players.length; index++) {
            const element = room.players[index];
            if(element.playerMD5Uid == HallSS.instance.userMD5Uid){
                cc.find("jifen/num", item).getComponent(cc.Label).string = (element.mark > 0)?"+"+element.mark:element.mark;
                cc.loader.load({url : element.headImgUrl, type : "jpg"}, function (err, texture) {
                    var frame = new cc.SpriteFrame(texture);
                    cc.find("range/head", item).getComponent(cc.Sprite).spriteFrame = frame;
                });
                break;
            }
        }
        //是否展示房主图标
        if(HallSS.instance.userMD5Uid != room.owner.playerMD5Uid){
            cc.find("owner_top", item).active = false;
        }
        
        cc.find("detail", item).tag = room.roomId;
        cc.find("detail", item).on('touchstart', this.content1BtnEvent, this);
    },

    content1BtnEvent (event) {
        HallSS.instance.replayRoomId = event.target.tag;
        this.showReplay(1);
    },

    initItem2 (room) {
        cc.find("main/roomDtl/number2/num", this.activeReplay).getComponent(cc.Label).string = room.roomNum;
        cc.find("main/roomDtl/round/num", this.activeReplay).getComponent(cc.Label).string = room.totalRound;
        cc.find("main/roomDtl/owner_icon/num", this.activeReplay).getComponent(cc.Label).string = room.owner.nickName;
        cc.find("main/roomDtl/time2_icon/num", this.activeReplay).getComponent(cc.Label).string = Utils.formatDateTime(room.createdDate);

        for (let index = 0; index < room.players.length; index++) {
            const element = room.players[index];
            var itemPrefab = cc.instantiate(this.replay2Item);
            this.content2.addChild(itemPrefab);
            itemPrefab.getComponent("Replay2Item").init(element, room);
        }
        
    },

    content2BtnEvent () {
        this.showReplay(2);
    },

    initItem3 (item, replay, replay2) {
        if(replay){
            cc.find("round1/round", item).getComponent(cc.Label).string = "第 " + replay.round + " 局";
            for (let index = 0; index < replay.items.length; index++) {
                const element = replay.items[index];
                cc.find("round1/jifen", item).getComponent(cc.Label).string = (element.score > 0)?"+"+element.score:element.score;
                break;
            }
            cc.find("round1", item).tag = replay.round;
            cc.find("round1", item).on('touchstart', this.content3BtnEvent, this);
        }else{
            cc.find("round", item).active = false;
        }
        if(replay2){
            cc.find("round2/round", item).getComponent(cc.Label).string = "第 " + replay2.round + " 局";
            for (let index = 0; index < replay2.items.length; index++) {
                const element = replay2.items[index];
                cc.find("round2/jifen", item).getComponent(cc.Label).string = (element.score > 0)?"+"+element.score:element.score;
                break;
            }
            cc.find("round2", item).tag = replay2.round;
            cc.find("round2", item).on('touchstart', this.content3BtnEvent, this);
        }else{
            cc.find("round2", item).active = false;
        }
    },

    content3BtnEvent (event) {
        HallSS.instance.replayRound = event.target.tag;
        this.showReplay(3);
    },

    initItem4 (replay) {
        cc.find("main/round", this.activeReplay).getComponent(cc.Label).string = "第 " + replay.round + " 局";

        var items = replay.items;

        //按照得分倒叙排列，当前玩家始终在最前
        items.sort(function(a, b){
            if(a.playerId == HallSS.instance.userMD5Uid){
                return -1; 
            }
            if(b.playerId == HallSS.instance.userMD5Uid){
                return 1;
            }
            return b.score - a.score;
        });
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            var itemPrefab = cc.instantiate(this.replay4Item);
            this.initCards(itemPrefab, element.cards);
            this.content4.addChild(itemPrefab);
            itemPrefab.getComponent("Replay4Item").init(element);
        }
    },

    initCards (itemPrefab, cards) {
        var cardNode = itemPrefab.getChildByName("cards");
        
        var anchorFirst = cardNode.getChildByName("anchorFirst");
        var anchorSecond = cardNode.getChildByName("anchorSecond");
        var anchorThird = cardNode.getChildByName("anchorThird");

        for (let index = 0; index < cards.length; index++) {
            const element = cards[index];
            var newCard = cc.instantiate(this.cardPrefab);
            var cardNode = newCard.getComponent('Card');
            cardNode.node.setScale(0.5);
            cardNode.init(element);

            if(index >= 0 && index < 3){
                anchorFirst.addChild(cardNode.node);
            }else if(index >= 3 && index < 8){
                anchorSecond.addChild(cardNode.node);
            }else if(index >= 8 && index < 13){
                anchorThird.addChild(cardNode.node);
            }
        }
        this.initCardPosAndRotate(anchorFirst);
        this.initCardPosAndRotate(anchorSecond);
        this.initCardPosAndRotate(anchorThird);
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

    reset () {
        this.replayIndex = 0;
    }

    // update (dt) {},
});
