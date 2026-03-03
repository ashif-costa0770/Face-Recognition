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

export default function VerifyUserTab() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState(MODES.UPLOAD);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const previewUrl = useObjectUrl(imageFile);
  const canVerify = Boolean(imageFile);

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
        setVerifyResult(null);
      },
      "image/jpeg",
      0.92
    );
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setVerifyResult(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setVerifyResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const verifyFace = async () => {
    if (!imageFile) {
      toast.error("Please capture or upload an image.");
      return;
    }

    setLoading(true);
    setVerifyResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(`${API_BASE_URL}/api/recognition/identify`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verification failed.");
      }

      const first = data.results?.[0];
      if (!first) {
        throw new Error("No face found in image.");
      }

      if (first.isUnknown) {
        setVerifyResult({ matched: false, distance: first.distance });
        toast.error("Face does not match");
        return;
      }

      const personResponse = await fetch(
        `${API_BASE_URL}/api/persons/${first.personId}`
      );
      const personJson = await personResponse.json();
      if (!personResponse.ok) {
        throw new Error(personJson.message || "Failed to fetch matched user.");
      }

      setVerifyResult({
        matched: true,
        distance: first.distance,
        name: personJson.person.name,
        createdAt: personJson.person.createdAt,
      });
      toast.success("Face matched successfully");
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyBorder = verifyResult
    ? verifyResult.matched
      ? "ring-4 ring-green-500"
      : "ring-4 ring-red-500"
    : "ring-2 ring-gray-200";

  return (
    <section className="space-y-6">
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
            className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:h-12 file:cursor-pointer file:rounded-xl file:border-0 file:bg-slate-900 file:px-5 file:text-white transition-all duration-300 hover:file:bg-slate-800"
          />
          <p className="text-xs text-slate-500">Upload PNG, JPEG, or JPG file.</p>
        </div>
      )}

      <ImagePreview
        src={previewUrl}
        alt="Verify preview"
        onRemove={removeImage}
        ringClassName={verifyBorder}
      />

      <LoadingButton
        loading={loading}
        disabled={!canVerify}
        onClick={verifyFace}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200 hover:from-emerald-500 hover:to-teal-500"
      >
        Verify User
      </LoadingButton>

      {verifyResult ? (
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
          {verifyResult.matched ? (
            <div className="space-y-2">
              <p className="font-semibold text-green-600">Matched User</p>
              <p>
                <span className="font-medium text-slate-700">Name:</span>{" "}
                {verifyResult.name}
              </p>
              <p>
                <span className="font-medium text-slate-700">Registration Date:</span>{" "}
                {formatDate(verifyResult.createdAt)}
              </p>
            </div>
          ) : (
            <p className="font-semibold text-red-600">No matching user found</p>
          )}
          {typeof verifyResult.distance === "number" ? (
            <p className="mt-3 text-xs text-slate-500">
              Distance score: {verifyResult.distance.toFixed(3)}
            </p>
          ) : null}
        </div>
      ) : null}
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

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
