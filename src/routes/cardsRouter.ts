import { Router } from "express";
import cardController from "../controllers/cardController.js";
import { checkKey } from "../middlewares/keyValidation.js";
import { validateSchema } from "../middlewares/schemaValidation.js";
import cardSchemas from "../schemas/cardSchemas.js";

const cardRouter = Router();

cardRouter.post("/card", checkKey, validateSchema(cardSchemas.createCard), cardController.create);
cardRouter.patch("/card/:id/activate", validateSchema(cardSchemas.activateCard), cardController.activate);
cardRouter.get("/card/:id/info", cardController.getTransactions);
cardRouter.patch("card/:id/block", validateSchema(cardSchemas.cardPassword),cardController.block);
cardRouter.patch("card/:id/unblock");

export default cardRouter;