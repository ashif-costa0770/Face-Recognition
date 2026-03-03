import path from "path";
import { fileURLToPath } from "url";
import "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";

const { Canvas, Image, ImageData } = canvas;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelPath = path.join(__dirname, "../faceModels");

let initialized = false;

const initFaceApi = async () => {
  if (initialized) return;

  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

  initialized = true;
  console.log("✅ Face models loaded");
};

export { faceapi };
export default initFaceApi;
