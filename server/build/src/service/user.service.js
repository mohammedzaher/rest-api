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
exports.findAndUpdateUser = exports.getGoogleUser = exports.getGoogleOAuthTokens = exports.findUser = exports.validatePassword = exports.createUser = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("config"));
const lodash_1 = require("lodash");
const user_model_1 = __importDefault(require("../models/user.model"));
const qs_1 = __importDefault(require("qs"));
const logger_1 = __importDefault(require("../utils/logger"));
function createUser(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.create(input);
            return (0, lodash_1.omit)(user.toJSON(), 'password');
        }
        catch (e) {
            throw new Error(e);
        }
    });
}
exports.createUser = createUser;
function validatePassword({ email, password, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return false;
        }
        const isValid = yield user.comparePassword(password);
        if (!isValid) {
            return false;
        }
        return (0, lodash_1.omit)(user.toJSON(), 'password');
    });
}
exports.validatePassword = validatePassword;
function findUser(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return user_model_1.default.findOne(query).lean();
    });
}
exports.findUser = findUser;
function getGoogleOAuthTokens({ code, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://oauth2.googleapis.com/token';
        const values = {
            code,
            client_id: config_1.default.get('googleClientId'),
            client_secret: config_1.default.get('googleClientSecret'),
            redirect_uri: config_1.default.get('googleOauthRedirectUrl'),
            grant_type: 'authorization_code',
        };
        try {
            const res = yield axios_1.default.post(url, qs_1.default.stringify(values), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return res.data;
        }
        catch (error) {
            console.error(error.response.data.error);
            logger_1.default.error(error, 'Failed to fetch Google Oauth Tokens');
            throw new Error(error.message);
        }
    });
}
exports.getGoogleOAuthTokens = getGoogleOAuthTokens;
function getGoogleUser({ id_token, access_token, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            });
            return res.data;
        }
        catch (error) {
            logger_1.default.error(error, 'Error Failer fetching Google userr');
            throw new Error(error.message);
        }
    });
}
exports.getGoogleUser = getGoogleUser;
function findAndUpdateUser(query, update, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return user_model_1.default.findOneAndUpdate(query, update, options);
    });
}
exports.findAndUpdateUser = findAndUpdateUser;
