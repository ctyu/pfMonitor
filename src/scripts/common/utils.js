var core_type = (function(){
    var class2type = {};
    var core_toString = Object.prototype.toString;
    var typeList = "Boolean Number String Function Array Date RegExp Object".split(" ");
    for(var i = 0,len = typeList.length;i < len;i++){
        class2type[ "[object " + typeList[i] + "]" ] = typeList[i].toLowerCase();
    }

    return function(obj){
        return obj == null ?
            String( obj ) :
            class2type[ core_toString.call(obj) ] || "object";
    }
})();

var logger = (function(){
    var divEl = document.createElement('div');
    divEl.id = 'logDiv';
    divEl.style.backgroundColor = 'black';
    divEl.style.position = 'fixed';
    divEl.style.top = '0px';
    divEl.style.right = '0px';
    divEl.style.color = 'white';
    divEl.style.display = 'none';
    document.body.appendChild(divEl);
    return function(name,value){
        var stringValue = [];
        if(name){
            stringValue.push('<span style="color:red">'+name+'</span><br/>');
        }
        if(typeof value === 'string'){
            stringValue.push(value + '<br/>');
        }else{
            for(var key in value){
                stringValue.push(key + '=' + value[key] + '<br/>');
            }
        }
        divEl.innerHTML += stringValue.join('');
    }
})();

logger.show = function(){
    document.getElementById('logDiv').style.display='block';
}

logger.hide = function(){
    document.getElementById('logDiv').style.display='none';
}

window.logger = logger;

function onDomReady(callback){
    if(core_type(callback) === 'function'){
        if (/complete|loaded|interactive/.test(document.readyState) && document.body) callback()
        else document.addEventListener('DOMContentLoaded', function(){ callback() }, false)
    }
}



module.exports = {
    'core_type' : core_type,
    'logger' : logger,
    'onDomReady' : onDomReady
}