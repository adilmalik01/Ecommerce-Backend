import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIo } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import "dotenv/config";
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from "./swaggerDefinition";

import AdminRouter from './routes/product';
import AuthRouter from './routes/auth';
import OrderRouter from './routes/orders';
import CategoryRouter from './routes/category';
import UnAuthRoutes from './routes/unauthRoutes';
import { Auth } from './middleware/checkToken';

declare module 'express-serve-static-core' {
  interface Request {
    io?: SocketIo;
  }
}

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://e-commerce-web-app-delta.vercel.app"],
    credentials: true,
  })
);

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./routes/*.ts'], // specify the path to your route files
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cookieParser());

const server = createServer(app);
const io = new SocketIo(server, {
  cors: {
    origin: ["http://localhost:3000/", "https://e-commerce-web-app-delta.vercel.app"],
    methods: "*",
    credentials: true
  },
  transports: ['websocket']
});

io.on("connection", (socket) => {
  console.log("New client connected with id: ", socket.id);
  socket.on("disconnect", (message) => {
    console.log("Client disconnected with id: ", message);
  });
});

// Pass socket.io instance to routes
app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

app.use("/api/v1", AuthRouter);
app.use("/api/v1", UnAuthRoutes);
app.use("/api/v1", AdminRouter);
app.use("/api/v1", OrderRouter);
app.use("/api/v1", CategoryRouter);

app.get('/api/v1/users', (req, res) => {
  res.json({ message: 'Socket io secuessfully' });
});

app.get("/api/v1/ping", Auth, (req: Request, res: Response) => {
  res.send(req.body.currentUser);
});

const PORT = 5006 || process.env.PORT;

// Handling SIGINT signal to gracefully shutdown the server
process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server gracefully');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
