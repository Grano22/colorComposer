var popupport = browser.runtime.connect({name: 'popup-colorComposer'});
import { colorComposerBuilder } from './modules/initial.mjs';
import { rangeRGBColorChooser } from './rangeColorChooser.js';
import { linearGriadientCSSGenerator, linearGradientCanvasGenerator } from './modules/gradientGenerator.mjs';
import { parseArrayOfLines, generateSelectorOfNode } from './modules/parsingData.mjs';
import { uniFormat, ColorConverter } from './modules/converters.mjs';
import { ColorPalleteMenager, ColorPallete, PalleteMenager } from './colorPalletes.js';
import { AnimationElement } from './modules/animations.js';
var colorComposer = new colorComposerBuilder();
var colorPalletesMng = new ColorPalleteMenager();
window.onload = ()=>{
	var standardColorPalletes = [
		"./pallete/standard/standard_RGB.json",
		"./pallete/standard/standard_CMYK.json"
	];  
	standardColorPalletes.forEach((val, ind, arr)=>{
		colorPalletesMng.addPallete("urlJSON", val);
	});
	colorPalletesMng.loadAllUserPalletes();
	document.getElementById("colorComposer-openGradientFabric").textContent = browser.i18n.getMessage("menuCat2");
	document.getElementById("colorComposer-openColorPicker").textContent = browser.i18n.getMessage("menuCat3");
	document.getElementById("colorComposer-openConverter").textContent = browser.i18n.getMessage("menuCat4");
	document.getElementById("colorComposer-settings").textContent = browser.i18n.getMessage("settingsWord");
	colorComposer.popup = (function() {
		
		var extensionContainer = document.getElementById("colorComposer-in");
		extensionContainer.savedEvents = [];
		extensionContainer.callbackEvents = [];
		var exported = {};
		
		return {
			menu:{
				current:"default",
				mode:"explore",
				restoreEvents: (menuID)=>{
					extensionContainer.savedEvents.forEach((val, inx, arr)=>{
						if(val.category==menuID) {
							if(document.querySelectorAll(val.nodeSelector).length>0) {
								let collection = Array.prototype.slice.call(document.querySelectorAll(val.nodeSelector));
								collection.forEach((pel)=>{ pel[val.eventType] = val.event; });
							}
						}
					});
				},
				restoreEventsByNodeSelector: (menuID, NodeSelector)=>{
					extensionContainer.savedEvents.forEach((val, inx, arr)=>{
						if(val.category==menuID && val.nodeSelector==NodeSelector) {
							if(document.querySelectorAll(val.nodeSelector).length>0) {
								let collection = Array.prototype.slice.call(document.querySelectorAll(val.nodeSelector));
								collection.forEach((pel)=>{ pel[val.eventType] = val.event; });
							}
						}
					});
				},
				restoreEventsByGroup: (menuID, Group)=>{
					extensionContainer.savedEvents.forEach((val)=>{
						if(val.category==menuID && val.group==Group) {
							if(document.querySelectorAll(val.nodeSelector).length>0) {
								let collection = Array.prototype.slice.call(document.querySelectorAll(val.nodeSelector));
								collection.forEach((pel)=>{ pel[val.eventType] = val.event; });
							}
						}
					});
				},
				clearEvents: (menuID, elClear=false)=>{
					extensionContainer.savedEvents.forEach((val, ind, arr)=>{
						if(val.category==menuID) {
							if(elClear) {
								if(document.querySelectorAll(val.nodeSelector).length>0) {
									let collection = Array.prototype.slice.call(document.querySelectorAll(val.nodeSelector));
									collection.forEach((pel)=>{ if(val.eventType.indexOf("on")!=-1) pel[val.eventType] = undefined; else pel.removeEventListener(val.event); });
								}
							}
							arr.splice(ind, 1);
						}
					});
				},
				clearEventsByNodeSelector: (menuID, NodeSelector, elClear=false)=>{
					extensionContainer.savedEvents.forEach((val, ind, arr)=>{
						if(val.category==menuID && val.nodeSelector==NodeSelector) {
							if(elClear) {
								if(document.querySelectorAll(val.nodeSelector).length>0) {
									let collection = Array.prototype.slice.call(document.querySelectorAll(val.nodeSelector));
									collection.forEach((pel)=>{ if(val.eventType.indexOf("on")!=-1) pel[val.eventType] = undefined; else pel.removeEventListener(val.event); });
								}
							}
							arr.splice(ind, 1);
						}
					});
				},
				clearEventsByGroup: (menuID, Group, elClear=false)=>{
					extensionContainer.savedEvents.forEach((val, ind, arr)=>{
						if(val.category==menuID && val.group==Group) {
							if(elClear) {
								if(document.querySelectorAll(val.nodeSelector).length>0) {
									let collection = Array.prototype.slice.call(document.querySelectorAll(val.nodeSelector));
									collection.forEach((pel)=>{ if(val.eventType.indexOf("on")!=-1) pel[val.eventType] = undefined; else pel.removeEventListener(val.event); });
								}
							}
							arr.splice(ind, 1);
						}
					});
				},
				addEvent: (el, type, cb, evtGroup=undefined ,capture=true)=>{
					if(el!=null) {
					var nodeSelector = "";
					if(type.indexOf("on")!=-1) {
						if(el instanceof HTMLCollection || el instanceof NodeList) {
							let valIDs = [], noid = false;
							
							Array.prototype.slice.call(el).forEach((val, index)=>{
								val[type] = (eventObj)=>cb(eventObj, index);
								if(val.id=="") noid = true;
								if(val.id!="" && !valIDs.includes(val.id)) valIDs.push(val.id);
								if(index==el.length-1) { if(valIDs.length>0) { nodeSelector = valIDs.map((v)=>{ return val.tagName+"#"+v; }); if(noid) nodeSelector.push(generateSelectorOfNode(el[0])); console.log(nodeSelector); } else nodeSelector = generateSelectorOfNode(el[0]); }
							});
						} else if(el!=null) { nodeSelector = generateSelectorOfNode(el); el[type] = cb; }
					} else {
						if(el instanceof HTMLCollection || el instanceof NodeList) {
							nodeSelector = generateSelectorOfNode(el[0]);
							Array.prototype.slice.call(el).forEach((val)=>{
								val.addEventListener(type, cb, capture);
							});
						} else { nodeSelector = generateSelectorOfNode(el); el.addEventListener(type, cb, capture); }
					}
					colorComposer.popup.menu.saveEvent(cb, nodeSelector, type, evtGroup);
				   } else console.warn("You trying add a event to not exist element"); 
				},
				replaceEvent: (el, type, cb, evtGroup=undefined , updateState=true, capture=true)=>{
					let nodeSel = generateSelectorOfNode(el), contNum = undefined;
					for(let oneEvt in extensionContainer.savedEvents) {
						if(extensionContainer.savedEvents[oneEvt].nodeSelector==nodeSel && extensionContainer.savedEvents[oneEvt].eventType==type) contNum = oneEvt;
					}
					if(typeof contNum!="undefined") {
						extensionContainer.savedEvents[contNum].event = cb;
						if(typeof evtGroup!="undefined") extensionContainer.savedEvents[contNum].group = evtGroup;
						if(updateState) {
							if(type.indexOf("on")!=-1) {
								if(el instanceof HTMLCollection || el instanceof NodeList) {
									Array.prototype.slice.call(el).forEach((val, index)=>{
										val[type] = (eventObj)=>cb(eventObj, index);
									});
								} else if(el!=null) { el[type] = cb; }
							} else {
								if(el instanceof HTMLCollection || el instanceof NodeList) {
									Array.prototype.slice.call(el).forEach((val)=>{
										val.addEventListener(type, cb, capture);
									});
								} else if(el!=null) { el.addEventListener(type, cb, capture); }
							}
						}
					} else console.warn("Given selector and event doesnt exists");
				},
				addOrReplaceEvent: (el, type, cb, evtGroup=undefined , updateState=true,capture=true)=>{
					let nodeSel = generateSelectorOfNode(el), includ = false;
					for(let oneEvt of extensionContainer.savedEvents) {
						if(oneEvt.nodeSelector==nodeSel && oneEvt.eventType==type) includ = true;
					}
					if(typeof includ=="undefined") return false;
					console.log(includ);
					if(includ) colorComposer.popup.menu.replaceEvent(el, type, cb, evtGroup, updateState, capture); else colorComposer.popup.menu.addEvent(el, type, cb, evtGroup ,capture);
				},
				saveEvent: (evtHandler,customNodeSelector, evtType, evtGroup)=>{
					for(let eventSaved of extensionContainer.savedEvents) if(eventSaved.nodeSelector==customNodeSelector && eventSaved.eventType==evtType) { console.warn("Are you trying save event to selector already exists. Use ReplaceEvent method instead."); return false; }
					if(typeof evtGroup=="undefined") evtGroup = "global";
					//"#linearGradientCSS"
					if(Array.isArray(customNodeSelector)) {
						console.log(customNodeSelector);
						for(let cOnce of customNodeSelector) {
							extensionContainer.savedEvents.push({id: Object.keys(extensionContainer.savedEvents).length, eventType: evtType, event:evtHandler, nodeSelector:cOnce, category:colorComposer.popup.menu.current, group:evtGroup});
						}
					} else extensionContainer.savedEvents.push({id: Object.keys(extensionContainer.savedEvents).length, eventType: evtType, event:evtHandler, nodeSelector:customNodeSelector, category:colorComposer.popup.menu.current, group:evtGroup});
					
					console.log(extensionContainer.savedEvents);
				},
				saveLastMenuSession: ()=>{
					if(colorComposer.popup.menu.current=="colorpicker") window.sessionStorage.setItem("colorComposer-colorPicker", extensionContainer.innerHTML);
					if(colorComposer.popup.menu.current=="gradientfabric") window.sessionStorage.setItem("colorComposer-gradientFabric", extensionContainer.innerHTML); //, events:extensionContainer.savedEvents
					if(colorComposer.popup.menu.current=="colorconverter") window.sessionStorage.setItem("colorComposer-colorConverter", extensionContainer.innerHTML);
				},
				hasCallbackEvents: ()=>{
					for(let cbEvent of extensionContainer.callbackEvents) if(cbEvent.category==colorComposer.popup.menu.current) return true;
					return false;
				},
				doCallbackEvents: ()=>{
					for(let cbEvent in extensionContainer.callbackEvents) {
						if(extensionContainer.callbackEvents[cbEvent].category==colorComposer.popup.menu.current) {
							if(extensionContainer.callbackEvents[cbEvent].argumentList.length>0) extensionContainer.callbackEvents[cbEvent].event.apply(this, extensionContainer.callbackEvents[cbEvent].argumentList); else extensionContainer.callbackEvents[cbEvent].event();
							//delete cbEvent;
							extensionContainer.callbackEvents.splice(cbEvent, 1);
							//console.log(extensionContainer.callbackEvents);
						}
					}
				},
				addCallbackEvent: (cb, target, argumentGiven=null)=>{
					let argList = [];
					if(Array.isArray(argumentGiven)) {
						for(let i=0;i<argumentGiven.length;i++) argList.push(argumentGiven[i]);
					} else if(arguments.length>2) {
						for(let i=2;i<arguments.length;i++) argList.push(arguments[i]);
					}
					extensionContainer.callbackEvents.push({event:cb,category:target,argumentList:argList});
					console.log(extensionContainer.callbackEvents);
				},
				change: (menuLayer)=>{
					if(colorComposer.popup.menu.current=="eyedropper") {
						document.getElementById("colorComposer-openEyeDropper").classList.remove("selected");	
					} else if(colorComposer.popup.menu.current=="gradientfabric") {
						document.getElementById("colorComposer-openGradientFabric").classList.remove("selected");
					} else if(colorComposer.popup.menu.current=="colorpicker") {
						document.getElementById("colorComposer-openColorPicker").classList.remove("selected");
					} else if(colorComposer.popup.menu.current=="converter") {
						document.getElementById("colorComposer-openConverter").classList.remove("selected");
					} else if(colorComposer.popup.menu.current=="colorpicker_selection") {
						document.getElementById("colorComposer-openColorPicker").classList.remove("selected");
					}
					
					switch(menuLayer.toLowerCase()) {
						case "textformater":
						document.getElementById("colorComposer-openTextFormater").classList.add("selected");
						extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.textformater, {
							CatZeroLang:browser.i18n.getMessage("menuCat0"),
							CatZeroLangSmallDes:browser.i18n.getMessage("menuCat0SmallDes")

						}, "");

						//Event Handlers
						colorComposer.popup.menu.addEvent(document.getElementById("textCSS") , "onclick", (evt)=>{
							document.getElementById("colorComposer-textGenerator").innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.textformatercss, {

							}, "");
						});

						break;
						case "gradientfabric":
						document.getElementById("colorComposer-openGradientFabric").classList.add("selected");
						colorComposer.popup.menu.current = "gradientfabric";
						if(window.sessionStorage.getItem("colorComposer-gradientFabric")===null) {
						extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.gradientfabric, {

						}, "");
						//Event Handlers
						colorComposer.popup.menu.addEvent(document.getElementById("linearGradient"), "onclick", (evt)=>{
							document.getElementById("colorComposer-gradientCreator").innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.gradientfabricLinear, {}, "");
							
							colorComposer.popup.menu.addEvent(document.getElementById("linearGradientCSS"), "onclick", (ev)=>{
								if(!document.getElementById("linearGradientCSS").classList.value.split(" ").includes("selected")) document.getElementById("linearGradientCSS").classList.add("selected");
								if(document.getElementById("linearGradientCanvas").classList.value.split(" ").includes("selected")) document.getElementById("linearGradientCanvas").classList.remove("selected");
								var linearCSSMng = new linearGriadientCSSGenerator();
								exported.linearCSSMng = linearCSSMng;
								//linearCSSMng.addColor(["#000", "#FFF"]);
								linearCSSMng.resetColors();
								
								document.getElementById("colorComposer-gradientGenerator").innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.gradientfabriccss, {
									'onStartGradientDefault':linearCSSMng.generateGradientColorSet(),
									'onStartGradientPreview':linearCSSMng.generateGradientPreview(),
									
								}, "");

								//Events for Colors Mng
								colorComposer.popup.menu.addEvent(document.querySelectorAll("ul#gradientFabric-colorSetCSS li"), "onclick", (e)=>{

										var container = document.querySelectorAll("ul#gradientFabric-colorSetCSS li"), elIq = null;
										for(let El in container) { if(container[El].id==e.target.id) elIq = El; }
										if(elIq===null) { console.warn("Not"); return false; }

										if(e.target.id!="addNewColorToGradient") {
											colorComposer.popup.menu.mode = "colorSendToInput&css;exist;"+elIq;
										} else {
											colorComposer.popup.menu.mode = "colorSendToInput&css;new;"+elIq;
										}
										colorComposer.popup.menu.saveLastMenuSession();
										colorComposer.popup.menu.change("colorpicker");
									
								}, "gradientFabric-colorSetGroup");

								//Events for Gradient Mix Menager
								colorComposer.popup.menu.addEvent(document.getElementById("gradientFabric-directionChooser"), "onchange", (evt)=>{
									let lastDirection = linearCSSMng.direction;
									if(evt.target.value=="custom") {
									let angleInput = document.createElement("input");
									angleInput.id = "customAngleCSS";
									angleInput.onkeyup = ev=>{
										console.log(ev.target.value+"deg");
										linearCSSMng.changeDirection(ev.target.value+"deg");
										document.getElementById("gradientFabric-preview").innerHTML = exported.linearCSSMng.generateGradientPreview();
									}
									document.getElementById("gradientFabric-directionChooser").parentNode.insertBefore(angleInput, document.getElementById("gradientFabric-directionChooser").nextSibling);
									} else {
									if(document.getElementById("customAngleCSS")!=null) document.getElementById("customAngleCSS").remove();
									if(evt.target.value=="default") linearCSSMng.changeDirection(""); else { linearCSSMng.changeDirection(evt.target.value);
									document.getElementById("gradientFabric-preview").innerHTML = exported.linearCSSMng.generateGradientPreview(); }
									console.log("Direction changed from "+lastDirection+" to "+linearCSSMng.direction);
									}
								});

								//Events for tools
								colorComposer.popup.menu.addEvent(document.getElementById("reverseGradient"), "onclick", (evt)=>{
									linearCSSMng.reverseGradient();
									document.getElementById("gradientFabric-preview").innerHTML = exported.linearCSSMng.generateGradientPreview();
									document.getElementById("gradientFabric-colorSetCSS").innerHTML = linearCSSMng.generateGradientColorSet();
									colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
								});

								colorComposer.popup.menu.addEvent(document.getElementById("randomizeGradient"), "onclick", evt=>{
									linearCSSMng.randomize();
									document.getElementById("gradientFabric-preview").innerHTML = exported.linearCSSMng.generateGradientPreview();
									document.getElementById("gradientFabric-colorSetCSS").innerHTML = linearCSSMng.generateGradientColorSet();
									colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
								});

								colorComposer.popup.menu.addEvent(document.getElementById("gradientFabric-generateView"), "onclick", (evt)=>{
									linearCSSMng.openHTMLViewInWindow();
								});

								colorComposer.popup.menu.addEvent(document.getElementById("exportGradientResultAsHTML"), "onclick", (evt)=>{
									linearCSSMng.sendToDownloadHTMLDoc();
								});
							}, "gradientFabric-colorSetGroup");

							colorComposer.popup.menu.addEvent(document.getElementById("linearGradientCanvas"), "onclick", (ev)=>{
								if(document.getElementById("linearGradientCSS").classList.value.split(" ").includes("selected")) document.getElementById("linearGradientCSS").classList.remove("selected");
								if(!document.getElementById("linearGradientCanvas").classList.value.split(" ").includes("selected")) document.getElementById("linearGradientCanvas").classList.add("selected");

								var linearCanvasMng = new linearGradientCanvasGenerator("gradientCanvasPreview");
								exported.linearCanvasMng = linearCanvasMng;
								linearCanvasMng.resetColors();

								document.getElementById("colorComposer-gradientGenerator").innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.gradientfabriccanvas, {
									'onStartGradientDefault':linearCanvasMng.generateGradientColorSet(),
									'onStartGradientRange':"Mixer Beta",
									'onStartGradientPreview':linearCanvasMng.generateGradientPreview().outerHTML,
									
								}, "");

								linearCanvasMng.generateCanvasLinearGradient();

								//Events for Colors Mng
								colorComposer.popup.menu.addEvent(document.querySelectorAll("ul#gradientFabric-colorSetCanvas li"), "onclick", (e)=>{

									var container = document.querySelectorAll("ul#gradientFabric-colorSetCanvas li"), elIq = null;
									for(let El in container) { if(container[El].id==e.target.id) elIq = El; }
									if(elIq===null) { console.warn("Not"); return false; }

									if(e.target.id!="addNewColorToGradient") {
										colorComposer.popup.menu.mode = "colorSendToInput&canvas;exist;"+elIq;
									} else {
										colorComposer.popup.menu.mode = "colorSendToInput&canvas;new;"+elIq;
									}
									colorComposer.popup.menu.saveLastMenuSession();
									colorComposer.popup.menu.change("colorpicker");
								
								}, "gradientFabric-colorSetGroup");
								
								//Event Handlers for Direction
								let angleError = false;
								colorComposer.popup.menu.addEvent(document.getElementById("gradientFabric-canvasAngle"), "onkeypress", (e)=>{
									if(e.keyCode==13) {
										console.log("works");
										if(linearCanvasMng.changeDirection(e.target.value)) {
											if(angleError) { angleError = false; e.target.style.color = ""; }
											document.getElementById("gradientFabric-previewCanvas").innerHTML = linearCanvasMng.generateGradientPreview().outerHTML;
											linearCanvasMng.generateCanvasLinearGradient();
										} else { if(!angleError) { angleError = true; e.target.style.color = "red"; } }
									}
								});

								colorComposer.popup.menu.addEvent(document.getElementById("gradientFabric-canvasRangeAngle"), "oninput", (e)=>{
									linearCanvasMng.changeDirection(e.target.value);
									document.getElementById("gradientFabric-previewCanvas").innerHTML = linearCanvasMng.generateGradientPreview().outerHTML;
									linearCanvasMng.generateCanvasLinearGradient();
								});

								colorComposer.popup.menu.addEvent(document.getElementById("reverseCanvasGradient"), "onclick", (e)=>{
									linearCanvasMng.reverseGradient();
									//document.getElementById("gradientFabric-previewCanvas").innerHTML = linearCanvasMng.generateGradientPreview().outerHTML;

									document.getElementById("gradientFabric-colorSetCanvas").innerHTML = linearCanvasMng.generateGradientColorSet();
									colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
								});

								colorComposer.popup.menu.addEvent(document.getElementById("exportGradientResultAsJPG"), "onclick", e=>{
									linearCanvasMng.sendToDownloadJpgImage();
								});

								colorComposer.popup.menu.addEvent(document.getElementById("gradientFabric-generateViewCanvas"), "onclick", e=>{
									linearCanvasMng.openHTMLViewInWindow("generatedCanvasPreview");
								});

							}, "gradientFabric-colorSetGroup");

							document.getElementById("linearGradientCSS").click();

						});
						window.sessionStorage.setItem("colorComposer-gradientFabric", extensionContainer.innerHTML);
							//class="colorComposer-regularBorder"><div class="colorComposer-title">
						} else {
						var sessionRestoredContent = window.sessionStorage.getItem("colorComposer-gradientFabric");
						extensionContainer.innerHTML = sessionRestoredContent;
						//Restored Handlers
						colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
						if(colorComposer.popup.menu.hasCallbackEvents()) colorComposer.popup.menu.doCallbackEvents();
						}
						break;
						case "colorpicker":
						document.getElementById("colorComposer-openColorPicker").classList.add("selected");
						if(colorComposer.popup.menu.mode.indexOf("colorSendToInput")!=-1) colorComposer.popup.menu.current = "colorpicker_selection"; else colorComposer.popup.menu.current = "colorpicker";
						if(window.sessionStorage.getItem("colorComposer-colorPicker")===null || colorComposer.popup.menu.mode.indexOf("colorSendToInput")!=-1) {
						let basicScene = new rangeRGBColorChooser(false);
						//Render Result
						let previewBox = document.createElement("figure");
						previewBox.className = "previewBox";
						previewBox.id = "colorpicker-preview";
						previewBox.innerHTML = '<div class="previewBox"></div><figcaption style="color:#fff">rgb(0,0,0)</figcaption>';
						previewBox.title = "";
						previewBox.style.background = 'rgb(0,0,0)';
						//end Render Result
						extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.colorpicker, {
							atStartPalleteGenerate:AnimationElement({template:"spinnerBalls"})
						}, "");
						
						document.getElementById("colorComoser-rangeSelector-RGB").innerHTML = basicScene.generateAsString();
						document.getElementById("colorComposer-colorChooser").parentNode.insertBefore(previewBox, document.getElementById("colorComposer-colorChooser"));
						//Events Handlers
						colorComposer.popup.menu.addEvent(document.getElementById("red"), "oninput", (evt)=>{
							basicScene.addChangeEvent(evt.target.value, "red", document.getElementById("colorpicker-preview"));
						});
						colorComposer.popup.menu.addEvent(document.getElementById("green"), "oninput", (evt)=>{
							basicScene.addChangeEvent(evt.target.value, "green", document.getElementById("colorpicker-preview"));
						});
						colorComposer.popup.menu.addEvent(document.getElementById("blue"), "oninput", (evt)=>{
							basicScene.addChangeEvent(evt.target.value, "blue", document.getElementById("colorpicker-preview"));
						});

						colorComposer.popup.menu.addEvent(document.getElementById("addToUserPallete"), "onclick", (evt)=>{
							colorPalletesMng.invokePalleteSelector(document.getElementById("addToUserPallete"), {colorValue:window.localStorage.getItem("pickedCurrentColor"), formType:"save"})
						});

						//Color Palletes Standard
						document.getElementById("colorComposer-standardPalleteRGB").innerHTML = "";
						document.getElementById("colorComposer-standardPalleteRGB").innerHTML+=colorPalletesMng.standardPalletes[0].output("inlineFigure");
						//console.log();

						//Callback Events
						if(colorComposer.popup.menu.mode.indexOf("colorSendToInput")!=-1) {
							document.getElementById("colorComposer-colorChooser").innerHTML += '<div class="colorComposer-title">Wybierz kolor</div><button id="gradientFabric-sendColorToReceiver">Wybierz</button>';
							let params = colorComposer.popup.menu.mode.split("&")[1];
							params = params.split(";");
							var doJobs = ()=>{}; let exportedPar = [];
							
							switch(params[0]) {
								case "css": exportedPar = ["linearCSSMng", "gradientFabric-preview", "CSS"]; break;
								case "canvas": exportedPar = ["linearCanvasMng", "gradientFabric-previewCanvas", "Canvas"]; break;
							}

							colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
							colorComposer.popup.menu.addOrReplaceEvent(document.getElementById("gradientFabric-sendColorToReceiver"), "onclick", (ev)=>{
								console.log(params);
								if(params[2]!==null || params[2]!="null") {
								let selectedColor = document.getElementById("colorpicker-preview").textContent;
								if(params[1]=="exist") {
									exported[exportedPar[0]].changeColor(params[2], uniFormat(selectedColor));
									doJobs = paramsGiven=>{
										if(colorComposer.popup.menu.mode!==null || colorComposer.popup.menu.mode!="null") {
											let targetSel = document.querySelectorAll("ul#gradientFabric-colorSet"+exportedPar[2]+" li")[paramsGiven[2]];
											targetSel.innerHTML = exported[exportedPar[0]].generateGradientColor(paramsGiven[2]).replace("<li>", "").replace("</li>", "");
											colorComposer.popup.menu.restoreEventsByNodeSelector(colorComposer.popup.menu.current, "SPAN.gradientFabric-unsetColor");
										}
										switch(exportedPar[2]) {
											case "CSS": document.getElementById(exportedPar[1]).innerHTML = exported.linearCSSMng.generateGradientPreview(); break;
											case "Canvas": exported.linearCanvasMng.generateCanvasLinearGradient(); break;
										}
									}
								} else if(params[1]=="new") {
									exported[exportedPar[0]].addColor(uniFormat(selectedColor));
									doJobs = paramsGiven=>{
										
										let allColorsInList = document.querySelectorAll("ul#gradientFabric-colorSet"+exportedPar[2]+" li:not(#addNewColorToGradient)");
										let newElements = exported.linearCSSMng.generateGradientColorSet(true, allColorsInList[0].parentNode);
										for(let newEl of newElements) {
										colorComposer.popup.menu.addEvent(newEl, "onclick", (e)=>{
											var container = document.querySelectorAll("ul#gradientFabric-colorSet"+exportedPar[2]+" li"), elIq = null;
											for(let El in container) { /*console.log(container[El].id); console.log(e.target.id);*/ if(container[El].id==e.target.id)  elIq = El; }
											if(elIq===null) { console.warn("Not"); return false; }

											if(e.target.id!="addNewColorToGradient") {
												colorComposer.popup.menu.mode = "colorSendToInput&"+params[0]+";exist;"+elIq;
											} else {
												colorComposer.popup.menu.mode = "colorSendToInput&"+params[0]+";new;"+elIq;
											}
											colorComposer.popup.menu.saveLastMenuSession();
											colorComposer.popup.menu.change("colorpicker");
										}, "gradientFabric-colorSetGroup");
										//newEl.insertBefore();
										if(document.getElementById("addNewColorToGradient")) document.getElementById("gradientFabric-colorSet"+exportedPar[2]).insertBefore(newEl, document.getElementById("addNewColorToGradient")); else  document.getElementById("gradientFabric-colorSet"+exportedPar[2]).appendChild(newEl);
										}

										allColorsInList = document.querySelectorAll("ul#gradientFabric-colorSet"+exportedPar[2]+" li:not(#addNewColorToGradient)");

										for(let colorInList of allColorsInList) {
											//console.log(colorInList.childNodes[0].id);
											if(allColorsInList.length<=2) {
												if(colorInList.childNodes[0].className=="gradientFabric-unsetColor") {
													colorInList.removeChild(colorInList.childNodes[0]);
													colorComposer.popup.menu.clearEventsByNodeSelector(colorComposer.popup.menu.current, "SPAN.gradientFabric-unsetColor");
												}
											} else {
												if(colorInList.childNodes[0].className!="gradientFabric-unsetColor") {
													let newCloseBtn = document.createElement("span");
													newCloseBtn.className = "gradientFabric-unsetColor";
													newCloseBtn.innerHTML = "&times;";
													colorComposer.popup.menu.addEvent(newCloseBtn, "onclick", (e)=>{
														e.stopPropagation();
														let decidion = confirm("Do you really want delete this color?");
														if(decidion) { 
															colorComposer.popup.menu.clearEventsByNodeSelector(colorComposer.popup.menu.current , e.target.parentNode.id);
															exported[exportedPar[0]].removeColor(e.target.parentNode.id.replace(/[A-Za-z]*/g, ""));
															document.getElementById("gradientFabric-colorSet"+exportedPar[2]).innerHTML = exported.linearCSSMng.generateGradientColorSet();
															colorComposer.popup.menu.restoreEventsByGroup(colorComposer.popup.menu.current, "gradientFabric-colorSetGroup");
															switch(exportedPar[2]) {
																case "CSS": document.getElementById(exportedPar[1]).innerHTML = exported.linearCSSMng.generateGradientPreview(); break;
																case "Canvas": exported.linearCanvasMng.generateCanvasLinearGradient(); break;
															}
														}
													}, "gradientFabric-colorSetGroup");
													colorInList.insertBefore(newCloseBtn, colorInList.childNodes[0]);
												}
											}
										}
										switch(exportedPar[2]) {
											case "CSS": document.getElementById(exportedPar[1]).innerHTML = exported.linearCSSMng.generateGradientPreview(); break;
											case "Canvas": exported.linearCanvasMng.generateCanvasLinearGradient(); break;
										}
									}
								}
								
							colorComposer.popup.menu.addCallbackEvent(doJobs, "gradientfabric", [params]); //colorpicker_selection
							} else console.warn("Unexpected Value");
							colorComposer.popup.menu.change("gradientfabric");
							});

						} else window.sessionStorage.setItem("colorComposer-colorPicker", extensionContainer.innerHTML);	
						
						} else {
						var sessionRestoredContent = window.sessionStorage.getItem("colorComposer-colorPicker");
						extensionContainer.innerHTML = sessionRestoredContent;
						//Restored Handlers
						colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
						if(colorComposer.popup.menu.hasCallbackEvents()) colorComposer.popup.menu.doCallbackEvents();
						}
						break;
						case "converter":
						document.getElementById("colorComposer-openConverter").classList.add("selected");
						if(window.sessionStorage.getItem("colorComposer-colorConverter")===null || colorComposer.popup.menu.mode.indexOf("colorSendToConvert")!=-1) {
							extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.colorconverter, {

							}, "");

							var ColorConverterMng = new ColorConverter();
							exported.ColorConverterMng = ColorConverterMng;

							colorComposer.popup.menu.addEvent(document.getElementById("colorConverter-input"), "onkeypress", (evt)=>{
								if(evt.keyCode==13 && evt.which==13) {
									let convertsArr = ColorConverterMng.convertMultipleColors(evt.target.value);
									console.log(convertsArr);
									document.getElementById("colorConverter-resultArea").innerHTML = '';
									for(let colorSystems in convertsArr) {
										document.getElementById("colorConverter-resultArea").innerHTML += '<div class="colorComposer-title"><h3>Konwersja '+colorSystems+'</h3></div>';
										for(let colorSystem in convertsArr[colorSystems]) {
											if(colorSystem=="rgb") {
												document.getElementById("colorConverter-resultArea").innerHTML += '<div class="colorComposer-title">Podgląd</div>';
												document.getElementById("colorConverter-resultArea").innerHTML += '<div class="colorComposer-inBox"><figure class="previewBox" style="background:'+convertsArr[colorSystems][colorSystem]+'"><div class="previewBox"></div></figure></div>';
											}
											document.getElementById("colorConverter-resultArea").innerHTML += '<div class="colorComposer-title">'+colorSystem.toUpperCase()+'</div>';
											document.getElementById("colorConverter-resultArea").innerHTML += '<div class="colorComposer-inBox">'+convertsArr[colorSystems][colorSystem]+'</div>';
										}
									}
								}
							});
						} else {
							var sessionRestoredContent = window.sessionStorage.getItem("colorComposer-colorConverter");
							console.log(sessionRestoredContent);
							extensionContainer.innerHTML = sessionRestoredContent;
							//Restored Handlers
							colorComposer.popup.menu.restoreEvents(colorComposer.popup.menu.current);
							if(colorComposer.popup.menu.hasCallbackEvents()) colorComposer.popup.menu.doCallbackEvents();
						}
						colorComposer.popup.menu.current = "converter";
						break;
						case "userpalletes":
							browser.storage.sync.get(['savedPalletes', 'lastSavedPallete']).then(obj=>console.log(obj));
							extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.userpalletes, {
								"UserColorPalletes":AnimationElement({template:"spinnerBalls"}).toString()
							}, "");
							console.log(colorPalletesMng);
							colorPalletesMng.generatePalleteStack(document.getElementById("userPalletes-colorGroup"));

							//Events Handlers
							colorComposer.popup.menu.addEvent(document.getElementById("addUserPallete"), "onclick", evt=>{
								const indx = document.getElementsByClassName("colorPallete").length || 0,newItemPallete = `<fieldset id="colorPallete${indx}" class="colorPallete"><legend contenteditable>Untitled</legend><legend id="ungrouped" class="middle">Niepogrupowane</legend><div class="optionBoxHiddenInline"><span id="savePallete${indx}" title="Save"><img src="../images/save_icon.png" data-entities="&#x1F4BE;"></span><span id="discardPallete${indx}" title="Discard"><img src="../images/discard_icon.png" data-entities="&times;"></span></div><figure id="addNewColorToPallete${indx}" class="minpreview"><div class="previewBox" style="background-color:transparent;border: 2px solid darkgray;box-sizing: border-box;-moz-box-sizing: border-box;"></div><figcaption>Nowy kolor</figcaption></figure></fieldset>`;
								document.getElementById("addUserPallete").insertAdjacentHTML("beforebegin", newItemPallete);
								colorPalletesMng.generateEventsForPalleteField(indx);
								window.localStorage.setItem("unsavedPallete", newItemPallete);
							});

							colorComposer.popup.menu.addEvent(document.getElementById("importJSONPallete"), "onclick", evt=>{
								let uploadHiddenForm = document.createElement("form");
								uploadHiddenForm.id = "importJSONcolorPallete";
									let uploadHiddenBtn = document.createElement("input");
									uploadHiddenBtn.setAttribute("type", "file");
									uploadHiddenBtn.setAttribute("accept", "application/json");
									uploadHiddenBtn.className = "hidden";
									uploadHiddenForm.appendChild(uploadHiddenBtn);
								uploadHiddenBtn.onclick = ev=>{
									document.body.onfocus = e=>{
										if(!uploadHiddenBtn.value.length) uploadHiddenForm.remove();
										document.body.onfocus = null;
									}
								}
								uploadHiddenBtn.onchange = ev=>{
									let reader = new FileReader(), f = uploadHiddenBtn.files[0];
									reader.readAsText(f);
									reader.onload = e=>{
										let objToCombine = JSON.parse(reader.result), newPal = new ColorPallete(colorPalletesMng);
										newPal.load("object", objToCombine);
										const indx = document.getElementsByClassName("colorPallete").length || 0;
										document.getElementById("addUserPallete").insertAdjacentHTML("beforebegin", newPal.output("devfieldset", true, true, {index:indx}));
										colorPalletesMng.generateEventsForPalleteField(indx);
										uploadHiddenForm.remove();
									}
									reader.onerror = e=>{

									}
								}
								document.body.appendChild(uploadHiddenForm);
								uploadHiddenBtn.click();
							});
						break;
						case "usergradients":
							extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.usergradients, {
								"UserGradientsPalletes":AnimationElement({template:"spinnerBalls"}).toString()
							}, "");
						break;
						case "default":
						default:
						colorComposer.popup.menu.current = "default";	
						extensionContainer.innerHTML = parseArrayOfLines(colorComposer.popup.menuUI.default, {}, "");

						colorComposer.popup.menu.addEvent(document.getElementById("myColorPalletes"), "onclick", (evt)=>{
							colorComposer.popup.menu.change("userpalletes");
							
						});

						colorComposer.popup.menu.addEvent(document.getElementById("checkDocumentation"), "onclick", evt=>{
							browser.tabs.create({
								url:'https://sites.google.com/view/colorcomposerdocumentation/strona-główna'
							});  
						});

						colorComposer.popup.menu.addEvent(document.getElementById("myGradientPalletes"), "onclick", (evt)=>{
							colorComposer.popup.menu.change("usergradients");
						});
					}
				}
			}
		}
	}());

	colorComposer.popup.menuUI = {
		default:[
			'<h1>Color Composer</h1>{{_MSG_Lang_menuDefaultCaption|Fast Actions}}<ul id="mainmenu"><li id="myColorPalletes">{{_MSG_Lang_menuDefaultLi2|My Color Palletes}}</li><li id="checkDocumentation">{{_MSG_Lang_menuDefaultLi4|Check for documentation}}</li></ul>'
		],
		gradientfabric:[
			'<h1>{{_MSG_Lang_menuCat2|Gradient Fabric}}</h1><small>{{_MSG_Lang_menuCat2SmallDes|Mix colors into gradient compositions for svg, canvas and css}}</small>',
			'<div id="colorComposer-gradientType"><a title="{{_MSG_Lang_wordLinearGradient|Linear Gradient}}" class="innerCategory" id="linearGradient"><img src="images/gradientLin.jpg"></a></div>',
			'<div id="colorComposer-gradientCreator" class="colorComposer-regularBorder"></div>'
		],
		gradientfabricLinear:[
			'<div class="colorComposer-innerGroups">',
			'<div id="linearGradientCSS" class="colorComposer-categoryGroup">CSS</div>',
			'<div id="linearGradientCanvas" class="colorComposer-categoryGroup">Canvas</div>',
			'</div><div id="colorComposer-gradientGenerator" class="filled"></div>'
		],
		gradientfabriccss:[
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory1|Partial Gradient Colors}}</div>',
			'<div class="colorComposer-inBox"><ul class="formatedList" id="gradientFabric-colorSetCSS">{{onStartGradientDefault}}</ul></div>',
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory2|Gradient Mixer}}</div>',
			'<div class="colorComposer-inBox" id="gradientFabric-rangeChooser"><fieldset id="gradientFabric-gradientDirection"><legend>{{_MSG_Lang_gradientFabricLegend1|Gradient Direction}}</legend><select id="gradientFabric-directionChooser"><option value="default">Domyślny kierunek</option><option value="to right">Do prawej</option><option value="to left">Do lewej</option><option value="to top">Do góry</option><option value="to bottom">Do dołu</option><option value="custom">Kąt</option></select></fieldset></div>',
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory3|Gradient Preview}}</div>',
			'<div id="gradientFabric-preview" class="colorComposer-inBox">{{onStartGradientPreview}}</div>',
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory4|Tools}}</div>',
			'<div class="colorComposer-inBox" id="gradientFabric-Tools"><button id="reverseGradient">{{_MSG_Lang_gradientFabricBtn1|Reverse Gradient Colors}}</button><button id="randomizeGradient">{{_MSG_Lang_randGradientBtn|Randomize Gradient}}</button><button id="exportGradientResultAsHTML">{{_MSG_Lang_gradientFabricBtn4|Export as HTML document}}</button><button id="gradientFabric-generateView">{{_MSG_Lang_gradientFabricBtn5|Generate result in new window}}</button></div>'

		],
		gradientfabriccanvas:[
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory1|Partial Gradient Colors}}</div>',
			'<div class="colorComposer-inBox"><ul class="formatedList" id="gradientFabric-colorSetCanvas">{{onStartGradientDefault}}</ul></div>',
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory2|Gradient Mixer}}</div>',
			'<div class="colorComposer-inBox" id="gradientFabric-rangeChooser"><fieldset id="gradientFabric-gradientDirection"><legend>{{_MSG_Lang_gradientFabricLegend1|Gradient Direction}}</legend><!--<input id="gradientFabric-canvasAngle" type="text" placeholder="enter your angle"><strong>deg</strong>--><input id="gradientFabric-canvasRangeAngle" type="range" max="359" value="0"></fieldset> {{onStartGradientRange}}</div>',
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory3|Gradient Preview}}</div>',
			'<div id="gradientFabric-previewCanvas" class="colorComposer-inBox">{{onStartGradientPreview}}</div>',
			'<div class="colorComposer-title">{{_MSG_Lang_gradientFabricCategory4|Tools}}</div>',
			'<div class="colorComposer-inBox" id="gradientFabric-Tools"><button id="reverseCanvasGradient">{{_MSG_Lang_gradientFabricBtn1|Reverse Gradient Colors}}</button><button id="exportGradientResultAsJPG">{{_MSG_Lang_gradientFabricBtn6|Export as JPG image}}</button><button id="gradientFabric-generateViewCanvas">{{_MSG_Lang_gradientFabricBtn5|Generate result in new window}}</button></div>'
		],
		colorpicker: [
			'<h1>{{_MSG_Lang_menuCat3|Color Picker}}</h1><small>{{_MSG_Lang_menuCat3SmallDes|Find your color pattern which you want}}</small><div id="colorComposer-palleteType"></div><div id="colorComposer-colorChooser" class="colorComposer-regularBorder"><div class="colorComposer-title">{{_MSG_Lang_RGB_Chooser_Title_Range|}}</div><div id="colorComoser-rangeSelector-RGB"></div><div class="colorComposer-title">{{_MSG_Lang_RGB_Options_Title|Options}}</div><button id="addToUserPallete">{{_MSG_Lang_AddColorToPallete|Add color to pallete}}</button></div><div id="colorComposer-standardPalletes" class="colorComposer-regularBorder"><div class="colorComposer-title">{{_MSG_Lang_RGB_Standard_Pallete_Title|Standard RGB Pallete}}</div><div id="colorComposer-standardPalleteRGB" class="colorComposer-inBox">{{atStartPalleteGenerate}}</div></div>'
		],
		colorconverter: [
			'<h1>{{_MSG_Lang_menuCat4|Color Converter}}</h1><small>{{_MSG_Lang_menuCat4SmallDes|Convert color format to one of supported}}</small>',
			'<div class="magrinized"><h2>{{_MSG_Lang_menuCat4Subtitle|Enter your Colour/s}}</h2><div class="flexibleContainer"><input id="colorConverter-input" type="text" placeholder="{{_MSG_Lang_menuCat4InputPlaceholder|Type your colours}}"><span class="infoBtnForInput">?</span><label for="" class="infobox">{{_MSG_Lang_menuCat4LabelInfo|If you want to convert more than one colour you can use semicons}}</label></div></div>',
			'<div id="colorConverter-resultArea" class="colorComposer-regularBorder">{{_MSG_Lang_menuCat4ResultAreaDefault|Type your colours and press enter to see results}}</div>'
		],
		userpalletes: [
			'<h1>{{CatUserPalletesLang|User Color Palletes}}</h1><small>{{CatUserPalletesLangSmallDes|Saved user color palletes}}</small>',
			'<div id="userPalletes-colorGroup" class="inlineBlocks">{{UserColorPalletes|Cannot fetch user palletes}}</div>', //<span class="error"></span>
			'<button id="addUserPallete">{{_MSG_Lang_AddUserPallete|Add new user pallete}}</button><button id="importJSONPallete">{{_MSG_Lang_ImportJSONPallete|Import JSON Pallete}}</button>'
		]
	}

	colorComposer.popup.menu.change("default");
	
	//////////////////////////////////////////////////////////////
	//////////// Color Composer Extension Version 0.1 ///////////
	////////////////////////////////////////////////////////////
	
	document.getElementById("colorComposer-openGradientFabric").onclick = (evt)=>{
		if(evt.target.classList.value.indexOf("seleced")==-1) { colorComposer.popup.menu.saveLastMenuSession(); colorComposer.popup.menu.mode = "explore"; colorComposer.popup.menu.change("gradientfabric"); }
	}
	
	document.getElementById("colorComposer-openColorPicker").onclick = (evt)=>{
		if(evt.target.classList.value.indexOf("seleced")==-1)  { colorComposer.popup.menu.saveLastMenuSession(); colorComposer.popup.menu.mode = "explore"; colorComposer.popup.menu.change("colorpicker"); }
	}
	
	document.getElementById("colorComposer-openConverter").onclick = (evt)=>{
		if(evt.target.classList.value.indexOf("seleced")==-1)  { colorComposer.popup.menu.saveLastMenuSession(); colorComposer.popup.menu.mode = "explore"; colorComposer.popup.menu.change("converter"); }
	}
	
	//Iniial events

	
	//Footer Events
	document.getElementById("colorComposer-home").onclick = ()=>{
		colorComposer.popup.menu.saveLastMenuSession();
		colorComposer.popup.menu.mode = "explore";
		colorComposer.popup.menu.change("default");
	}
    
    document.getElementById("colorComposer-settings").onclick = ()=>{
        browser.runtime.openOptionsPage();
    }
	
	document.getElementById("colorComposer-close").onclick = ()=>{ close(); }
	
}