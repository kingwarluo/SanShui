var State = require('state.com');

var instance;
var model;

function on(message){
    return function (mesToEvaluate){
        return mesToEvaluate === message;
    }
}

var evaluating = false;

exports = {
    init : function(target){
        // send log messages, warnings and errors to the console
        State.console = console;
        
        model = new State.StateMachine('root');
        var initial = new State.PseudoState('init-root', model, State.PseudoStateKind.Initial);
        //比牌流程
        var compare = new State.State('比牌', model);
        var special = new State.State('特殊牌型', model);
        var daqiang = new State.State('打枪', model);
        var end = new State.State('结算', model);
        
        initial.to(compare);
        compare.to(special).when(on('compared'));
        special.to(daqiang).when(on('specialed'));
        daqiang.to(end).when(on('end'));
        
        compare.entry(function(){
            target.onCompareState();
        });
        special.entry(function(){
            target.onSpecialState();
        });
        daqiang.entry(function(){
            target.onDaQiangState();
        });
        end.entry(function(){
            target.onEndState();
        });
        
        // create a State machine instance
        instance = new State.StateMachineInstance('fsm');
        State.initialise(model, instance);
    },
    
    toSpecial : function(){
        this._evaluate('compared');
    },
    
    toDaQiang : function (){
        this._evaluate('specialed');
    },
    
    toEnd : function(){
        this._evaluate('end');
    },
    
    _evaluate : function(message){
        if(evaluating){
            // can not call fsm's evaluate recursively
            setTimeout(function(){
                State.evaluate(model, instance, message);
            }, 1);
            return;
        }
        evaluating = true;
        State.evaluate(model, instance, message);
        evaluating = false;
    },
    
    _getInstance : function(){
        return instance;
    },
    
    _getModel : function(){
        return model;
    }
};

module.exports = exports;