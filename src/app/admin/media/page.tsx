import AdminHeader from '@/components/admin/AdminHeader';
import MediaLibraryClient from '@/components/admin/media/MediaLibraryClient';

export const metadata = {
  title: 'Media Library - Admin',
  description: 'Browse and manage uploaded files in organized folders',
};

export default function MediaLibraryPage() {
  return (
    <div className="px-8 py-6 space-y-6">
      <AdminHeader
        pageTitle="Media Library"
        description="Browse and manage files stored in organized folders"
      />

      <MediaLibraryClient />
    </div>
  );
}
