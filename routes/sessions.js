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
exports.sessionsRoute = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../utils/bcrypt");
const uuid_1 = require("uuid");
const verifySession_1 = require("../utils/verifySession");
const prisma = new client_1.PrismaClient();
exports.sessionsRoute = (0, express_1.Router)();
exports.sessionsRoute.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Lisada valideerimised, et email ja parool oleks päringu kehas olemas
    // TODO: Kontrollida, et päringuga saadetud emailiga kasutaja eksisteerib
    // TODO: Võrrelda, kas andmebaasi salvestatud parooliräsi klapib saadetud parooliga, kui see ära räsida (ja saata veateade kui mitte)
    // TODO: Luua andmebaasi uus sessioon sellele kasutajale
    // TODO: Saata päringu vastusena selle uue sessiooni id
    const { email, password } = req.body;
    if (email === "" || password === "") {
        return res.status(500).json({ errorMessage: "Email or Password is empty" });
    }
    const isPwValid = yield isPasswordValid(email, password);
    if (isPwValid) {
        const userId = yield prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true
            }
        });
        const uuid = (0, uuid_1.v4)();
        if (userId) {
            yield prisma.session.create({
                data: {
                    id: "Bearer " + uuid,
                    userId: userId.id
                }
            });
            res.status(200).json({ uuid: "Bearer " + uuid });
        }
    }
    else {
        res.status(500).json({ errorMessage: "Valideerimine ebaõnnestus" });
    }
    /*
    try {
        const isPwValid = await isPasswordValid(email, password);
        console.log("isPasswordValid? " + isPwValid);
        res.status(200).json({isPWValid: isPwValid});
    } catch (err: Error) {
        console.log(err);
        res.status(500).json({errorMessage: "Valideerimine ebaõnnestus"});
    }*/
}));
exports.sessionsRoute.post('/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    console.log(token);
    const istokenvalid = yield (0, verifySession_1.verifySession)(token);
    res.status(200).json({ onValidToken: istokenvalid });
}));
function isPasswordValid(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hashedPassword = yield prisma.user.findUnique({
                where: {
                    email: email
                },
                select: {
                    password: true
                }
            });
            if (hashedPassword === null || hashedPassword === void 0 ? void 0 : hashedPassword.password) {
                return (0, bcrypt_1.comparePasswords)(password, hashedPassword.password);
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.log("Error: Error has occured while verifying password" + error);
            return false;
        }
    });
}
