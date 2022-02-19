// Initialize button with user's preferred color
const stylesheets = document.getElementById("stylesheets");
const s_template = document.getElementById("stylesheetTemplate");
const p_template = document.getElementById("propertyTemplate");
const g_template = document.getElementById("groupTemplate");
document.getElementById("refresh").addEventListener("click", getSheets);

stylesheets.addEventListener("change", async function(event){
	let [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
	chrome.tabs.sendMessage(activeTab.id, {kind: "set", element: {kind: event.target.type, name: event.target.dataset.name}, value: event.target.checked});
	let obj = {};
	obj[event.target.dataset.name] = event.target.checked;
});

getSheets();

async function getSheets(){
	let [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
	chrome.tabs.sendMessage(activeTab.id, {kind: "get"}, (response)=>{
		if(!response){
			stylesheets.innerText = "Error";
		}else{
			stylesheets.innerHTML = "";
			console.log(response);
			for(let i in response){
				let sheet = response[i];
				stylesheets.appendChild(createStylesheetNode(sheet, i == 0));
			}
		}
	});
}

function createStylesheetNode(sheet, disabledisable){
	let clon = s_template.content.cloneNode(true);
	clon.getElementById("stylesheetName").innerText = sheet.name;
	let cb = clon.getElementById("stylesheetEnabled");
	cb.dataset.name = sheet.name;
	if(disabledisable){
		cb.parentElement.removeChild(cb);
	} else{
		cb.checked = !sheet.disabled;
	}
	let grup = clon.getElementById("groups");
	for(i in sheet.groups){
		grup.appendChild(createGroupNode(sheet.groups[i]));
	}
	return clon;
}
function createGroupNode(group){
	let clon = g_template.content.cloneNode(true);
	clon.getElementById("groupName").innerText = group.name;
	let prop = clon.getElementById("properties");
	for(i in group.properties){
		prop.appendChild(createPropertyNode(group.properties[i]));
	}
	return clon;
}
function createPropertyNode(property){
	let clon = p_template.content.cloneNode(true);
	clon.getElementById("propertyName").innerText = property.name;
	return clon;
}