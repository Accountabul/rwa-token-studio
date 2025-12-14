import { KBEntry, KBCategory, kbCategoryLabel, canProposeKB } from "@/types/knowledgeBase";
import { Role } from "@/types/tokenization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, History, Info } from "lucide-react";
import { format } from "date-fns";

interface KBEntryDetailProps {
  entry: KBEntry;
  role: Role;
  onProposeEdit: () => void;
}

export function KBEntryDetail({ entry, role, onProposeEdit }: KBEntryDetailProps) {
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
            <CardTitle className="text-xl">{entry.title}</CardTitle>
          </div>
          {canProposeKB(role) && (
            <Button variant="outline" size="sm" onClick={onProposeEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Propose Edit
            </Button>
          )}
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
                  <p className="text-sm leading-relaxed">{entry.definition}</p>
                </div>

                {entry.allowedValues && entry.allowedValues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Allowed Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.allowedValues.map((value) => (
                        <Badge key={value} variant="outline" className="font-mono text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.usageContext && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Usage Context</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{entry.usageContext}</p>
                  </div>
                )}

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
