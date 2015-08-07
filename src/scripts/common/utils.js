var CustEvents = require('./CustEvents.js');
var core_type = (function(){
    var class2type = {
        '[object HTMLDocument]': 'Document',
        '[object HTMLCollection]': 'NodeList',
        '[object StaticNodeList]': 'NodeList',
        '[object IXMLDOMNodeList]': 'NodeList',
        '[object DOMWindow]': 'Window',
        '[object global]': 'Window',
        'null': 'Null',
        'NaN': 'NaN',
        'undefined': 'Undefined'
    };
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

function docSize(doc) {
    function getWidthOrHeight(clientProp) {
        var docEl = doc.documentElement,
            body = doc.body;
        return Math.max(
            body["scroll" + clientProp],
            docEl["scroll" + clientProp],
            body["offset" + clientProp],
            docEl["offset" + clientProp],
            docEl["client" + clientProp]
        );
    }

    return {
        width: getWidthOrHeight('Width'),
        height: getWidthOrHeight('Height')
    };
}

function winSize(win) {
    function getWidthOrHeight(clientProp) {
        return win.document.documentElement["client" + clientProp];
    }

    return {
        width: getWidthOrHeight('Width'),
        height: getWidthOrHeight('Height')
    };
}

// position
var _contains = document.compareDocumentPosition ? function (a, b) {
    return !!(a.compareDocumentPosition(b) & 16);
} : function (a, b) {
    return a !== b && (a.contains ? a.contains(b) : TRUE);
};

function generalPosition(el) {
    var box = el.getBoundingClientRect(),
        body = el.ownerDocument.body,
        docEl = el.ownerDocument.documentElement,
        scrollTop = Math.max(window.pageYOffset || 0, docEl.scrollTop, body.scrollTop),
        scrollLeft = Math.max(window.pageXOffset || 0, docEl.scrollLeft, body.scrollLeft),
        clientTop = docEl.clientTop || body.clientTop || 0,
        clientLeft = docEl.clientLeft || body.clientLeft || 0;

    return {
        left: box.left + scrollLeft - clientLeft,
        top: box.top + scrollTop - clientTop
    };
}

function diff(pos, bPos) {
    return {
        left: pos.left - bPos.left,
        top: pos.top - bPos.top
    };
}

function _position(el) {
    if (!_contains(el.ownerDocument.body, el)) {
        return {
            top: NaN,
            left: NaN
        };
    }

    return arguments.length > 1 ?
        diff(generalPosition(el), generalPosition(arguments[1])) :
        generalPosition(el);
}

function noop(){}

function supportCustEvent(obj){
    var type = core_type(obj);
    if( type === 'object'){
        for(var key in CustEvents){
            if(obj[key] === undefined){
                obj[key] = CustEvents[key];
            }
        }
    }else if( type === 'function' ){
        obj = obj.prototype;
        supportCustEvent(obj);
    }
}

function classExtend(target, params, notOverridden){
    if(arguments.length === 1){
        params = target;
        target = this;
        notOverridden = false;
    }else{
        if(typeof params === 'boolean'){
            notOverridden = params;
            params = target;
            target = this;
        }
    }
    target = target || this;
    params = params || {};
    for(var key in params){
        var value = params[key];
        var prev = target[ key ];
        if (prev && notOverridden === true)
            return;
        target[ key ] = value;
        if (typeof value === 'function') {
            if (prev)
                value.$prev = prev;
        }
    }
}

module.exports = {
    'core_type' : core_type,
    'logger' : logger,
    'onDomReady' : onDomReady,
    'winSize' : winSize,
    'position' : _position,
    'noop' : noop,
    'supportCustEvent' : supportCustEvent,
    'classExtend' : classExtend
}