import { parseArrayOfLines, objectSize } from './modules/parsingData.mjs';
import storageMng from './modules/storage.mjs';

////////////////////////////////////////
///// Settings UI /////////////////////
//////////////////////////////////////

var SettingsUI = {
    summaryCat: [
        '<strong>Ostatnia data modyfikacji ustawień:</strong> {{lastSettingsChangeDate}}',
        '<strong>Zużycie pamięci na palety:</strong> {{memoryOfPalletes}}',
        '<strong>Tryb Dewelopera</strong> <input type="checkbox">',
        '<input form="colorComposer-settingsForm" type="button" id="colorComposer-settingsSaveCat" value="Zapisz ustawienia">'
    ],
    compositionCat: [
        '<h2>Motyw rozszerzenia</h2><strong>Obecny Motyw:</strong> {{selectedTheme}}',
        '<hr><strong>Wybieranie motywu</strong> <select id="themeSelection">{{themes_select}}</select>',
        '<input form="colorComposer-settingsForm" type="button" id="colorComposer-settingsSaveCat" value="Zapisz motyw">'
    ],
    aboutAddonCat: [
        '<img src="images/colorComposer128.png">',
        '<strong>Wersja Rozszerzenia:</strong> 0.1 Beta',
        '<strong>Autor:</strong> Grano22',
        '<strong>Dotacja:</strong> <small>Jeśli chcesz wesprzeć moje projekty i zobaczyć cele na które zbieram, gorąco zapraszam na serwisy dotacyjne i z góry dziękuję za dotacje :)</small><br><button id="paypalDonation">Przekaż datek przez PayPal</button>'

    ]
}

var SettingsEvents = {
    summary:()=>{},
    composition:()=>{},
    aboutAddon:()=>{}
}

function changeMenu(menu) {
    let hry = document.getElementsByClassName("colorComposer-columnItem");
    for(let i = 0;i<hry.length;i++) {
        if(hry[i].id==menu) { if(!hry[i].className.split(" ").includes("selected")) hry[i].classList.add("selected"); } else { if(hry[i].className.split(" ").includes("selected")) hry[i].classList.remove("selected"); }
    }
    switch(menu) {
        default:
        case "summary":
            browser.storage.sync.get().then(odp=>{
                console.log(odp);
                console.log(objectSize(odp.savedPalletes));
                document.getElementById("colorComposer-settingsForm").innerHTML = parseArrayOfLines(SettingsUI.summaryCat, {
                    "lastSettingsChangeDate":odp.settingsChanged.toString(),
                    "memoryOfPalletes":objectSize(odp.savedPalletes).total+" bytes"
                });
                SettingsEvents.summary();
            });
        break;
        case "composition":
            browser.storage.sync.get(['theme', 'themes']).then(odp=>{
                console.log(odp);
                let currThemeInfo = odp.theme=="" || odp.theme.toLowerCase()=="default" ? "light" : odp.theme.toLowerCase(), themesSelectList = "";
                for(let th in odp.themes) {
                    themesSelectList += `<option value="${th}">${th}</option>`;
                }

                document.getElementById("colorComposer-settingsForm").innerHTML = parseArrayOfLines(SettingsUI.compositionCat, {
                    "selectedTheme":currThemeInfo,
                    "themes_select":themesSelectList
                });
                SettingsEvents.composition();
            });
        break;
        case "aboutAddon":
            document.getElementById("colorComposer-settingsForm").innerHTML = parseArrayOfLines(SettingsUI.aboutAddonCat, {});
            SettingsEvents.aboutAddon();
        break;
    }
}

function exportSettings(category="all") {

}

function onMenuChange(menuid, fn) {
    SettingsEvents[menuid] = fn;
}

window.onload = function() {
    //Live Settings Events
    ///Categories

    changeMenu("summary");

    Array.prototype.slice.call(document.getElementsByClassName("colorComposer-columnItem")).forEach(el=>{
        el.onclick = ()=>{
            changeMenu(el.id);
        }
    });

    onMenuChange("aboutAddon",()=>{
        document.getElementById("paypalDonation").onclick = evt=>{
            evt.preventDefault();
            browser.tabs.create({url:'https://paypal.me/grano22'});
        }
    });

    onMenuChange("composition", ()=>{
        document.getElementById("colorComposer-settingsSaveCat").onclick = evt=>{
            evt.preventDefault();
            browser.storage.sync.get().then(odp=>{
            if(Object.keys(odp.themes).includes(document.getElementById("themeSelection").value)) odp.theme = document.getElementById("themeSelection").value;
            browser.storage.sync.set(odp).then(e=>console.log("Theme changed to "+odp.theme));
            });
        }
    });
}