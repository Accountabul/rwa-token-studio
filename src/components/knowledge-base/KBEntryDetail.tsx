import { useState } from "react";
import { KBEntry, KBCategory, kbCategoryLabel, canProposeKB, canEditKBDirectly } from "@/types/knowledgeBase";
import { Role } from "@/types/tokenization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, History, Info, Save, X, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface KBEntryDetailProps {
  entry: KBEntry;
  role: Role;
  onProposeEdit: () => void;
  onDirectEdit?: (updatedEntry: KBEntry) => void;
}

export function KBEntryDetail({ entry, role, onProposeEdit, onDirectEdit }: KBEntryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(entry.title);
  const [editedDefinition, setEditedDefinition] = useState(entry.definition);
  const [editedUsageContext, setEditedUsageContext] = useState(entry.usageContext || "");
  const [editedAllowedValues, setEditedAllowedValues] = useState(entry.allowedValues?.join(", ") || "");

  const handleStartEdit = () => {
    setEditedTitle(entry.title);
    setEditedDefinition(entry.definition);
    setEditedUsageContext(entry.usageContext || "");
    setEditedAllowedValues(entry.allowedValues?.join(", ") || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updatedEntry: KBEntry = {
      ...entry,
      title: editedTitle,
      definition: editedDefinition,
      usageContext: editedUsageContext || undefined,
      allowedValues: editedAllowedValues ? editedAllowedValues.split(",").map(v => v.trim()).filter(Boolean) : undefined,
      currentVersion: entry.currentVersion + 1,
      updatedAt: new Date(),
      versions: [
        ...entry.versions,
        {
          id: `v${entry.id}-${entry.currentVersion + 1}`,
          version: entry.currentVersion + 1,
          title: editedTitle,
          key: entry.key,
          definition: editedDefinition,
          allowedValues: editedAllowedValues ? editedAllowedValues.split(",").map(v => v.trim()).filter(Boolean) : undefined,
          usageContext: editedUsageContext || undefined,
          publishedAt: new Date(),
          publishedBy: "Super Admin",
        }
      ]
    };

    if (onDirectEdit) {
      onDirectEdit(updatedEntry);
    }
    
    toast({
      title: "Entry updated",
      description: `${editedTitle} has been saved as v${entry.currentVersion + 1}`
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {kbCategoryLabel[entry.category]}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {entry.key}
              </Badge>
            </div>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl font-semibold mt-2"
              />
            ) : (
              <CardTitle className="text-xl">{entry.title}</CardTitle>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                {canEditKBDirectly(role) && (
                  <Button variant="default" size="sm" onClick={handleStartEdit}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit Directly
                  </Button>
                )}
                {canProposeKB(role) && !canEditKBDirectly(role) && (
                  <Button variant="outline" size="sm" onClick={onProposeEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Propose Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="definition" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="definition" className="gap-1">
              <Info className="h-3 w-3" />
              Definition
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1">
              <History className="h-3 w-3" />
              History ({entry.versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="definition">
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="space-y-6 pr-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Definition</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedDefinition}
                      onChange={(e) => setEditedDefinition(e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{entry.definition}</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Allowed Values</h4>
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        value={editedAllowedValues}
                        onChange={(e) => setEditedAllowedValues(e.target.value)}
                        placeholder="Comma-separated values"
                      />
                      <p className="text-xs text-muted-foreground">Separate values with commas</p>
                    </div>
                  ) : entry.allowedValues && entry.allowedValues.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {entry.allowedValues.map((value) => (
                        <Badge key={value} variant="outline" className="font-mono text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No allowed values defined</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Usage Context</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedUsageContext}
                      onChange={(e) => setEditedUsageContext(e.target.value)}
                      rows={2}
                      placeholder="Where and how this entry is used"
                    />
                  ) : entry.usageContext ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">{entry.usageContext}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No usage context defined</p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Version:</span>
                      <span className="ml-2 font-medium">v{entry.currentVersion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">{format(entry.createdAt, "MMM d, yyyy")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="ml-2">{format(entry.updatedAt, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="space-y-4 pr-4">
                {[...entry.versions].reverse().map((version, index) => (
                  <div
                    key={version.id}
                    className={`p-4 rounded-lg border ${
                      index === 0 ? "border-primary/30 bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          v{version.version}
                        </Badge>
                        {index === 0 && (
                          <span className="text-xs text-primary font-medium">Current</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(version.publishedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{version.definition}</p>
                    <p className="text-xs text-muted-foreground">
                      Published by {version.publishedBy}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
