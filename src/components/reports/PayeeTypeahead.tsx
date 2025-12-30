import React, { useState, useCallback, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Payee, PayeeType } from "@/types/payout";
import { usePayeeService } from "@/domain/ServiceContext";

interface PayeeTypeaheadProps {
  value: Payee | null;
  onChange: (payee: Payee | null) => void;
  disabled?: boolean;
  canCreatePayee?: boolean;
  onCreatePayee?: () => void;
}

const payeeTypeBadgeColor: Record<PayeeType, string> = {
  VENDOR: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  CONTRACTOR: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  EMPLOYEE: "bg-green-500/10 text-green-700 border-green-500/20",
  ENTITY: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

export const PayeeTypeahead: React.FC<PayeeTypeaheadProps> = ({
  value,
  onChange,
  disabled = false,
  canCreatePayee = false,
  onCreatePayee,
}) => {
  const payeeService = usePayeeService();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Payee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const payees = await payeeService.searchPayees(searchQuery, 10);
        setResults(payees);
      } catch (error) {
        console.error("Failed to search payees:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, payeeService]);

  const handleSelect = (payee: Payee) => {
    onChange(payee);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{value.name}</span>
              <Badge
                variant="outline"
                className={cn("text-[10px] shrink-0", payeeTypeBadgeColor[value.type])}
              >
                {value.type}
              </Badge>
            </div>
          ) : (
            "Select payee..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search payees..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {!isLoading && searchQuery.length >= 2 && results.length === 0 && (
              <CommandEmpty>
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No payees found
                  </p>
                  {canCreatePayee && onCreatePayee && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        onCreatePayee();
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Create new payee
                    </Button>
                  )}
                </div>
              </CommandEmpty>
            )}
            {!isLoading && searchQuery.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((payee) => (
                  <CommandItem
                    key={payee.id}
                    value={payee.id}
                    onSelect={() => handleSelect(payee)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === payee.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{payee.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] shrink-0",
                            payeeTypeBadgeColor[payee.type]
                          )}
                        >
                          {payee.type}
                        </Badge>
                        {payee.status === "INACTIVE" && (
                          <Badge variant="destructive" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {payee.vendorId && <span>ID: {payee.vendorId}</span>}
                        {payee.dba && <span>DBA: {payee.dba}</span>}
                        {payee.email && <span>{payee.email}</span>}
                      </div>
                    </div>
                    {payee.verificationStatus !== "VERIFIED" && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
