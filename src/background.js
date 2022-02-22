chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

function init() {
	chrome.action.disable();
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// With a new rule ...
		let rule = {
			conditions: [
			new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'discord.com'}
			})
			],
			// And shows the extension's page action.
			actions: [ new chrome.declarativeContent.ShowPageAction() ]
		}
		chrome.declarativeContent.onPageChanged.addRules([rule]);
	});
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		//console.log("Passing on message");
		//console.log(request);
		chrome.tabs.query({active: true, url: "https://discord.com/*"}, function([activeTab]){
			//console.log(activeTab);
			chrome.tabs.sendMessage(activeTab.id, request, function(response){
				//console.log("Received response");
				//console.log(response);
				sendResponse(response);
			});
		});
		return true;
	}
)
