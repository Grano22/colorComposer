let styleEl = document.createElement("link");
styleEl.rel = "stylesheet";
styleEl.type = "text/css";
styleEl.href = "Themes/mainLight.css";
let recognisePart = (location.pathname).replace("/", ""), pageType = "", currExecution = document.currentScript;
switch(recognisePart) {
    case "popup.html": pageType = "popup"; break;
    case "colorComposerSettings.html": pageType = "settingsPage"; break;
}
console.log(location);
browser.storage.sync.get(['theme', 'themes']).then(odp=>{
    let currThemeInfo = odp.theme=="" || odp.theme.toLowerCase()=="default" ? "light" : odp.theme.toLowerCase();
    console.log(currThemeInfo, pageType);
    styleEl.href = odp.themes[currThemeInfo].location[pageType];
    currExecution.parentNode.insertBefore(styleEl, currExecution);
    currExecution.remove();
}, ifnt=>{
    currExecution.parentNode.insertBefore(styleEl, currExecution);
    currExecution.remove();
});