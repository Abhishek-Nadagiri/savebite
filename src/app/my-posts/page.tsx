import { PageHeader } from '@/components/page-header';
import { MyPostsClient } from './_components/my-posts-client';
import { Suspense } from 'react';

export default function MyPostsPage() {
  return (
    <div>
      <PageHeader title="My Posted Leftovers" />
      <main className="container mx-auto p-4 max-w-2xl">
        <Suspense fallback={<div>Loading posts...</div>}>
          <MyPostsClient />
        </Suspense>
      </main>
    </div>
  );
}
