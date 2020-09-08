export class rangeRGBColorChooser {
	
	constructor(enableAlpha=false) {
		
		//Range Choose Container
		let rangeChooserContainer = document.createElement("div");
		rangeChooserContainer.className = "colorChooser-range-rgb";
		rangeChooserContainer.id = "colorChooser-range-rgb";
			//Range Choose In
			let rangeChooserIn = document.createElement("div");
			rangeChooserIn.className = "colorChooser-in";
				
				//Range
				var rangeR = document.createElement("input"), rangeG = document.createElement("input"), rangeB = document.createElement("input");
				rangeR.type = rangeG.type = rangeB.type = "range";
				rangeR.min = rangeG.min = rangeB.min = 0;
				rangeR.value = rangeG.value = rangeB.value = 0;
				rangeR.max = rangeG.max = rangeB.max = 255;
				//Range R
				rangeR.id = "red";
				rangeR.className = "flat";
				rangeR.style.backgroundImage = 'linear-gradient(to right, #000000, #ff0000)';
				//rangeR.onchange = (evt)=>{ rangeRGBColorChooser.updateColorState(evt, peviewBox); }
				//Range G
				rangeG.id = "green";
				rangeG.className = "flat";
				rangeG.style.backgroundImage = 'linear-gradient(to right, #000000, #00ff00)';
				//rangeG.onchange = (evt)=>{ rangeRGBColorChooser.updateColorState(evt, peviewBox); }
				//Range B
				rangeB.id = "blue";
				rangeB.className = "flat";
				rangeB.style.backgroundImage = 'linear-gradient(to right, #000000, #0000ff)';
				//rangeB.onchange = (evt)=>{ rangeRGBColorChooser.updateColorState(evt, peviewBox); }
				
				rangeChooserIn.appendChild(rangeR);
				rangeChooserIn.appendChild(rangeG);
				rangeChooserIn.appendChild(rangeB);
				
				//Range A
				if(enableAlpha) {
					var rangeA = document.createElement("input");
					rangeA.type = "range";
					rangeA.className = "oldstyled";
					rangeA.id = "alpha";
					rangeChooserIn.appendChild(rangeA);
				}

				//rangeChooserIn.appendChild(previewBox);
			rangeChooserContainer.appendChild(rangeChooserIn);
			//End Range Choose In
		this.container = rangeChooserContainer;
		this.enableAlpha = enableAlpha;
		this.savedLastColor = enableAlpha ? "rgba(0, 0, 0, 1)" : "rgb(0, 0, 0)";
	}
	
	addChangeEvent(val, color, updateContainer) {
		let previousParam = window.localStorage.getItem("pickedCurrentColor") || undefined;
			if(this.enableAlpha) {
			if(typeof previousParam=="undefined") { if(typeof updateContainer.style.background == "string" && updateContainer.style.background.indexOf("rgba")!=-1) previousParam = updateContainer.style.background; else previousParam = "rgba(0,0,0,1)"; }
			
			var parsedRGBparam = previousParam.match(new RegExp('[0-9]*\\.?[0-9]*', "g"));
			parsedRGBparam = parsedRGBparam.filter(function (el) {
				return el != "";
}			);
			if(parsedRGBparam.length<4) return false;
			switch(color) {
				case "red": parsedRGBparam[0] = val; break;
				case "green": parsedRGBparam[1] = val; break;
				case "blue": parsedRGBparam[2] = val; break;
				case "alpha":  parsedRGBparam[3] = val; break;
			}
			updateContainer.style.background = 'rgba('+parsedRGBparam[0]+','+parsedRGBparam[1]+','+parsedRGBparam[2]+','+parsedRGBparam[3]+')';

			} else {
			if(typeof previousParam=="undefined") { if(typeof updateContainer.style.background == "string" && updateContainer.style.background.indexOf("rgb")!=-1) previousParam = updateContainer.style.background; else previousParam = "rgb(0,0,0)"; }
			
			var parsedRGBparam = previousParam.match(new RegExp('[0-9]*\\.?[0-9]*', "g"));
			parsedRGBparam = parsedRGBparam.filter(function (el) {
				return el != "";
}			);
			if(parsedRGBparam.length<3) return false;
			switch(color) {
				case "red": parsedRGBparam[0] = val; break;
				case "green": parsedRGBparam[1] = val; break;
				case "blue": parsedRGBparam[2] = val; break;
			}
			updateContainer.style.background = 'rgb('+parsedRGBparam[0]+','+parsedRGBparam[1]+','+parsedRGBparam[2]+')';
			updateContainer.childNodes[1].innerHTML = 'rgb(<span id="r_param" contenteditable>'+parsedRGBparam[0]+'</span>,<span id="g_param" contenteditable>'+parsedRGBparam[1]+'</span>,<span id="b_param" contenteditable>'+parsedRGBparam[2]+'</span>)';;
			}
			window.localStorage.setItem("pickedCurrentColor", updateContainer.style.background);
			if(parseInt(parsedRGBparam[0])<100 || parseInt(parsedRGBparam[1])<100 || parseInt(parsedRGBparam[2])<100) updateContainer.childNodes[1].className = "lighty"; else updateContainer.childNodes[1].className = "";
	}	

	generate() {
		return this.container;
	}
	
	generateAsString() {
		return this.container.outerHTML;
	}
}