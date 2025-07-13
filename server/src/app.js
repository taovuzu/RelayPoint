import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalSlowDown } from "./middlewares/rateLimit.middleware.js";
import requestIp from "request-ip";
import passport from "passport";
import helmet from "helmet";


const app = express();

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://localhost:*",
        "https://accounts.google.com",
        "https://www.googleapis.com",
        "https://play.google.com",
        "https://oauth2.googleapis.com",
        "https://www.google.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.use(requestIp.mw());

app.use(globalSlowDown({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || (15 * 60 * 1000),
  threshold: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
}));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static("public"));

import logger from './utils/logger.js';
import "./middlewares/passport.js";
app.use(passport.initialize());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    logger.http(`${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
});

import userRouter from './routes/user.routes.js';
import relayRouter from './routes/relay.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import suggesterRouter from './routes/suggester.routes.js';
import healthRouter from './routes/health.routes.js';
import actionRouter from './routes/action.routes.js';
import triggerRouter from './routes/trigger.routes.js';
import connectionRouter from './routes/connection.routes.js';
import googleConnectionRouter from './routes/google.connection.routes.js';
import gmailRouter from './routes/gmail.routes.js';
import sheetsRouter from './routes/sheets.routes.js';
import webhookTriggerRouter from './routes/webhook.trigger.routes.js';
import solanaRouter from './routes/solana.routes.js';
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

app.use('/api/v1/users', userRouter);
app.use('/api/v1/relays', relayRouter);
app.use('/api/v1/hooks', webhookRouter);
app.use('/api/v1/suggester', suggesterRouter);
app.use("/api/v1/health", healthRouter);
app.use('/api/v1/actions', actionRouter);
app.use('/api/v1/triggers', triggerRouter);
// Google connection routes must come before general connection routes
app.use('/api/v1/connections/google', googleConnectionRouter);
app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/gmail', gmailRouter);
app.use('/api/v1/sheets', sheetsRouter);
app.use('/api/v1/webhooks', webhookTriggerRouter);
app.use('/api/v1/solana', solanaRouter);

app.use(errorHandler);

export { app };
