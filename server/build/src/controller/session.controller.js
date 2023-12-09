"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthHandler = exports.deleteSessionHandler = exports.getUserSessionsHandler = exports.createSessionHandler = void 0;
const user_service_1 = require("../service/user.service");
const session_service_1 = require("../service/session.service");
const jwt_utils_1 = require("../utils/jwt.utils");
const config_1 = __importDefault(require("config"));
const logger_1 = __importDefault(require("../utils/logger"));
const accessTokenCookieOptions = {
    maxAge: 900000,
    httpOnly: true,
    domain: 'localhost',
    path: '/',
    sameSite: 'lax',
    secure: false,
};
const refreshTokenCookieOptions = Object.assign(Object.assign({}, accessTokenCookieOptions), { maxAge: 3.154e10 });
function createSessionHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate the email and password
        const user = yield (0, user_service_1.validatePassword)(req.body);
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }
        // Create a session
        const session = yield (0, session_service_1.createSession)(user._id, req.get('user-agent') || '');
        // Create access token
        const accessToken = (0, jwt_utils_1.signJwt)(Object.assign(Object.assign({}, user), { session: session._id }), { expiresIn: config_1.default.get('accessTokenTtl') } // 15 minutes
        );
        // Create a refresh token
        const refreshToken = (0, jwt_utils_1.signJwt)(Object.assign(Object.assign({}, user), { session: session._id }), { expiresIn: config_1.default.get('refreshTokenTtl') } // 1 year
        );
        // return access & refresh token
        res.cookie('accessToken', accessToken, accessTokenCookieOptions);
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
        return res.send({ accessToken, refreshToken });
    });
}
exports.createSessionHandler = createSessionHandler;
function getUserSessionsHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = res.locals.user._id;
        const sessions = yield (0, session_service_1.findSessions)({ user: userId, valid: true });
        return res.send(sessions);
    });
}
exports.getUserSessionsHandler = getUserSessionsHandler;
function deleteSessionHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionId = res.locals.user.session;
        yield (0, session_service_1.updateSession)({ _id: sessionId }, { valid: false });
        return res.send({
            accessToken: '',
            refreshToken: '',
        });
    });
}
exports.deleteSessionHandler = deleteSessionHandler;
function googleOAuthHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: get the code from qs
        const code = req.query.code;
        try {
            // TODO: get the id and access token with the code
            const { id_token, access_token } = yield (0, user_service_1.getGoogleOAuthTokens)({ code });
            console.log({ id_token, access_token });
            // TODO: get the user with tokens
            const googleUser = 
            //jwt.decode(id_token);
            yield (0, user_service_1.getGoogleUser)({ id_token, access_token });
            console.log({ googleUser });
            if (!googleUser.verified_email) {
                return res.status(403).send('Google account is not verified');
            }
            // TODO: upsert the user
            const user = yield (0, user_service_1.findAndUpdateUser)({ email: googleUser.email }, {
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
            }, {
                upsert: true,
                new: true,
            });
            // TODO: create a session
            if (!user) {
                logger_1.default.error('Failed to update the user');
                throw new Error('Failed to update the user');
            }
            const session = yield (0, session_service_1.createSession)(user._id, req.get('user-agent') || '');
            // TODO: create access and refresh token
            const accessToken = (0, jwt_utils_1.signJwt)(Object.assign(Object.assign({}, user.toJSON()), { session: session._id }), { expiresIn: config_1.default.get('accessTokenTtl') } // 15 minutes
            );
            const refreshToken = (0, jwt_utils_1.signJwt)(Object.assign(Object.assign({}, user.toJSON()), { session: session._id }), { expiresIn: config_1.default.get('refreshTokenTtl') } // 1 year
            );
            // TODO: set cookies
            res.cookie('accessToken', accessToken, accessTokenCookieOptions);
            res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
            // TODO: redirect back to client}
            res.redirect(`${config_1.default.get('origin')}`);
        }
        catch (error) {
            logger_1.default.error(error, 'Failed to authorize Google user');
            return res.redirect(`${config_1.default.get('origin')}/oauth/error`);
        }
    });
}
exports.googleOAuthHandler = googleOAuthHandler;
