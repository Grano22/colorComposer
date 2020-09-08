import storageMng from './modules/storage.mjs';

browser.runtime.onInstalled.addListener(function(details) {

    if(details.reason == "install"){
        let langPage = "";
        //console.log(browser.i18n.getUILanguage());
        switch(navigator.language.slice(0, 2)) {
            case "en": default: langPage = "thanksForInstallation"; break;
            case "pl": langPage = "podziekowaniaZaInstalacje";
        }
        var onInstallInfoPage = browser.tabs.create({
            url:browser.extension.getURL('./additionalPages/'+langPage+'.html')
        });    
    }else if(details.reason == "update"){
        var thisVersion = browser.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
    
    var colorComposer = {};

    colorComposer.background = (function(){

        return {
            savedEvents: [],
            addEvent: (from, to, category, eventID , stopEvt, runTime=Infinity)=>{
                colorComposer.background.savedEvents.push({from:from,to:to,category:category,event:eventID});
            },
            clearAllEvents: ()=>{
                colorComposer.background.savedEvents.forEach((evtOnce)=>{

                });
            }
        }
    }());

    colorComposer.popup = {
        menu: { last:"default" }
    }

    storageMng.initStorageSync();
    storageMng.storageLocalLoad();

    browser.runtime.onConnect.addListener(function(port) {
        let dataBck = JSON.parse(document.body.textContent);
        dataBck.extension.ready = true;
        document.body.innerHTML = JSON.stringify(dataBck);

        port.onDisconnect.addListener(function(evt) {
        browser.runtime.reload();
        let dataBck = JSON.parse(document.body.textContent);
        dataBck.extension.ready = false;
        document.body.innerHTML = JSON.stringify(dataBck);
        });
    });
});