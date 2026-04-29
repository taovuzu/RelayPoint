import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import passport from "passport";
import helmet from "helmet";
import envConfig from '#config/env.config.js';

import logger from './util/logger.js';
import "#middleware/passport.js";

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: envConfig.FRONTEND_URL,
  credentials: true
}));

app.use(requestIp.mw());
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser(envConfig.COOKIE_SECRET));
app.use(express.static("public"));
app.use(passport.initialize());

app.use((req, res, next) => {
  const skipLogs = req.originalUrl.startsWith('/apps/') || req.originalUrl.startsWith('/api/v1/health');
  if (skipLogs) return next();

  const start = Date.now();
  const { method, originalUrl, body: reqBody } = req;

  const originalSend = res.send;
  let resBody;
  res.send = function (chunk) {
    resBody = chunk;
    return originalSend.apply(res, arguments);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const isError = statusCode >= 400;
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (isError || isMutation) {
      let parsedResBody = resBody;
      try {
        if (typeof resBody === 'string') parsedResBody = JSON.parse(resBody);
      } catch (e) {
        // Not JSON
      }

      logger.info(`HTTP ${method} ${originalUrl} [${statusCode}] - ${duration}ms`, {
        request: { method, url: originalUrl, body: reqBody },
        response: { statusCode, body: parsedResBody }
      });
    } else {
      // Simple one-liner for successful GETs
      logger.info(`HTTP ${method} ${originalUrl} [${statusCode}] - ${duration}ms`);
    }
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
import appsRouter from './apps/apps.routes.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/health", healthRouter);

app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/apps', appsRouter);
app.use('/hooks/triggers', webhookRouter);
app.use('/hooks/nango', nangoWebhookRouter);

app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export { app };