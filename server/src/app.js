import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { globalSlowDown } from "#middlewares/rateLimit.middleware.js";
import requestIp from "request-ip";
import passport from "passport";
import helmet from "helmet";
import envConfig from '#config/env.config.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: envConfig.FRONTEND_URL,
  credentials: true
}));

app.use((req, res, next) => {
  logger.info(`>>> Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use(requestIp.mw());

// app.use(globalSlowDown({ windowMs: 15 * 60 * 1000, threshold: 100 }));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser(envConfig.COOKIE_SECRET));
app.use(express.static("public"));

import logger from './util/logger.js';
import "#middleware/passport.js";
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


import userRouter from "./route/user.route.js";
import healthRouter from "./route/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

import connectionRouter from './features/connection/connection.routes.js';
import workflowRouter from './features/workflow/workflow.routes.js';
import webhookRouter from './features/webhook/webhook.routes.js';
import nangoWebhookRouter from './features/webhook/nango.webhook.routes.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/health", healthRouter);

app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/hooks/triggers', webhookRouter);
app.use('/hooks/nango', nangoWebhookRouter);

app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export { app };
