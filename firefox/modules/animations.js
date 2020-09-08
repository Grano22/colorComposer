import { crc32 } from "./parsingData.mjs";

export class HTMLAnimationElement extends HTMLElement {
    constructor() {
        super();


    }
}

customElements.define("animation-playground", HTMLAnimationElement); //, options

export class AnimationDefinition {
    constructor(name, id, body, styles=[], defaultEl=undefined,frames=[]) {
        this.name = name;
        this.id = id;
        this.body = body;
        this.styles = styles;
        this.frames = frames;

        this.elements = [];
        this.totalElementsCount = 0;
        this.elementAnimation = null;
    }

    createAnimationNode() {
        this.elementAnimation = document.createElement("animation-playground");
        this.elementAnimation.id = this.id;  // ? this.id : document.getElementsByTagName("animation-playground").length;
        let allStylesData = (function(){
          let obj = [], styleNodes = document.getElementsByClassName("animation-style");
          if(styleNodes===null) return []; 
          for(let i = 0;i<styleNodes.length;i++) {
            obj[i] = styleNodes[i].tagName=="STYLE" ? crc32(styleNodes[i].textContent) : crc32(styleNodes[i].href); ///*{id:styleNodes[i].id,checksum:(*/))};
          }
          return obj;
        }());
            for(let i = 0;i<this.styles.length;i++) {
                if(this.styles[i].trim().lastIndexOf(".css")==(this.styles[i].trim().length-4)) {
                    
                    if(!allStylesData.includes(crc32(this.styles[i]))) {
                    let styleLink = document.createElement("link");
                    styleLink.id = this.id+"-style"+i;
                    styleLink.className = "animation-style";
                    styleLink.rel = "stylesheet";
                    styleLink.type = "text/css";
                    styleLink.href = this.styles[i].trim();
                    this.elementAnimation.innerHTML += styleLink.outerHTML;
                    }
                    
                } else {

                    if(!allStylesData.includes(crc32(this.styles[i].trim()))) {
                    let styleEl = document.createElement("style");
                    styleEl.id = this.id+"-style"+i;
                    styleEl.className = "animation-style";
                    //styleEl.setAttribute("id-unique", "");
                    styleEl.type = "text/css";
                    styleEl.innerHTML = this.styles[i];
                    this.elementAnimation.innerHTML += styleEl.outerHTML;
                    }
                }
            }
        this.elementAnimation.innerHTML += this.body;
        return this.elementAnimation;
    }

    toString() {
      console.log(this.createAnimationNode().outerHTML);
        return this.createAnimationNode().outerHTML;
    }

    appendTo(element) {
       element.parentNode.appendChild(this.createAnimationNode());
    }
}

export function AnimationElement(objorname, body="", styles="", other=undefined, template=undefined) {

    if(typeof window.localStorage.getItem("animation-playgrounds")=="undefined") window.localStorage.setItem("animation-playgrounds", 0);

    let AnimationDef = null, newobj= {};

    function getAnimationTemplate(templateName) {
        if(Object.keys(AnimationTemplates).includes(templateName)) {
            return AnimationTemplates[templateName];
        } else return {};
    }

    if(typeof objorname=="object") {
          
        if(typeof objorname.template!="undefined") newobj = Object.assign(objorname, getAnimationTemplate(objorname.template)); else newobj = objorname;
        newobj.body = objorname.body ? objorname.body : (newobj.body ? newobj.body : "");
        newobj.styles = objorname.styles ? objorname.styles : (Array.isArray(newobj.styles) ? newobj.styles : []);
        if(typeof objorname.frames!=undefined && Array.isArray(objorname.frames))  newobj.frames = objorname.frames;
        newobj.id = objorname.id ? objorname.id.replace("{{currentId}}", window.localStorage.getItem("animation-playgrounds")) : (newobj.id.replace("{{currentId}}", window.localStorage.getItem("animation-playgrounds")) ? newobj.id : objorname.name+window.localStorage.getItem("animation-playgrounds"));
        if(typeof objorname.element!=undefined && objorname.element instanceof HTMLElement) newobj.element = objorname.element;

    } else {

        if(typeof template!="undefined") newobj = Object.assign(objorname, getAnimationTemplate(template)); else newobj = objorname;
        newobj.body = body ? body : (newobj.body ? newobj.body : "");
        newobj.styles = styles ? styles : (Array.isArray(newobj.styles) ? newobj.styles : []);
        if(typeof other=="object") {
            newobj.id = other.id ? other.id.replace("{{currentId}}", window.localStorage.getItem("animation-playgrounds")) : objorname+window.localStorage.getItem("animation-playgrounds");
            if(typeof other.element!=undefined && other.element instanceof HTMLElement) newobj.element = other.element;
            if(typeof other.frames!=undefined && Array.isArray(other.frames)) newobj.frames = other.frames;
        }

    }

    if(typeof newobj.name=="undefined") return false; 

    AnimationDef = new AnimationDefinition(newobj.name, newobj.id, newobj.body, newobj.styles, newobj.frames);

    if(newobj.element) AnimationDef.appendTo(newobj.element);

    let lastNumber = parseInt(window.localStorage.getItem("animation-playgrounds"));
    window.localStorage.setItem("animation-playgrounds", lastNumber++);

    return AnimationDef;
}

const AnimationTemplates = { 
  spinnerBalls:{
    name:"Spinner Balls",
    id:"spinnerballs{{currentId}}",
    type:"static",
    body:`<div class="spinner">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
    </div>`,
    styles:[`.spinner {
        margin: 5px auto 0;
        width: 70px;
        text-align: center;
      }
      
      .spinner > div {
        width: 18px;
        height: 18px;
        background-color: #333;
      
        border-radius: 100%;
        display: inline-block;
        -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      }
      
      .spinner .bounce1 {
        -webkit-animation-delay: -0.32s;
        animation-delay: -0.32s;
      }
      
      .spinner .bounce2 {
        -webkit-animation-delay: -0.16s;
        animation-delay: -0.16s;
      }
      
      @-webkit-keyframes sk-bouncedelay {
        0%, 80%, 100% { -webkit-transform: scale(0) }
        40% { -webkit-transform: scale(1.0) }
      }
      
      @keyframes sk-bouncedelay {
        0%, 80%, 100% { 
          -webkit-transform: scale(0);
          transform: scale(0);
        } 40% { 
          -webkit-transform: scale(1.0);
          transform: scale(1.0);
        }
      }`]
  }
}