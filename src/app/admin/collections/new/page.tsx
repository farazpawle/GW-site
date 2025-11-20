import AdminHeader from '@/components/admin/AdminHeader';
import CollectionForm from '@/components/admin/collections/CollectionForm';

export default function NewCollectionPage() {
  return (
    <div className="p-8">
      <AdminHeader 
        pageTitle="Create New Collection" 
        description="Create a product collection with automatic filtering or manual selection"
      />
      <div className="mt-6">
        <CollectionForm />
      </div>
    </div>
  );
}
