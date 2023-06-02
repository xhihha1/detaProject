const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors')

const routes = require('./simpleJson/index');

app.use(cors())
app.use(express.json());

app.use('/simpleJson', routes);

app.get("/", (req, res) => {
  res.send("Hello from Space! 🚀");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});