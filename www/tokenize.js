import * as DICTIONARY from './model/dictionary.js';

// The number of input elements the ML Model is expecting.
const ENCODING_LENGTH = 20;


/**
 * Function that takes an array of words, converts words to tokens,
 * and then returns a Tensor representation of the tokenization that
 * can be used as input to the machine learning model.
 */
export function tokenize(wordArray) {
  // Always start with the START token
  let returnArray = [DICTIONARY.START];

  // Loop through the words in the sentence you want to encode.
  // If word is found in dictionary, add that number else
  // you add the UNKNOWN token.
  for (let i = 0; i < wordArray.length; i++) {
    let encoding = DICTIONARY.LOOKUP[wordArray[i]];
    returnArray.push(encoding === undefined ? DICTIONARY.UNKNOWN : encoding)
  }

  console.log(returnArray);
  // Finally if the number of words was < the minimum encoding length
  // minus 1 (due to the start token), fill the rest with PAD tokens.
  while (returnArray.length < ENCODING_LENGTH) {
    returnArray.push(DICTIONARY.PAD)
  }
  console.log(returnArray);

  // Log the result to see what you made.
  // console.log(returnArray);

  // Convert to a TensorFlow Tensor and return that.
  return tf.tensor([returnArray]);
}
