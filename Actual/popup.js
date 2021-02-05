
var text;
async function nice(){
    while (true){
        await new Promise(resolve => setTimeout(resolve, 100));
        let promise1 = new Promise((resolve, reject) => {
            chrome.storage.local.get(['limit'], function (result) {
                let limit = result.limit;
                resolve(limit);
            });
        });
        let limit = await promise1;
        let promise2 = new Promise((resolve, reject) => {
            chrome.storage.local.get(['cur'], function (result) {
                let limit = result.cur;
                resolve(limit);
            });
        });
        let cur = await promise2;
        if (typeof cur == 'undefined'){
            cur=0;
        }

        if (typeof limit == 'undefined'){
            limit=0;
        }
        text.innerHTML =cur + "/"+limit + " min";
    }

}

document.addEventListener('DOMContentLoaded', function() {

    nice();
    let but = document.createElement("input");
    but.type="button";
    but.id = "buttp";
    but.value="+";
    but.onclick=plus;
    document.body.appendChild(but);
    but = document.createElement("input");
    but.type="button";
    but.id = "buttm";
    but.value="-";
    but.onclick=minus;
    document.body.appendChild(but);
    but = document.getElementById("butr");
    but.onclick=reset;
    chrome.storage.local.get(['list'], function(result) {
        let list= result.list;
        if (typeof list == "undefined"){
            list = [];

        }
        for (let i = 0; i < list.length;++i) {
            let ne = document.createElement("input");
            ne.type="text";
            ne.id = "list" + i.toString();
            if (list.length > i){
                ne.setAttribute("value",list[i]);
            }

            document.body.appendChild(ne);
            ne.addEventListener('input', updateList);
        }
    });
    var checkNum= document.getElementById('num');
        checkNum.addEventListener('input', updateValue);
    chrome.storage.local.get(['limit'], function(result) {
        let limit= result.limit;
        chrome.storage.local.get(['cur'], function(result) {
            let cur= result.cur;
            text= document.getElementById('text');
            if (typeof cur == 'undefined'){
                cur=0;
            }

            if (typeof limit == 'undefined'){
                limit=0;
            }
            checkNum.setAttribute("value",limit.toString());
        });
    });

}, false);

function minus() {

    chrome.storage.local.get(['list'], function(result) {
        let list = result.list;
        if (typeof list == "undefined"){
            list = [];
        }
        else if (list.length!=0){
            list.pop();
        }
        chrome.storage.local.set({'list': list}, function() {


            location.reload();
        });
    });
}
function plus() {

    chrome.storage.local.get(['list'], function(result) {
        let list = result.list;
        if (typeof list == "undefined"){
            list = [];
        }
        list.push("");
        chrome.storage.local.set({'list': list}, function() {


            location.reload();
        });
    });
}
function reset() {

        chrome.storage.local.set({'cur': 0}, function() {
            //location.reload();
        });
}

function updateList(e) {
    let value = e.target.value;
    let num = parseInt(e.target.id.split('t')[1]);
    chrome.storage.local.get(['list'], function(result) {
        let list= result.list;
            list[num]=value;
            chrome.storage.local.set({'list': list}, function() {
            });

    });
}

function updateValue(e) {
    let value = parseInt(e.target.value);
    chrome.storage.local.set({'limit': value}, function() {
    });
}

