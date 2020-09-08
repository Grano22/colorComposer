console.info("colorComposerContentStartup.js working..");

SCEPlongReceiver((res)=>{
    console.log(res);
});

console.warn("not working");

/*
let testScript = document.createElement("script");
testScript.type = "module";
testScript.src = browser.extension.getURL('eyeDropper.client.js');
document.head.appendChild(testScript);*/

/*
var readFile = (_path) => {
    return new Promise((resolve, reject) => {
        fetch(_path, {mode:'same-origin'})
            .then(function(_res) {
                return _res.blob();
            })
            .then(function(_blob) {
                var reader = new FileReader();

                reader.addEventListener("loadend", function() {
                    resolve(this.result);
                });

                reader.readAsText(_blob);
            })
            .catch(error => {
                reject(error);
            });
    });
};

readFile(browser.extension.getURL('./modules/firefox.message.lib.js')).then((data)=>{
    console.log(data.replace(/export/g, ""));
}).catch(()=>{

});*/

/*
let testScript = document.createElement("script");
testScript.type = "text/javascript";
testScript.src = browser.extension.getURL('eyeDropper.client.js');
document.head.appendChild(testScript);*/

/*chrome.tabs.executeScript(tabId, {file: './eyeDropper.client.js'}, function() {
    
});*/

//Imports
/*
import { SCEPlongReceiver } from './modules/firefox.message.lib.js';

*/