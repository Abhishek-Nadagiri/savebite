import { PageHeader } from '@/components/page-header';
import { FindFoodClient } from './_components/find-food-client';

export default function FindFoodPage() {
  return (
    <div>
      <PageHeader title="Find Food Near Me" />
      <main className="container mx-auto p-4 max-w-2xl">
        <FindFoodClient />
      </main>
    </div>
  );
}
