import { Server } from "socket.io";
import cors from 'cors';
import log4js from "log4js";
import Professionator from "@/games/professionator/professionator";

var logger = log4js.getLogger("professionator");
logger.level = "info";

// Create a new instance of the CORS middleware
const corsMiddleware = cors();

var io;
var professionator;

// Setting up the server
export default function SocketHandler(req, res) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    io = new Server(res.socket.server, {
        path: "/api/socket/games/professionator/connection",
        addTrailingSlash: false,
        maxHttpBufferSize: 1e7
    });

    professionator = new Professionator(logger, io);

    corsMiddleware(req, res, () => {
        res.socket.server.io = io;
        res.end();
    });
}