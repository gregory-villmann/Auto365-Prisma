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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationRoute = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../utils/bcrypt");
const verifyEmail_1 = require("../utils/verifyEmail");
const prisma = new client_1.PrismaClient();
exports.registrationRoute = (0, express_1.Router)();
exports.registrationRoute.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, firstName, lastName, password } = req.body;
    if (password.length < 5) {
        return res.status(409).json({ errorMessage: 'Password should be minimum 5 characters' });
    }
    if (!(yield isEmailValid(email))) {
        return res.status(409).json({ errorMessage: 'Email not valid' });
    }
    if (!(yield isEmailInUse(email))) {
        return res.status(409).json({ errorMessage: 'Email is already in use' });
    }
    try {
        const user = yield prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                password: yield (0, bcrypt_1.hashPassword)(password),
            }
        });
        res.status(200).json({ response: 'User has been registered successfully', email: user.email });
    }
    catch (error) {
        res.status(500).json({ errorMessage: 'An error has occurred, user has not been registered', error: error });
    }
}));
function isEmailValid(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, verifyEmail_1.verifyEmail)(email);
            return result.success;
        }
        catch (error) {
            console.log("Error: " + error);
            return false;
        }
    });
}
function isEmailInUse(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if user already exists
            const userExists = yield prisma.user.findUnique({
                where: {
                    email: email
                },
            });
            return !userExists;
        }
        catch (err) {
            console.log("Error: " + err);
            return false;
        }
    });
}
