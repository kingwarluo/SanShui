var Types = require('Types');
var encrypt = require("encryptjs");
var Global = require("Global");

function getSpecialCardCH(weight){
    var Special = Types.Special;
    for (var index = 0; index < Special.length; index++) {
        var element = Special[index];
        if(element.value == weight){
            return element.nameCH;
        }
    }
}

function getSimpleCardCH(weight){
    var Simple = Types.Simple;
    for (var index = 0; index < Simple.length; index++) {
        var element = Simple[index];
        if(element.value == weight){
            return element.nameCH;
        }
    }
}

function getSimpleCardIndex(line, weight){
    var Simple = Types.Simple;
    for (var index = 0; index < Simple.length; index++) {
        var element = Simple[index];
        if(element.value == weight){
            if(line == 1 && weight == 4){//冲三
                return 10;
            }else if(line == 2 && weight == 7){//中墩葫芦
                return 11;
            }
            return index - 1;
        }
    }
}

function mapToArray(map){
    var array = new Array();
    for (const key in map) {
        var obj = {};
        obj.key = key;
        obj.value = map[key];
        array.push(obj);
    }
    return array;
}

function valueWithSymbol(value){
    return (value >= 0)?"+"+value:value;
}

function formatDateTime(timeStamp) {
    var date = new Date();
    date.setTime(timeStamp);
    // var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    // var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    // second = second < 10 ? ('0' + second) : second;
    // return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
    return m + '-' + d+' '+h+':'+minute;
}

function encryptData(item){
    var dataString = JSON.stringify(item);
    var encrypted = encrypt.encrypt(dataString, Global.secretkey, 256);
    return encrypted;
}

function decryptData(item){
    return JSON.parse(encrypt.decrypt(item, Global.secretkey, 256));
}

var clientIp = "172.17.190.149";
// var clientIp = "172.17.190.76";
// var clientIp = "192.168.10.101";

module.exports = {
    getSpecialCardCH : getSpecialCardCH,
    getSimpleCardCH : getSimpleCardCH,
    mapToArray : mapToArray,
    valueWithSymbol : valueWithSymbol,
    getSimpleCardIndex : getSimpleCardIndex,
    formatDateTime : formatDateTime,
    encryptData : encryptData,
    decryptData : decryptData,
    clientIp : clientIp
}