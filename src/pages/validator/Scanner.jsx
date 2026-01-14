import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { validationAPI } from "../../services/api";
import { HiCheckCircle, HiXCircle, HiQrcode } from "react-icons/hi";

// Custom Scanner Loading Component with scanning line animation
const ScannerLoader = ({ message = "Initializing camera..." }) => (
  <div className='flex flex-col items-center py-8'>
    <div className='scanner-loader'>
      <div className='corner tl'></div>
      <div className='corner tr'></div>
      <div className='corner bl'></div>
      <div className='corner br'></div>
      <HiQrcode className='qr-icon' />
    </div>
    <p className='mt-4 text-text/90 text-sm animate-pulse'>{message}</p>
  </div>
);

const Scanner = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await validationAPI.getEventStats(eventId);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [eventId]);

  const onScanSuccess = useCallback(
    async (decodedText) => {
      // Prevent duplicate processing
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      setIsLoading(true);
      setScanning(false);

      // Pause the scanner immediately to stop further detections
      if (scannerRef.current) {
        try {
          await scannerRef.current.pause(true);
        } catch (e) {
          // Scanner might already be paused
        }
      }

      try {
        const response = await validationAPI.scan({
          qrCode: decodedText,
          eventId,
        });

        setResult({
          success: response.data.success,
          status: response.data.status,
          message: response.data.message,
          ticket: response.data.ticket,
        });

        if (eventId) fetchStats();
      } catch (error) {
        setResult({
          success: false,
          status: error.response?.data?.status || "ERROR",
          message: error.response?.data?.message || "Validation failed",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, fetchStats]
  );

  const onScanError = useCallback(() => {
    // Ignore errors during scanning
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 5, // Reduced FPS for better performance
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
    });

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    // Check for when camera becomes active (video element appears)
    const checkCameraReady = setInterval(() => {
      const videoElement = document.querySelector("#qr-reader video");
      if (videoElement && videoElement.srcObject) {
        setScannerReady(true);
        clearInterval(checkCameraReady);
      }
    }, 200);

    return () => {
      clearInterval(checkCameraReady);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [eventId, fetchStats, onScanSuccess, onScanError]);

  const resetScanner = async () => {
    // Reset all state first
    setResult(null);
    setIsLoading(false);
    setScanning(true);
    setScannerReady(false);

    // Clear the existing scanner and create a fresh one
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.log("Error clearing scanner:", e);
      }
    }

    // Small delay to let the DOM update, then re-initialize the scanner
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 5,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
      isProcessingRef.current = false; // Allow new scans

      // Check for when camera becomes active again
      const checkCameraReady = setInterval(() => {
        const videoElement = document.querySelector("#qr-reader video");
        if (videoElement && videoElement.srcObject) {
          setScannerReady(true);
          clearInterval(checkCameraReady);
        }
      }, 200);
    }, 100);
  };

  return (
    <div className='max-w-lg mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-text mb-6 text-center'>
        Ticket Scanner
      </h1>

      {/* Stats */}
      {stats && (
        <div className='card p-2 mb-6'>
          <h2 className='text-sm font-medium text-text/90 mb-2'>
            {stats.event?.title}
          </h2>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-2xl font-bold text-text'>
                {stats.stats.checkedIn}
              </p>
              <p className='text-xs text-text/90'>Checked In</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-text'>
                {stats.stats.pending}
              </p>
              <p className='text-xs text-text/90'>Pending</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-text'>
                {stats.stats.checkInRate}%
              </p>
              <p className='text-xs text-text/90'>Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Scanner or Result */}
      {scanning && !result ? (
        <div className='card overflow-hidden'>
          {/* Show custom loader while camera initializes */}
          {!scannerReady && <ScannerLoader message='Initializing camera...' />}
          <div
            id='qr-reader'
            className={`w-full ${!scannerReady ? "hidden" : ""}`}></div>
          {scannerReady && (
            <p className='p-2 py-3 text-center text-sm text-text/90'>
              Point camera at the QR code on the ticket
            </p>
          )}
        </div>
      ) : isLoading ? (
        <div className='card p-4 text-center'>
          <ScannerLoader message='Validating ticket...' />
        </div>
      ) : (
        <div
          className={`card p-4 text-center ${
            result?.success ? "bg-green-50 border-green-200" : " "
          }`}>
          {result?.success ? (
            <>
              <HiCheckCircle className='text-7xl text-green-500 mx-auto animate-bounce' />
              <h2 className='text-2xl font-bold text-green-700 mt-4'>
                Entry Granted
              </h2>
            </>
          ) : (
            <>
              <HiXCircle className='text-7xl text-red-500 mx-auto  rounded-full bg-white' />
              <h2 className='text-2xl font-bold text-red-700 mt-4'>
                {result?.status === "ALREADY_USED"
                  ? "Already Scanned"
                  : "Invalid Ticket"}
              </h2>
            </>
          )}

          <p className='text-text mt-2'>{result?.message}</p>

          {result?.ticket && (
            <div className='mt-2 p-2 bg-text text-left'>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <span className='text-text/90'>Name:</span>
                <span className='font-medium'>{result.ticket.holderName}</span>
                <span className='text-text/90'>Ticket:</span>
                <span className='font-medium'>{result.ticket.tierName}</span>
              </div>
            </div>
          )}

          <button
            onClick={resetScanner}
            className='btn mt-6 flex items-center gap-2 mx-auto px-6 py-3 text-lg'>
            <HiQrcode className='text-xl' /> Scan Another Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default Scanner;
