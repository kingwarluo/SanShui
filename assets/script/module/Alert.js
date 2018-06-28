cc.Class({
    extends: cc.Component,

    properties: {
        _isShow : false,    // 是否显示
        _animSpeed : 0.3,    // 动画速度
        _enterCallBack : null,    // 回调事件
        _cancelCallBack : null,    // 回调事件
    },

    onLoad: function () {
        // 获取子节点
        this.detailLabel = cc.find("alertBackground/detailLabel", this.node).getComponent(cc.Label);
        this.cancelButton = cc.find("alertBackground/cancelButton", this.node);
        this.enterButton = cc.find("alertBackground/enterButton", this.node);

        this.enterOriginalX = this.enterButton.x;
    },

    show (detailString, needCancel, _enterCallBack,  _cancelCallBack, animSpeed) {
        
        animSpeed = animSpeed ? animSpeed : this._animSpeed;

        this._isShow = true;
        this.node.active = true;

        // 动画 
        var cbFadeOut = cc.callFunc(this.onFadeOutFinish, this);
        var cbFadeIn = cc.callFunc(this.onFadeInFinish, this);
        this.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(animSpeed, 255), cc.scaleTo(animSpeed, 1.0)), cbFadeIn);
        this.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(animSpeed, 0), cc.scaleTo(animSpeed, 2.0)), cbFadeOut);

        // 展现 alert
        this.startFadeIn();

        // 参数
        this.configAlert(detailString, _enterCallBack, needCancel, _cancelCallBack, animSpeed);
    },
   
    // 参数
    configAlert (detailString, enterCallBack, needCancel, cancelCallBack, animSpeed) {
        this._enterCallBack = enterCallBack;
        this._cancelCallBack = cancelCallBack;

        // 添加点击事件
        this.enterButton.on('click', this.onButtonClicked, this);
        this.cancelButton.on('click', this.onButtonClicked, this);
        
        // 内容
        this.detailLabel.string = detailString;
        // 是否需要取消按钮
        if (needCancel) { // 显示
            this.cancelButton.active = true;
        } else {  // 隐藏
            this.cancelButton.active = false;
            this.enterButton.x = 0;
        }
    },

    // 执行弹进动画
    startFadeIn () {
        cc.eventManager.pauseTarget(this.node, true);
        this.node.position = cc.p(0, 0);
        this.node.setScale(2);
        this.node.opacity = 0;
        this.node.runAction(this.actionFadeIn);
    },

    // 执行弹出动画
    startFadeOut () {
        cc.eventManager.pauseTarget(this.node, true);
        this.node.runAction(this.actionFadeOut);
    },

    // 弹进动画完成回调
    onFadeInFinish () {
        cc.eventManager.resumeTarget(this.node, true);
    },

    // 弹出动画完成回调
    onFadeOutFinish () {
        this.onHide();
    },

    // 按钮点击事件
    onButtonClicked (event){
        if(event.target.name == "enterButton"){
            if(this._enterCallBack){
                this._enterCallBack();
            }
        }
        if(event.target.name == "cancelButton"){
            if(this._cancelCallBack){
                this._cancelCallBack();
            }
        }
        this.startFadeOut();
    },

    onHide () {
        this._isShow = false;
        this.node.active = false;
        this.enterButton.active = true;
        this.enterButton.off('click', this.onButtonClicked);
        this._enterCallBack = null;
        this.cancelButton.active = true;
        this.cancelButton.off('click', this.onButtonClicked);
        this._cancelCallBack = null;
        this.enterButton.x = this.enterOriginalX;
        this._animSpeed = 0.3;
    },

});
