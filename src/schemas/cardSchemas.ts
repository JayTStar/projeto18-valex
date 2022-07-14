import Joi from "joi"

const createCard = Joi.object({
    employeeId: Joi.number().required(),
    type: Joi.string().valid("groceries", "restaurants", "transport", "education", "health").required()
});

const activateCard = Joi.object({
    cvc: Joi.string().length(3).required(),
    password: Joi.string().length(4).pattern(/[0-9]{4}/).required(),
});

const cardPassword = Joi.object({
    password: Joi.string().length(4).pattern(/[0-9]{4}/).required()
});

const cardSchemas = {
    createCard,
    activateCard,
    cardPassword
}

export default cardSchemas;