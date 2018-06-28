var Suit = cc.Enum({
    Club : 1, //梅花（黑）
    Diamond : 2, //方块（红）
    Heart: 3, //红桃
    Spade : 4 //黑桃
});

var CountDownType = cc.Enum({
    Start : 1, //开始倒计时
    FinishGroup : 2, //组牌倒计时
});

var RoomState = cc.Enum({
    Ready : "Ready",//等待玩家加入或准备
    InGame : "InGame",//牌局开始
    Compareing : "Compareing",//正在比牌
    Over : "Over",//所有牌局比完，结束
});

var Simple = [
    {
        value : 0,
        name : 'NULL',
        nameCH : '未匹配'
    },
    {
        value : 1,
        name : 'WU_LONG',
        nameCH : '乌龙'
    },
    {
        value : 2,
        name : 'DUI_ZI',
        nameCH : '对子'
    },
    {
        value : 3,
        name : 'LIANG_DUI',
        nameCH : '两对'
    },
    {
        value : 4,
        name : 'SAN_TIAO',
        nameCH : '三条'
    },
    {
        value : 5,
        name : 'SHUN_ZI',
        nameCH : '顺子'
    },
    {
        value : 6,
        name : 'TONG_HUA',
        nameCH : '同花'
    },
    {
        value : 7,
        name : 'HU_LU',
        nameCH : '葫芦'
    },
    {
        value : 8,
        name : 'TIE_ZHI',
        nameCH : '铁支'
    },
    {
        value : 9,
        name : 'TONG_HUA_SHUN',
        nameCH : '同花顺'
    },
    {
        value : 10,
        name : 'WU_TONG',
        nameCH : '五同'
    },
    {
        value : 20,
        name : 'CHONG_SAN',
        nameCH : '冲三'
    },
    {
        value : 30,
        name : 'CHONG_SAN',
        nameCH : '中墩葫芦'
    }
];

var Special = [
    {
        value : 100,
        name : 'SAN_TONG_HUA',
        nameCH : '三同花'
    },
    {
        value : 101,
        name : 'SAN_SHUN_ZI',
        nameCH : '三顺子'
    },
    {
        value : 102,
        name : 'LIU_DUI_BAN',
        nameCH : '六对半'
    },
    {
        value : 103,
        name : 'WU_DUI_CHONG_SAN',
        nameCH : '五对冲三'
    },
    {
        value : 104,
        name : 'SI_TAO_SAN_TIAO',
        nameCH : '四套三条'
    },
    {
        value : 105,
        name : 'COU_YI_SE',
        nameCH : '凑一色'
    },
    {
        value : 106,
        name : 'QUAN_XIAO',
        nameCH : '全小'
    },
    {
        value : 107,
        name : 'QUAN_DA',
        nameCH : '全大'
    },
    {
        value : 108,
        name : 'SAN_ZHA_DAN',
        nameCH : '三炸弹（三分天下）'
    },
    {
        value : 109,
        name : 'SAN_TONG_HUA_SHUN',
        nameCH : '三同花顺'
    },
    {
        value : 110,
        name : 'SHI_ER_HUANG_ZU',
        nameCH : '十二皇族'
    },
    {
        value : 111,
        name : 'YI_TIAO_LONG',
        nameCH : '一条龙'
    },
    {
        value : 112,
        name : 'ZHI_ZUN_QING_LONG',
        nameCH : '至尊清龙'
    }
];

var cardList = [
    {
        number: 9,
        suit: 1
    },
    {
        number: 12,
        suit: 1
    },
    {
        number: 1,
        suit: 1
    },
    {
        number: 2,
        suit: 2
    },
    {
        number: 3,
        suit: 2
    },
    {
        number: 8,
        suit: 2
    },
    {
        number: 12,
        suit: 2
    },
    {
        number: 13,
        suit: 2
    },
    {
        number: 1,
        suit: 3
    },
    {
        number: 7,
        suit: 3
    },
    {
        number: 10,
        suit: 3
    },
    {
        number: 12,
        suit: 3
    },
    {
        number: 1,
        suit: 3
    }
];

var cardTypeList = [
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    },
    {
        firstGroup : {
            type : 4
        },
        middleGroup : {
            type : 10
        },
        endGroup : {
            type : 20
        }
    }
];

module.exports = {
    Suit : Suit,
    Special : Special,
    Simple : Simple,
    cardList : cardList,
    cardTypeList : cardTypeList,
    CountDownType : CountDownType,
    RoomState : RoomState
}