import { PageHeader } from '@/components/page-header';
import { StorageTipsClient } from './_components/storage-tips-client';
import { Suspense } from 'react';

export default function StorageTipsPage() {
  return (
    <div>
      <PageHeader title="Get Storage Tips" />
      <main className="container mx-auto p-4 max-w-2xl">
        <Suspense fallback={<div>Loading...</div>}>
          <StorageTipsClient />
        </Suspense>
      </main>
    </div>
  );
}
