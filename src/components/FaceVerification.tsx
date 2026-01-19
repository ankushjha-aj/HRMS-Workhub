"use client";

import { useState, useRef, useEffect } from "react";
import type { NormalizedFace } from '@tensorflow-models/blazeface';
import {
    initializeFaceDetection,
    startCamera,
    stopCamera,
    detectFaces,
    extractFaceDescriptor,
    compareFaces,
    validateFaceQuality,
} from "@/lib/faceRecognition";

interface FaceVerificationProps {
    userId: string;
    storedDescriptor: number[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function FaceVerification({
    userId,
    storedDescriptor,
    onSuccess,
    onCancel,
}: FaceVerificationProps) {
    const [status, setStatus] = useState<'init' | 'scanning' | 'success' | 'failed'>('init');
    const [message, setMessage] = useState("Position your face in the frame");
    const [confidence, setConfidence] = useState<number>(0);
    const [showReset, setShowReset] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const isMounted = useRef(true);
    const processingSuccess = useRef(false);

    // Helper to stop all streams (ref and video source)
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
        isMounted.current = true;

        // Check for outdated face data (length 16 vs 12)
        if (storedDescriptor && storedDescriptor.length !== 12) {
            setStatus('failed');
            setMessage("Face data outdated (System Upgrade). Please reset.");
            setShowReset(true);
            return;
        }

        // Auto-start verification when component mounts
        startVerification();

        return () => {
            isMounted.current = false;
            // Cleanup on unmount
            stopAllStreams();
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, []);

    const startVerification = async () => {
        if (showReset) return; // Don't start if reset needed

        try {
            if (!isMounted.current) return;
            setStatus('scanning');
            setMessage("Loading face detection model...");

            if (!videoRef.current || !canvasRef.current) {
                throw new Error("Video or canvas element not found");
            }

            // Load BlazeFace model
            modelRef.current = await initializeFaceDetection();
            if (!isMounted.current) return;

            // Start camera
            setMessage("Requesting camera access...");
            streamRef.current = await startCamera(videoRef.current);
            if (!isMounted.current) {
                stopAllStreams();
                return;
            }

            setMessage("Looking for your face...");

            // Start detection loop
            startDetectionLoop();

        } catch (err) {
            if (!isMounted.current) return;

            // Ignore AbortError from video.play()
            if (err instanceof Error && err.name === 'AbortError') {
                console.log("✋ Video play aborted (usually due to unmount/reload)");
                return;
            }

            console.error("❌ Verification error:", err);
            setStatus('failed');
            setMessage("Failed to access camera. Please try again.");
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

        // Detection loop - runs every 500ms
        detectionIntervalRef.current = setInterval(async () => {
            if (!isMounted.current || !modelRef.current || !video.readyState || video.readyState < 2) {
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
                    ctx.strokeStyle = "#ff0000";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(topLeft[0], topLeft[1], width, height);
                    setMessage(validation.message);
                    return;
                }

                // Extract descriptor and compare
                const currentDescriptor = extractFaceDescriptor(prediction);
                const comparison = compareFaces(storedDescriptor, currentDescriptor);

                if (!isMounted.current) return;
                if (processingSuccess.current) return; // Prevent multiple success triggers

                // Update confidence
                setConfidence(comparison.confidence);

                if (comparison.isMatch) {
                    processingSuccess.current = true; // Block further matches

                    // Draw green box for match
                    ctx.strokeStyle = "#00ff00";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(topLeft[0], topLeft[1], width, height);

                    // Stop detection
                    if (detectionIntervalRef.current) {
                        clearInterval(detectionIntervalRef.current);
                        detectionIntervalRef.current = null;
                    }

                    // Success!
                    setStatus('success');
                    setMessage(`Face verified! Confidence: ${Math.round(comparison.confidence * 100)}%`);

                    // Cleanup and call success callback
                    setTimeout(() => {
                        stopAllStreams();
                        onSuccess();
                    }, 1500);
                } else {
                    // Draw yellow/red box for no match
                    const isLowConfidence = comparison.confidence < 0.2;
                    ctx.strokeStyle = isLowConfidence ? "#ff4444" : "#ffff00";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(topLeft[0], topLeft[1], width, height);

                    if (isLowConfidence) {
                        setMessage("Face not recognized");
                    } else {
                        setMessage(`Verifying... ${Math.round(comparison.confidence * 100)}%`);
                    }
                }

            } catch (err) {
                console.error("❌ Detection error:", err);
            }
        }, 500); // Run detection twice per second
    };

    const handleReset = async () => {
        try {
            setMessage("Resetting face data...");
            const response = await fetch("/api/face/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                window.location.reload(); // Reload to refresh user state
            } else {
                throw new Error("Failed to reset");
            }
        } catch (err) {
            console.error("Reset error:", err);
            setMessage("Failed to reset. Please try again.");
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
                    Face Verification
                </h2>

                <div className="space-y-4">
                    {/* Video preview - Only show if not resetting */}
                    {!showReset && (
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
                    )}

                    {/* Reset UI */}
                    {showReset && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
                            <span className="material-symbols-outlined text-4xl text-amber-500 mb-3">warning</span>
                            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">System Upgrade Required</h3>
                            <p className="text-amber-700 dark:text-amber-300 mb-4">
                                The face recognition system has been upgraded for better accuracy.
                                Your old face data is no longer compatible.
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mb-6">
                                Please reset your face ID and enroll again.
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold transition-colors"
                            >
                                Reset Face ID & Re-Enroll
                            </button>
                        </div>
                    )}

                    {/* Status message */}
                    {!showReset && (
                        <div className="text-center">
                            <p className={`font-medium ${status === 'success'
                                ? 'text-green-600'
                                : status === 'failed'
                                    ? 'text-red-600'
                                    : message === 'Face not recognized'
                                        ? 'text-amber-600'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {message}
                            </p>
                            {status === 'scanning' && confidence > 0 && (
                                <div className="mt-2">
                                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${confidence < 0.2 ? 'bg-amber-500' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${confidence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>

                        {status === 'failed' && !showReset && (
                            <button
                                onClick={startVerification}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        )}
                        {status === 'success' && (
                            <div className="text-green-600 font-medium flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verification Successful!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
