export const localMemory = {
    temponary:[]
}

export const syncMemory = {
    theme:"light",
    themes:{
        "light":{location:{settingsPage:"Themes/settingsLight.css", popup:"Themes/mainLight.css"}, ver:"0.1"},
        "dark":{location:{settingsPage:"Themes/settingsDark.css", popup:"Themes/mainDark.css"}, ver:"0.1"}
    },
    language: "default",
    keybinds: {},
    sessionId: Math.floor(Math.random()*1000),
    settingsChanged: new Date(),
    savedPalletes:[],
    buildedInPallete:{"name":"BuildInPallete", "categories":[]},
    savedGradients:[]
}

//Sync Memory
export function initStorageSync() {
    browser.storage.sync.get().then(storageObj=>{
        if(typeof storageObj["settingsChanged"]==undefined || typeof storageObj["sessionId"]==undefined) storageRestoreDefault();
        if(storageObj["theme"]=="") { storageObj["theme"] = "light"; browser.storage.sync.set(storageObj); }
        console.log(storageObj);
    });
}

export function storageRestoreDefault() {
    browser.storage.sync.clear().then(()=>console.log("cleared"), ()=>console.log("falied memory clear"));
    browser.storage.sync.set(syncMemory);
}

export function storageItemCreate(name, value) {
    return new Promise((resolve, reject)=>{
    let timecounter = performance.now();
    browser.storage.sync.get().then(storageObj=>{
        if(typeof storageObj[name]=="undefined") storageObj[name] = value; else { let execTime = performance.now() - timecounter; reject(execTime); return false; }
        browser.storage.set(storageObj).then(r=>{ let execTime = performance.now() - timecounter; resolve(execTime); });
    });
    });
}

export function storageItemUpdate(name, newvalue) {
    return new Promise((resolve, reject)=>{
    browser.storage.sync.get(name).then(storageObj=>{
        if(Object.keys(storageObj).includes(name)) {
            if(Array.isArray(name) && Array.isArray(newvalue)) {
                for(let i in name) {
                    storageObj[name[i]] = newvalue[i];
                }
            } else storageObj[name] = newvalue;
            browser.storage.sync.set(storageObj);
        } else { let execTime = performance.now() - timecounter; reject(execTime); return false; }
        
    });
    });
}

export function storageItemRemove(name) {
    return new Promise((resolve, reject)=>{
    browser.storage.sync.get(name).then(storageObj=>{
        if(Object.keys(storageObj).includes(name)) {
            storageObj[name] = undefined;
            delete storageObj[name];
            browser.storage.sync.set(storageObj);
        }
    });
    });
}

export function storageItemGet(name) {
    return new Promise((resolve, reject)=>{
    browser.torage.sync.get(name).then(storageObj=>{
        
    });
    });
}

//Local memory
export function storageLocalLoad() {

}

export default { storageLocalLoad, initStorageSync, storageRestoreDefault }