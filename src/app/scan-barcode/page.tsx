import { PageHeader } from '@/components/page-header';
import { ScanBarcodeClient } from './_components/scan-barcode-client';

export default function ScanBarcodePage() {
  return (
    <div>
      <PageHeader title="Intelligent Barcode Scan" />
      <main className="container mx-auto p-4 max-w-2xl">
        <ScanBarcodeClient />
      </main>
    </div>
  );
}
