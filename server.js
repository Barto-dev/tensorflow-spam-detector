const express = require("express");
const app = express();
const PORT = 3005;

// Make all the files in 'www' available.
app.use(express.static("www"));



app.get("/", (request, response) => {
  response.sendFile(__dirname + "/www/index.html");
});

// Listen for requests.
const listener = app.listen(PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
