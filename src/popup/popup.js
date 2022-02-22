// Initialize button with user's preferred color
const stylesheets = document.getElementById("stylesheets");
const s_template = document.getElementById("stylesheetTemplate");
const p_template = document.getElementById("propertyTemplate");
const g_template = document.getElementById("groupTemplate");
document.getElementById("refresh").addEventListener("click", getSheets);

document.getElementById("popout").addEventListener("click", ()=>{
	chrome.windows.create({
		url: 'src/popup/popup.html',
		type: "popup",
		width: 500,
		height: 350
	});
	window.close();
});

stylesheets.addEventListener("change", async function(event){
	chrome.runtime.sendMessage({kind: "set", element: {kind: event.target.type, name: event.target.dataset.name}, value: event.target.checked});
});

getSheets();

async function getSheets(){
	chrome.runtime.sendMessage({kind: "get"}, (response)=>{
		if(!response){
			stylesheets.innerText = "Error";
		}else{
			stylesheets.innerHTML = "";
			//console.log(response);
			response.sort((x, y)=>x.name.localeCompare(y.name));
			for(let i in response){
				let sheet = response[i];
				stylesheets.appendChild(createStylesheetNode(sheet, i == 0));
			}
		}
	});
}

function createStylesheetNode(sheet, disabledisable){
	let clon = s_template.content.cloneNode(true);
	clon.querySelector(".stylesheetName").innerText = sheet.name;
	let cb = clon.querySelector(".stylesheetEnabled");
	cb.dataset.name = sheet.name;
	if(disabledisable){
		cb.parentElement.removeChild(cb);
	} else{
		cb.checked = !sheet.disabled;
	}
	let grup = clon.querySelector(".groups");
	if(sheet.groups?.length){
		let single = false;
		if(sheet.groups.length == 1){
			single = true;
		}
		//console.log(sheet.name);
		//console.log(single);
		for(i in sheet.groups){
			grup.appendChild(createGroupNode(sheet.groups[i], single));
		}
	} else{
		let notice = document.createElement("span");
		notice.innerText = "No properties in sheet";
		notice.classList.add("nopropertyNotice");
		grup.appendChild(notice);
	}
	return clon;
}
function createGroupNode(group, isOpen){
	let clon = g_template.content.cloneNode(true);
	clon.querySelector(".group").open = isOpen;
	clon.querySelector(".groupName").innerText = group.name;
	let prop = clon.querySelector(".properties");
	for(i in group.properties){
		prop.appendChild(createPropertyNode(group.properties[i]));
	}
	return clon;
}
function createPropertyNode(property){
	let clon = p_template.content.cloneNode(true);
	clon.querySelector(".propertyName").innerText = property.name;
	return clon;
}