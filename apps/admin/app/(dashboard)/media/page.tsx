import { PageShell } from "@/components/PageShell";
import { MediaLibraryClient } from "./MediaLibraryClient";
import { MediaUploadButton } from "./MediaUploadButton";

export const metadata = {
  title: "Media Library | Luxero Admin",
  description: "Browse and manage uploaded media files.",
};

export default function MediaPage() {
  return (
    <PageShell
      title="Media Library"
      description="Browse and manage uploaded images. Frames are excluded."
      actions={<MediaUploadButton />}
    >
      <div className="mx-auto w-full max-w-7xl">
        <MediaLibraryClient />
      </div>
    </PageShell>
  );
}
