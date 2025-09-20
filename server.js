import { createServer } from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (dev ? "http://localhost:3000" : "https://teamify.onlinemichel.dev");

// Validation de la configuration
if (!dev && !process.env.NEXT_PUBLIC_APP_URL) {
  console.error(
    "❌ ERREUR: NEXT_PUBLIC_APP_URL doit être définie en production"
  );
  process.exit(1);
}

console.log("🚀 Démarrage du serveur Socket.IO...");
console.log(`📊 Environnement: ${dev ? "développement" : "production"}`);
console.log(`🌐 URL de l'application: ${appUrl}`);
console.log(`🔧 Variables d'environnement:`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   - PORT: ${process.env.PORT || "non défini"}`);
console.log(
  `   - NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || "non défini"}`
);
console.log(`📅 Timestamp de démarrage: ${new Date().toISOString()}`);
console.log(`🖥️  Plateforme: ${process.platform} ${process.arch}`);
console.log(`📦 Version Node.js: ${process.version}`);

// Créer le serveur HTTP simple
const httpServer = createServer((req, res) => {
  const timestamp = new Date().toISOString();
  const clientIP =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || "inconnu";

  // Configuration CORS pour toutes les requêtes
  const allowedOrigins = [
    "https://teamify.onlinemichel.dev",
    "https://www.teamify.onlinemichel.dev",
    "http://localhost:3000",
    "https://teamify-socket-server.up.railway.app",
    "https://socket.teamify.onlinemichel.dev",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Cookie, Authorization, Content-Type, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    console.log(`   ✅ [CORS] Preflight request autorisée pour: ${origin}`);
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`\n🌐 [HTTP] ${timestamp} - ${req.method} ${req.url}`);
  console.log(`   📍 IP: ${clientIP}`);
  console.log(`   🖥️  User-Agent: ${userAgent}`);
  console.log(`   🌐 Origin: ${origin || "inconnu"}`);
  console.log(`   📋 Headers:`, JSON.stringify(req.headers, null, 2));
  // Endpoint de health check
  if (req.url === "/health") {
    console.log(`   ✅ [HEALTH] Health check demandé`);
    res.writeHead(200, { "Content-Type": "application/json" });
    const healthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "socket-io-server",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: io.engine.clientsCount,
    };
    console.log(`   📊 [HEALTH] Réponse:`, healthData);
    res.end(JSON.stringify(healthData));
    return;
  }

  // Page d'accueil avec emoji
  if (req.url === "/" || req.url === "") {
    console.log(`   🏠 [HOME] Page d'accueil demandée`);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teamify Socket.IO Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9f9f9;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #020102;
          }
          .container {
            text-align: center;
            background: #f9f9f9;
            padding: 3rem;
            border-radius: 12px;
            border: 1px solid #333333;
            max-width: 500px;
            width: 90%;
          }
          .emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
            color: #020102;
          }
          p {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            color: #4b5563;
            line-height: 1.5;
          }
          .status {
            background: #f9f9f9;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            display: inline-block;
            margin-top: 1rem;
            border: 1px solid #333333;
            color: #020102;
            font-weight: 500;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0;
            text-align: left;
          }
          .info-item {
            background: #f9f9f9;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #333333;
          }
          .info-label {
            font-size: 0.9rem;
            color: #4b5563;
            margin-bottom: 0.25rem;
          }
          .info-value {
            font-size: 1rem;
            color: #020102;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🚀</div>
          <h1>Teamify Socket.IO Server</h1>
          <p>Serveur de messagerie en temps réel</p>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Port</div>
              <div class="info-value">${process.env.PORT}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Environnement</div>
              <div class="info-value">${
                dev ? "Développement" : "Production"
              }</div>
            </div>
            <div class="info-item">
              <div class="info-label">Statut</div>
              <div class="info-value">Actif</div>
            </div>
            <div class="info-item">
              <div class="info-label">Service</div>
              <div class="info-value">Socket.IO</div>
            </div>
          </div>
          
          <div class="status">
            ✅ Serveur prêt pour les connexions
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Pour toutes les autres requêtes, retourner 404
  console.log(`   ❌ [404] Route non trouvée: ${req.url}`);
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// Initialiser Socket.IO avec une configuration optimisée pour la production
const io = new Server(httpServer, {
  path: "/socket.io",
  cors: {
    origin: [
      "https://teamify.onlinemichel.dev",
      "https://www.teamify.onlinemichel.dev",
      "http://localhost:3000",
      "https://teamify-socket-server.up.railway.app",
      "https://socket.teamify.onlinemichel.dev",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Cookie",
      "Authorization",
      "Content-Type",
      "X-Requested-With",
    ],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

console.log("✅ Socket.IO initialisé");
console.log(`🔧 Configuration Socket.IO:`);
console.log(`   - Path: /socket.io`);
console.log(`   - CORS Origins:`, io.opts.cors.origin);
console.log(`   - Transports:`, io.opts.transports);
console.log(`   - Credentials:`, io.opts.cors.credentials);

// Ajout de la gestion des erreurs de connexion engine.io
io.engine.on("connection_error", (err) => {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [ENGINE.IO ERROR] ${timestamp}`);
  console.error(`   URL: ${err.req.url}`);
  console.error(`   Code: ${err.code}`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Headers:`, err.req.headers);
  console.error(`   Stack:`, err.stack);
});

// Logs pour les événements engine.io
io.engine.on("connection", (socket) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔌 [ENGINE.IO] ${timestamp} - Nouvelle connexion engine.io`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Transport: ${socket.transport.name}`);
  console.log(`   Headers:`, socket.handshake.headers);
  console.log(`   Query:`, socket.handshake.query);

  socket.on("upgrade", () => {
    console.log(
      `   ⬆️ [UPGRADE] Transport mis à niveau vers: ${socket.transport.name}`
    );
  });

  socket.on("upgradeError", (err) => {
    console.error(`   ❌ [UPGRADE ERROR]`, err);
  });
});

// Middleware d'authentification
// io.use(async (socket, next) => {
//   try {
//     if (dev) {
//       console.log("[Socket.IO] 🔍 Vérification de l'authentification...");
//     }

//     // Récupérer les cookies de la requête
//     const cookies = socket.handshake.headers.cookie;
//     if (dev) {
//       console.log("[Socket.IO] Cookies reçus:", cookies);
//     }

//     if (!cookies) {
//       console.log("[Socket.IO] ❌ Aucun cookie fourni");
//       return next(new Error("Cookies requis"));
//     }

//     // Vérifier l'authentification via l'API avec les cookies
//     try {
//       const response = await fetch(`${appUrl}/api/auth/me`, {
//         method: "GET",
//         headers: {
//           Cookie: cookies,
//           "Content-Type": "application/json",
//         },
//       });

//       if (dev) {
//         console.log("[Socket.IO] Réponse API auth:", {
//           status: response.status,
//           ok: response.ok,
//         });
//       }

//       if (response.ok) {
//         const data = await response.json();
//         socket.data.userId = data.user.uid;
//         socket.data.userUid = data.user.uid;
//         if (dev) {
//           console.log(
//             "[Socket.IO] ✅ Authentification réussie pour:",
//             data.user.email
//           );
//         }
//         next();
//       } else {
//         console.log("[Socket.IO] ❌ Authentification échouée");
//         next(new Error("Authentification échouée"));
//       }
//     } catch (apiError) {
//       console.log(
//         "[Socket.IO] ❌ Erreur API d'authentification:",
//         apiError.message
//       );
//       next(new Error("Erreur d'authentification"));
//     }
//   } catch (error) {
//     console.error("[Socket.IO] ❌ Erreur d'authentification:", error);
//     next(new Error("Erreur d'authentification"));
//   }
// });

// Gestion des connexions
io.on("connection", (socket) => {
  const timestamp = new Date().toISOString();
  const userId = socket.data.userId;
  const clientIP = socket.handshake.address;
  const userAgent = socket.handshake.headers["user-agent"] || "inconnu";

  console.log(`\n🔌 [SOCKET.IO CONNECTION] ${timestamp}`);
  console.log(`   👤 User ID: ${userId || "non authentifié"}`);
  console.log(`   🆔 Socket ID: ${socket.id}`);
  console.log(`   📍 IP: ${clientIP}`);
  console.log(`   🖥️  User-Agent: ${userAgent}`);
  console.log(`   🌐 Origin: ${socket.handshake.headers.origin || "inconnu"}`);
  console.log(`   🔗 Transport: ${socket.conn.transport.name}`);
  console.log(
    `   📋 Headers:`,
    JSON.stringify(socket.handshake.headers, null, 2)
  );
  console.log(`   🔍 Query:`, JSON.stringify(socket.handshake.query, null, 2));
  console.log(`   📊 Connexions actives: ${io.engine.clientsCount}`);

  // Rejoindre la room utilisateur
  socket.join(`user:${userId}`);
  console.log(`   🏠 [ROOM] Rejoint room: user:${userId}`);

  // Événement de test
  socket.on("ping", (data) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📡 [PING] ${timestamp}`);
    console.log(`   👤 User: ${userId}`);
    console.log(`   🆔 Socket: ${socket.id}`);
    console.log(`   📦 Data:`, data);

    const pongData = {
      message: "Pong!",
      timestamp: timestamp,
      userId: userId,
      socketId: socket.id,
    };

    socket.emit("pong", pongData);
    console.log(`   ✅ [PONG] Envoyé:`, pongData);
  });

  // Événement d'envoi de message
  socket.on("message:send", async (data) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📨 [MESSAGE:SEND] ${timestamp}`);
    console.log(`   👤 User: ${userId}`);
    console.log(`   🆔 Socket: ${socket.id}`);
    console.log(`   💬 Conversation: ${data.conversationId}`);
    console.log(`   📝 Content: ${data.content}`);
    console.log(`   📎 Attachments:`, data.attachments);
    console.log(`   📦 Full Data:`, JSON.stringify(data, null, 2));

    try {
      // Sauvegarder le message en base via l'API
      try {
        // Utiliser les cookies de la requête Socket.IO
        const cookies = socket.handshake.headers.cookie;
        console.log(`   🍪 [API] Cookies utilisés:`, cookies);

        const apiUrl = `${appUrl}/api/conversations/${data.conversationId}/messages`;
        const requestBody = {
          content: data.content,
          attachments: data.attachments,
        };

        console.log(`   🌐 [API] URL: ${apiUrl}`);
        console.log(
          `   📤 [API] Request Body:`,
          JSON.stringify(requestBody, null, 2)
        );

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookies,
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`   📊 [API] Response Status: ${response.status}`);
        console.log(
          `   📋 [API] Response Headers:`,
          Object.fromEntries(response.headers.entries())
        );

        if (response.ok) {
          const messageData = await response.json();
          console.log(`   ✅ [API] Message sauvegardé:`, messageData);
          console.log(`   🆔 [API] Message ID: ${messageData.id}`);

          // Diffuser à la conversation (sauf à l'expéditeur qui a déjà le message optimiste)
          const roomName = `conversation:${data.conversationId}`;
          const roomSockets = await io.in(roomName).fetchSockets();
          console.log(`   📡 [BROADCAST] Diffusion à room: ${roomName}`);
          console.log(
            `   👥 [BROADCAST] Nombre de sockets dans la room: ${roomSockets.length}`
          );

          io.to(roomName).emit("message:new", messageData);
          console.log(`   ✅ [BROADCAST] Message diffusé avec succès`);
        } else {
          const errorText = await response.text();
          console.error(`   ❌ [API] Erreur sauvegarde: ${response.status}`);
          console.error(`   📝 [API] Error Response:`, errorText);
          socket.emit("error", { message: "Erreur lors de la sauvegarde" });
        }
      } catch (apiError) {
        console.error(`   ❌ [API] Erreur API:`, apiError);
        console.error(`   📝 [API] Error Stack:`, apiError.stack);
        socket.emit("error", { message: "Erreur de connexion à l'API" });
      }
    } catch (error) {
      console.error(`   ❌ [MESSAGE] Erreur générale:`, error);
      console.error(`   📝 [MESSAGE] Error Stack:`, error.stack);
      socket.emit("error", { message: "Erreur lors de l'envoi" });
    }
  });

  // Rejoindre une conversation
  socket.on("join:conversation", (data) => {
    const timestamp = new Date().toISOString();
    console.log(`\n🏠 [JOIN:CONVERSATION] ${timestamp}`);
    console.log(`   👤 User: ${userId}`);
    console.log(`   🆔 Socket: ${socket.id}`);
    console.log(`   💬 Conversation: ${data.conversationId}`);
    console.log(`   📦 Data:`, JSON.stringify(data, null, 2));

    try {
      const roomName = `conversation:${data.conversationId}`;
      socket.join(roomName);
      console.log(`   ✅ [ROOM] Rejoint room: ${roomName}`);

      const responseData = {
        conversationId: data.conversationId,
        timestamp: timestamp,
        socketId: socket.id,
      };

      socket.emit("conversation:joined", responseData);
      console.log(`   📤 [EMIT] conversation:joined envoyé:`, responseData);

      // Log des rooms actuelles du socket
      const rooms = Array.from(socket.rooms);
      console.log(`   🏠 [ROOMS] Rooms actuelles:`, rooms);
    } catch (error) {
      console.error(`   ❌ [JOIN] Erreur:`, error);
      console.error(`   📝 [JOIN] Error Stack:`, error.stack);
    }
  });

  // Quitter une conversation
  socket.on("leave:conversation", (data) => {
    const timestamp = new Date().toISOString();
    console.log(`\n🚪 [LEAVE:CONVERSATION] ${timestamp}`);
    console.log(`   👤 User: ${userId}`);
    console.log(`   🆔 Socket: ${socket.id}`);
    console.log(`   💬 Conversation: ${data.conversationId}`);
    console.log(`   📦 Data:`, JSON.stringify(data, null, 2));

    try {
      const roomName = `conversation:${data.conversationId}`;
      socket.leave(roomName);
      console.log(`   ✅ [ROOM] Quitté room: ${roomName}`);

      // Log des rooms actuelles du socket
      const rooms = Array.from(socket.rooms);
      console.log(`   🏠 [ROOMS] Rooms actuelles:`, rooms);
    } catch (error) {
      console.error(`   ❌ [LEAVE] Erreur:`, error);
      console.error(`   📝 [LEAVE] Error Stack:`, error.stack);
    }
  });

  // Gestion de la déconnexion
  socket.on("disconnect", (reason) => {
    const timestamp = new Date().toISOString();
    console.log(`\n❌ [DISCONNECT] ${timestamp}`);
    console.log(`   👤 User: ${userId || "non authentifié"}`);
    console.log(`   🆔 Socket: ${socket.id}`);
    console.log(`   📍 IP: ${socket.handshake.address}`);
    console.log(`   🔍 Reason: ${reason}`);
    console.log(`   🏠 Rooms:`, Array.from(socket.rooms));
    console.log(`   📊 Connexions restantes: ${io.engine.clientsCount - 1}`);
  });

  // Message de bienvenue
  const welcomeData = {
    message: "Connexion réussie !",
    userId: userId,
    socketId: socket.id,
    timestamp: new Date().toISOString(),
    serverInfo: {
      version: "1.0.0",
      uptime: process.uptime(),
      connections: io.engine.clientsCount,
    },
  };

  socket.emit("welcome", welcomeData);
  console.log(`   📤 [WELCOME] Message de bienvenue envoyé:`, welcomeData);
});

// Gestion des erreurs globales
io.on("error", (error) => {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [SOCKET.IO GLOBAL ERROR] ${timestamp}`);
  console.error(`   📝 Error:`, error);
  console.error(`   📊 Stack:`, error.stack);
  console.error(`   🔍 Type:`, typeof error);
});

// Démarrer le serveur
const port = process.env.PORT || 3001;
console.log(`\n🚀 [SERVER START] Démarrage du serveur...`);
console.log(`   🔧 Port: ${port}`);
console.log(`   🌐 Host: 0.0.0.0`);
console.log(`   📅 Timestamp: ${new Date().toISOString()}`);

httpServer.listen(port, "0.0.0.0", (err) => {
  if (err) {
    console.error("❌ [SERVER START ERROR] Erreur de démarrage:", err);
    console.error("   📝 Error Stack:", err.stack);
    throw err;
  }

  const timestamp = new Date().toISOString();
  console.log(`\n✅ [SERVER STARTED] ${timestamp}`);
  console.log(`   🚀 Serveur Socket.IO démarré sur le port ${port}`);
  console.log(`   🌐 Application: ${appUrl}`);
  console.log(`   🔗 URL complète: http://0.0.0.0:${port}`);
  console.log(`   📊 PID: ${process.pid}`);
  console.log(`   💾 Mémoire initiale:`, process.memoryUsage());

  // En production, afficher des informations de santé
  if (!dev) {
    console.log("   ✅ Serveur prêt pour la production");
    console.log(`   📊 Environnement: ${process.env.NODE_ENV}`);
  }

  console.log(`\n🎉 [READY] Serveur prêt à accepter les connexions !`);
});

// Gestion des signaux d'arrêt
const gracefulShutdown = (signal) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🛑 [SHUTDOWN] ${timestamp} - Signal ${signal} reçu`);
  console.log(`   📊 Connexions actives: ${io.engine.clientsCount}`);
  console.log(`   ⏱️  Uptime: ${process.uptime()}s`);
  console.log(`   💾 Mémoire:`, process.memoryUsage());
  console.log(`   🔄 Début de l'arrêt gracieux...`);

  // Fermer les connexions Socket.IO
  io.close(() => {
    console.log(`   ✅ [SHUTDOWN] Socket.IO fermé`);
  });

  // Fermer le serveur HTTP
  httpServer.close(() => {
    console.log(`   ✅ [SHUTDOWN] Serveur HTTP fermé`);
    console.log(`   🎯 [SHUTDOWN] Arrêt propre terminé`);
    process.exit(0);
  });

  // Forcer l'arrêt après 10 secondes
  setTimeout(() => {
    console.log(`   ⚠️ [SHUTDOWN] Arrêt forcé du serveur après 10s`);
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Log des signaux reçus
process.on("SIGTERM", () => {
  console.log(`\n📡 [SIGNAL] SIGTERM reçu - Arrêt demandé par le système`);
});
process.on("SIGINT", () => {
  console.log(
    `\n📡 [SIGNAL] SIGINT reçu - Arrêt demandé par l'utilisateur (Ctrl+C)`
  );
});

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [UNCAUGHT EXCEPTION] ${timestamp}`);
  console.error(`   📝 Error:`, error);
  console.error(`   📊 Stack:`, error.stack);
  console.error(`   🔍 Type:`, typeof error);
  console.error(`   📊 Connexions: ${io.engine.clientsCount}`);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [UNHANDLED REJECTION] ${timestamp}`);
  console.error(`   📝 Reason:`, reason);
  console.error(`   🔍 Promise:`, promise);
  console.error(`   📊 Connexions: ${io.engine.clientsCount}`);
  gracefulShutdown("unhandledRejection");
});

// Log de démarrage des gestionnaires d'erreurs
console.log(`\n🛡️ [ERROR HANDLERS] Gestionnaires d'erreurs installés:`);
console.log(`   - uncaughtException`);
console.log(`   - unhandledRejection`);
console.log(`   - SIGTERM`);
console.log(`   - SIGINT`);
