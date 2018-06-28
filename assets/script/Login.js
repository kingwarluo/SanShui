var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        loginNode : [cc.Node]
    },

    // use this for initialization
    onLoad: function () {
        for (let index = 0; index < this.loginNode.length; index++) {
            const element = this.loginNode[index];
            var node = element.getChildByName('weixinLogin');
            node.on('click', this.loginClick, this);
        }
    },

    loginClick (event) {
        var target = event.target.parent;
        var lbl = target.getChildByName('lbl');
        var label = lbl.getComponent(cc.Label);
        var encrypted = Utils.encryptData("m"+label.string);
        cc.sys.localStorage.setItem("uid", encrypted);
        cc.director.loadScene('hall');
    }

});
