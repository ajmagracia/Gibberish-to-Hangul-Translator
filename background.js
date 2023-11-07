const CONSONANT = 588;
const VOWEL = 28;
const PAD = 44032;

/**
 * These are indexed such that the Unicode value of block follows the formula:
 * [(initial index) × 588 + (vowel index) × 28 + (final index)] + 44032
 */
const initialConsonants = [
  "r", // ㄱ
  "R", // ㄲ
  "s", // ㄴ
  "e", // ㄷ
  "E", // ㄸ
  "f", // ㄹ
  "a", // ㅁ
  "q", // ㅂ
  "Q", // ㅃ
  "t", // ㅅ
  "T", // ㅆ
  "d", // ㅇ
  "w", // ㅈ
  "W", // ㅉ
  "c", // ㅊ
  "z", // ㅋ
  "x", // ㅌ
  "v", // ㅍ
  "g", // ㅎ
];

const vowels = [
  "k", // ㅏ
  "o", // ㅐ
  "i", // ㅑ
  "O", // ㅒ
  "j", // ㅓ
  "p", // ㅔ
  "u", // ㅕ
  "P", // ㅖ
  "h", // ㅗ
  "hk", // ㅘ
  "ho", // ㅙ
  "hl", // ㅚ
  "y", // ㅛ
  "n", // ㅜ
  "nj", // ㅝ
  "np", // ㅞ
  "nl", // ㅟ
  "b", // ㅠ
  "m", // ㅡ
  "ml", // ㅢ
  "l", // ㅣ
];

const finalConsonants = [
  "", // 0 is none
  "r", // ㄱ
  "R", // ㄲ
  "rt", // ㄳ
  "s", // ㄴ
  "sw", // ㄵ
  "sg", // ㄶ
  "e", // ㄷ
  "f", // ㄹ
  "fr", // ㄺ
  "fa", // ㄻ
  "fq", // ㄼ
  "ft", // ㄽ
  "fx", // ㄾ
  "fv", // ㄿ
  "fg", // ㅀ
  "a", // ㅁ
  "q", // ㅂ
  "qt", // ㅄ
  "t", // ㅅ
  "T", // ㅆ
  "d", // ㅇ
  "w", // ㅈ
  "c", // ㅊ
  "z", // ㅋ
  "x", // ㅌ
  "v", // ㅍ
  "g", // ㅎ
];

/**
 * Gets the selected text.
 * @returns {string} Selected text
 */
function getSelectionText() {
  return getSelection().toString();
}

/**
 * Checks an array for the existence of the last character(s) in a string and
 * returns the index.
 *
 * @param {string} str - The string to pull characters from
 * @param {string[]} arr - The array to search
 * @param {number} num - The number of characters to test, multiplied by -1
 *
 * @returns {number} The index of the characters + 1, 0 if not found
 *
 * @example
 * // Returns 4
 * checkLetter('dlwlrma', ['d', 'c', 'b', 'a', 'ma'], -1);
 *
 * // Returns 5
 * checkLetter('dlwlrma', ['d', 'c', 'b', 'a', 'ma'], -2);
 *
 * // Returns 0
 * checkLetter('dlwlrma', ['d', 'c', 'b', 'a'], -2);
 */
function checkLetter(str, arr, num = -1) {
  return arr.indexOf(str.slice(num)) + 1;
}

/**
 * Checks consonant and vowel arrays for the existence of the last two
 * characters in a string, and returns [index, 2]. If not found,
 * searches for the last character in the string and returns the index.
 * Returns [index, 1]. If not found, returns [0] or throws if desired.
 *
 * @param {string} str - The string to pull characters from
 * @param {string[]} arr - The array to search
 * @param {boolean} allowZero - Whether or not to throw if not found
 *
 * @returns {number[]} [The index of characters + 1, number of characters]
 *
 * @example
 * // Returns [4, 1]
 * checkTwoOrOne('dlwlrma', ['d', 'c', 'b', 'a', 'ma'], -1);
 *
 * // Returns [4, 2]
 * checkTwoOrOne('dlwlrma', ['d', 'c', 'b', 'a', 'ma'], -2);
 *
 * // Throws
 * checkTwoOrOne('dlwlrma', ['e', 'f', 'g'], -1);
 *
 * // Returns [0]
 * checkTwoOrOne('dlwlrma', ['e', 'f', 'g'], -1, true);
 */
function checkTwoOrOne(str, arr, allowZero = false) {
  // Check for double vowel/consonant first to prevent false positives
  let value = checkLetter(str, arr, -2);
  if (value) return [value - 1, -2];

  value = checkLetter(str, arr);
  if (value) return [value - 1, -1];

  // If actually Korean, would only get here for the final consonant check.
  if (!allowZero) throw new Error("Invalid selection.");
  return [0];
}

/**
 * Recursively tranforms a string of letters into a string composed of Hangul blocks.
 * Blocks created via the formula [(initial) × 588 + (medial) × 28 + (final)] + 44032
 *
 * @param {string} str - The string to convert
 * @param {output} str - The current output
 *
 * @returns The converted string
 *
 * @example
 * // Returns 이지금
 * convertLettersToHangul('dlwlrma', '');
 *
 * // Throws
 * convertLettersToHangul('12345###', '');
 */
function convertLettersToHangul(str, output = "") {
  try {
    if (!str.length) return output;

    // Check if ends in consonant
    let [code, lettersToTrim] = checkTwoOrOne(str, finalConsonants, true);

    // We found something, so cut it out from the str
    if (code) str = str.slice(0, lettersToTrim);

    // Regardless if it ends in a consonant, double or not, it will have a vowel
    // Could be single or double as well
    const [vowelBase, vowelsToTrim] = checkTwoOrOne(str, vowels);
    code += vowelBase * VOWEL;
    str = str.slice(0, vowelsToTrim);

    // Definitely has a consonant to start, and definitely single
    const consonantBase = checkLetter(str.slice(-1), initialConsonants) - 1;

    // Put it all together
    const block = String.fromCodePoint(code + consonantBase * CONSONANT + PAD);

    // Repeat until string empty
    return convertLettersToHangul(str.slice(0, -1), block + output);
  } catch (err) {
    return "Invalid selection.";
  }
}

chrome.runtime.onInstalled.addListener(() => {
  // Parent menu option
  chrome.contextMenus.create({
    id: "gibberishToHangul",
    title: "Translate gibberish to Hangul",
    contexts: ["selection"],
  });

  // Creates a submenu option from the above
  chrome.contextMenus.create({
    id: "gibberishToHangulResult",
    parentId: "gibberishToHangul",
    title: "Results will show here", // Shouldn't see this tho
    contexts: ["selection"],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if ("selection" in message && message.selection.length) {
    chrome.contextMenus.update("gibberishToHangulResult", {
      title: `${convertLettersToHangul(message.selection)}`,
    });
  }
});

chrome.tabs.onActivated.addListener((info) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: info.tabId },
      function: getSelectionText,
    },
    (results) => {
      if (!results) return;
      chrome.contextMenus.update("gibberishToHangulResult", {
        title: `${convertLettersToHangul(results[0])}`,
      });
    }
  );
});
