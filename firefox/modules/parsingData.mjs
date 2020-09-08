//Parse Data

export function parseArrayOfLines(arrLines, matchPattern ,separator="<br>") {
    let allText = "";
    for(let line of arrLines) {
        var VariablesInString = line.match(/{{([A-Za-z0-9_]*)(|\|[A-Za-z0-9\s/,]*)}}/g);

        if(VariablesInString!==null) {
        for(let i = 0;i<VariablesInString.length;i++) { 
            var parsedVar = VariablesInString[i].replace("{{", "").replace("}}", ""), stringVariableValue = "";
            if(parsedVar.indexOf("|")!=-1) { if(parsedVar.indexOf("_MSG_Lang_")==0) stringVariableValue = browser.i18n.getMessage(parsedVar.split("|")[0].replace("_MSG_Lang_", "")) || parsedVar.split("|")[1] || ""; else stringVariableValue = matchPattern[parsedVar.split("|")[0]] || parsedVar.split("|")[1]; } else { if(parsedVar.indexOf("_MSG_Lang_")==0) stringVariableValue = browser.i18n.getMessage(parsedVar) || ""; else stringVariableValue = matchPattern[parsedVar] || "undefined"; }
            //console.log(stringVariableValue);
            line = line.replace(VariablesInString[i], stringVariableValue);
        }
        }
        allText += line+separator;
    }
    return allText;
}

export function objectSize(arr) {
    let totalSize = 0, elementalSize = [];

    for(let i in arr) {
        if(typeof arr[i]=="boolean") {
            elementalSize.push(4);
            totalSize += 4;
        } else if(typeof arr[i]=="string") {
            elementalSize.push(arr[i].length * 2);
            totalSize += arr[i].length * 2;
        } else if(typeof arr[i]=="number") {
            elementalSize.push(8);
            totalSize += 8;
        } else if(typeof arr[i]=="object" || Array.isArray(arr[i])) {
            if(arr[i]!==null) {
                const objVal = objectSize(arr[i]).total;
                elementalSize.push(objVal);
                totalSize += objVal;
            }
        }
    }

    return {"total":totalSize, "elemental":elementalSize};
}

export function objectkeyDelete(obj, key, deep=false) {
   if(Array.isArray(key)) { for(let k in key) { if(typeof obj[key[k]]!="undefined") obj[key[k]] = undefined; } } else { if(typeof obj[key]!="undefined") obj[key] = undefined; }
   if(typeof Object.prototype.map=="function") return obj = obj.map(val=>key!=undefined); else {
       let temobj = {};
       for(let val in obj) {
            if(typeof obj[val]!="undefined") temobj[val] = obj[val];
       }
       return temobj;
   }
}

export function generateSelectorOfNode(element) {
    let nodeSelector = "";
    nodeSelector += element.tagName;
    if(element.tagName=="INPUT") {
        if(element.type!="") nodeSelector += "[type="+CSS.escape(element.type)+"]";
    }
    if(element.id!="") nodeSelector += "#"+CSS.escape(element.id);
    if(typeof element.classList!="undefined" && element.classList.length>0) nodeSelector += "."+element.classList.value.replace(/\s/g, "."); //CSS.escape();
    //console.log(nodeSelector);
    return nodeSelector;
}

export function isVaildJSON(json_string) {
    try {
        var obj = JSON.parse(json_string);

        if(obj && typeof obj=="object") {
            return true;
        }
    } catch(e) {}
    return false;
}

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

export function crc32(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
}