import { uniFormat, DecToHex, RGBtoHexColor } from './converters.mjs';

class linearGradient {
    constructor(colorSet, direction) {
        this.colorSet = colorSet || [];
        this.name = "";
        this.direction = direction;
        this.procentage = [];
        this.lastGeneratedDocumentId = 0;
    }

    addColor(color) {
        if(Array.isArray(color)) {
            color.forEach((v)=>{
                this.colorSet.push(uniFormat(v));
            });
        } else {
            this.colorSet.push(uniFormat(color));
        }
    }

    changeColor(oldIndex, color) {
        this.colorSet[oldIndex] = color;
    }

    removeColor(pos) {
        this.colorSet.splice(pos, 1);
        console.log(this.colorSet);
    }

    resetColors() {
        this.colorSet = ["#000", "#FFF"];
        this.procentage = [];
    }

    reverseGradient() {
        this.colorSet.reverse();
        this.procentage.reverse();
    }

    randomize(max=10) {
        this.colorSet = [];
        max = parseInt(Math.random()*max)+2;
        for(let i =0;i<max;i++) {
            let num = [Math.round(Math.random()*255), Math.round(Math.random()*255), Math.round(Math.random()*255)];
            num = RGBtoHexColor(num[0], num[1], num[2]);
            console.log(num);
            this.colorSet.push(num);
        }
    }

    //Color Sets

    generateGradientColorSet(update=false, action=undefined, indx=undefined) {
        let output = "", someOther = "";
        if(this.colorSet.length>2) someOther = '<span class="gradientFabric-unsetColor">&times;</span>';
        if(!update) {
        for(let ind in this.colorSet) {
            output += '<li id="colorProperty'+ind+'">'+someOther+'<div style="background:'+this.colorSet[ind]+';" class="previewBoxmin"></div> '+this.colorSet[ind]+'</li>';
        }
        output += '<li id="addNewColorToGradient">Dodaj kolejny</li>';
        return output;
        } else {
        output = [];

        let number = 0; for(let nodeEl of action.childNodes) { if(nodeEl.tagName=="LI" && nodeEl.id!="addNewColorToGradient") number++;  } //nodeEl.nodeType==1 && 
        var liLength = number || this.colorSet.length;

        for(let i = liLength;i<this.colorSet.length;i++) {
            let newColorSetLi = document.createElement("li");
            newColorSetLi.id = 'colorProperty'+i;
                let divPreview = document.createElement("div");
                divPreview.style.background = this.colorSet[i];
                divPreview.className = "previewBoxmin";
            newColorSetLi.appendChild(divPreview);
                let txtND = document.createTextNode(this.colorSet[i]);
            newColorSetLi.appendChild(txtND);
            newColorSetLi.onclick = indx;
            //output += '<li>'+someOther+'<div style="background:'+this.colorSet[i]+';" class="previewBoxmin"></div> '+this.colorSet[i]+'</li>';
            output.push(newColorSetLi);
        }
        return output;
        }
    }
    
}

export class linearGradientSVGGenerator extends linearGradient {
    constructor(direction="default", width=200, height=100,customColorSet=[], opt={}) {
        super(customColorSet, direction);
        if(typeof opt=="object") {
            this.allowProcentage = opt.allowProcentage || false;
            this.allowDirection = opt.allowDirection || false;
        }
        this.imageWidth = width; this.imageHeight = height;

        this.containerArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.containerArea.setAttribute("width", this.imageWidth); this.containerArea.setAttribute("height", this.imageHeight);
    }

    generateSVGLinearGradient(shape="rect", id=undefined) {
        this.containerArea.innerHTML = "";
        let definitionPlace = document.createElement("defs"), figure, uniID = typeof id!="undefined" ? id: "gradientFabric"+0;
            let linearGradientPlace = document.createElement("linearGradient");
            linearGradientPlace.id = uniID;
        for(let i = 0;i<this.colorSet.length;i++) {
            let stop = document.createElement("stop"), proc = Math.floor(100/(this.colorSet.length-1));
            stop.setAttribute("offset", (proc*i)+"%");
            stop.style.stopColor = this.colorSet[i];
            linearGradientPlace.appendChild(stop);
        }
            definitionPlace.appendChild(linearGradientPlace);
        this.containerArea.appendChild(definitionPlace);
        switch(shape) {
            case "rect":
                figure = document.createElement("rect");
                figure.setAttribute("y", 0);
                figure.setAttribute("x", 0);
                figure.setAttribute("width", this.imageWidth); figure.setAttribute("height", this.imageHeight);
            break;
        }
        figure.setAttribute("fill", "url(#"+uniID+")");
        this.containerArea.appendChild(figure);
        return this.containerArea.outerHTML;
    }

    exportAsSVGXML() {
        let xmldoc = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg>';
        xmldoc += this.containerArea.outerHTML;
        var blob = new Blob([xmldoc], {type: "image/svg+xml"});
        browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "generatedGradient"+(this.lastGeneratedDocumentId++)+".svg"
        });
    }
}

export class linearGradientCanvasGenerator extends linearGradient {
    constructor(id, direction="default", width=220, height=220,customColorSet=[], opt={}) {
        super(customColorSet, direction);
        if(typeof opt=="object") {
            this.allowProcentage = opt.allowProcentage || false;
            this.allowDirection = opt.allowDirection || false;
        }
        this.canvasEl = document.createElement("canvas");
        this.canvasEl.id = id;
        this.canvasEl.width = width; this.canvasEl.height = height;
        //this.rendererContext = this.canvasEl.getContext("2d");
        this.currGradient = null;
        this.allowDirectionLine = true;
    }

    generateGradientColor(unstandardIndex=undefined) {
        let output = "", someOther = "";
        if(this.colorSet.length>2) someOther = '<span class="gradientFabric-unsetColor">&times;</span>';
        let ind = typeof unstandardIndex!="undefined" ? this.colorSet[unstandardIndex] : this.colorSet[this.colorSet.length - 1];
        output = '<li>'+someOther+'<div style="background:'+ind+';" class="previewBoxmin"></div> '+ind+'</li>';
        return output;
    }

    generateCanvasLinearGradient() {
        let getCanvasEl = document.getElementById(this.canvasEl.id), rendererContext = getCanvasEl.getContext("2d");
        console.log(this.direction);
        let mx = 110, my = 110, wx = this.canvasEl.width, wy = this.canvasEl.height/2, lenght = this.canvasEl.width/2;
        let ax = this.canvasEl.width/2, ay = this.canvasEl.height/2;
        if(this.direction!="default") {
            //Angle Calc
            let angle = this.direction / 180 * Math.PI;
            wx = mx + Math.cos(angle) * lenght;
            wy = my + Math.sin(angle) * lenght;


        }
        let grd = rendererContext.createLinearGradient(mx, my, wx, wy); //mx, my, wx, wy
        for(let i =0;i<this.colorSet.length;i++) {
            grd.addColorStop(i, this.colorSet[i]);
        }
        rendererContext.fillStyle = grd;
        this.currGradient = grd;
        rendererContext.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);

        // line of direction
        rendererContext.beginPath();
        rendererContext.moveTo(ax, ay);
        rendererContext.lineTo(wx, wy);
        /*rendererContext.lineTo(wx-20, wy-11);
        rendererContext.moveTo(wx, wy);
        rendererContext.lineTo(wx-20, wy+11);*/
        rendererContext.strokeStyle = "red";
        rendererContext.stroke();
    }

    changeDirection(angle) {
        if(angle=="default" || angle=="") { this.direction = "default"; return true; }
        if(isNaN(angle) || !isFinite(angle)) return false;
        angle = Math.sign(angle)==-1 ? 360 - Math.abs(angle) : angle;
        console.log(angle);
        if(angle>359 || angle<0) return false;
        this.direction = angle;
        return true;
    }

    generateGradientPreview() {
        return this.canvasEl;
    }

    updateGradientPreview(newWidth=undefined, newHeight=undefined) {
        return this.canvasEl;
    }

    exportAsPngImage() {
        return this.canvasEl.toDataURL();
    }

    generateHTMLView(uniID="") {
        uniID = uniID.length>0 ? uniID : this.canvasEl.id;
        return `<!DOCTYPE HTML><html>
        <head>
        <title>Wygenerowany widok gradientu HTML ze skryptem Canvas</title>
        <style type="text/css">
            body { margin: 0; }

            div#container {
                background: #EEE;
            }

            xmp {
                border-radius: 8px;
                padding: 5px;
                width: 70%;
                margin: 2px 0;
                background: #404040;
                color: #fff;
            }
        </style>
        </head>
        <body>
        <div id="container">
        <header>
        <div id="header">
        <h1>Wygenerowany gradient Canvas</h1>
        </div>
        </header>
        <main>
        <canvas id="${uniID}" width="${this.canvasEl.width}" height="${this.canvasEl.height}">Your browser do not support Canvas</canvas>
        <button id="button">Zobacz podgląd</button>
        <xmp id="scriptcontent">${this.generateCanvasScript(uniID)}</xmp>
        </main>
        </div>
        </body>
        </html>`;
    }

    generateCanvasScript(uniID, canvasNode="") {
        let contentScript = `var c = ${canvasNode}document.getElementById("${uniID}"), cr = c.getContext("2d"), gr = cr.createLinearGradient(0, 0, ${this.canvasEl.width}, 0);
        `;
        for(let i = 0;i<this.colorSet.length;i++) {
            contentScript+=`gr.addColorStop(${i}, "${this.colorSet[i]}");\n`;
        }
        contentScript+=`cr.fillStyle = gr;\ncr.fillRect(0, 0, ${this.canvasEl.width}, ${this.canvasEl.height});`;
        return contentScript;
    }

    openHTMLViewInWindow(uniID) {
        var generatedGradientWindow = window.open("", "_blank", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,fullscreen=yes");
            let generatedDOM = this.generateHTMLView(uniID);
            generatedGradientWindow.document.getElementsByTagName("html")[0].innerHTML = generatedDOM.replace("<html>", "").replace("</html>", "");
            let execScript = document.createElement("script");
            execScript.type = "text/javascript";
            execScript.innerHTML = this.generateCanvasScript(uniID);
            setTimeout(function(){ //generatedGradientWindow.document.head.appendChild(execScript); 
                generatedGradientWindow.document.getElementById("button").onclick = e=>{
                    generatedGradientWindow.alert("works");
                    eval(this.generateCanvasScript(uniID, "generatedGradientWindow."));
                    console.log(this.generateCanvasScript(uniID, "generatedGradientWindow."));
                }
            }, 10000);
    }

    sendToDownloadJpgImage() {
        var blob = new Blob([this.exportAsPngImage()], {type: "image/jpg"});
        browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "generatedGradient"+(this.lastGeneratedDocumentId++)+".jpg"
        });
    }
}

export class linearGriadientCSSGenerator extends linearGradient {
    constructor(direction="default", customColorSet=[], opt={}) {
        super(customColorSet, direction);
        if(typeof opt=="object") {
            this.allowProcentage = opt.allowProcentage || false;
            this.allowDirection = opt.allowDirection || false;
        }
    }

    generateGradientColor(unstandardIndex=undefined) {
        let output = "", someOther = "";
        if(this.colorSet.length>2) someOther = '<span class="gradientFabric-unsetColor">&times;</span>';
        let ind = typeof unstandardIndex!="undefined" ? this.colorSet[unstandardIndex] : this.colorSet[this.colorSet.length - 1];
        output = '<li>'+someOther+'<div style="background:'+ind+';" class="previewBoxmin"></div> '+ind+'</li>';
        return output;
    }

    calculateProcentageSplit() {
        let onceVal = Math.round(100/this.colorSet.length), allVals = [onceVal];
        for(let i=1;i<this.colorSet.length;i++) { /*, lastVal = onceVal lastVal+=onceVal; lastVal*/ allVals.push(onceVal); }
        return allVals;
    }

    generateLinearFunc() {
        let colors = "", linearFunc = "";
        if(this.allowProcentage) var procentages = this.procentage.length>0 ? this.procentage : this.calculateProcentageSplit(); //==this.colorSet.length

        for(let ind in this.colorSet) {
            colors += this.colorSet[ind];
            if(this.allowProcentage && typeof procentages[ind]!="undefined") {
                colors += " "+procentages[ind]+"%";
            }
            if(ind<this.colorSet.length-1) colors += ",";
        }
        linearFunc = 'linear-gradient(';
        if(this.direction!="" && this.allowDirection) linearFunc += this.direction+","; 
        linearFunc += colors;
        linearFunc += ")";
        return linearFunc;
    }

    generateGradientColorRange() {
        let allVals = this.calculateProcentageSplit();
        allVals = allVals.join(" ");
        return '<input type="range" id="gradientMixer" data-values="'+allVals+'" max="100" min="0" multiple>';
    }

    generateGradientPreview() {
        let linearFunc = this.generateLinearFunc();
        return `<figure class="previewBox" style="background-image:${linearFunc};"><figcaption>${linearFunc}</figcaption></figure>`;
    }

    generateGradientTool() {
        
    }

    changeDirection(direction) {
        var avaibleDirections = ["to right", "to left", "to top", "to bottom"];
        if(avaibleDirections.includes(direction) || direction.indexOf("deg")!=-1) { this.direction = direction; this.allowDirection = true; console.log(this.direction); return true; } else if(direction=="") { this.direction = "default"; this.allowDirection = false; } else return false;
    }

    /* Addon Tools */
    generateHTMLView() {
        let generatedRes = this.generateLinearFunc(), generatedResWithoutName = generatedRes.replace("linear-gradient", "");
        var Content = `<!DOCTYPE HTML><html>\
        <head><meta charset="utf-8">\
        <title>Wygenerowany gradient</title>\
        <style type="text/css">\
            html, body { margin: 0; }\
\
            div#container {  }\
\
            div#gradient {\
                background: -webkit-gradient-${generatedResWithoutName};\
                background: -webkit-${generatedRes};\
                background: -moz-${generatedRes};\
                background: -ms-${generatedRes};\
                background: -o-${generatedRes};\
                background: ${generatedRes};\
                height: calc(100vh - 250px);\
                zoom: 1;\
            }\
\
            div#spec {\
                height: 210px;\
                padding: 20px;\
                background: #CCC;\
            }\
\
            div#readyToCloseWindow {\
                width: calc(100% - 40px);\
                padding: 20px;\
                position: fixed;\
                bottom: 0; left: 0;\
                background: #27ae60;\
                text-align: center;\
                text-align: -moz-center;\
                border-top: #2ecc71 2px solid;\
                font-weight: bolder;\
                color: #fff;\
            }\
\
            div#readyToCloseWindow:hover {\
                background: #2ecc71;\
                cursor: pointer;\
            }\
        </style>\
        </head>\
        <body>\
        <div id="container">\
        <div id="gradient">\
        </div>\
        <div id="spec">\
        <h1>Informacje o gradiencie</h1>\
        <strong>Funkcja CSS</strong> ${generatedRes}\
        </div>\
        <!--<div onclick="close()" id="readyToCloseWindow">Close Preview</div>-->\
        </div>\
        <!--<script>window.onload = ()=>{ document.getElementById("readyToCloseWindow").onclick = ()=>close(); }</script>-->\
        </body>\
        </html>`;

        return Content;
    }

    openHTMLViewInWindow() {
        /*var createdWindow = browser.windows.create({
            type: "detached_panel",
            //url: "about:blank",
            //url: "about:srcdoc",
            //url: "./additionalPages/generatedPage.html",
            width: window.screen.availWidth,
            height: window.screen.availHeight,
            allowScriptsToClose: true
        });

        createdWindow.then((window)=>{
            //browser.tabs.connect(window.tabs[0].id, {name: "popup"});
            console.log(window);
            console.log(window.tabs[0].id);
            let generatedDOM = this.generateHTMLView();
            browser.tabs.executeScript(window.tabs[0].id, { code: `document.getElementsByTagName("html")[0].innerHTML = '${generatedDOM}'.replace("<html>", "").replace("</html>", "");`, allFrames: true }); //document.getElementsByTagName("html")[0].outerHTML = '${generatedDOM}';,, matchAboutBlank: true

        });*/

        var generatedGradientWindow = window.open("", "_blank", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,fullscreen=yes");
        //generatedGradientWindow.addEventListener("DOMContentLoaded", (e)=>{
            let generatedDOM = this.generateHTMLView();
            generatedGradientWindow.document.getElementsByTagName("html")[0].innerHTML = generatedDOM.replace("<html>", "").replace("</html>", "");
        //});

        /*browser.windows.onCreated.addListener((window) => {
            console.log("New window: " + window.id);
            console.log(window);
            //browser.windows.getCurrent({populate: true}).then((dom)=>{ console.log(dom); /*document.body.parentNode.innerHTML = this.generateHTMLView(); });
        });*/
        //createdWindow.contentWindow.document.body.parentNode.innerHTML = this.generateHTMLView();
    }

    sendToDownloadHTMLDoc() {
        var blob = new Blob([this.generateHTMLView()], {type: "text/html"});
        browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "generatedGradient"+(this.lastGeneratedDocumentId++)+".html"
        });
        //console.log("Saved generatedGradient"+this.lastGeneratedDocumentId);
    }

    saveToGradientGroup() {

    }
}