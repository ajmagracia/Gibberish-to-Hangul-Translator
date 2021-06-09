/**
 * Recursively tranforms a string of letters into a string composed of Hangul blocks.
 * Blocks created via the formula [(initial) × 588 + (medial) × 28 + (final)] + 44032
 * @param {string} str - The string to convert
 * @param {output} str - The current output
 * 
 * @example
 * // Returns 이지금
 * convertLettersToHangul('dlwlrma', '');
 */
 export default function convertLettersToHangul(str, output = '') {
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
    consonantBase = checkLetter(str.slice(-1), initialConsonants) -1;

    // Put it all together
    const block = String.fromCodePoint(code + consonantBase * CONSONANT + PAD);

    // Repeat until string empty
    return convertLettersToHangul(str.slice(0, -1), block + output);
  } catch(err) {
    return "Invalid selection.";
  }
}
