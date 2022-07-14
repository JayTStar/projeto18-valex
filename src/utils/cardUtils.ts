import dayjs from "dayjs";
import Cryptr from "cryptr";
import bcrypt from "bcrypt";

import { TransactionTypes, Card } from "../repositories/cardRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as businessUtils from "../utils/businessUtils.js";

async function checkCardType(
    type: TransactionTypes,
    employeeId: number
) {
    const card = await cardRepository.findByTypeAndEmployeeId(type, employeeId);

    if (card) {
        throw {
            type: "conflict",
            message: "Employee already owns this card",
        };
    }
}

async function getCardData(cardId: number) {
    const cardData = await cardRepository.findById(cardId);

    if (!cardData) {
        throw {
            type: "notFound",
            message: "Card not found",
        };
    }

    return cardData;
}

function checkCardActive(password: string | null, active: boolean) {
    if (password !== null && !active) {
        throw {
            type: "badRequest",
            message: "Card is already active",
        };
    } else if (password === null && active) {
        throw {
            type: "unauthorized",
            message: "Card is not active",
        };
    }
}

function checkCardBlocked(isBlocked: boolean, blocked: boolean) {
    if (isBlocked && !blocked) {
        throw {
            type: "badRequest",
            message: "Card is blocked",
        };
    } else if (!isBlocked && blocked) {
        throw {
            type: "badRequest",
            message: "Card is not blocked",
        };
    }
}

function checkCardExpired(expirationDate: string) {
    const date = expirationDate.split("/");
    const formatedDate = dayjs()
        .set("date", 1)
        .set("month", parseInt(date[0]))
        .set("year", parseInt(date[1]))
        .format("DD/MM/YYYY");
    if (new Date() > new Date(formatedDate)) {
        throw {
            type: "badRequest",
            message: "Expired card",
        };
    }
}

function validateCvc(cvcInserted: string, encryptedCvc: string) {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);
    const decryptedCvc = cryptr.decrypt(encryptedCvc);
    console.log(decryptedCvc);

    if (cvcInserted !== decryptedCvc) {
        throw {
            type: "unauthorized",
            message: "Invalid cvc",
        };
    }
}

function validatePassword(password: string, passwordHash: string) {
    if (!bcrypt.compareSync(password, passwordHash)) {
        throw {
            type: "unauthorized",
            message: "Invalid password",
        };
    }
}

async function checkCardAndBusinessType(
    cardType: string,
    businessId: number
) {
    const businessData = await businessUtils.getBusinessData(businessId);

    if (cardType !== businessData.type) {
        throw {
            type: "badRequest",
            message: "Card type and business type are different",
        };
    }
}

async function calculateBalance(cardId: number) {
    const payments = await paymentRepository.findByCardId(cardId);
    const recharges = await rechargeRepository.findByCardId(cardId);

    let paymentsTotal = 0;
    payments.forEach((payment) => {
        paymentsTotal += payment.amount;
    });

    let rechargesTotal = 0;
    recharges.forEach((recharge) => {
        rechargesTotal += recharge.amount;
    });

    const balance = rechargesTotal - paymentsTotal;

    return { balance, payments, recharges };
}

const cardUtils = {
    checkCardType,
    getCardData,
    checkCardActive,
    checkCardBlocked,
    checkCardExpired,
    validateCvc,
    validatePassword,
    checkCardAndBusinessType,
    calculateBalance
}

export default cardUtils