let style_used;

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		let temp = document.getElementById("discordcss-wrapper");
		if(!temp){
			sendResponse(false);
			return true;
		}
		if(request.kind == "get"){
			console.log("Request received");
			sendResponse(parseDocumentCSS());
		}else if(request.kind == "set"){
			if(request.element.kind == "checkbox"){
				let sheet = temp.querySelector(`[data-name="${request.element.name}"]`);
				sheet.disabled = !request.value;
				let obj = {}
				obj[request.element.name] = request.value;
				chrome.storage.sync.set(obj);
			} else if(request.element.kind == "text"){
				document.getElementById("discordcss-custom-style").innerHTML = request.value;
			}
			sendResponse(true);
		}
		return true;
	}
);
fetchStylesheets(async function(sheets){
	let temp = document.createElement("div");
	temp.id = "discordcss-wrapper";
	let entries = sheets.map((x)=>x.split("/").pop());
	entries.push("style");
	let settings = await chrome.storage.sync.get(entries);
	for(let i in sheets){
		get(sheets[i], function(response){
			let sheet = document.createElement("style");
			let name = sheets[i].split("/").pop();
			sheet.dataset.name = name;
			sheet.innerHTML = response;
			temp.appendChild(sheet);
			sheet.disabled = !(settings && settings[name]);
		});
	}
	let style = document.createElement("style");
	style.id = "discordcss-custom-style";
	style.innerHTML = settings?.style || "";
	temp.appendChild(style);
	document.head.appendChild(temp);
});
console.log("[DiscordCSS] Injected");
/* Adapted from https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/ */
function parseDocumentCSS(){
	//console.log([...document.styleSheets]);
	return [...document.styleSheets]
		.map((stylesheet)=>{
			return {
				name: (stylesheet.href && "_discord.css") || stylesheet.ownerNode.dataset.name,
				disabled: stylesheet.disabled,
				groups: [...stylesheet.cssRules]
					.filter((rule) => rule.type === 1)
					.map((rule)=>{
						return {
							name: rule.selectorText,
							properties: [...rule.styleMap.entries()]
								.filter((property)=>property[0].indexOf("--") === 0)
								.map((property)=>{
									return {
										name: property[0],
										value: property[1]
									}
								})
						}
					})
					.filter((group)=>group.properties.length)
			}
	})
	.filter((stylesheet)=>stylesheet.name);
}
function fetchStylesheets(callback){
	const root = "https://api.github.com/repos/MrTipson/DiscordCSS/git/trees/5fe13e3060d72dcce2954c987475f6028a7cfb88";
	get(root, function(responseText){
		let arr = [];
		let sheets = JSON.parse(responseText).tree;
		for(s in sheets){
			arr.push("https://mrtipson.github.io/DiscordCSS/css/"+sheets[s].path);
		}
		callback(arr);
	});
}
function get(url, callback){
	let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(xhr.responseText);
        }
    };
    xhr.open("GET", url);
    xhr.send();
}