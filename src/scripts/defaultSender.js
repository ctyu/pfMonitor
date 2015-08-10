var baseFeMonitorUrl = 'http://m.ued.qunar.com/monitor/log';

function send(url){
    var img = new Image();
    img.onload = function(){
        //防止IE7 GC时在请求未发出去之前abort掉该请求。
        img.onload = null;
        img = null;
    };
    img.src = url;
}

function makeUrl(baseUrl, searchParams, hashParams){
    baseUrl = baseUrl || baseFeMonitorUrl;
    searchParams = searchParams || {};
    hashParams = hashParams || {};
    var searchParamString = [],
        hashParamsString = [];
    for( var key in searchParams ){
        searchParamString.push(key + '=' + searchParams[key]);
    }
    searchParamString = searchParamString.join('&').toLowerCase();

    for( var _key in hashParams ){
        hashParamsString.push(_key + '=' + hashParams[_key]);
    }
    hashParamsString = hashParamsString.join('&').toLowerCase();

    return baseUrl + (searchParamString ? ('?' + searchParamString) : '' + hashParamsString ? ('#' + hashParamsString) : '');
}

function exec(data){
    data = data || {};
    var monitorParams = data.monitor,
        url;
    if(monitorParams){
        var codeString = monitorParams.id && monitorParams.id.replace(/[^a-zA-Z0-9_]/g,'');
        monitorParams.id && monitorParams.searchParams ? (monitorParams.searchParams.code = codeString) : (monitorParams.searchParams = {'code':codeString});
        url = makeUrl(monitorParams.baseUrl, monitorParams.searchParams, monitorParams.hashParams);
    }
    // console.log(url)
    url && send(url);
}

module.exports = exec;
