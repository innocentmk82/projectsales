import React, { useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';
import { X } from 'lucide-react';

interface QuaggaScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const QuaggaScanner: React.FC<QuaggaScannerProps> = ({ onDetected, onClose }) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'upc_e_reader',
            'code_128_reader',
            'code_39_reader',
            'code_39_vin_reader',
            'codabar_reader',
            'i2of5_reader',
            '2of5_reader',
            'code_93_reader',
          ],
        },
        locate: true,
      }, (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Quagga init error:', err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected(handleDetected);
    }
    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDetected = (result: any) => {
    if (result && result.codeResult && result.codeResult.code) {
      onDetected(result.codeResult.code);
      Quagga.stop();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md flex flex-col items-center">
        <button
          onClick={() => {
            Quagga.stop();
            onClose();
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Scan Product Barcode</h3>
        <div ref={scannerRef} style={{ width: 300, height: 200 }} className="rounded border border-gray-300 dark:border-gray-700 overflow-hidden" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Align the barcode within the frame.</p>
      </div>
    </div>
  );
};

export default QuaggaScanner; 