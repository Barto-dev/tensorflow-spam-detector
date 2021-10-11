const POST_COMMENT_BTN = document.querySelector('#post');
const COMMENT_TEXT = document.querySelector('#comment');
const COMMENT_LIST = document.querySelector('#commentsList');

// CSS styling class to indicate comment is being processed when
// posting to provide visual feedback to users.
const PROCESSING_CLASS = 'processing';

// Store username of logged in user. Right now you have no auth
// so default to Anonymous until known.
let currentUserName = 'Anonymous';

/**
 * Function to handle the processing of submitted comments.
 **/
