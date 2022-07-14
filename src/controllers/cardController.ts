import { Request, Response } from "express";
import { TransactionTypes } from "../repositories/cardRepository.js";

import cardServices from "../services/cardService.js";

interface CreateCardBody {
    employeeId: number;
    type: TransactionTypes;
}

interface Employee {
    id: number;
    fullName: string;
    cpf: string;
    email: string;
    companyId: number;
}

interface ActivateCardBody {
    cvc: string;
    password: string;
}

async function create(req: Request, res: Response){
    const cardData: CreateCardBody = req.body;
    const employeeData: Employee = res.locals.employee;

    await cardServices.createCard(employeeData, cardData.type);

    res.sendStatus(201);
}

async function activate(req: Request, res: Response) {
    const cardId = parseInt(req.params.cardId);

    if (isNaN(cardId) || !cardId) {
        throw {
            type: "unprocessableEntity",
            message: "Invalid cardId",
        };
    }

    const { cvc, password }: ActivateCardBody = req.body;

    await cardServices.activateCard(cardId, cvc, password);

    res.sendStatus(200);
}

async function getTransactions(req: Request, res: Response) {
    const cardId = parseInt(req.params.cardId);

    if (!cardId || isNaN(cardId)) {
        throw {
            type: "unprocessableEntity",
            message: "Invalid cardId",
        };
    }

    const transactions = await cardServices.getTransactions(cardId);

    res.send(transactions);
}

async function block(req: Request, res: Response) {
    const cardId = parseInt(req.params.cardId);
    const password: string = req.body.password;

    if (!cardId || isNaN(cardId)) {
        throw {
            type: "unprocessableEntity",
            message: "Invalid cardId",
        };
    }

    await cardServices.blockCard(cardId, password);

    res.sendStatus(200);
}

const cardController = {
    create,
    activate,
    getTransactions,
    block
}

export default cardController