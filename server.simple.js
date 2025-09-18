import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3001;

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() })
    );
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.IO server is running");
});

const io = new Server(httpServer, {
  path: "/socket.io",
  cors: {
    origin: [
      "https://teamify.onlinemichel.dev",
      "http://localhost:3000",
      "https://teamify-socket-server.up.railway.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Connexion de base
io.on("connection", (socket) => {
  console.log("🔌 Client connecté :", socket.id);

  socket.on("ping", () => {
    console.log("📡 Ping reçu");
    socket.emit("pong", { message: "Pong!", time: new Date().toISOString() });
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Déconnecté :", reason);
  });
});

// Démarrage du serveur
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Socket.IO server listening on port ${port}`);
});
