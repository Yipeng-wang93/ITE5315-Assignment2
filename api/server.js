// Vercel treats files inside the api/ folder as serverless functions.
// By placing server.js inside /api/, I am preparing it for deployment in Vercel.
// Locally, I can still run node api/server.js to launch the app normally.
// This structure works well for both local development and serverless deployment and compatible with
// vercel deployment strategy.
// In addition, app.js focuse on creating app object, server.js focuse on start this app
const app = require('../app');
require('dotenv').config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.listen(PORT, () => {
  console.log(`Example app listening at http://${HOST}:${PORT}`)
});
