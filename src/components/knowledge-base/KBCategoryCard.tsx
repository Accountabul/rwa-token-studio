import { KBCategory, kbCategoryLabel, kbCategoryDescription } from "@/types/knowledgeBase";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Layers, Code, UserCheck, Wallet } from "lucide-react";

const categoryIcons: Record<KBCategory, React.ReactNode> = {
  projects_assets: <Building2 className="h-5 w-5" />,
  asset_classification: <Layers className="h-5 w-5" />,
  xls89_metadata: <Code className="h-5 w-5" />,
  investor_compliance: <UserCheck className="h-5 w-5" />,
  permissiondex: <Wallet className="h-5 w-5" />,
};

interface KBCategoryCardProps {
  category: KBCategory;
  entryCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function KBCategoryCard({ category, entryCount, isSelected, onClick }: KBCategoryCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {categoryIcons[category]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm truncate">{kbCategoryLabel[category]}</h3>
              <span className="text-xs text-muted-foreground ml-2">{entryCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {kbCategoryDescription[category]}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
