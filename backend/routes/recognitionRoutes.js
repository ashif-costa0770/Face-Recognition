import { Router } from "express";
import { identifyFaces } from "../controllers/recognitionController.js";
import { uploadSingle } from "../middleware/upload.js";

const router = Router();

router.post("/identify", uploadSingle, identifyFaces);

export default router;
