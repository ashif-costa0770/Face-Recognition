import fs from "fs";
import { loadImage } from "canvas";
import { faceapi } from "../config/faceapi.js";
import Person from "../models/Person.js";

//! cleanup uploaded files
const cleanupUploadedFiles = (files = []) => {
  for (const file of files) {
    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.warn(`Failed to delete temp file: ${file?.path}`);
    }
  }
};

//! create person
export const createPerson = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const person = await Person.create({ name: name.trim() });
    return res.status(201).json({ success: true, person });
  } catch (error) {
    return next(error);
  }
};

//! get persons
export const getPersons = async (_req, res, next) => {
  try {
    const persons = await Person.find().sort({ createdAt: -1 });
    const data = persons.map((person) => ({
      _id: person._id,
      name: person.name,
      descriptorCount: person.faceDescriptors.length,
      createdAt: person.createdAt,
    }));

    return res.json({ success: true, persons: data });
  } catch (error) {
    return next(error);
  }
};

//! get person by id
export const getPersonById = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }
    return res.json({ success: true, person });
  } catch (error) {
    return next(error);
  }
};

//! delete person
export const deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }
    return res.json({ success: true, message: "Person deleted" });
  } catch (error) {
    return next(error);
  }
};

//! train person
export const trainPerson = async (req, res, next) => {
  const warnings = [];
  const files = req.files || [];

  try {
    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: "Provide 1 to 5 images using field name 'images'",
      });
    }

    const person = await Person.findById(req.params.id);
    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    let descriptorsAdded = 0;

    for (const file of files) {
      const image = await loadImage(file.path);
      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        warnings.push(`${file.originalname}: no face detected`);
        continue;
      }

      if (detections.length > 1) {
        warnings.push(`${file.originalname}: multiple faces detected`);
        continue;
      }

      person.faceDescriptors.push({
        descriptor: Array.from(detections[0].descriptor),
      });
      descriptorsAdded += 1;
    }

    if (descriptorsAdded > 0) {
      await person.save();
    }

    return res.json({
      success: true,
      descriptorsAdded,
      totalDescriptors: person.faceDescriptors.length,
      warnings,
    });
  } catch (error) {
    return next(error);
  } finally {
    cleanupUploadedFiles(files);
  }
};

//! clear training
export const clearTraining = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    person.faceDescriptors = [];
    await person.save();

    return res.json({ success: true, message: "All descriptors cleared" });
  } catch (error) {
    return next(error);
  }
};
