import fs from "fs";
import { loadImage } from "canvas";
import { faceapi } from "../config/faceapi.js";
import Person from "../models/Person.js";

//it takes one uploaded image, finds faces, compares them with trained faces from DB, returns best matches, and always cleans temp file.
export const identifyFaces = async (req, res, next) => {
  const startedAt = Date.now();

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Provide one image using field name 'image'",
        });
    }

    const persons = await Person.find();
    const personMap = new Map(
      persons.map((person) => [String(person._id), person]),
    );

    const labeledDescriptors = persons
      .filter((person) => person.faceDescriptors.length > 0)
      .map((person) => {
        const descriptors = person.faceDescriptors.map((item) =>
          Float32Array.from(item.descriptor),
        );
        return new faceapi.LabeledFaceDescriptors(
          String(person._id),
          descriptors,
        );
      });

    const threshold = Number(process.env.FACE_MATCH_THRESHOLD || 0.6);
    const matcher =
      labeledDescriptors.length > 0
        ? new faceapi.FaceMatcher(labeledDescriptors, threshold)
        : null;

    const image = await loadImage(req.file.path);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const results = detections.map((detection) => {
      if (!matcher) {
        return {
          match: "unknown",
          distance: null,
          isUnknown: true,
        };
      }

      const bestMatch = matcher.findBestMatch(detection.descriptor);
      const person = personMap.get(bestMatch.label);
      const isUnknown = bestMatch.label === "unknown" || !person;

      if (isUnknown) {
        return {
          match: "unknown",
          distance: bestMatch.distance,
          isUnknown: true,
        };
      }

      return {
        match: person.name,
        personId: person._id,
        distance: bestMatch.distance,
        isUnknown: false,
      };
    });

    return res.json({
      success: true,
      facesFound: detections.length,
      results,
      processingTimeMs: Date.now() - startedAt,
    });
  } catch (error) {
    return next(error);
  } finally {
    try {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.warn(`Failed to delete temp file: ${req.file?.path}`);
    }
  }
};
