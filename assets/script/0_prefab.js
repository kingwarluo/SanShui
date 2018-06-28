cc.Class({
    extends: cc.Component,

    properties: {
        score : cc.Label,
        dest : cc.Node
    },

    onLoad: function () {
        var self = this;

        this.currentTime = 0;
        this.totalScore = 0;
        this.totalTime = 0;

        var children = this.node.children;
        for (let index = 0; index < children.length; index++) {
            const element = children[index];
            element.on('touchstart', function(){
                var src = this.position;
                var _dest = self.dest;

                var pointList = [];
                pointList.push(src);
                //曲线弧度
                pointList.push(cc.p(_dest.x, src.y));
                pointList.push(_dest);
                var bezire = cc.bezierTo(0.5, pointList);
                this.runAction(cc.sequence(bezire, cc.callFunc(self.moveEnd.bind(self, this))));
            });
        }
    },

    moveEnd (coin) {
        coin.destroy();
        this.totalTime += 0.5;
        this.totalScore += 1000;
    },
  
    update (dt) {
        if(this.totalTime > 0){
            if(this.currentTime < this.totalTime){
                this.currentTime += dt;
            }else{
                this.currentTime = this.totalTime;
            }
            var currentScore = this.totalScore * (this.currentTime / this.totalTime);
            this.score.string = Math.round(currentScore);
        }
    }

});
