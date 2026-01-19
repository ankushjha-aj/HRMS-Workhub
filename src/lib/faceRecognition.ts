"use client";

import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl'; // Required for browser execution

// Face detection configuration
const DETECTION_CONFIG = {
  returnTensors: false as const,
  flipHorizontal: false,
  maxFaces: 1, // Only detect one face for attendance
};

// Similarity threshold for face matching (0-1, lower is stricter)
const MATCH_THRESHOLD = 0.4; // Slightly higher for relative landmark checking

// Global model instance
let blazefaceModel: blazeface.BlazeFaceModel | null = null;
let modelLoadPromise: Promise<blazeface.BlazeFaceModel> | null = null;

/**
 * Load BlazeFace model
 */
async function loadBlazeFaceModel(): Promise<blazeface.BlazeFaceModel> {
  if (blazefaceModel) {
    return blazefaceModel;
  }

  if (modelLoadPromise) {
    return modelLoadPromise;
  }

  console.log("📦 Loading BlazeFace model...");
  modelLoadPromise = blazeface.load();
  blazefaceModel = await modelLoadPromise;
  console.log("✅ BlazeFace model loaded successfully");

  return blazefaceModel;
}

/**
 * Initialize face detection (loads model)
 */
export async function initializeFaceDetection(): Promise<blazeface.BlazeFaceModel> {
  return await loadBlazeFaceModel();
}

/**
 * Start camera for face detection
 */
export async function startCamera(
  videoElement: HTMLVideoElement
): Promise<MediaStream> {
  console.log("📸 [startCamera] Starting camera initialization...");

  try {
    console.log("🔐 [startCamera] Requesting getUserMedia...");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
    });

    console.log("✅ [startCamera] getUserMedia succeeded, stream:", stream);
    console.log("📹 [startCamera] Video tracks:", stream.getVideoTracks());

    // Attach stream to video element
    videoElement.srcObject = stream;
    try {
      await videoElement.play();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("✋ [startCamera] Video play stopped (interrupted by load/unmount)");
      } else {
        throw err;
      }
    }

    console.log("✅ [startCamera] Camera started successfully!");
    return stream;
  } catch (error) {
    console.error("❌ [startCamera] Camera access error:", error);
    if (error instanceof Error) {
      console.error("❌ [startCamera] Error name:", error.name);
      console.error("❌ [startCamera] Error message:", error.message);

      if (error.name === "NotAllowedError") {
        throw new Error(
          "Camera permission denied. Please allow camera access in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        throw new Error("No camera found on your device.");
      } else if (error.name === "NotReadableError") {
        throw new Error(
          "Camera is already in use by another application."
        );
      }
    }
    throw new Error("Failed to access camera. Please try again.");
  }
}

/**
 * Stop camera stream
 */
export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    console.log("🛑 Stopping track:", track.label);
    track.stop();
  });
}

/**
 * Detect faces in video element
 */
export async function detectFaces(
  videoElement: HTMLVideoElement,
  model: blazeface.BlazeFaceModel
): Promise<blazeface.NormalizedFace[]> {
  const predictions = await model.estimateFaces(videoElement, DETECTION_CONFIG.returnTensors);
  return predictions;
}

/**
 * Extract face descriptor from BlazeFace prediction
 * Converts bounding box and landmarks into a feature vector
 */
/**
 * Extract face descriptor from BlazeFace prediction
 * Converts landmarks into a translation/scale invariant feature vector
 */
export function extractFaceDescriptor(prediction: blazeface.NormalizedFace): number[] {
  const landmarks = prediction.landmarks as number[][];

  // Landmarks: 0=RightEye, 1=LeftEye, 2=Nose, 3=Mouth, 4=RightEar, 5=LeftEar
  const rightEye = landmarks[0];
  const leftEye = landmarks[1];
  const nose = landmarks[2];

  // Calculate inter-ocular distance (distance between eyes)
  // This serves as our scale reference
  const dx = rightEye[0] - leftEye[0];
  const dy = rightEye[1] - leftEye[1];
  const eyeDistance = Math.sqrt(dx * dx + dy * dy);

  if (eyeDistance === 0) return new Array(12).fill(0); // Should not happen

  // Create descriptor relative to nose position and scaled by eye distance
  const descriptor: number[] = [];

  landmarks.forEach((landmark) => {
    // Relative to nose
    const relX = landmark[0] - nose[0];
    const relY = landmark[1] - nose[1];

    // Normalized by scale
    descriptor.push(relX / eyeDistance);
    descriptor.push(relY / eyeDistance);
  });

  // Result is 6 landmarks * 2 coords = 12 values
  // These values represent the "shape" of the face invariant to position and size
  return descriptor;
}

/**
 * Calculate Euclidean distance between two descriptor vectors
 */
function calculateDistance(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) {
    console.warn("⚠️ Descriptor length mismatch (Old vs New format). Defaulting to no match.");
    return Number.POSITIVE_INFINITY;
  }

  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }

  return Math.sqrt(sum);
}

/**
 * Compare two face descriptors and return match confidence
 * Returns value between 0-1, where 1 is perfect match
 */
export function compareFaces(
  descriptor1: number[],
  descriptor2: number[]
): { isMatch: boolean; confidence: number } {
  const distance = calculateDistance(descriptor1, descriptor2);

  // Handle mismatch case (infinite distance)
  if (distance === Number.POSITIVE_INFINITY) {
    return { isMatch: false, confidence: 0 };
  }

  // Convert distance to similarity score (0-1)
  // Lower distance = higher similarity
  const maxDistance = Math.sqrt(descriptor1.length); // Theoretical max
  const similarity = Math.max(0, 1 - distance / maxDistance);

  return {
    isMatch: distance < MATCH_THRESHOLD,
    confidence: Math.round(similarity * 100) / 100,
  };
}

/**
 * Average multiple face descriptors (for enrollment)
 * Takes multiple captures and averages them for better accuracy
 */
export function averageDescriptors(descriptors: number[][]): number[] {
  if (descriptors.length === 0) {
    throw new Error("No descriptors provided");
  }

  const length = descriptors[0].length;
  const averaged: number[] = new Array(length).fill(0);

  descriptors.forEach((descriptor) => {
    descriptor.forEach((value, index) => {
      averaged[index] += value;
    });
  });

  return averaged.map((sum) => sum / descriptors.length);
}

/**
 * Validate face detection quality
 * Returns true if face is well-positioned and clear
 */
export function validateFaceQuality(prediction: blazeface.NormalizedFace): {
  isValid: boolean;
  message: string;
} {
  if (!prediction) {
    return { isValid: false, message: "No face detected" };
  }

  // Check detection confidence
  // Since returnTensors is false, probability should be a number or number array
  const probabilityValue = Array.isArray(prediction.probability)
    ? prediction.probability[0]
    : (typeof prediction.probability === 'number' ? prediction.probability : 0);

  if (probabilityValue < 0.9) {
    return { isValid: false, message: "Face detection confidence too low. Please ensure good lighting" };
  }

  // Check bounding box size (face should be reasonably large)
  const topLeft = prediction.topLeft as [number, number];
  const bottomRight = prediction.bottomRight as [number, number];

  const width = bottomRight[0] - topLeft[0];
  const height = bottomRight[1] - topLeft[1];
  const faceSize = width * height;

  console.log("👤 Face size:", faceSize, "Width:", width, "Height:", height);

  if (faceSize < 0.02) {
    return { isValid: false, message: "Face too small. Please move closer to camera" };
  }
  // Temporarily disabled - needs investigation
  // if (faceSize > 0.95) {
  //   return { isValid: false, message: "Face too close. Please move back slightly" };
  // }

  return { isValid: true, message: "Face detected successfully" };
}

/**
 * Check if person is wearing glasses
 * Simple heuristic based on eye landmarks
 */
export function detectGlasses(prediction: blazeface.NormalizedFace): boolean {
  // BlazeFace doesn't have built-in glasses detection
  // This is a placeholder for future enhancement
  // For now, we'll return false and rely on user instructions
  return false;
}
