import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { validationAPI } from '../../services/api';
import { HiCheckCircle, HiXCircle, HiRefresh } from 'react-icons/hi';

const Scanner = () => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('event');
    const scannerRef = useRef(null);
    const [result, setResult] = useState(null);
    const [scanning, setScanning] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (eventId) {
            fetchStats();
        }

        const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        });

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await validationAPI.getEventStats(eventId);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const onScanSuccess = async (decodedText) => {
        setScanning(false);

        try {
            const response = await validationAPI.scan({
                qrCode: decodedText,
                eventId
            });

            setResult({
                success: response.data.success,
                status: response.data.status,
                message: response.data.message,
                ticket: response.data.ticket
            });

            if (eventId) fetchStats();
        } catch (error) {
            setResult({
                success: false,
                status: error.response?.data?.status || 'ERROR',
                message: error.response?.data?.message || 'Validation failed'
            });
        }
    };

    const onScanError = (error) => {
        // Ignore errors during scanning
    };

    const resetScanner = () => {
        setResult(null);
        setScanning(true);
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ticket Scanner</h1>

            {/* Stats */}
            {stats && (
                <div className="card p-4 mb-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-2">{stats.event?.title}</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.stats.checkedIn}</p>
                            <p className="text-xs text-gray-500">Checked In</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-primary-600">{stats.stats.checkInRate}%</p>
                            <p className="text-xs text-gray-500">Rate</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanner or Result */}
            {scanning && !result ? (
                <div className="card overflow-hidden">
                    <div id="qr-reader" className="w-full"></div>
                    <p className="p-4 text-center text-sm text-gray-500">
                        Point camera at the QR code on the ticket
                    </p>
                </div>
            ) : (
                <div className={`card p-8 text-center ${result?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                    {result?.success ? (
                        <>
                            <HiCheckCircle className="text-7xl text-green-500 mx-auto animate-bounce" />
                            <h2 className="text-2xl font-bold text-green-700 mt-4">Entry Granted</h2>
                        </>
                    ) : (
                        <>
                            <HiXCircle className="text-7xl text-red-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-red-700 mt-4">
                                {result?.status === 'ALREADY_USED' ? 'Already Scanned' : 'Invalid Ticket'}
                            </h2>
                        </>
                    )}

                    <p className="text-gray-600 mt-2">{result?.message}</p>

                    {result?.ticket && (
                        <div className="mt-6 p-4 bg-white rounded-lg text-left">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-gray-500">Name:</span>
                                <span className="font-medium">{result.ticket.holderName}</span>
                                <span className="text-gray-500">Ticket:</span>
                                <span className="font-medium">{result.ticket.tierName}</span>
                            </div>
                        </div>
                    )}

                    <button onClick={resetScanner} className="btn-primary mt-6 flex items-center gap-2 mx-auto">
                        <HiRefresh /> Scan Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scanner;
