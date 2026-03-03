"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ImagePreview from "./ImagePreview";
import LoadingButton from "./LoadingButton";
import SegmentedTabs from "./SegmentedTabs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const MODES = {
  CAMERA: "camera",
  UPLOAD: "upload",
};

const modeOptions = [
  { value: MODES.CAMERA, label: "Camera" },
  { value: MODES.UPLOAD, label: "Upload" },
];

export default function RegisterUserTab() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState(MODES.UPLOAD);
  const [personName, setPersonName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const previewUrl = useObjectUrl(imageFile);
  const canRegister = Boolean(personName.trim() && imageFile);

  useEffect(() => {
    if (mode === MODES.CAMERA) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (_error) {
      toast.error("Camera access failed. Upload mode is active.");
      setMode(MODES.UPLOAD);
    }
  };

  const stopCamera = () => {
    if (!streamRef.current) return;
    for (const track of streamRef.current.getTracks()) {
      track.stop();
    }
    streamRef.current = null;
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setImageFile(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const registerFace = async () => {
    if (!personName.trim()) {
      toast.error("Please enter user name.");
      return;
    }
    if (!imageFile) {
      toast.error("Please capture or upload an image.");
      return;
    }

    setLoading(true);

    try {
      const createRes = await fetch(`${API_BASE_URL}/api/persons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: personName.trim() }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createJson.message || "Failed to create person.");
      }

      const formData = new FormData();
      formData.append("images", imageFile);

      const trainRes = await fetch(
        `${API_BASE_URL}/api/persons/${createJson.person._id}/train`,
        {
          method: "POST",
          body: formData,
        }
      );
      const trainJson = await trainRes.json();
      if (!trainRes.ok) {
        throw new Error(trainJson.message || "Failed to train face.");
      }

      toast.success("User registered successfully");
      setPersonName("");
      removeImage();
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="personName" className="text-sm font-medium text-slate-700">
          User Name
        </label>
        <input
          id="personName"
          type="text"
          value={personName}
          onChange={(event) => setPersonName(event.target.value)}
          placeholder="Enter user name"
          className="h-12 w-full rounded-xl border-2 border-slate-400 bg-white/90 px-4 text-sm text-slate-700 outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <SegmentedTabs value={mode} onChange={setMode} options={modeOptions} />

      {mode === MODES.CAMERA ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-video w-full rounded-xl bg-black object-cover"
          />
          <button
            type="button"
            onClick={captureFromCamera}
            className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800"
          >
            Capture Photo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={onFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:h-12 file:cursor-pointer file:rounded-xl file:border-0 file:bg-slate-900 file:px-5 file:text-white transition-all duration-300 hover:file:bg-slate-800"
          />
          <p className="text-xs text-slate-500">Upload PNG, JPEG, or JPG file.</p>
        </div>
      )}

      <ImagePreview src={previewUrl} alt="Register preview" onRemove={removeImage} />

      <LoadingButton
        loading={loading}
        disabled={!canRegister}
        onClick={registerFace}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-200 hover:from-indigo-500 hover:to-blue-500"
      >
        Register User
      </LoadingButton>
    </section>
  );
}

function useObjectUrl(file) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return url;
}
