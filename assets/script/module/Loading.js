cc.Class({
    extends: cc.Component,

    properties: {
        _isShow : false,    // 是否显示
        _roundSpeed : 1.5,    // 滚动速度
        _label : "正在请求数据...",    // 默认提示
    },

    onLoad: function () {
    },

    show (detailString, roundSpeed) {
        
        roundSpeed = roundSpeed ? roundSpeed : this._roundSpeed;

        this._isShow = true;
        this.node.active = true;

        // 获取子节点
        var detailLabel = cc.find("loading_bg/label", this.node).getComponent(cc.Label);
        detailLabel.string = detailString?detailString:this._label;

        var pic = cc.find("loading_bg/load_turn", this.node);
        var repeat = cc.repeatForever(cc.rotateBy(roundSpeed, 360));
        pic.runAction(repeat);

        var bg = cc.find("bg", this.node);
        bg.on('touchstart', function(e){
            e.stopPropagation();
        });
    },

    hide () {
        this._isShow = false;
        this.node.active = false;
        this._roundSpeed = 1.5;
    },

});
