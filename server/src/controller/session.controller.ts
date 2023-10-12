import { CookieOptions, Request, Response } from 'express';
import {
  findAndUpdateUser,
  getGoogleOAuthTokens,
  getGoogleUser,
  validatePassword,
} from '../service/user.service';
import {
  createSession,
  findSessions,
  updateSession,
} from '../service/session.service';
import { signJwt } from '../utils/jwt.utils';
import config from 'config';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';
import { findAndUpdateProduct } from '../service/product.service';

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 minutes
  httpOnly: true,
  domain: 'localhost',
  path: '/',
  sameSite: 'lax',
  secure: false,
};
const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10, // 1 year
};

export async function createSessionHandler(req: Request, res: Response) {
  // Validate the email and password
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(401).send('Invalid username or password');
  }

  // Create a session
  const session = await createSession(user._id, req.get('user-agent') || '');

  // Create access token
  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get('accessTokenTtl') } // 15 minutes
  );

  // Create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get('refreshTokenTtl') } // 1 year
  );

  // return access & refresh token

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
  return res.send({ accessToken, refreshToken });
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session;

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({
    accessToken: '',
    refreshToken: '',
  });
}

export async function googleOAuthHandler(req: Request, res: Response) {
  // TODO: get the code from qs
  const code = req.query.code as string;
  try {
    // TODO: get the id and access token with the code
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });
    console.log({ id_token, access_token });

    // TODO: get the user with tokens
    const googleUser =
      //jwt.decode(id_token);
      await getGoogleUser({ id_token, access_token });

    console.log({ googleUser });

    if (!googleUser.verified_email) {
      return res.status(403).send('Google account is not verified');
    }
    // TODO: upsert the user
    const user = await findAndUpdateUser(
      { email: googleUser.email },
      {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      {
        upsert: true,
        new: true,
      }
    );

    // TODO: create a session
    if (!user) {
      logger.error('Failed to update the user');
      throw new Error('Failed to update the user');
    }
    const session = await createSession(user._id, req.get('user-agent') || '');

    // TODO: create access and refresh token
    const accessToken = signJwt(
      { ...user.toJSON(), session: session._id },
      { expiresIn: config.get('accessTokenTtl') } // 15 minutes
    );

    const refreshToken = signJwt(
      { ...user.toJSON(), session: session._id },
      { expiresIn: config.get('refreshTokenTtl') } // 1 year
    );

    // TODO: set cookies
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    // TODO: redirect back to client}
    res.redirect(`${config.get('origin')}`);
  } catch (error: any) {
    logger.error(error, 'Failed to authorize Google user');
    return res.redirect(`${config.get('origin')}/oauth/error`);
  }
}
