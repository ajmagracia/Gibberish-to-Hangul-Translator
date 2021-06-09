import {
  CONSONANT,
  PAD,
  VOWEL,
  finalConsonants,
  initialConsonants,
  vowels,
} from './constants';

import convertLettersToHangul from './translate';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gibberishToHangul",
    title: "Translate gibberish to Hangul",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "gibberishToHangulResult",
    parentId: "gibberishToHangul",
    title: "Results will show here", // Shouldn't see this tho
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.contextMenus.update(
    "gibberishToHangulResult", {
    title: `Last Translation: ${convertLettersToHangul(info.selectionText)}`,
  });
});
 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if ("selection" in message) {
    chrome.contextMenus.update(
      "gibberishToHangulResult", {
      title: `Last Translation: ${convertLettersToHangul(message.selection)}`,
    });
  }
 });

/**
 * Gets the selected text.
 * @returns {string} Selected text
 */
function getSelectionText() {
  return getSelection().toString();
}

chrome.tabs.onActivated.addListener(info => {
  chrome.scripting.executeScript({
    target: {tabId: info.tabId},
    function: getSelectionText,
  }, results => {
    chrome.contextMenus.update(
      "gibberishToHangulResult", {
      title: `Last Translation: ${convertLettersToHangul(results[0])}`,
    });
    },
  );
});


function checkLetter(str, arr, num = -1) {
  return arr.indexOf(str.slice(num)) + 1;
}

function checkTwoOrOne(str, arr, allowZero = false) {
  // Check for double vowel/consonant first to prevent false positives
  let value = checkLetter(str, arr, -2);
  if (value) return [value - 1, -2];

  value = checkLetter(str, arr);
  if (value) return [value - 1, -1];

  // Should only get here for the final consonant check.
  if (allowZero) return [0];
  throw new Error("Invalid selection.");
}
