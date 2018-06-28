var Global = require('Global');

cc.Class({
    extends: cc.Component,

    properties: {
        target:cc.Node,
        sprite:cc.SpriteFrame,
        checkedSprite:cc.SpriteFrame,
        checked:false,
        groupId:-1,
        value:-1
    },

    // use this for initialization
    onLoad: function () {
        if(!Global.radiogroup){
            var RadioGroup = require("RadioGroup");
            Global.radiogroup = new RadioGroup();
            Global.radiogroup.init();
        }
        Global.radiogroup.add(this);
        this.refresh();
    },
    
    refresh (){
        var targetSprite = this.target.getComponent(cc.Sprite);
        if(this.checked){
            targetSprite.spriteFrame = this.checkedSprite;
        }else{
            targetSprite.spriteFrame = this.sprite;
        }
    },
    
    check (checked){
        this.checked = checked;
        this.refresh();
    },
    
    onClicked (){
        Global.radiogroup.check(this);
    },
    
    onDestroy (){
        Global.radiogroup.del(this);            
    }
});
