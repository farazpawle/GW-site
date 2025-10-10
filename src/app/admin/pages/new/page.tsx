import AdminHeader from '@/components/admin/AdminHeader';
import PageForm from '@/components/admin/pages/PageForm';

export default function NewPagePage() {
  return (
    <div className="p-8">
      <AdminHeader 
        pageTitle="Create New Page" 
        description="Create a custom page with product groups"
      />
      <div className="mt-6">
        <PageForm />
      </div>
    </div>
  );
}
