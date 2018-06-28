cc.Class({
    extends: cc.Component,

    properties: {
        scrollView : cc.ScrollView,
        prefabRankItem : cc.Prefab,
        rankCount : 0
    },

    // use this for initialization
    onLoad: function () {
        this.content = this.scrollView.content;
    },
    
    show : function(players){
        //得分从大到小排序
        players.sort(function(a, b){
            return b.mark - a.mark;
        });
        for(var i = 0; i < players.length; i++){
            var item = cc.instantiate(this.prefabRankItem);
            item.getComponent('RankItem').init(i, players[i]);
            this.content.addChild(item);
        }
    }
    
});
