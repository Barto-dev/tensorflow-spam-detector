import {tokenize} from './tokenize.js';

const socket = io.connect();

const postCommentButton = document.querySelector('#post');
const commentInput = document.querySelector('#comment');
const COMMENT_LIST = document.querySelector('#commentsList');

// CSS styling class to indicate comment is being processed when
// posting to provide visual feedback to users.
const PROCESSING_CLASS = 'processing';

// Store username of logged in user. Right now you have no auth
// so default to Anonymous until known.
let currentUserName = 'Anonymous';

function handleRemoteComments(data) {
  // Render a new comment to DOM from a remote client.
  let li = document.createElement('li');
  let p = document.createElement('p');
  p.innerText = data.comment;

  let spanName = document.createElement('span');
  spanName.setAttribute('class', 'username');
  spanName.innerText = data.username;

  let spanDate = document.createElement('span');
  spanDate.setAttribute('class', 'timestamp');
  spanDate.innerText = data.timestamp;

  li.appendChild(spanName);
  li.appendChild(spanDate);
  li.appendChild(p);

  COMMENT_LIST.prepend(li);
}

/**
 * Function to handle the processing of submitted comments.
 **/
function handleCommentPost() {
  // Only continue if you are not already processing the comment.
  if (!postCommentButton.classList.contains(PROCESSING_CLASS)) {
    postCommentButton.classList.add(PROCESSING_CLASS);
    commentInput.classList.add(PROCESSING_CLASS);
    let currentComment = commentInput.value;
    // Convert sentence to lower case which ML Model expects
    // Strip all characters that are not alphanumeric or spaces
    // Then split on spaces to create a word array.
    let lowerCaseSentenceArray = currentComment
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')

    let li = document.createElement('li');
    // Remember loadAndPredict is asynchronous so you use the then
    // keyword to await a result before continuing.
    loadAndPredict(tokenize(lowerCaseSentenceArray), li)
      .then(() => {
        postCommentButton.classList.remove(PROCESSING_CLASS);
        commentInput.classList.remove(PROCESSING_CLASS);
        const data = commentInput.value;
        let p = document.createElement('p');
        p.innerText = data;

        let spanName = document.createElement('span');
        spanName.setAttribute('class', 'username');
        spanName.innerText = currentUserName;

        let spanDate = document.createElement('span');
        spanDate.setAttribute('class', 'timestamp');
        let curDate = new Date();
        spanDate.innerText = curDate.toLocaleString();

        li.appendChild(spanName);
        li.appendChild(spanDate);
        li.appendChild(p);
        COMMENT_LIST.prepend(li);

        // Reset comment text
        commentInput.value = '';
      })
  }
}

postCommentButton.addEventListener('click', handleCommentPost);

/*Tensor Flow*/


// Set the URL below to the path of the model.json file you uploaded.
const MODEL_JSON_URL = '/model/model.json';
// Set the minimum confidence for spam comments to be flagged.
// Remember this is a number from 0 to 1, representing a percentage
// So here 0.75 == 75% sure it is spam.
const SPAM_THRESHOLD = 0.45;

// Create a variable to store the loaded model once it is ready so
// you can use it elsewhere in the program later.
let model = undefined;

/**
 * Asynchronous function to load the TFJS model and then use it to
 * predict if an input is spam or not spam.
 */
async function loadAndPredict(inputTensor, domComment) {
  // Load the model.json and binary files you hosted. Note this is
  // an asynchronous operation so you use the await keyword
  if (model === undefined) {
    model = await tf.loadLayersModel(MODEL_JSON_URL);
  }
  // Once model has loaded you can call model.predict and pass to it
  // an input in the form of a Tensor. You can then store the result.
  console.log(model);
  let results = await model.predict(inputTensor);

  // Print the result to the console for us to inspect.
  results.print();

  results.data().then((dataArray) => {
    if (dataArray[1] > SPAM_THRESHOLD) {
      domComment.classList.add('spam');
    } else {
      // Emit socket.io comment event for server to handle containing
      // all the comment data you would need to render the comment on
      // a remote client's front end.
      socket.emit('comment', {
        username: currentUserName,
        timestamp: domComment.querySelectorAll('span')[1].innerText,
        comment: domComment.querySelectorAll('p')[0].innerText
      })
    }
  })
}


socket.on('remoteComment', handleRemoteComments);
