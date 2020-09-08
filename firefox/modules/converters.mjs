import { isVaildJSON } from './parsingData.mjs';

export function roundTo(n, digits) {
    if (digits === undefined) {
      digits = 0;
    }

    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    var test =(Math.round(n) / multiplicator);
    return +(test.toFixed(digits));
}

export function padToCounter(val, how) {
    val = val+"";
    if(val.length<how) {
        for(let i=val.length;i<how;i++) val = "0"+val;
        return val;
    } else return val;
}

export function containsANumber(string) {
    if(typeof string == "string") {
        for(let character of string.split("")) { if(!isNaN(parseFloat(character)) && isFinite(parseFloat(character))) return true;  }
    } 
    return false;
}

export function changeRGBTypeData(red, green, blue, type="array") {
    switch(type) {
        case "array":
        default:
        return [red, green, blue];
        case "object":
        return {r:red, g:green, b:blue};
        case "func":
        return 'rgb('+red+','+green+','+blue+')';
    }
}

export function DecToHex(decNumber) {
    if(Array.isArray(decNumber)) {
        let convertedVal = [];
        for(let index in decNumber) {
            convertedVal.push(Number(decNumber[index]).toString(16).toUpperCase());
        }
        return convertedVal;
    } else if(arguments.length>1) {
        let convertedVal = [];
        for(let index = 0;index<arguments.length;index++) {
            convertedVal.push(Number(arguments[index]).toString(16).toUpperCase());
        }
        return convertedVal;
    } else {
        return Number(decNumber).toString(16).toUpperCase();
    }

}

export function HexToDec(hexNumber) {

    function switchHexIndicator(val) {
        switch(val.toUpperCase()) {
            case "F": return 15;
            case "E": return 14;
            case "D": return 13;
            case "C": return 12;
            case "B": return 11;
            case "A": return 10;
            default: return parseInt(val);
        }
    }

    function oneTourHex(hexNumber) {
        var decimal = 0, hexNumberMain = "";
        if(hexNumber.indexOf(".")==-1) {
            hexNumberMain = hexNumber;
        } else {
            hexNumberMain = hexNumber.split(".")[0];
            var hexNumberFloat = hexNumber.split(".")[1];
            let hexSpec = -1; var floatExt = 0;
            for(let floatChar=0;floatChar<hexNumberFloat.length;floatChar++) {
                let expectedNum = switchHexIndicator(hexNumberFloat[floatChar]);
                floatExt += expectedNum * Math.pow(16, hexSpec);
                hexSpec--;
            }
        }
        hexNumberMain = hexNumberMain.split("").reverse();
        for(let char = 0;char<hexNumberMain.length;char++) {
            let expectedNum = switchHexIndicator(hexNumberMain[char]);
            decimal += expectedNum * Math.pow(16, char);
        }

        return hexNumber.indexOf(".")==-1 ? decimal : parseFloat(decimal+floatExt);
    }

    if(Array.isArray(hexNumber)) {
        let convertedVal = [];
        for(let index in hexNumber) {
            convertedVal.push(oneTourHex(hexNumber[index]));
        }
        return convertedVal;
    } else if(arguments.length>1) {
        let convertedVal = [];
        for(let index = 0;index<arguments.length;index++) {
            convertedVal.push(oneTourHex(arguments[index]));
        }
        return convertedVal;
    } else {
        return oneTourHex(hexNumber);
    }
}

export function toColorModelFunction(system, data) {
    switch(system) {
        case "rgb":
        if(Array.isArray(data)) return 'rgb('+data[0]+','+data[1]+','+data[2]+')'; else if(typeof data =="object") return 'rgb('+data.r+','+data.g+','+data.b+')'; else return false; 
        case "hsl":
        if(Array.isArray(data)) return 'hsl('+Math.round(data[0]*360)+','+Math.round(data[1]*100)+'%,'+Math.round(data[2]*100)+'%)'; else if(typeof data =="object") return 'hsl('+data.h+','+data.s*100+'%,'+data.l*100+'%)'; else return false; 
        case "hsv":
        if(Array.isArray(data)) return 'hsv('+Math.round(data[0]*360)+','+Math.round(data[1]*100)+'%,'+Math.round(data[2]*100)+'%)'; else if(typeof data =="object") return 'hsv('+Math.round(data.h*360)+','+Math.round(data.s*100)+'%,'+Math.round(data.v*100)+'%)'; else return false; 
        case "cmyk":
        if(Array.isArray(data)) return 'cmyk('+data[0]*100+'%,'+data[1]*100+'%,'+data[2]*100+'%,'+data[3]*100+'%)'; else if(typeof data =="object") return 'cmyk('+data.c*100+'%,'+data.m*100+'%,'+data.y*100+'%,'+data.k*100+'%)'; else return false; 
        case "hwb":
        if(Array.isArray(data)) return 'hwb('+data[0]+','+Math.round(data[1]*100)+'%,'+Math.round(data[2]*100)+'%)'; else if(typeof data =="object") return 'hwb('+data.h+','+data.w*100+'%,'+data.b*100+'%)'; else return false; 
    }
}

export function HEXColorToRGB(hex, output="array") {
    hex = hex.replace("#", "");
    if(hex.length!=6 && hex.length!=3) return false;
    let result = [];
    if(hex.length==3) {
        result = hex.substring(0, 1)==hex.substring(1, 2) && hex.substring(1, 2)==hex.substring(2, 3) ? [HexToDec(hex.substring(0, 1)+hex.substring(0, 1)), HexToDec(hex.substring(1, 2)+hex.substring(1, 2)), HexToDec(hex.substring(2, 3)+hex.substring(2, 3))] : [HexToDec(hex.substring(0, 1)), HexToDec(hex.substring(1, 2)), HexToDec(hex.substring(2, 3))];
    } else result = [HexToDec(hex.substring(0, 2)), HexToDec(hex.substring(2, 4)), HexToDec(hex.substring(4, 6))];

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {r:result[0], g:result[1], b:result[2]};
        case "func":
        return 'rgb('+result[0]+','+result[1]+','+result[2]+')';
    }
}

export function RGBtoHexColor(r, g=undefined, b=undefined) {

    function RGBIndicator(red, green, blue) {
        let h = "#";

        if(red==green && green==blue && blue==red) {
            h += DecToHex(red).slice(0, -1) + DecToHex(green).slice(0, -1) + DecToHex(blue).slice(0, -1);
        } else {
            let h1 = DecToHex(red), h2 = DecToHex(green), h3 = DecToHex(blue);
            
            if(h1.length<h2.length || h1.length<h3.length) h1 = padToCounter(h1, 2);
            if(h2.length<h1.length || h2.length<h3.length) h2 = padToCounter(h2, 2);
            if(h3.length<h1.length || h3.length<h2.length) h3 = padToCounter(h3, 2);

            h += h1 + h2 + h3;
        }

        return h;
    }

    let result = [];
    if(Array.isArray(r)) {
        result = RGBIndicator(r[0], r[1], r[2]);
    } else if(typeof r=="object") {
        result = RGBIndicator(r.r, r.g, r.b);
    } else if(arguments.length==3) {
        result = RGBIndicator(r, g, b);
    } else return false;

    return result;
}

//CSS Color Module Level 4 Namespace

function getNamespaceColors(fn) {
    fetch(browser.runtime.getURL("data/colorNamespaces.json")).then(response=>response.json()).then(json=>{ json = JSON.parse(json); fn(json) });
}

export var colorNamespaces = JSON.parse('{"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#0ff","aquamarine":"#7fffd4","azure":"#f0ffff","beige":"#f5f5dc","bisque":"#ffe4c4","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887","cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff","darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkgrey":"#a9a9a9","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f","darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkslategrey":"#2f4f4f","darkturquoise":"#00ced1","darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dimgrey":"#696969","dodgerblue":"#1e90ff","firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff","gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f","grey":"#808080","honeydew":"#f0fff0","hotpink":"#ff69b4","indianred":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c","lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2","lightgray":"#d3d3d3","lightgreen":"#90ee90","lightgrey":"#d3d3d3","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightslategrey":"#778899","lightsteelblue":"#b0c4de","lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6","magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370db","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee","mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5","navajowhite":"#ffdead","navy":"#000080","oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6","palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#db7093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080","rosybrown":"#bc8f8f","royalblue":"#4169e1","saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","slategrey":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4","tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0","violet":"#ee82ee","wheat":"#f5deb3","whitesmoke":"#f5f5f5","yellow":"#ffff00","yellowgreen":"#9acd32","white":"#fff"}');

/*(function() {
    let colors = null;
    getNamespaceColors(color=>);
}());*/

export function RGBtoColorNamespace(pattern) {
    if(Array.isArray(pattern) && pattern.length==3) pattern = RGBtoHexColor(pattern).toLowerCase(); else pattern.toLowerCase();
    let equal = false;
    for(let colorNS in colorNamespaces) {
        if(colorNamespaces[colorNS]==pattern) equal = colorNS;
        console.log(colorNamespaces[colorNS]);
    }
    console.log(pattern);
    return equal ? equal : null;
}

//if(Object.keys(colorNamespaces).includes())

export function ColorNamespaceToRGB(namespace) {
    if(typeof namespace != "string" || containsANumber(namespace) || namespace.indexOf("#")!=-1) return false;
    if(Object.keys(colorNamespaces).includes(namespace)) {
        for(let colorHex in colorNamespaces) {
            if(colorHex==namespace) return colorNamespaces[colorHex];
        }
    } else return null;
}

//END CSS Color Module Level 4 Namespace

export function HSVtoRGB(h, s=undefined, v=undefined, output="array") {
    
    function HSVIndicator(hue, sat, val) {
        let r = 0, g = 0, b = 0, i, f, p, q, t;

        i = Math.floor(hue * 6);
        f = hue * 6 - i;
        p = val * (1 - sat);
        q = val * (1 - f * sat);
        t = val * (1 - (1 - f) * sat);

        switch (i % 6) {
            case 0: r = val, g = t, b = p; break;
            case 1: r = q, g = val, b = p; break;
            case 2: r = p, g = val, b = t; break;
            case 3: r = p, g = q, b = val; break;
            case 4: r = t, g = p, b = val; break;
            case 5: r = val, g = p, b = q; break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    let result = [];
    if(Array.isArray(h)) {
        result = HSVIndicator(h[0], h[1], h[2]);
    } else if(typeof h=="object") {
        result = HSVIndicator(h.h, h.s, h.v);
    } else if(arguments.length==3) {
        result = HSVIndicator(h, s, v);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {r:result[0], g:result[1], b:result[2]};
    }

}

export function RGBtoHSV(red, green=undefined, blue=undefined, output="array") {
    
    function RGBIndicator(r, g, b) {
        r = parseInt(r), g = parseInt(g), b = parseInt(b);
        let max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h, s = (max == 0 ? 0 : d/max), v = max / 255;
        console.log(typeof r, g, b);
        console.log(max);
        switch(max) {
            case min: h = 0; return [h, s, v];
            case r: h = (g - b) + d * (g < b ? 6 : 0); break;
            case g: h = (b - r) + d * 2; break;
            case b: h = (r - g) + d * 4; break;
        }

        console.log(h, s, v);

        h/= 6 * d;

        return [roundTo(h, 2), roundTo(s, 2), roundTo(v, 2)];
    }

    let result = [];
    if(Array.isArray(red)) {
        result = RGBIndicator(red[0], red[1], red[2]);
    } else if(typeof red=="object") {
        result = RGBIndicator(red.r, red.g, red.b);
    } else if(arguments.length==3) {
        result = RGBIndicator(red, green, blue);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {h:result[0], s:result[1], v:result[2]};
    }

}

export function HSLtoRGB(h, s=undefined, l=undefined, output="array") {
    
    function RGBIndicator(h, s, l) {
    if(s!=0) {
        function hueTorgb(p, q, t) {
            if(t < 0) t+=1;
            if(t > 1) t-=1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = 1 < .5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q, r, g, b;
        r = hueTorgb(p , q, h + 1/3);
        g = hueTorgb(p, q, h);
        b = hueTorgb(p, q, h - 1/3);

    } else r = g = b = l;
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
    }

    let result = [];
    if(Array.isArray(h)) {
        result = RGBIndicator(h[0], h[1], h[2]);
    } else if(typeof red=="object") {
        result = RGBIndicator(h.h, h.s, h.l);
    } else if(arguments.length==3) {
        result = RGBIndicator(h, s, l);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {r:result[0], g:result[1], b:result[2]};
        case "func":
        return 'rgb('+result[0]+','+result[1]+','+result[2]+')';
    }

}

export function RGBtoHSL(red, green=undefined, blue=undefined, output="array") {

    function HSLIndicator(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0;
        }else{
            var d = max - min;
            s = l > .5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [roundTo(h, 2), roundTo(s, 2), roundTo(l, 2)];
    }

    let result = [];
    if(Array.isArray(red)) {
        result = HSLIndicator(red[0], red[1], red[2]);
    } else if(typeof h=="object") {
        result = HSLIndicator(red.r, red.g, red.b);
    } else if(arguments.length==3) {
        result = HSLIndicator(red, green, blue);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {h:result[0], s:result[1], l:result[2]};
        case "func":
        return 'hsl('+result[0]+','+result[1]+','+result[2]+')';
    }

}

export function CMYKtoRGB(c, m=undefined, y=undefined, k=undefined, output="array") {

    function CMYKIndicator(c, m, y, k) {
        let r = 255 * (1 - c) * (1 - k);
        let g = 255 * (1 - m) * (1 - k);
        let b = 255 * (1 - y) * (1 - k); 
        return [Math.round(r), Math.round(g), Math.round(b)];
    }

    let result = [];
    if(Array.isArray(c)) {
        result = CMYKIndicator(c[0], c[1], c[2], c[3]);
    } else if(typeof c=="object") {
        result = CMYKIndicator(c.c, c.m, c.y, c.k);
    } else if(arguments.length==4) {
        result = CMYKIndicator(c, m, y, k);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {r:result[0], g:result[1], b:result[2]};
        case "func":
        return 'rgb('+result[0]+','+green+','+blue+')';
    }

}

export function RGBtoCMYK(r, g=undefined, b=undefined, output="array") {

    function RGBIndicator(r, g, b) {
        if(r==0 && g==0 && b==0) return [0, 0, 0, 1];

        let c = 1 - (r/255), m = 1 - (g/255), y = 1 - (b/255), min = Math.min(c, m, y), k = min;

        c = (c - min) / (1 - min);
        m = (m - min) / (1 - min);
        y = (y - min) / (1 - min);

        return [roundTo(c, 2), roundTo(m, 2), roundTo(y, 2), roundTo(k, 2)];
    }

    let result = [];
    if(Array.isArray(r)) {
        result = RGBIndicator(r[0], r[1], r[2]);
    } else if(typeof r=="object") {
        result = RGBIndicator(r.r, r.g, r.b);
    } else if(arguments.length==3) {
        result = RGBIndicator(r, g, b);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {c:result[0], m:result[1], y:result[2], k:result[3]};
        case "func":
        return 'cmyk('+result[0]+'%,'+result[1]+'%,'+result[2]+'%,'+result[3]+'%)';
    }

}

export function CILabtoRGB() {

}

export function RGBtoCILab() {

}

export function HWBtoRGB(h, w=undefined, b=undefined, output="array") {

    function HWBIndicator(hue, whit, blck) {
        hue = hue/360;
        whit = whit/100;
        blck = blck/100;
        let v, n, f, i;
        v = 1 - blck;
        if(!isNaN(hue)) return [v, v, v];
        i = Math.floor(hue);
        f = hue - i;
        if(i%2==0) f = 1 - f;
        n = whit + f * (v - whit);
        switch(i) {
            case 6: case 0: return [v, n, w];
            case 1: return [n, v, w];
            case 2: return [w, v, n];
            case 3: return [w, n, v];
            case 4: return [n, w, v];
            case 5: return [v, w, n];
        }
    }

    let result = [];
    if(Array.isArray(h)) {
        result = HWBIndicator(h[1], h[2], h[3]);
    } else if(typeof h=="object") {
        result = HWBIndicator(h.h, h.w, h.b);
    } else if(arguments.length==3) {
        result = HWBIndicator(h, w, b);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {r:result[0], g:result[1], b:result[2]};
        case "func":
        return 'rgb('+result[0]+','+result[1]+','+result[2]+')';
    }
}

export function RGBtoHWB(r, g=undefined, bl=undefined, output="array") {

    function RGBIndicator(red, green, blue) {
        let w, v, b, h, c;

        red/=255; green/=255; blue/=255;
        w = Math.min(red, green, blue);
        v = Math.max(red, green, blue);
        c = v - w;
        b = 1 - v;
        if(c==0) return [0, w, b]; else if(red==v) h = 360-Math.abs(((green - blue)/c)/6)*360; else if(green==v) h = ((((blue - red)/c)+2)/6)*360; else h = (Math.abs(((red - green)/c)+4)/6)*360;
        return [Math.round(h), w, b];
    }

    let result = [];
    if(Array.isArray(r)) {
        result = RGBIndicator(r[0], r[1], r[2]);
    } else if(typeof r=="object") {
        result = RGBIndicator(r.r, r.g, r.b);
    } else if(arguments.length==3) {
        result = RGBIndicator(r, g, bl);
    } else return false;

    switch(output) {
        case "array":
        default:
        return result;
        case "object":
        return {h:result[0], w:result[1], b:result[2]};
        case "func":
        return 'hwb('+result[0]+','+result[1]+'%,'+result[2]+'%)';
    }

}

export function uniFormat(allColorFormatType) {
    if(allColorFormatType.indexOf("#")==0 && (allColorFormatType.length==4 || allColorFormatType.length==7)) {
        return allColorFormatType;
    } else if(allColorFormatType.indexOf("rgb")!=-1) {
        allColorFormatType = allColorFormatType.match(new RegExp('[0-9]*\\.?[0-9]*', "g")).filter((val)=>{
            return val != "";
        });
        return "#"+padToCounter(DecToHex(allColorFormatType[0]), 2)+padToCounter(DecToHex(allColorFormatType[1]), 2)+padToCounter(DecToHex(allColorFormatType[2]), 2);
    } else if(allColorFormatType.indexOf("cmyk")!=-1) {
        allColorFormatType = allColorFormatType.match(new RegExp('[0-9]*\\%', "g")).filter(()=>{
            return el != "";
        });
        allColorFormatType[0] /= 100;
        allColorFormatType[1] /= 100;
        allColorFormatType[2] /= 100;
        allColorFormatType[3] /= 100;
        allColorFormatType = CMYKtoRGB(allColorFormatType);
        return "#"+DecToHex(allColorFormatType[0])+DecToHex(allColorFormatType[1])+DecToHex(allColorFormatType[2]);
    }
}

export class ColorConverter {
    constructor() {
        this.lastConverts = [];
        this.lastConvertionId = 0;
        this.allowCopy = true;
    }

    convertTo(pattern, to, from=false) {
        
    }

    convertAllTo(pattern) {
        let RGBformat = [], HEXformat = "", HSVformat = [], HSLformat = [], HWBformat=[], CMYKformat=[], NSformat="";
        
        //Check General RGB
        if(isVaildJSON(pattern) && typeof JSON.parse(pattern)[r] != "undefined" &&  typeof JSON.parse(pattern)[g] != "undefined" &&  typeof JSON.parse(pattern)[b] != "undefined") {
            RGBformat = JSON.parse(pattern);
            RGBformat = [RGBformat.r, RGBformat.g, RGBformat.b];
        } else if(typeof pattern=="string" && pattern.indexOf("rgb")!=-1) {
            RGBformat = pattern.replace("rgb", "").replace("(", "").replace(")", "").replace(/\s/g, "");
            RGBformat = RGBformat.split(",");
        }

        //Check other for pattern && rgb conversion
        if(pattern.indexOf("#")==0 && (pattern.length==4 || pattern.length==7)) { //pattern.match(/\,/g).filter(v=>v!="").length==3
            HEXformat = pattern;
            if(RGBformat.length==0) {
                RGBformat = HEXColorToRGB(HEXformat);
            }
        }

        if(!containsANumber(pattern) && pattern.indexOf("#")==-1) {
            console.log("wtf");
            NSformat = pattern;
            if(RGBformat.length==0) {
            RGBformat = HEXColorToRGB(ColorNamespaceToRGB(pattern));
            }
        }

        if(isVaildJSON(pattern) && typeof JSON.parse(pattern)[h] != "undefined" &&  typeof JSON.parse(pattern)[s] != "undefined" &&  typeof JSON.parse(pattern)[l] != "undefined") {
            HSLformat = JSON.parse(pattern);
            HSLformat = [HSLformat[0], HSLformat[1], HSLformat[2]];
            if(RGBformat.length==0) {
                RGBFormat = HSLtoRGB(HSLformat);
            }
        } else if(typeof pattern=="string" && pattern.indexOf("hsl")!=-1) {
            HSLformat = pattern.replace("hsl", "").replace("(", "").replace(")", "").replace(/\%/g, "").replace(/\s/g, "");
            HSLformat = HSLformat.split(",");
            HSLformat[0] /= 360; HSLformat[1] /= 100; HSLformat[2] /= 100;
            if(RGBformat.length==0) {
                RGBformat = HSLtoRGB(HSLformat);
            }
        }

        if(isVaildJSON(pattern) && typeof JSON.parse(pattern)[h] != "undefined" &&  typeof JSON.parse(pattern)[s] != "undefined" &&  typeof JSON.parse(pattern)[v] != "undefined") {
            HSVformat = JSON.parse(pattern);
            HSVformat = [HSVformat[0], HSVformat[1], HSVformat[2]];
            if(RGBformat.length==0) {
                RGBFormat = HSVtoRGB(HSVformat);
            }
        } else if(typeof pattern=="string" && pattern.indexOf("hsv")!=-1) {
            HSVformat = pattern.replace("hsv", "").replace("(", "").replace(")", "").replace(/\%/g, "").replace(/\s/g, "");
            HSVformat = HSVformat.split(",");
            HSVformat[0] /= 360; HSVformat[1] /= 100; HSVformat[2] /= 100;
            if(RGBformat.length==0) {
                RGBformat = HSVtoRGB(HSVformat);
            }
        }

        if(isVaildJSON(pattern) && typeof JSON.parse(pattern)[c] != "undefined" &&  typeof JSON.parse(pattern)[m] != "undefined" &&  typeof JSON.parse(pattern)[y] != "undefined" && typeof JSON.parse(pattern)[k] != "undefined") {
            CMYKformat = JSON.parse(pattern);
            CMYKformat = [CMYKformat[0], CMYKformat[1], CMYKformat[2], CMYKformat[3]];
            if(RGBformat.length==0) {
                RGBFormat = CMYKtoRGB(CMYKformat);
            }
        } else if(typeof pattern=="string" && pattern.indexOf("cmyk")!=-1) {
            CMYKformat = pattern.replace("cmyk", "").replace("(", "").replace(")", "").replace(/\%/g, "").replace(/\s/g, "");
            CMYKformat = CMYKformat.split(",").map(v=>v/100);
            if(RGBformat.length==0) {
                RGBformat = CMYKtoRGB(CMYKformat);
            }
        }

        if(isVaildJSON(pattern) && typeof JSON.parse(pattern)[h] != "undefined" &&  typeof JSON.parse(pattern)[w] != "undefined" &&  typeof JSON.parse(pattern)[b] != "undefined") {
            HWBformat = JSON.parse(pattern);
            HWBformat = [HWBformat[0], HWBformat[1], HWBformat[2]];
            if(RGBformat.length==0) {
                RGBFormat = HWBtoRGB(HWBformat);
            }
        } else if(typeof pattern=="string" && pattern.indexOf("hwb")!=-1) {
            HWBformat = pattern.replace("hwb", "").replace("(", "").replace(")", "").replace(/\%/g, "").replace(/\s/g, "");
            HWBformat = HWBformat.split(",");
            if(RGBformat.length==0) {
                RGBFormat = HWBtoRGB(HWBformat);
            }
        }

        //Check to Conversion Targets
        if(HEXformat=="") HEXformat = RGBtoHexColor(RGBformat);
        if(NSformat=="") { NSformat = RGBtoColorNamespace(RGBformat) || "Color is not avaible in namespace"; }
        if(HSLformat.length==0) HSLformat = RGBtoHSL(RGBformat);
        if(HSVformat.length==0) HSVformat = RGBtoHSV(RGBformat);
        if(CMYKformat.length==0) CMYKformat = RGBtoCMYK(RGBformat);
        if(HWBformat.length==0) HWBformat = RGBtoHWB(RGBformat);

        return {"rgb":toColorModelFunction("rgb",RGBformat), "hex":HEXformat,"hsv":toColorModelFunction("hsv",HSVformat), "hsl":toColorModelFunction("hsl",HSLformat),"cmyk":toColorModelFunction("cmyk",CMYKformat), "hwb":toColorModelFunction("hwb",HWBformat), "namespace":NSformat}; //convertedList
    }

    convertMultipleColors(pattern) {
        let arrOfResult = [], tempId = this.lastConvertionId;
        pattern = pattern.split(";");
        for(let i = 0;i<pattern.length;i++) {
            arrOfResult.push(this.convertAllTo(pattern[i]));
            this.lastConverts.push({id: tempId,convertsList:arrOfResult[i], date:new Date()});
        }
        return arrOfResult;
    }
}