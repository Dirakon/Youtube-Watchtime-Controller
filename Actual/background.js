async function GetJson(url){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",url,true);
    Httpreq.onreadystatechange = checkData;
    Httpreq.send(null);
    var ans=null;
    let promise0 = new Promise((resolve, reject) => {
            function looper() {
                if (ans == null){
                    setTimeout(looper,100);
                }else {
                    resolve(ans);
                }
            }
            looper();

    });
    function checkData()
    {
        ans=Httpreq.responseText;
    }
    var json_obj = JSON.parse(await promise0);
    return json_obj;
}
var vidId = "";
var secs = 0;
var csecs = 60;
async function f() {
    while (true) {
        let isYoutube = new Promise((resolve, reject) => {
            chrome.tabs.getSelected(null,function(tab) {
                let p = tab.url;
               // alert(p);
                lastTabUrl=p;
                if (p.includes("www.youtube.com")) {
                    let spl = p.split("watch?v=");
                    if (spl.length > 1) {
                        vidId=spl[1];

                            resolve(true);
                    }
                }
                    resolve(false);
            });
        });
        if (!await isYoutube) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }
        let url = "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyD7RTxocv7aqfKE0BXWrRJIMYf9hFldyYk&part=snippet&id=" + vidId;
        let json = await GetJson(url);
        let name = json.items[0].snippet.channelTitle;
        let promise0 = new Promise((resolve, reject) => {
            chrome.storage.local.get(['list'], function (result) {
                var list = result.list;
                resolve(list);
            });
        });
        let isInList = false;
        var list = await promise0;
        if (typeof list =="undefined" || list.length===0){
            isInList=true;
        }
        else{
            for (let i = 0; i < list.length;++i){
                if (list[i] === name){
                    isInList=true;
                }

            }
        }

        let promise = new Promise((resolve, reject) => {
            chrome.storage.local.get(['limit'], function (result) {
                var limit = result.limit;
                resolve(limit);
            });
        });
        let limit = await promise;
        if (typeof limit =="undefined"){
            limit = 0;
        }
        let promise2 = new Promise((resolve, reject) => {
            chrome.storage.local.get(['cur'], function (result) {
                let limit = result.cur;
                resolve(limit);
            });
        });
        let cur = await promise2;
        if (typeof cur == "undefined"){
            cur = 0;
        }
        if (cur >= limit || !isInList){
            let promise4 = new Promise((resolve, reject) => {
                chrome.tabs.getSelected(null, function (tab) {
                        chrome.tabs.remove(tab.id, function () {
                            if (chrome.runtime.lastError) {
                                console.log(chrome.runtime.lastError.message);
                            } else {
                                // Tab exists
                            }
                            resolve(true);
                        });
                });
            });
            await promise4;
        }else if (secs >= csecs){
            secs=0;
            chrome.storage.local.set({'cur': cur + 1}, function () {
            });
        }else {
            secs+=1;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

f();
