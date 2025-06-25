import { PageHeader } from '@/components/page-header';
import { PostLeftoversClient } from './_components/post-leftovers-client';

export default function PostLeftoversPage() {
  return (
    <div>
      <PageHeader title="Post Leftovers" />
      <main className="container mx-auto p-4 max-w-2xl">
        <PostLeftoversClient />
      </main>
    </div>
  );
}
