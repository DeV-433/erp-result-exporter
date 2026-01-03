chrome.action.onClicked.addListener((tab) => {
    if (!tab.url || !tab.url.startsWith("https://erp.iiitnr.edu.in/")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                alert("This extension works only on the IIIT-NR ERP portal.");
            }
        });
        return;
    }

    // Inject jsPDF FIRST
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["jspdf.umd.min.js"]
    }, () => {
        // THEN inject main logic
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    });
});
