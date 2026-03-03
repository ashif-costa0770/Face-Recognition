import { Router } from "express";
import {
  clearTraining,
  createPerson,
  deletePerson,
  getPersonById,
  getPersons,
  trainPerson,
} from "../controllers/personController.js";
import { uploadMultiple } from "../middleware/upload.js";

const router = Router();

router.post("/", createPerson);
router.get("/", getPersons);
router.get("/:id", getPersonById);
router.delete("/:id", deletePerson);

router.post("/:id/train", uploadMultiple, trainPerson);
router.delete("/:id/train", clearTraining);

export default router;
