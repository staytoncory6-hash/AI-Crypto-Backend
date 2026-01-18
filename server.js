import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// IMPORTANT: lock this down to your GitHub Pages domain in production
app.use(cors({
  origin: true,
  credentials: true
}));

// In-memory state for demo (use a DB/Redis/Durable Object in production)
const state = {
  connected: false,
  running: false,
  mode: "paper",
  lastAction: null
};

// --- AUTH (stub) ---
// In real life, /auth/start generates a Coinbase OAuth URL.
// /auth/callback handles the redirect + exchanges code for token.
app.get("/auth/start", (req, res) => {
  // TODO: build Coinbase OAuth URL here (recommended) OR implement secure API-key flow.
  // For now we return a placeholder.
  res.json({ url: "https://example.com/coinbase-oauth-placeholder" });
});

app.get("/auth/callback", (req, res) => {
  // TODO: exchange code for tokens, store securely server-side.
  state.connected = true;
  state.lastAction = "auth_callback";
  res.send("Connected! You can close this tab and go back to the dashboard.");
});

// --- BOT CONTROL ---
app.post("/bot/start", (req, res) => {
  if (!state.connected) return res.status(401).json({ error: "Not connected to Coinbase yet." });

  const mode = req.body?.mode === "live" ? "live" : "paper";
  state.running = true;
  state.mode = mode;
  state.lastAction = "start";

  // TODO: start your strategy loop / scheduler here
  res.json({ ok: true, running: state.running, mode: state.mode });
});

app.post("/bot/stop", (req, res) => {
  state.running = false;
  state.lastAction = "stop";

  // TODO: stop your strategy loop here
  res.json({ ok: true, running: state.running });
});

app.get("/bot/status", (req, res) => {
  res.json({
    connected: state.connected,
    running: state.running,
    mode: state.mode,
    lastAction: state.lastAction
  });
});

app.get("/", (req, res) => res.send("Crypto Bot Backend is running."));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
