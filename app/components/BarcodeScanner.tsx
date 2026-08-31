"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

type ScannerStatus = "idle" | "starting" | "scanning" | "detected" | "error";

type BarcodeScannerProps = {
  isOpen: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ isOpen, onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const scanLockedRef = useRef(false);
  const mountedRef = useRef(false);

  const [status, setStatus] = useState<ScannerStatus>("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const [detectedBarcode, setDetectedBarcode] = useState("");

  // =====================================================
  // STOP CAMERA
  // =====================================================

  const stopScanner = useCallback(() => {
    scanLockedRef.current = true;

    // Stop ZXing controls
    try {
      controlsRef.current?.stop();
    } catch (error) {
      console.error("Failed to stop scanner controls:", error);
    }

    controlsRef.current = null;

    // Stop all camera tracks directly.
    // This is important because some browser/device
    // combinations keep the camera active otherwise.
    try {
      const video = videoRef.current;

      if (video?.srcObject instanceof MediaStream) {
        const stream = video.srcObject as MediaStream;

        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error("Failed to stop camera track:", error);
          }
        });

        video.srcObject = null;
      }
    } catch (error) {
      console.error("Failed to stop camera stream:", error);
    }

    readerRef.current = null;
  }, []);

  // =====================================================
  // START CAMERA
  // =====================================================

  const startScanner = useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    setStatus("starting");
    setErrorMessage("");
    setDetectedBarcode("");

    scanLockedRef.current = false;

    try {
      // Make sure previous scanner is fully stopped.
      stopScanner();

      scanLockedRef.current = false;

      const reader = new BrowserMultiFormatReader();

      readerRef.current = reader;

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: {
            ideal: "environment",
          },

          width: {
            ideal: 1280,
          },

          height: {
            ideal: 720,
          },

          aspectRatio: {
            ideal: 16 / 9,
          },
        },
      };

      const controls = await reader.decodeFromConstraints(constraints, videoRef.current, (result, error) => {
        if (!mountedRef.current) {
          return;
        }

        if (scanLockedRef.current) {
          return;
        }

        // Barcode successfully detected.
        if (result) {
          const text = result.getText().trim();

          if (!text) {
            return;
          }

          // Lock immediately.
          scanLockedRef.current = true;

          setDetectedBarcode(text);
          setStatus("detected");

          // Give the green state a short moment
          // so the user can visually see confirmation.
          window.setTimeout(() => {
            if (!mountedRef.current) {
              return;
            }

            stopScanner();

            onScan(text);
          }, 450);

          return;
        }

        // ZXing returns NotFoundException frequently
        // while continuously scanning. Do not show
        // this as an error to the user.
        if (error) {
          return;
        }
      });

      controlsRef.current = controls;

      if (mountedRef.current) {
        setStatus("scanning");
      }
    } catch (error) {
      console.error("Barcode scanner error:", error);

      stopScanner();

      if (!mountedRef.current) {
        return;
      }

      setStatus("error");

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Akses kamera ditolak. Silakan izinkan kamera pada browser.");

        return;
      }

      if (error instanceof DOMException && error.name === "NotFoundError") {
        setErrorMessage("Kamera tidak ditemukan pada perangkat ini.");

        return;
      }

      setErrorMessage("Kamera tidak dapat dibuka. Pastikan browser memiliki izin menggunakan kamera.");
    }
  }, [onScan, stopScanner]);

  // =====================================================
  // COMPONENT MOUNT
  // =====================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      try {
        controlsRef.current?.stop();
      } catch (error) {
        console.error(error);
      }

      controlsRef.current = null;

      try {
        const video = videoRef.current;

        if (video?.srcObject instanceof MediaStream) {
          const stream = video.srcObject as MediaStream;

          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (error) {
              console.error(error);
            }
          });

          video.srcObject = null;
        }
      } catch (error) {
        console.error(error);
      }

      readerRef.current = null;
    };
  }, []);

  // =====================================================
  // OPEN / CLOSE HANDLER
  // =====================================================

  useEffect(() => {
    if (!isOpen) {
      stopScanner();

      setStatus("idle");
      setErrorMessage("");
      setDetectedBarcode("");

      return;
    }

    const timer = window.setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, startScanner, stopScanner]);

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    stopScanner();

    setStatus("idle");
    setErrorMessage("");
    setDetectedBarcode("");

    onClose();
  };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry = () => {
    stopScanner();

    setErrorMessage("");
    setDetectedBarcode("");

    scanLockedRef.current = false;

    window.setTimeout(() => {
      startScanner();
    }, 150);
  };

  if (!isOpen) {
    return null;
  }

  const isDetected = status === "detected";

  const isError = status === "error";

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="scanner-header">
          <div>
            <div className="scanner-eyebrow">PRODUCT SCANNER</div>

            <h2 className="scanner-title">Scan Product</h2>
          </div>

          <button type="button" className="scanner-close" onClick={handleClose} aria-label="Close scanner">
            ×
          </button>
        </div>

        {/* =================================================
            CAMERA AREA
        ================================================= */}

        <div className={["scanner-camera", isDetected ? "scanner-camera-detected" : "", isError ? "scanner-camera-error" : ""].filter(Boolean).join(" ")}>
          <video ref={videoRef} className="scanner-video" muted autoPlay playsInline />

          {/* Dark overlay */}
          <div className="scanner-shade" />

          {/* Scan frame */}
          <div className={["scanner-frame", isDetected ? "scanner-frame-green" : ""].filter(Boolean).join(" ")}>
            {/* Corner indicators */}
            <span className="scanner-corner scanner-corner-tl" />
            <span className="scanner-corner scanner-corner-tr" />
            <span className="scanner-corner scanner-corner-bl" />
            <span className="scanner-corner scanner-corner-br" />

            {/* Scanning line */}
            {!isDetected && status === "scanning" && <div className="scanner-line" />}

            {/* Detected check */}
            {isDetected && (
              <div className="scanner-success">
                <div className="scanner-success-icon">✓</div>
              </div>
            )}
          </div>

          {/* Camera loading */}
          {status === "starting" && (
            <div className="scanner-status-overlay">
              <div className="scanner-spinner" />

              <span>Membuka kamera...</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="scanner-error-overlay">
              <div className="scanner-error-icon">!</div>

              <p>{errorMessage}</p>

              <button type="button" onClick={handleRetry} className="scanner-retry">
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <div className="scanner-status">
          {isDetected ? (
            <>
              <div className="scanner-status-dot scanner-status-dot-green" />

              <div>
                <strong>Barcode detected</strong>

                <span>{detectedBarcode}</span>
              </div>
            </>
          ) : status === "starting" ? (
            <>
              <div className="scanner-status-dot scanner-status-dot-yellow" />

              <div>
                <strong>Preparing camera</strong>

                <span>Mohon tunggu sebentar...</span>
              </div>
            </>
          ) : status === "scanning" ? (
            <>
              <div className="scanner-status-dot scanner-status-dot-yellow" />

              <div>
                <strong>Arahkan barcode ke dalam kotak</strong>

                <span>Pastikan barcode terlihat jelas dan tidak blur.</span>
              </div>
            </>
          ) : (
            <>
              <div className="scanner-status-dot scanner-status-dot-yellow" />

              <div>
                <strong>Scanner siap</strong>

                <span>Arahkan kamera ke barcode produk.</span>
              </div>
            </>
          )}
        </div>

        {/* =================================================
            TIPS
        ================================================= */}

        {!isDetected && !isError && (
          <div className="scanner-tips">
            <div className="scanner-tip">
              <span>01</span>
              <p>Pegang HP dengan stabil</p>
            </div>

            <div className="scanner-tip">
              <span>02</span>
              <p>Jaga barcode tetap fokus</p>
            </div>

            <div className="scanner-tip">
              <span>03</span>
              <p>Pastikan seluruh barcode masuk frame</p>
            </div>
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <button type="button" className="scanner-cancel" onClick={handleClose}>
          Tutup Scanner
        </button>
      </div>
    </div>
  );
}
