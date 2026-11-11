const http = require("node:http");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT || 3000);

const server = http.createServer(createApp());
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`School ERP API listening on port ${PORT}`);
});
