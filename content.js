document.addEventListener("selectionchange", () => {
  chrome.runtime.sendMessage({ selection: getSelection().toString() });
});
