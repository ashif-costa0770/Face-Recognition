import mongoose from "mongoose";

const descriptorSchema = new mongoose.Schema(
  {
    descriptor: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 128,
        message: "Descriptor must have 128 values",
      },
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    faceDescriptors: {
      type: [descriptorSchema],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Person = mongoose.model("Person", personSchema);

export default Person;
