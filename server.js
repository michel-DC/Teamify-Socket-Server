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

// Créer le serveur HTTP simple
const httpServer = createServer((req, res) => {
  // Endpoint de health check
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "socket-io-server",
      })
    );
    return;
  }

  // Page d'accueil avec emoji
  if (req.url === "/" || req.url === "") {
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
      "https://socket.teamify.onlinemichel.dev/",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Cookie", "Authorization"],
  },
  transports: ["websocket", "polling"],
});

console.log("✅ Socket.IO initialisé");

// Ajout de la gestion des erreurs de connexion engine.io
io.engine.on("connection_error", (err) => {
  console.error("❌ Connection error", err.req.url, err.code, err.message);
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
  const userId = socket.data.userId;
  if (dev) {
    console.log(
      `[Socket.IO] 🔌 Utilisateur connecté: ${userId} (${socket.id})`
    );
  }

  // Rejoindre la room utilisateur
  socket.join(`user:${userId}`);

  // Événement de test
  socket.on("ping", () => {
    if (dev) {
      console.log(`[Socket.IO] 📡 Ping reçu de ${userId}`);
    }
    socket.emit("pong", {
      message: "Pong!",
      timestamp: new Date().toISOString(),
      userId: userId,
    });
  });

  // Événement d'envoi de message
  socket.on("message:send", async (data) => {
    try {
      if (dev) {
        console.log(`[Socket.IO] 📨 Message reçu:`, data);
      }

      // Sauvegarder le message en base via l'API
      try {
        // Utiliser les cookies de la requête Socket.IO
        const cookies = socket.handshake.headers.cookie;

        const response = await fetch(
          `${appUrl}/api/conversations/${data.conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: cookies,
            },
            body: JSON.stringify({
              content: data.content,
              attachments: data.attachments,
            }),
          }
        );

        if (response.ok) {
          const messageData = await response.json();
          if (dev) {
            console.log(
              `[Socket.IO] ✅ Message sauvegardé en base:`,
              messageData.id
            );
          }

          // Diffuser à la conversation (sauf à l'expéditeur qui a déjà le message optimiste)
          io.to(`conversation:${data.conversationId}`).emit(
            "message:new",
            messageData
          );
          if (dev) {
            console.log(
              `[Socket.IO] ✅ Message diffusé à la conversation: ${data.conversationId}`
            );
          }
        } else {
          console.error(`[Socket.IO] ❌ Erreur sauvegarde:`, response.status);
          socket.emit("error", { message: "Erreur lors de la sauvegarde" });
        }
      } catch (apiError) {
        console.error(`[Socket.IO] ❌ Erreur API:`, apiError);
        socket.emit("error", { message: "Erreur de connexion à l'API" });
      }
    } catch (error) {
      console.error(`[Socket.IO] ❌ Erreur message:`, error);
      socket.emit("error", { message: "Erreur lors de l'envoi" });
    }
  });

  // Rejoindre une conversation
  socket.on("join:conversation", (data) => {
    try {
      if (dev) {
        console.log(
          `[Socket.IO] 🏠 Utilisateur ${userId} rejoint conversation: ${data.conversationId}`
        );
      }
      socket.join(`conversation:${data.conversationId}`);
      socket.emit("conversation:joined", {
        conversationId: data.conversationId,
      });
      if (dev) {
        console.log(
          `[Socket.IO] ✅ Utilisateur ${userId} dans la room: conversation:${data.conversationId}`
        );
      }
    } catch (error) {
      console.error(`[Socket.IO] ❌ Erreur join:`, error);
    }
  });

  // Quitter une conversation
  socket.on("leave:conversation", (data) => {
    try {
      if (dev) {
        console.log(
          `[Socket.IO] 🚪 Quitte conversation: ${data.conversationId}`
        );
      }
      socket.leave(`conversation:${data.conversationId}`);
    } catch (error) {
      console.error(`[Socket.IO] ❌ Erreur leave:`, error);
    }
  });

  // Gestion de la déconnexion
  socket.on("disconnect", (reason) => {
    if (dev) {
      console.log(`[Socket.IO] ❌ Déconnexion: ${userId} - ${reason}`);
    }
  });

  // Message de bienvenue
  socket.emit("welcome", {
    message: "Connexion réussie !",
    userId: userId,
    timestamp: new Date().toISOString(),
  });
});

// Gestion des erreurs globales
io.on("error", (error) => {
  console.error("[Socket.IO] ❌ Erreur globale:", error);
});

// Démarrer le serveur
const port = process.env.PORT || 3001;
httpServer.listen(port, "0.0.0.0", (err) => {
  if (err) {
    console.error("❌ Erreur de démarrage:", err);
    throw err;
  }
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${port}`);
  console.log(`🌐 Application: ${appUrl}`);

  // En production, afficher des informations de santé
  if (!dev) {
    console.log("✅ Serveur prêt pour la production");
    console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
  }
});

// Gestion des signaux d'arrêt
const gracefulShutdown = (signal) => {
  console.log(`🛑 Signal ${signal} reçu, arrêt du serveur...`);

  // Fermer les connexions Socket.IO
  io.close(() => {
    console.log("✅ Socket.IO fermé");
  });

  // Fermer le serveur HTTP
  httpServer.close(() => {
    console.log("✅ Serveur arrêté proprement");
    process.exit(0);
  });

  // Forcer l'arrêt après 10 secondes
  setTimeout(() => {
    console.log("⚠️ Arrêt forcé du serveur");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("❌ Erreur non capturée:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesse rejetée non gérée:", reason);
  gracefulShutdown("unhandledRejection");
});
