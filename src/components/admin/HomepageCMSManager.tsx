"use client";

import { useEffect, useState } from "react";
import { PageSection } from "@/types/page-section";
import {
  Eye,
  EyeOff,
  Edit,
  Trash2,
  GripVertical,
  Loader2,
  Lock,
} from "lucide-react";
import HeroSectionEditor from "./section-editors/HeroSectionEditor";
import BrandStorySectionEditor from "./section-editors/BrandStorySectionEditor";
import CarouselSectionEditor from "./section-editors/CarouselSectionEditor";
import CategoriesSectionEditor from "./section-editors/CategoriesSectionEditor";
import PrecisionMfgSectionEditor from "./section-editors/PrecisionMfgSectionEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Section type labels
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  brandStory: "Brand Story",
  carousel: "Brand Carousel",
  categories: "Categories",
  precisionMfg: "Precision Manufacturing",
};

// Sortable section item component
function SortableSection({
  section,
  onEdit,
  onToggleVisibility,
  onDelete,
  canEdit,
}: {
  section: PageSection;
  onEdit: (section: PageSection) => void;
  onToggleVisibility: (section: PageSection) => void;
  onDelete: (section: PageSection) => void;
  canEdit: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4
        ${!section.visible ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...(canEdit ? attributes : {})}
          {...(canEdit ? listeners : {})}
          disabled={!canEdit}
          className={`${
            canEdit
              ? "cursor-grab active:cursor-grabbing text-gray-400 hover:text-white"
              : "cursor-not-allowed text-gray-600 opacity-50"
          }`}
          title={!canEdit ? "No permission to reorder" : "Drag to reorder"}
        >
          {canEdit ? <GripVertical size={20} /> : <Lock size={20} />}
        </button>

        {/* Section Info */}
        <div className="flex-1">
          <h3 className="text-white font-semibold">
            {section.name ||
              SECTION_LABELS[section.sectionType] ||
              section.sectionType}
          </h3>
          {section.name && (
            <p className="text-xs text-gray-500 italic">
              {SECTION_LABELS[section.sectionType] || section.sectionType}
            </p>
          )}
          <p className="text-sm text-gray-400">
            Position: {section.position} •{" "}
            {section.visible ? "Visible" : "Hidden"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle Visibility */}
          <button
            onClick={() => {
              if (!canEdit) {
                alert(
                  "⛔ Access Denied\n\nYou do not have permission to edit homepage sections.\n\nMissing permission: homepage.edit",
                );
                return;
              }
              onToggleVisibility(section);
            }}
            disabled={!canEdit}
            className={`p-2 rounded transition-colors ${
              canEdit
                ? "hover:bg-[#2a2a2a] cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              !canEdit
                ? "No permission to edit"
                : section.visible
                  ? "Hide section"
                  : "Show section"
            }
          >
            {!canEdit ? (
              <Lock size={18} className="text-gray-500" />
            ) : section.visible ? (
              <Eye size={18} className="text-green-500" />
            ) : (
              <EyeOff size={18} className="text-gray-500" />
            )}
          </button>

          {/* Edit Button */}
          <button
            onClick={() => {
              if (!canEdit) {
                alert(
                  "⛔ Access Denied\n\nYou do not have permission to edit homepage sections.\n\nMissing permission: homepage.edit",
                );
                return;
              }
              onEdit(section);
            }}
            disabled={!canEdit}
            className={`p-2 rounded transition-colors ${
              canEdit
                ? "hover:bg-[#2a2a2a] cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={!canEdit ? "No permission to edit" : "Edit section"}
          >
            {!canEdit ? (
              <Lock size={18} className="text-gray-500" />
            ) : (
              <Edit size={18} className="text-blue-500" />
            )}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (!canEdit) {
                alert(
                  "⛔ Access Denied\n\nYou do not have permission to delete homepage sections.\n\nMissing permission: homepage.edit",
                );
                return;
              }
              onDelete(section);
            }}
            disabled={!canEdit}
            className={`p-2 rounded transition-colors ${
              canEdit
                ? "hover:bg-[#2a2a2a] cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={!canEdit ? "No permission to edit" : "Delete section"}
          >
            {!canEdit ? (
              <Lock size={18} className="text-gray-500" />
            ) : (
              <Trash2 size={18} className="text-red-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomepageCMSManager() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(
    null,
  );
  const [editorType, setEditorType] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch user permissions and homepage sections
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user permissions with cache-busting
        const userRes = await fetch("/api/auth/me?t=" + Date.now(), {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!userRes.ok) {
          console.error(
            "[HomepageCMS] Failed to fetch user permissions:",
            userRes.status,
            userRes.statusText,
          );
          setLoading(false);
          return;
        }

        const userData = await userRes.json();

        if (userData.success && userData.data.permissions) {
          // Check if user has homepage.edit permission
          const hasEditPermission =
            userData.data.permissions.includes("homepage.edit") ||
            userData.data.permissions.includes("homepage.*");
          setCanEdit(hasEditPermission);

          // Log for debugging
          console.log("[HomepageCMS] User permissions loaded:", {
            role: userData.data.role,
            hasEditPermission,
            totalPermissions: userData.data.permissions.length,
          });
        }

        // First, find the homepage
        console.log("[HomepageCMS] Fetching homepage...");
        const pagesRes = await fetch("/api/admin/pages?search=home&limit=1");

        if (!pagesRes.ok) {
          console.error(
            "[HomepageCMS] Failed to fetch pages:",
            pagesRes.status,
            pagesRes.statusText,
          );
          setLoading(false);
          return;
        }

        const pagesData = await pagesRes.json();
        console.log("[HomepageCMS] Pages API response:", {
          hasPages: !!pagesData.pages,
          pagesCount: pagesData.pages?.length || 0,
          firstPage: pagesData.pages?.[0]
            ? {
                id: pagesData.pages[0].id,
                title: pagesData.pages[0].title,
                slug: pagesData.pages[0].slug,
              }
            : null,
        });

        if (pagesData.pages && pagesData.pages.length > 0) {
          const homepage = pagesData.pages[0];
          setPageId(homepage.id);
          console.log("[HomepageCMS] Homepage found:", homepage.id);

          // Fetch sections for this page
          console.log("[HomepageCMS] Fetching sections for page:", homepage.id);
          const sectionsRes = await fetch(
            `/api/admin/page-sections?pageId=${homepage.id}`,
          );

          if (!sectionsRes.ok) {
            console.error(
              "[HomepageCMS] Failed to fetch sections:",
              sectionsRes.status,
              sectionsRes.statusText,
            );
            setLoading(false);
            return;
          }

          const sectionsData = await sectionsRes.json();
          console.log("[HomepageCMS] Sections API response:", {
            success: sectionsData.success,
            sectionsCount: sectionsData.data?.length || 0,
            sections:
              sectionsData.data?.map(
                (s: {
                  id: string;
                  sectionType: string;
                  enabled: boolean;
                  order: number;
                  position?: number;
                }) => ({
                  id: s.id,
                  type: s.sectionType,
                  position: s.position,
                }),
              ) || [],
          });

          if (sectionsData.success) {
            setSections(sectionsData.data || []);
            console.log(
              "[HomepageCMS] Sections loaded into state:",
              sectionsData.data?.length || 0,
            );
          } else {
            console.warn(
              "[HomepageCMS] Sections API returned success=false:",
              sectionsData,
            );
          }
        } else {
          console.warn(
            "[HomepageCMS] No homepage found in search results!",
            pagesData,
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle drag end
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reorderedSections = arrayMove(sections, oldIndex, newIndex);

    // Update local state immediately for smooth UX
    setSections(reorderedSections);
    setHasChanges(true);

    // Send reorder request to API
    try {
      const response = await fetch("/api/admin/page-sections/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          sections: reorderedSections.map((s, index) => ({
            id: s.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder sections");
      }

      const data = await response.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch (error) {
      console.error("Error reordering sections:", error);
      // Revert on error
      setSections(sections);
      setHasChanges(false);
    }
  }

  // Toggle visibility
  async function handleToggleVisibility(section: PageSection) {
    try {
      const response = await fetch(`/api/admin/page-sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visible: !section.visible,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      const data = await response.json();
      if (data.success) {
        setSections(sections.map((s) => (s.id === section.id ? data.data : s)));
        setHasChanges(true);
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to toggle visibility");
    }
  }

  // Edit section
  function handleEdit(section: PageSection) {
    setEditingSection(section);
    setEditorType(section.sectionType);
  }

  // Close editor
  function closeEditor() {
    setEditingSection(null);
    setEditorType(null);
  }

  // Handle save from editor
  function handleSaveSection(updatedSection: PageSection) {
    setSections(
      sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
    );
    setHasChanges(true);
    closeEditor();
  }

  // Delete section
  async function handleDelete(section: PageSection) {
    if (
      !confirm(
        `Are you sure you want to delete the ${SECTION_LABELS[section.sectionType]}?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/page-sections/${section.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }

      const data = await response.json();
      if (data.success) {
        setSections(sections.filter((s) => s.id !== section.id));
        setHasChanges(true);
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    }
  }

  // Publish changes (revalidate the homepage)
  async function handlePublish() {
    if (!hasChanges) return;

    setPublishing(true);
    try {
      // Call Next.js revalidation API
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "/",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish changes");
      }

      setHasChanges(false);
      alert(
        "✅ Changes published successfully! The homepage has been updated.",
      );
    } catch (error) {
      console.error("Error publishing changes:", error);
      alert("❌ Failed to publish changes. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-maroon" />
      </div>
    );
  }

  if (!pageId) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 text-center">
        <p className="text-gray-400">
          Homepage not found. Please create a page with slug &quot;home&quot;
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Publish Button */}
      <div className="flex items-center justify-between">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex-1">
          <p className="text-sm text-blue-400">
            💡 <strong>Tip:</strong> Drag and drop sections to reorder them. Use
            the eye icon to show/hide sections. Click the{" "}
            <strong>&quot;Publish Changes&quot;</strong> button to apply changes
            to the live website.
          </p>
        </div>

        {hasChanges && canEdit && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="ml-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>✓ Publish Changes</>
            )}
          </button>
        )}

        {/* Show read-only banner if user can't edit */}
        {!canEdit && (
          <div className="ml-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex-shrink-0">
            <p className="text-sm text-yellow-400 flex items-center gap-2">
              <Lock size={16} />
              <span>
                <strong>Read-only access</strong> - You can view but not edit
                homepage sections. Missing permission:{" "}
                <code className="text-yellow-300">homepage.edit</code>
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 text-center">
          <p className="text-gray-400">
            No sections found. Run the seed script to create default sections.
          </p>
          <code className="text-xs text-gray-500 mt-2 block">
            npx ts-node scripts/seed-homepage-sections.ts
          </code>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onEdit={handleEdit}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={handleDelete}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Section Editors - Only render if user has edit permission */}
      {canEdit && editingSection && editorType === "hero" && (
        <HeroSectionEditor
          section={editingSection}
          isOpen={true}
          onClose={closeEditor}
          onSave={handleSaveSection}
        />
      )}

      {canEdit && editingSection && editorType === "brandStory" && (
        <BrandStorySectionEditor
          section={editingSection}
          isOpen={true}
          onClose={closeEditor}
          onSave={handleSaveSection}
        />
      )}

      {canEdit && editingSection && editorType === "carousel" && (
        <CarouselSectionEditor
          section={editingSection}
          isOpen={true}
          onClose={closeEditor}
          onSave={handleSaveSection}
        />
      )}

      {canEdit && editingSection && editorType === "categories" && (
        <CategoriesSectionEditor
          section={editingSection}
          isOpen={true}
          onClose={closeEditor}
          onSave={handleSaveSection}
        />
      )}

      {canEdit && editingSection && editorType === "precisionMfg" && (
        <PrecisionMfgSectionEditor
          section={editingSection}
          isOpen={true}
          onClose={closeEditor}
          onSave={handleSaveSection}
        />
      )}
    </div>
  );
}
