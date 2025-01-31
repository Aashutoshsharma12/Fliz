import "./pre-start"; // Must be the first import
const logger = require("./logger");

import server from "./server";
const { createServer } = require("http");
import swaggerDocs from "./swagger";
const { Server } = require("socket.io");
// Constants
const serverStartMsg = "Express server started on port: ",
  port = process.env.PORT || 3000;

const httpServer = createServer(server);
// Start server
httpServer.listen(port, (req: any, res: any) => {
  swaggerDocs(server, port);
  console.log(serverStartMsg + port);
});

const io: any = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
  transport: "polling",
});

var events = require("events");
const eventEmitter = new events.EventEmitter();
export = {
  io: io,
};

setTimeout(() => {
   require('@utils/socket')(eventEmitter)
}, 10)

