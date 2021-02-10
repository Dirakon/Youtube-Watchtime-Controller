async function getSiteContent(url){
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET",url,true);
    httpRequest.onreadystatechange = checkData;
    httpRequest.send(null);
    let ans = null;
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
        ans=httpRequest.responseText;
    }
    return await promise0;
}

async function GetJson(url){
    return JSON.parse(await getSiteContent(url));
}



let vidId = "";
let secs = 0;
const thresholdSecs  = 60;

async function f() {
    const secretKey = (await getSiteContent(chrome.runtime.getURL("superSecretKey.txt"))).split(';')[1];
    while (true) {
        let isYoutube = new Promise((resolve, reject) => {
            chrome.tabs.getSelected(null,function(tab) {
                let tabUrl = tab.url;
                if (tabUrl.includes("www.youtube.com")) {
                    let spl = tabUrl.split("watch?v=");
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
        let url = "https://www.googleapis.com/youtube/v3/videos?key="+secretKey+"&part=snippet&id=" + vidId;
        let json = await GetJson(url);
        let channelTitle = json.items[0].snippet.channelTitle;
        let personalListOfChannels = new Promise((resolve, reject) => {
            chrome.storage.local.get(['list'], function (result) {
                const list = result.list;
                resolve(list);
            });
        });
        let isInList = false;
        const list = await personalListOfChannels;
        if (typeof list =="undefined" || list.length===0){
            isInList=true;
        }
        else{
            for (let i = 0; i < list.length;++i){
                if (list[i] === channelTitle){
                    isInList=true;
                }

            }
        }

        let promise = new Promise((resolve, reject) => {
            chrome.storage.local.get(['limit'], function (result) {
                const limit = result.limit;
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
        let currentTime = await promise2;
        if (typeof currentTime == "undefined"){
            currentTime = 0;
        }
        if (currentTime >= limit || !isInList){
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
        }else if (secs >= thresholdSecs){
            secs=0;
            chrome.storage.local.set({'cur': currentTime + 1}, function () {
            });
        }else {
            secs+=1;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

f();
