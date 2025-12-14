import { useState } from "react";
import { KBEntry, KBCategory, kbCategoryLabel } from "@/types/knowledgeBase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KBProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: KBEntry | null; // null for new entry
  onSubmit: (proposal: {
    entryId: string | null;
    category?: KBCategory;
    title: string;
    key: string;
    definition: string;
    allowedValues?: string;
    usageContext?: string;
    rationale: string;
  }) => void;
}

const categories: KBCategory[] = [
  "projects_assets",
  "asset_classification",
  "xls89_metadata",
  "investor_compliance",
  "permissiondex",
];

export function KBProposalDialog({ open, onOpenChange, entry, onSubmit }: KBProposalDialogProps) {
  const [category, setCategory] = useState<KBCategory>(entry?.category || "projects_assets");
  const [title, setTitle] = useState(entry?.title || "");
  const [key, setKey] = useState(entry?.key || "");
  const [definition, setDefinition] = useState(entry?.definition || "");
  const [allowedValues, setAllowedValues] = useState(entry?.allowedValues?.join(", ") || "");
  const [usageContext, setUsageContext] = useState(entry?.usageContext || "");
  const [rationale, setRationale] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      entryId: entry?.id || null,
      category: entry ? undefined : category,
      title,
      key,
      definition,
      allowedValues: allowedValues || undefined,
      usageContext: usageContext || undefined,
      rationale,
    });
    onOpenChange(false);
    // Reset form
    setTitle("");
    setKey("");
    setDefinition("");
    setAllowedValues("");
    setUsageContext("");
    setRationale("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? `Propose Edit: ${entry.title}` : "Propose New Definition"}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? "Suggest changes to this KB entry. Your proposal will be reviewed by a Super Admin."
              : "Propose a new definition for the Knowledge Base. It will be reviewed before publishing."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!entry && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as KBCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {kbCategoryLabel[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Project Status"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g., project_status"
                className="font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Clear, authoritative definition..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedValues">Allowed Values (comma-separated, optional)</Label>
            <Input
              id="allowedValues"
              value={allowedValues}
              onChange={(e) => setAllowedValues(e.target.value)}
              placeholder="e.g., PENDING, APPROVED, REJECTED"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageContext">Usage Context (optional)</Label>
            <Textarea
              id="usageContext"
              value={usageContext}
              onChange={(e) => setUsageContext(e.target.value)}
              placeholder="Where and how this is used in the platform..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rationale">Rationale for Change</Label>
            <Textarea
              id="rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why is this change or addition needed?"
              rows={2}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Proposal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
