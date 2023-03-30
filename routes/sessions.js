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
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const verifyPassword_1 = require("../utils/verifyPassword");
const prisma = new client_1.PrismaClient();
exports.sessionsRoute = (0, express_1.Router)();
exports.sessionsRoute.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email === "" || password === "") {
        return res.status(500).json({ errorMessage: "Email or Password is empty" });
    }
    const isPwValid = yield (0, verifyPassword_1.isPasswordValid)(email, password);
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
                    id: 'Bearer ' + uuid,
                    userId: userId.id
                }
            });
            res.status(200).json({ uuid: 'Bearer ' + uuid });
        }
    }
    else {
        res.status(500).json({ errorMessage: "Valideerimine ebaõnnestus" });
    }
}));
exports.sessionsRoute.delete('', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('token');
    try {
        yield prisma.session.delete({
            where: {
                id: token
            }
        });
        res.status(204);
    }
    catch (error) {
        res.status(404).json({ error });
    }
}));
