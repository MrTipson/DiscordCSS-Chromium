chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

function init() {
	chrome.action.disable();
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
		// With a new rule ...
		let rule = {
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: { hostEquals: 'discord.com' }
				})
			],
			// And shows the extension's page action.
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}
		chrome.declarativeContent.onPageChanged.addRules([rule]);
	});
}

chrome.action.onClicked.addListener(function () {
	chrome.windows.create({
		url: 'src/popup/popup.html',
		type: "popup",
		width: 500,
		height: 350
	});
});

// Pass on messages received from the popup to the content script
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		// Find active discord tab
		chrome.tabs.query({ active: true, url: "https://discord.com/*" }, function ([activeTab]) {
			chrome.tabs.sendMessage(activeTab.id, request, function (response) {
				sendResponse(response);
			});
		});
		return true;
	}
)
