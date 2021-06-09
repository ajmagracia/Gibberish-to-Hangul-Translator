document.addEventListener("selectionchange", e => {
  chrome.runtime.sendMessage({selection: getSelection().toString()});
});
