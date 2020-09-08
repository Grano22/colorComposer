import storageMng from './modules/storage.mjs';

export class Pallete {
	constructor(menager) {
		//Pallete Menager
		this.menager = menager;
		//Pallete Data
		this.name = "Unnamed";
		this.id = null;
		this.decscription = "Undescripted";
		this.length = 0;
	}


}

export class PalleteMenager {
	constructor(palletes=[]) {
		this.standardPalletes = [];
		this.palletes = palletes;
		this.buildInPallete = [];
		this.localPalletes = [];
		this.openedSelector = false;
	}

	addPallete(type, source, name=undefined, palleteType="standard") {
		return new Promise((resolve, reject)=>{
		let newpallete = new ColorPallete(this, palleteType), cntx = this;
		console.log(this);
		newpallete.onLoad = function() {
			if(typeof name!="undefined") newpallete.name = name;
			newpallete.id = "pallete"+cntx.palletes.length;
			//this.palletes.push(newpallete);
			resolve(newpallete, cntx.palletes);
		};
		newpallete.load(type, source);
		});
	}

	forEach(fn) {
		this.palletes.forEach((val, ind, arr)=>{
			fn(val, ind, arr);
		});
	}

	makeJSON(name, ungrouped=[], grouped=[],des="") {
		let preparedObj = {name:name, categories:[]};
		if(Array.isArray(grouped) && grouped.length>0) {
			grouped.forEach(val=>preparedObj.categories.push({caption:val.caption, list:val.list}));
		}
		if(Array.isArray(ungrouped) && ungrouped.length>0) {
			ungrouped.forEach(val=>preparedObj.categories.push({name:val.name,content:val.content}));
		}
		return JSON.stringify(preparedObj);
	}
}

export class ColorPalleteMenager extends PalleteMenager {
	constructor(palletes) {
		super(palletes);
	}

	addNewUserPallete(type, name, source, fn, typeStorage="sync") {
		this.addPallete(type, source, name).then(newpal=>{
		browser.storage[typeStorage].get().then(obj=>{
			if(typeof obj.savedPalletes=="undefined") obj.savedPalletes = new Array();
			obj.savedPalletes.push(newpal.toDataObj());
			obj.lastSavedPallete = obj.savedPalletes[obj.savedPalletes.length-1];
			browser.storage[typeStorage].set(obj).then(()=>{fn(obj); this.loadAllUserPalletes();});
		});
		});
	}
	
	getUserPaleteByName(name, fn) {
		browser.storage.sync.get(['savedPalletes'], res=>{
			for(let pallete in res.savedPalletes) {
				if(typeof name == "string" && res.savedPalletes[pallete].name==name) {
					fn(res.savedPalletes[pallete], pallete, res.savedPalletes);
				} else if(isFinite(name) && pallete==name) {
					fn(res.savedPalletes[pallete], pallete ,res.savedPalletes);
				}
			}
		})
	}

	getAllUserPalletes() {
		return new Promise((resolve, reject)=>{
			try {
				browser.storage.sync.get(['savedPalletes']).then(res=>{
					console.log(res)
					if(typeof res.savedPalletes!="undefined") resolve(res.savedPalletes); else throw "Pallete stack not exist";
				});
			} catch(e) {
				reject(e);
			}

		});
	}

	syncUserPallete(fn, customArr=undefined) { //newArr, 
		return new Promise((resolve, reject)=>{
		if(typeof customArr=="undefined") customArr = this.palletes;
		browser.storage.sync.set({savedPalletes:customArr, lastSavedPallete:customArr[customArr.length - 1]}).then(resolve(), reject());
		browser.storage.local.get().then(obj=>console.log(obj));
		});
	}

	addNewColorToUserPallete(inputType,input, colorName, colorHex) {
		return new Promise((resolve, reject)=>{
		browser.storage.sync.get().then(res=>{ //['savedPalletes']
			for(let pal of res.savedPalletes) { if(pal[inputType]==input) pal.colorGrouped[input].list.push({name:colorName, content:colorHex}); else if(inputType=="name" && input=="ungrouped") pal.colorUngrouped.push({name:colorName, content:colorHex});  }
			browser.storage.sync.set(res);
		});
		});
	}

	removePallete(name) {
		for(let i = 0;i<this.palletes.length;i++) {
			if(!isNan(name) && this.palletes[i].name==name) {
				this.palletes.splice(i, 1);
			} else if(isFinite(name) && name==i) {
				this.palletes.splice(i, 1);
			}
		}
	}

	removeUserPallete(name) {
		return new Promise((resolve, reject)=>{
		browser.storage.sync.get(['savedPalletes'], (res)=>{
			let arrnew = res.savedPalletes;
			arrnew.forEach((val, ind, arr)=>{
				if(val.name==name) {
					arr.splice(ind, 1);
				} else if(isFinite(name) && ind==name) {
					arr.splice(ind, 1);
				} else { reject(); return false; }
			});
			browser.storage.sync.set({savedPalletes:arrnew}).then(()=>{resolve(); this.loadAllUserPalletes();}, ()=>reject());
		});
		});
	}

	updateUserPallete(nameorid, newdata) {
		return new Promise((resolve, reject)=>{
		browser.storage.sync.get().then(res=>{ //['savedPalletes']
			console.log(res);
			for(let palname in res.savedPalletes) {
				if(typeof nameorid == "string" && nameorid==res.savedPalletes[palname].name || isFinite(nameorid) && nameorid==palname) { //res.savedPalletes[palname].id
					res.savedPalletes[palname] = Object.assign(res.savedPalletes[palname], newdata);
					console.log(res.savedPalletes[palname]);
					browser.storage.sync.set(res).then(()=>{resolve();}, ()=>{reject();});
					return true;
				}
			}
			//reject();
			return false;
		});
		});
	}
	
	changeUserPalleteColor(palName, colName, colValue) {
		this.getUserPaleteByName(palName, (fet, ind, all)=>{
			for(let color in fet.colorUngrouped) {
				if(color.name==colName) {
					all[ind] = {name:color.name,content:colValue};
					this.syncUserPallete(all);
				}
			}
		});
	}

	loadAllUserPalletes(storageType="sync") {
		browser.storage[storageType].get(['savedPalletes']).then(res=>{
			this.palletes = [];
			res.savedPalletes.forEach(val=>{
				this.palletes.push(Object.assign(new ColorPallete(this, "user", {pushInto:false}), val));
			});
			console.log(this.palletes);
		});
	}

	invokePalleteSelector(btn, api={formType:"save", predefinedName:true}) {
		if(this.openedSelector) return false;
		api = Object.assign({formType:"save", predefinedName:true}, api);
		let selectorContainer = document.createElement("div"), selectorSearchfield = document.createElement("input"), selectorDatalist = document.createElement("datalist") ,selectorPalleteList = document.createElement("div"), confirmBtn = document.createElement("input"), cancelBtn = document.createElement("input"), inContainer = document.createElement("div");
		selectorContainer.id = "palleteSelector";
		let rect = btn.getBoundingClientRect();
		selectorContainer.style.left = (Math.round(rect.x) - (200 - btn.offsetWidth)/2)+"px"; selectorContainer.style.top = (Math.round(rect.y) + btn.offsetHeight)+"px"; // + (800 - btn.offsetWidth)
		console.log(btn.offsetWidth);
		let theme = document.createElement("link");
		theme.rel = "stylesheet";
		theme.type = "text/css";
		theme.href = "./Themes/contextPalleteSelectorLight.css";
		selectorContainer.appendChild(theme);
		//selectorContainer.innerHTML = '<input type="search" id="searchFieldPalletes" list="userPalletesDatalist"><datalist id="userPalletesDatalist"></datalist><div id="userPalletesList"></div>';
			if(typeof api.predefinedName != "undefined" && api.predefinedName) {
			let selectorNameField = document.createElement("input");
			selectorNameField.type = "text";
			selectorNameField.id = "nameFieldNewPallete";
			if(typeof api.name=="string") selectorNameField.value=api.name;
			selectorNameField.setAttribute("placeholder", browser.i18n.getMessage("PalleteSelectorNameInputPlaceholder"));
			selectorContainer.appendChild(selectorNameField);
			}
			selectorSearchfield.type = "search";
			selectorSearchfield.id = "searchFieldPalletes";
			selectorSearchfield.setAttribute("list", "userPalletesDatalist");
			selectorSearchfield.setAttribute("placeholder", browser.i18n.getMessage("PalleteSelectorSearchInputPlaceholder"));
			selectorContainer.appendChild(selectorSearchfield);
			
			selectorDatalist.id = "userPalletesDatalist";

			selectorPalleteList.id = "userPalletesList";
			inContainer.className = "in"; inContainer.id = "userPalletesListIn";
			selectorPalleteList.appendChild(inContainer);

			if(this.palletes.length>0) {
			this.palletes.forEach(val=>{
				let tempOption = document.createElement("option"), tempListItem = document.createElement("span"), checkBox = document.createElement("input");
				tempOption.value = val.name;
				tempListItem.className = "palleteSelectionItem";
				tempListItem.innerHTML = '<h3>'+val.name+'</h3>'+(typeof val.description != "undefined" ? val.decscription : browser.i18n.getMessage("noDescriptionWord"));
				tempListItem.childNodes[tempListItem.childNodes.length-1].checked = false;
				checkBox.type = "checkbox";
				checkBox.className = "colorPalleteCheck";
				tempListItem.appendChild(checkBox);
				tempListItem.onclick = ()=>{ 
					if(tempListItem.selected=false) {
					tempListItem.classList.add("selectedItem"); 
					tempListItem.childNodes[tempListItem.childNodes.length-1].checked = true;
					} else {
					tempListItem.classList.remove("selectedItem");
					tempListItem.childNodes[tempListItem.childNodes.length-1].checked = false;
					}
				}
				selectorDatalist.appendChild(tempOption);
				inContainer.appendChild(tempListItem);
			});
			} else { let tempListItem = document.createElement("span"); tempListItem.id = "palleteSelectorItemInformation"; tempListItem.innerHTML = "No user Palletes"; selectorPalleteList.appendChild(tempListItem); }

			//UngroupedBuildedInPlalete

			selectorContainer.appendChild(selectorDatalist); selectorContainer.appendChild(selectorPalleteList);

			confirmBtn.id = "confirmSelectorBtn";
			confirmBtn.type = "submit";
			confirmBtn.value = browser.i18n.getMessage("PalleteSelectorSaveBtn");
			confirmBtn.onclick = evt=>{
				this.addNewColorToUserPallete("name", evt.target.getAttribute("data-selection") , api.colorName , api.colorValue).then();
			}

			cancelBtn.id = "cancelSelectorBtn";
			cancelBtn.type = "button";
			cancelBtn.value = browser.i18n.getMessage("PalleteSelectorCancelBtn");
			cancelBtn.onclick = evt=>{cancelBtn.parentNode.remove(); this.openedSelector=false;}

			selectorContainer.appendChild(cancelBtn);
			selectorContainer.appendChild(confirmBtn);
			btn.parentNode.insertBefore(selectorContainer, btn);
			this.openedSelector = true;
	}

	//Editor
	generateEventsForPalleteField(id, discardCancelMode=false, updateMode=false) {
		if(discardCancelMode) {
		document.getElementById(`discardPallete${id}`).onclick = ()=>{
			let currContext = document.getElementById(`colorPallete${id}`);
			currContext.childNodes[0].removeAttribute("contenteditable");
			currContext.childNodes[1].innerHTML = `<span id="editPallete${id}" title="Edit"><img src="../images/edit_icon.png" data-entities="&#10001;"></span><span id="deletePallete${id}" title="Delete"><img src="../images/trash_icon.png" data-entities="&#8629;"></span><span id="exportPallete${id}" title="Export JSON"><img src="../images/json_export_icon.png" data-entities="&#8629;"></span>`;
			if(currContext.hasChildNodes()) {
				for(let nod of currContext.childNodes) {
					if(nod.className=="middle" || nod.tagName=="LEGEND") {
						nod.removeAttribute("contenteditable");
					} else if(nod.tagName=="FIGURE") {
						nod.childNodes[0].removeAttribute("contenteditable");
						nod.childNodes[1].removeAttribute("contenteditable");
					}
				}
			}
			this.generateEventsforEditableField(id);
		}
		} else {
		document.getElementById(`discardPallete${id}`).onclick = ()=>{
			document.getElementById(`colorPallete${id}`).remove();
		}
		}

		if(updateMode) {
			document.getElementById(`savePallete${id}`).onclick = evt=>{
			let inBoxNotification = document.createElement("div"), palleteNode = document.getElementById(`colorPallete${id}`), closeBtnForAlert = document.createElement("span");
			this.updateUserPallete(`${id}`, this.fieldsetToObj(document.getElementById(`colorPallete${id}`))).then(()=>{
				
				inBoxNotification.className = "positiveAlertBox";
				inBoxNotification.innerHTML = '<h4>Udało się nadpisać paletę kolorów</h4> Zapisano zmiany';
					closeBtnForAlert.class = "closeBtn";
					closeBtnForAlert.innerHTML = '&times;';
					closeBtnForAlert.onclick = ev=>ev.target.parentNode.remove();
				inBoxNotification.appendChild(closeBtnForAlert);
				document.getElementById(`colorPallete${id}`).parentNode.appendChild(inBoxNotification);
				document.getElementById(`colorPallete${id}`).remove();
				this.loadAllUserPalletes();
				setTimeout(()=>this.generatePalleteStack(document.getElementById("userPalletes-colorGroup")), 500);
			}).catch(()=>console.log("error"));
			}
		} else {
		document.getElementById(`savePallete${id}`).onclick = evt=>{
			let palleteName = document.querySelector(`fieldset#colorPallete${id} legend`).textContent; 
			
			if(palleteName=="Untitled") { alert("Palletw must be titled"); return false; }
			//Delete editable field signs
			document.getElementById(`addNewColorToPallete${id}`).remove();
			this.addNewUserPallete("object", palleteName, this.fieldsetToObj(document.getElementById(`colorPallete${id}`)), ()=>{
				let inBoxNotification = document.createElement("div"), palleteNode = document.getElementById(`colorPallete${id}`), closeBtnForAlert = document.createElement("span");
				inBoxNotification.className = "positiveAlertBox";
				inBoxNotification.innerHTML = '<h4>Udało się zapisać nową paletę kolorów</h4> Paletę kolorów zapisano w chmurze';
					closeBtnForAlert.class = "closeBtn";
					closeBtnForAlert.innerHTML = '&times;';
					closeBtnForAlert.onclick = ev=>ev.target.parentNode.remove();
				inBoxNotification.appendChild(closeBtnForAlert);
				//palleteNode.parentNode.replaceChild(palleteNode ,inBoxNotification);
				palleteNode.parentNode.appendChild(inBoxNotification);
				palleteNode.remove();
				browser.storage.local.get().then((all)=>console.log(all));
				this.loadAllUserPalletes();
				setTimeout(()=>this.generatePalleteStack(document.getElementById("userPalletes-colorGroup")), 500);
			});
			
		}
		}

		if(document.getElementById(`addNewColorToPallete${id}`)!=null) {
		document.getElementById(`addNewColorToPallete${id}`).onclick = (evt)=>{
			const cid = document.getElementsByClassName("colorItemInPallete").length || 0, newColorToItem =  `<figure id="colorItemInPallete${cid}" class="minpreview colorItemInPallete"><div id="colorPreviewCode${cid}" class="previewBox" style="background-color:#0fe;" contenteditable>#0fe</div><figcaption id="colorCaption${cid}" contenteditable>Untitled</figcaption></figure>`;
			document.getElementById(`addNewColorToPallete${id}`).insertAdjacentHTML("beforebegin", newColorToItem);
			document.getElementById(`colorPreviewCode${cid}`).onkeyup = (ev)=>{
				ev.target.style.backgroundColor = ev.target.textContent;
				console.log(ev.target.textContent);
			}
		}
		}
	}

	generateEventsforEditableField(id) {
		document.getElementById(`editPallete${id}`).onclick = evt=>{
			let currContext = document.getElementById(`colorPallete${id}`);
			currContext.childNodes[0].setAttribute("contenteditable", "true");
			currContext.childNodes[1].innerHTML = `<span id="savePallete${id}" title="Save"><img src="../images/save_icon.png" data-entities="&#x1F4BE;"></span><span id="discardPallete${id}" title="Discard"><img src="../images/discard_icon.png" data-entities="&times;"></span>`;
			if(currContext.hasChildNodes()) {
				for(let nod of currContext.childNodes) {
					if(nod.className=="middle" || nod.tagName=="LEGEND") {
						nod.setAttribute("contenteditable", "true");
					} else if(nod.tagName=="FIGURE") {
						nod.childNodes[0].setAttribute("contenteditable", "true");
						nod.childNodes[1].setAttribute("contenteditable", "true");
					}
				}
			}
			this.generateEventsForPalleteField(id, true, true);
		}

		document.getElementById(`deletePallete${id}`).onclick = evt=>{
			let anwser = confirm("Do you really dellete this pallete?");
			if(!anwser) return false;
			this.removeUserPallete(document.getElementById(`colorPallete${id}`).childNodes[0].textContent).then(()=>{
				document.getElementById("userPalletes-colorGroup").insertAdjacentHTML('beforebegin', `<div class="positiveAlertBox"><h4>Usunięto pomyślnie</h4> Paleta kolorów została usunięta pomyślnie<div>`);
				setTimeout(()=>this.generatePalleteStack(document.getElementById("userPalletes-colorGroup")), 1000);
			}).catch(()=>{
				document.getElementById(`colorPallete${id}`).insertAdjacentHTML('beforebegin', `<div class="errorAlertBox"><h4>Wystąpił błąd podczas usuwania</h4> Nie można usunąć zawartości<div>`);
			});
		}

		document.getElementById(`exportPallete${id}`).onclick = evt=>{
			browser.downloads.download({
				url : URL.createObjectURL(new Blob([JSON.stringify(this.fieldsetToObj(document.getElementById(`colorPallete${id}`)))], {type:'application/json'})),
				filename : document.getElementById(`colorPallete${id}`).childNodes[0].textContent+'.json',
				conflictAction : 'uniquify'
			  });
		}
	}

	generatePalleteStack(element) {
		if(this.palletes.length>0) {
			element.innerHTML = '<div id="colorComposer-palletesContainer" class="colorComposer-regularBorder">'; 
		this.palletes.forEach((val, ind)=>{
			element.innerHTML += val.output("editableFieldset", true, true, {index:ind});
		});
		element.innerHTML += '</div>';
		this.palletes.forEach((val, ind)=>{
			this.generateEventsforEditableField(ind);
		});
		} else element.innerHTML = 'No Palletes Saved';
	}

	fieldsetToObj(element) {
		let obj = {name:"untitled",categories:[]}, lastGrouped;
		if(element.hasChildNodes()) {
			for(let nodeChild of element.childNodes) {
				if(nodeChild.nodeType==1 && nodeChild.tagName=="LEGEND") {
					if(nodeChild.className!="middle") obj.name = nodeChild.textContent; else { if(nodeChild.id=="ungrouped") lastGrouped = "ungrouped"; else { obj.categories.push({caption:nodeChild.textContent,list:[]}); lastGrouped = obj.categories[obj.categories.length-1]; } }
				} else if(nodeChild.nodeType==1 && nodeChild.tagName=="FIGURE") {
					if(lastGrouped!="ungrouped") lastGrouped.list.push({name:nodeChild.childNodes[1].textContent, content:nodeChild.childNodes[0].textContent}); else obj.categories.push({name:nodeChild.childNodes[1].textContent, content:nodeChild.childNodes[0].textContent});
				}
			}
		} else console.log("No nodes");
		return obj;
	}
}

export class ColorPallete extends Pallete {
	constructor(menager, palleteType="standard", opt={pushInto:true}) { //user
		super(menager);
		this.colorGrouped = [];
		this.colorUngrouped = [];
		this.body = [];

		
		if(typeof opt.pushInto!="undefined" && opt.pushInto) { if(palleteType=="standard") this.menager.standardPalletes.push(this); else this.menager.palletes.push(this); }
	}

	onLoad() {

	}

	onUnload() {

	}

	toDataObj() {
		let dataObj = {}, deniedProps = ["onLoad", "menager", "onUnload"];
		for(let prop in this) {
			if(!deniedProps.includes(prop)) dataObj[prop] = this[prop];
		}
		return dataObj;
	}

	load(methodGet, getParam) {
		switch(methodGet) {
			case "urlJSON":
				var url = "";
				if(typeof browser.runtime.getURL == "function") url = browser.runtime.getURL(getParam); else url = getParam;
				fetch(url).then(response=> response.json()).then((json) => { 
					if(typeof json.name !="undefined") this.name = json.name;
					if(typeof json.categories !="undefined") {
						for(let obj of json.categories) {
							if(typeof obj.list != "undefined" && Array.isArray(obj.list)) {
								this.length += obj.list.length;
								this.colorGrouped.push(obj);
							} else if(typeof obj.name != "undefined") {
								this.length++;
								color.Ungrouped.push(obj);
							}
						}
						this.onLoad();
					}
				});
			break;
			case "JSON":
				var json = JSON.parse(getParam);
				if(typeof json.name !="undefined") this.name = json.name;
					if(typeof json.categories !="undefined") {
						for(let obj of json.categories) {
							if(typeof obj.list != "undefined" && Array.isArray(obj.list)) {
								this.length += obj.list.length;
								this.colorGrouped.push(obj);
							} else if(typeof obj.name != "undefined") {
								this.length++;
								color.Ungrouped.push(obj);
							}
						}
						this.onLoad();
					}
			break;
			case "object":
					if(typeof getParam.name !="undefined") this.name = getParam.name;
					if(typeof getParam.categories !="undefined") {
						for(let obj of getParam.categories) {
							if(typeof obj.list != "undefined" && Array.isArray(obj.list)) {
								this.length += obj.list.length;
								this.colorGrouped.push(obj);
							} else if(typeof obj.name != "undefined") {
								this.length++;
								this.colorUngrouped.push(obj);
							}
						}
						this.onLoad();
					}
			break;
		}
	}
	
	output(type, enableGrouped=true, enableUngrouped=true, addonOpt={}) { // Obj addonOpt { informUngrouped=true, id=undefined, class=undefined }
		//if(!enableungrouped) informUngrouped = false;
		let numberIndx = typeof addonOpt.index !="undefined" ? addonOpt.index : this.id, outputResult="";
		try {
		switch(type) {
			case "list":
				outputResult = '<ul id="'+this.id+'" >';
				if(enableGrouped) {
					for(let group of this.colorGrouped) {
						outputResult += '<li>'+group.caption+'<ul>'
						for(let color of group.list) {
							outputResult += '<li><div class="previewBox" style="background-color:'+color.content+';"></div> '+color.name+'</li>';
						}
						outputResult += '</ul></li>';
					}
				}
				if(enableUngrouped) {
					for(let color of this.colorUngrouped) {
						outputResult += '<li><div class="previewBox" style="background-color:'+color.content+';"></div> '+group.name+'</li>';
					}
				}
				outputResult += '</ul>';
			break;
			case "inlineFigure":
				outputResult = '<div class="inline">';
				if(enableGrouped) {
					for(let group of this.colorGrouped) {
						outputResult += '<div class="colorComposer-subtitle">'+group.caption+'</div>';
						for(let color of group.list) {
							outputResult += '<figure class="minpreview"><div class="previewBox" style="background-color:'+color.content+';"></div><figcaption>'+color.name+'</figcaption></figure>';
						}
					}
				}
				if(enableUngrouped) {
					for(let color of this.colorUngrouped) {
						outputResult += '<figure><div class="previewBox" style="background-color:'+color.content+';"></div> <figcaption>'+group.name+'</figcaption></figure>';
					}
				}
				outputResult += '</div>';
			break;
			case "select":
			
			break;
			case "devfieldset":
				outputResult = `<fieldset id="colorPallete${numberIndx}" class="colorPallete">`;
				outputResult += `<legend contenteditable><strong>${this.name}</strong></legend><div class="optionBoxHiddenInline"><span id="savePallete${numberIndx}" title="Save"><img src="../images/save_icon.png" data-entities="&#x1F4BE;"></span><span id="discardPallete${numberIndx}" title="Discard"><img src="../images/discard_icon.png" data-entities="&times;"></span></div>`;
				if(enableGrouped) {
					for(let group of this.colorGrouped) {
						outputResult += `<legend class="middle" contenteditable>${group.caption}</legend>`;
						for(let color of group.list) {
							outputResult += `<figure id="colorItemInPallete${numberIndx}" data-group="" class="minpreview colorItemInPallete"><div id="colorPreviewCode${numberIndx}" class="previewBox" style="background-color:${color.content};" contenteditable>${color.content}</div><figcaption id="colorCaption${numberIndx}" contenteditable>${color.name}</figcaption></figure>`;
						}
					}
				}
				if(enableUngrouped) {
					if(this.colorUngrouped.length>0) outputResult += `<legend id="ungrouped" class="middle">Niepogrupowane</legend>`;
					for(let color of this.colorUngrouped) {
						outputResult += `<figure id="colorItemInPallete${numberIndx}" class="minpreview colorItemInPallete"><div id="colorPreviewCode${numberIndx}" class="previewBox" style="background-color:${color.content};" contenteditable>${color.content}</div><figcaption id="colorCaption${numberIndx}" contenteditable>${color.name}</figcaption></figure>`;
					}
				}
				outputResult += `<figure id="addNewColorToPallete${numberIndx}" class="minpreview"><div class="previewBox" style="background-color:transparent;border: 2px solid darkgray;box-sizing: border-box;-moz-box-sizing: border-box;"></div><figcaption>Nowy kolor</figcaption></figure></fieldset>`;
			break;
			case "fieldset":
			case "editableFieldset":
				outputResult = `<fieldset id="colorPallete${numberIndx}" class="colorPallete">`;
				if(type=="editableFieldset") outputResult += `<legend><strong>${this.name}</strong></legend><div class="optionBoxHiddenInline"><span id="editPallete${numberIndx}" title="Edit"><img src="../images/edit_icon.png" data-entities="&#10001;"></span><span id="deletePallete${numberIndx}" title="Delete"><img src="../images/trash_icon.png" data-entities="&#8629;"></span><span id="exportPallete${numberIndx}" title="Export JSON"><img src="../images/json_export_icon.png" data-entities="&#8629;"></span></div>`; else outputResult += `<legend><strong>${this.name}</strong></legend>`;
				if(enableGrouped) {
					for(let group of this.colorGrouped) {
						outputResult += `<legend class="middle">${group.caption}</legend>`;
						for(let color of group.list) {
							outputResult += `<figure id="colorItemInPallete${numberIndx}" data-group="" class="minpreview colorItemInPallete"><div id="colorPreviewCode${numberIndx}" class="previewBox" style="background-color:${color.content};">${color.content}</div><figcaption id="colorCaption${numberIndx}">${color.name}</figcaption></figure>`;
						}
					}
				}
				if(enableUngrouped) {
					if(this.colorUngrouped.length>0) outputResult += `<legend id="ungrouped" class="middle">Niepogrupowane</legend>`;
					for(let color of this.colorUngrouped) {
						outputResult += `<figure id="colorItemInPallete${numberIndx}" class="minpreview colorItemInPallete"><div id="colorPreviewCode${numberIndx}" class="previewBox" style="background-color:${color.content};">${color.content}</div><figcaption id="colorCaption${numberIndx}">${color.name}</figcaption></figure>`;
					}
				}
				outputResult += `</fieldset>`;

			break;
			default:
				
		}
		} catch(e) {
			outputResult = '<span class="error">Error during generate output</span>'
		}
		return outputResult;
	}

	exportJSON() {

	}
}

export class gradientPalleteMenager extends PalleteMenager {
	constructor(palletes) {
		super(palletes);
	}
}

export class gradientPallete extends Pallete {
	constructor(menager, palletes) {
		super(menager, methodGet, getParam);
		this.gradientGrouped = [];
		this.gradientUngrouped = [];		
	}


}

export default { ColorPallete, ColorPalleteMenager }