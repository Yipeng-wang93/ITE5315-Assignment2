const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.listen(PORT, () => {
  console.log(`Example app listening at http://${HOST}:${PORT}`)
});
