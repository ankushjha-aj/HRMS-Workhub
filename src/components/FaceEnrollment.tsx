"use client";

import { useState, useRef, useEffect } from "react";
import type { NormalizedFace } from '@tensorflow-models/blazeface';
import {
    initializeFaceDetection,
    startCamera,
    stopCamera,
    detectFaces,
    extractFaceDescriptor,
    averageDescriptors,
    validateFaceQuality,
    detectGlasses,
} from "@/lib/faceRecognition";

interface FaceEnrollmentProps {
    userId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function FaceEnrollment({ userId, onSuccess, onCancel }: FaceEnrollmentProps) {
    const [step, setStep] = useState<'init' | 'scanning' | 'processing' | 'complete'>('init');
    const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);
    const [message, setMessage] = useState("Welcome! Let's set up face recognition");
    const [error, setError] = useState<string>("");
    const [hasGlasses, setHasGlasses] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const capturedDescriptorsRef = useRef<number[][]>([]);

    const CAPTURES_NEEDED = 3;

    // Helper to stop all streams
    const stopAllStreams = () => {
        if (streamRef.current) {
            stopCamera(streamRef.current);
            streamRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const videoStream = videoRef.current.srcObject as MediaStream;
            if (videoStream.getTracks) {
                videoStream.getTracks().forEach(track => track.stop());
            }
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            stopAllStreams();
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, []);

    const startEnrollment = async () => {
        try {
            console.log("🎥 [FaceEnrollment] Starting enrollment...");
            setStep('scanning');
            setMessage("Loading face detection model...");
            setError("");
            setCapturedDescriptors([]);
            capturedDescriptorsRef.current = [];

            if (!videoRef.current || !canvasRef.current) {
                console.error("❌ [FaceEnrollment] Video or canvas element not found");
                return;
            }

            // Load BlazeFace model
            console.log("📦 [FaceEnrollment] Initializing BlazeFace model...");
            modelRef.current = await initializeFaceDetection();
            console.log("✅ [FaceEnrollment] Model loaded successfully");

            // Start camera
            setMessage("Requesting camera access...");
            console.log("📸 [FaceEnrollment] Starting camera...");
            streamRef.current = await startCamera(videoRef.current);
            console.log("✅ [FaceEnrollment] Camera started successfully");

            setMessage(`Position your face in the frame (0/${CAPTURES_NEEDED})`);

            // Start detection loop
            startDetectionLoop();

        } catch (err) {
            console.error("❌ [FaceEnrollment] Enrollment error:", err);
            const errorMessage = err instanceof Error
                ? err.message
                : "Failed to initialize. Please try again.";
            setError(errorMessage);
            setStep('init');
        }
    };

    const startDetectionLoop = () => {
        if (!videoRef.current || !canvasRef.current || !modelRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Detection loop - runs every 300ms
        detectionIntervalRef.current = setInterval(async () => {
            if (!modelRef.current || !video.readyState || video.readyState < 2) {
                return;
            }

            try {
                // Detect faces
                const predictions = await detectFaces(video, modelRef.current);

                // Clear canvas and draw video frame
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                if (predictions.length === 0) {
                    setMessage("No face detected. Please position your face in the frame");
                    return;
                }

                const prediction = predictions[0];

                // Draw bounding box
                const topLeft = prediction.topLeft as [number, number];
                const bottomRight = prediction.bottomRight as [number, number];
                const width = bottomRight[0] - topLeft[0];
                const height = bottomRight[1] - topLeft[1];

                // Validate face quality
                const validation = validateFaceQuality(prediction);

                if (!validation.isValid) {
                    // Draw red box for invalid face
                    ctx.strokeStyle = "#ff0000";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(topLeft[0], topLeft[1], width, height);
                    setMessage(validation.message);
                    return;
                }

                // Draw green box for valid face
                ctx.strokeStyle = "#00ff00";
                ctx.lineWidth = 3;
                ctx.strokeRect(topLeft[0], topLeft[1], width, height);

                // Draw landmarks
                const landmarks = prediction.landmarks as number[][];
                ctx.fillStyle = "#00ff00";
                landmarks.forEach(([x, y]) => {
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                });

                // Check for glasses
                if (detectGlasses(prediction)) {
                    if (!hasGlasses) {
                        setHasGlasses(true);
                        setMessage("Glasses detected. Please remove them for better accuracy");
                        return;
                    }
                }

                // Auto-capture when face is valid and we need more captures
                if (capturedDescriptorsRef.current.length < CAPTURES_NEEDED) {
                    captureFaceDescriptor(prediction);
                }

            } catch (err) {
                console.error("❌ Detection error:", err);
            }
        }, 300); // Run detection 3 times per second
    };

    const lastCaptureTimeRef = useRef<number>(0);

    const captureFaceDescriptor = async (prediction: NormalizedFace) => {
        const now = Date.now();
        if (now - lastCaptureTimeRef.current < 1000) {
            return; // Cooldown pending
        }

        try {
            const descriptor = extractFaceDescriptor(prediction);
            console.log("✅ Captured face descriptor:", descriptor);

            // Update ref first to be safe
            capturedDescriptorsRef.current = [...capturedDescriptorsRef.current, descriptor];

            // Update state for UI
            setCapturedDescriptors(capturedDescriptorsRef.current);
            lastCaptureTimeRef.current = now;

            const captureCount = capturedDescriptorsRef.current.length;
            setMessage(`Captured ${captureCount}/${CAPTURES_NEEDED}. Hold still...`);

            if (captureCount >= CAPTURES_NEEDED) {
                // Stop detection
                if (detectionIntervalRef.current) {
                    clearInterval(detectionIntervalRef.current);
                    detectionIntervalRef.current = null;
                }

                // Process captures
                await processCapturedFaces();
            }
        } catch (err) {
            console.error("❌ Capture error:", err);
            setError("Failed to capture face. Please try again.");
        }
    };

    const processCapturedFaces = async () => {
        try {
            setStep('processing');
            setMessage("Processing your face data...");

            const currentDescriptors = capturedDescriptorsRef.current; // Use ref here too

            // Average the descriptors
            const averagedDescriptor = averageDescriptors(currentDescriptors);

            // Save to database
            const response = await fetch("/api/face/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    faceDescriptor: averagedDescriptor,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save face data");
            }

            setStep('complete');
            setMessage("Face recognition setup complete!");

            // Cleanup
            stopAllStreams();

            // Call success callback after a brief delay
            setTimeout(() => {
                onSuccess();
            }, 1500);

        } catch (err) {
            console.error("❌ Processing error:", err);
            setError("Failed to save face data. Please try again.");
            setStep('init');
            setCapturedDescriptors([]);
        }
    };

    const handleCancel = () => {
        stopAllStreams();
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                    Face Recognition Setup
                </h2>

                <div className="space-y-4">
                    {/* Video preview */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }} // Mirror the video
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full"
                            style={{ transform: 'scaleX(-1)' }} // Mirror the canvas
                        />
                    </div>

                    {/* Status message */}
                    <div className="text-center">
                        {error ? (
                            <p className="text-red-600 font-medium">{error}</p>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">{message}</p>
                        )}
                    </div>

                    {/* Progress indicator */}
                    {step === 'scanning' && (
                        <div className="flex justify-center space-x-2">
                            {[...Array(CAPTURES_NEEDED)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${i < capturedDescriptors.length
                                        ? 'bg-green-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        {step === 'init' && (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={startEnrollment}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Start Setup
                                </button>
                            </>
                        )}
                        {step === 'scanning' && (
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                        )}
                        {step === 'complete' && (
                            <div className="text-green-600 font-medium flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Setup Complete!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
