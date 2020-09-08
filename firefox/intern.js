var defaultCSS = document.createElement("link"); 
defaultCSS.rel = "stylesheet";
defaultCSS.href = "default.css";
document.head.appendChild(defaultCSS);

var lastLength = 0, locked = false;

window.addEventListener("load", (evt)=>{
window.addEventListener("DOMSubtreeModified", (evt)=>{

    if(!locked) {
    locked = true;
    var multipleInputs = document.querySelectorAll('input[type=range][multiple]');
      if(lastLength!=multipleInputs.length) {
        for(let nodeEl of multipleInputs) {
          if(nodeEl.getAttribute('data-values')!==null) {
          var multipleInputsValues = nodeEl.getAttribute('data-values').split(' ');
          nodeEl.removeAttribute('data-values');
          multipleInputsValues.forEach((val, ind, arr)=>{
              let cloned = nodeEl.cloneNode();
              cloned.setAttribute("value", val);
              nodeEl.parentNode.insertBefore(cloned, nodeEl.nextSibling);
          });
          nodeEl.parentNode.removeChild(nodeEl);
        }
        }

        lastLength = multipleInputs.length;
        locked = false;
    }
    }

});
});