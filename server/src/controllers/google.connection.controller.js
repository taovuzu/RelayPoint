import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Connection } from '../models/connection.model.js';
import { EncryptionService } from '../services/encryption.service.js';
import { OAuthStateService } from '../services/oauthState.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const redirectToGoogleAuth = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const existingConnection = await Connection.findOne({
    userId,
    service: 'google',
    isActive: true
  });

  if (existingConnection) {
    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=connected&connectionId=${existingConnection._id}`);
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const state = OAuthStateService.generateState();

  const stateData = {
    userId: userId.toString(),
    service: 'google',
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
  };

  const stateStored = await OAuthStateService.storeState(state, stateData, 600); // 10 minutes TTL
  if (!stateStored) {
    throw new ApiError(500, 'Failed to initialize OAuth state');
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required for refresh token
    prompt: 'consent', // Force consent screen to ensure refresh token
    scope: scopes,
    state: state,
    include_granted_scopes: true,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  });

  logger.info('Google OAuth redirect initiated', {
    userId,
    state: state.substring(0, 8) + '...'
  });

  res.redirect(authUrl);
});

export const handleGoogleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  logger.info('Google OAuth callback received', {
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
    state: state?.substring(0, 8) + '...',
    query: req.query
  });

  if (error) {
    logger.error('Google OAuth error', { error, state: state?.substring(0, 8) + '...' });
    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=error&error=${encodeURIComponent(error)}`);
  }

  if (!state || !OAuthStateService.isValidState(state)) {
    logger.error('Invalid OAuth state parameter', {
      receivedState: state?.substring(0, 8) + '...',
      isValid: OAuthStateService.isValidState(state)
    });
    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=error&error=invalid_state`);
  }

  const stateData = await OAuthStateService.getState(state);
  if (!stateData) {
    logger.error('OAuth state not found or expired', {
      state: state.substring(0, 8) + '...'
    });
    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=error&error=state_expired`);
  }

  const userId = stateData.userId;

  if (!code) {
    logger.error('No authorization code received', { userId });
    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=error&error=no_code`);
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const people = google.people({ version: 'v1', auth: oauth2Client });
    const profile = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names'
    });

    const emailAddress = profile.data.emailAddresses?.[0]?.value;
    const displayName = profile.data.names?.[0]?.displayName || emailAddress;

    if (!emailAddress) {
      throw new Error('Could not retrieve user email from Google');
    }

    await Connection.updateMany(
      { userId, service: 'google', isActive: true },
      { isActive: false }
    );

    const encryptedCredentials = EncryptionService.encryptObject(tokens);
    const iv = encryptedCredentials.split(':')[0];

    logger.info('Creating Google connection', { userId, emailAddress });
    const connection = await Connection.create({
      userId,
      service: 'google',
      accountIdentifier: emailAddress,
      encryptedCredentials,
      iv
    });
    logger.info('Google connection created successfully', { connectionId: connection._id });

    await OAuthStateService.deleteState(state);

    logger.info('Google OAuth connection created successfully', {
      userId,
      connectionId: connection._id,
      email: emailAddress,
      hasRefreshToken: !!tokens.refresh_token
    });

    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=success&connectionId=${connection._id}&email=${encodeURIComponent(emailAddress)}`);

  } catch (error) {
    logger.error('Google OAuth callback error', {
      error: error.message,
      stack: error.stack,
      userId,
      state: state?.substring(0, 8) + '...'
    });

    if (state) {
      await OAuthStateService.deleteState(state);
    }

    return res.redirect(`${process.env.FRONTEND_URL}/connections/google?status=error&error=${encodeURIComponent(error.message)}`);
  }
});

export const getGoogleConnectionStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connection = await Connection.findOne({
    userId,
    service: 'google',
    isActive: true
  }).select('-encryptedCredentials -iv');

  if (!connection) {
    return ApiResponse.success(
      { connected: false },
      'No Google connection found',
      200
    ).withRequest(req).send(res);
  }

  return ApiResponse.success(
    {
      connected: true,
      connection: {
        _id: connection._id,
        accountIdentifier: connection.accountIdentifier,
        createdAt: connection.createdAt,
        lastUsedAt: connection.lastUsedAt
      }
    },
    'Google connection found',
    200
  ).withRequest(req).send(res);
});

export const disconnectGoogle = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const connection = await Connection.findOne({
    userId,
    service: 'google',
    isActive: true
  });

  if (!connection) {
    throw ApiError.notFound('Google connection not found');
  }

  await Connection.findByIdAndUpdate(connection._id, {
    isActive: false,
    lastUsedAt: new Date()
  });

  logger.info('Google connection disconnected', {
    userId,
    connectionId: connection._id,
    email: connection.accountIdentifier
  });

  return ApiResponse.success(
    {},
    'Google account disconnected successfully',
    200
  ).withRequest(req).send(res);
});
