cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {
        this.runTimeMax = 0.3;//速度
    },

    move (pointList, runTimeMax) {
        this.runTimeMax = (runTimeMax && runTimeMax > 0)?runTimeMax:this.runTimeMax;

        var bezire = cc.bezierTo(this.runTimeMax, pointList);
        this.node.runAction(bezire);
    }

});
