import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag as TagIcon, Lightbulb } from "lucide-react";
import { type Transaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Tag interface
interface Tag {
  id: string;
  text: string;
}

// A simple TagInput component
function TagInput({
  tags,
  setTags,
  placeholder = "Add tags",
  id,
  className = "",
}: {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = { id: inputValue.trim(), text: inputValue.trim() };
      setTags([...tags, newTag]);
      setInputValue("");
    }
  };

  const removeTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  return (
    <div className={`border rounded-md p-2 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <div 
            key={tag.id} 
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
          >
            {tag.text}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="text-secondary-foreground opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full outline-none bg-transparent"
      />
    </div>
  );
}

interface TransactionCategorizationDialogProps {
  transaction: Transaction;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function TransactionCategorizationDialog({
  transaction,
  trigger,
  onSuccess
}: TransactionCategorizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(transaction.category || "");
  const [subcategory, setSubcategory] = useState(transaction.subcategory || "");
  const [tags, setTags] = useState<Tag[]>(
    transaction.tags ? transaction.tags.map(tag => ({ id: tag, text: tag })) : []
  );
  const [notes, setNotes] = useState(transaction.notes || "");
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch available categories
  const categoriesQuery = useQuery<string[]>({
    queryKey: ["/api/transactions/categories"],
    enabled: open,
    staleTime: 60000, // 1 minute
  });
  
  const categories = categoriesQuery.data || [];
  const isLoadingCategories = categoriesQuery.isLoading;
  
  // Show toast on error
  useEffect(() => {
    if (categoriesQuery.error) {
      toast({
        title: "Error loading categories",
        description: "Failed to load categories.",
        variant: "destructive"
      });
    }
  }, [categoriesQuery.error, toast]);
  
  // Fetch subcategories when a category is selected
  const subcategoriesQuery = useQuery<string[]>({
    queryKey: ["/api/transactions/categories", category, "subcategories"],
    enabled: !!category && open,
    staleTime: 60000, // 1 minute
    queryFn: async () => {
      if (!category) return [];
      const res = await fetch(`/api/transactions/categories/${category}/subcategories`);
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      return res.json();
    }
  });
  
  const subcategories = subcategoriesQuery.data || [];
  const isLoadingSubcategories = subcategoriesQuery.isLoading;
  
  // Show toast on error
  useEffect(() => {
    if (subcategoriesQuery.error) {
      toast({
        title: "Error loading subcategories",
        description: "Failed to load subcategories.",
        variant: "destructive"
      });
    }
  }, [subcategoriesQuery.error, toast]);

  // Mutation for updating the transaction category
  const categorizeMutation = useMutation({
    mutationFn: async (data: {
      category: string;
      subcategory?: string;
      tags?: string[];
      notes?: string;
    }) => {
      const response = await apiRequest(
        "POST", 
        `/api/transactions/${transaction.id}/categorize`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Categorized",
        description: "The transaction has been successfully categorized.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      if (onSuccess) onSuccess();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to categorize transaction: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // AI suggestion mutation
  const suggestionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/transactions/suggest-category",
        {
          description: transaction.description,
          amount: transaction.amount.toString(),
          type: transaction.type
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setCategory(data.category);
      setSubcategory(data.subcategory);
      
      if (data.tags && data.tags.length > 0) {
        const newTags = data.tags.map((tag: string) => ({ id: tag, text: tag }));
        setTags(newTags);
      }
      
      toast({
        title: "AI Suggestion Applied",
        description: `Suggested category: ${data.category} (${Math.round(data.confidence * 100)}% confidence)`,
      });
      setIsAiSuggesting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to get AI suggestion: ${error.message}`,
        variant: "destructive",
      });
      setIsAiSuggesting(false);
    }
  });

  // Fetch similar transactions
  const similarTransactionsQuery = useQuery<{
    similarTransactions: Array<{
      description: string;
      category: string;
      subcategory: string;
    }>;
  }>({
    queryKey: ["/api/transactions/similar-descriptions", transaction.description],
    enabled: open,
    queryFn: async () => {
      const res = await fetch(`/api/transactions/similar-descriptions?description=${encodeURIComponent(transaction.description)}`);
      if (!res.ok) throw new Error("Failed to fetch similar transactions");
      return res.json();
    }
  });
  
  const similarTransactions = similarTransactionsQuery.data;
  const isLoadingSimilar = similarTransactionsQuery.isLoading;

  function handleSuggestion() {
    setIsAiSuggesting(true);
    suggestionMutation.mutate();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }
    
    categorizeMutation.mutate({
      category,
      subcategory: subcategory || undefined,
      tags: tags.map(tag => tag.text),
      notes: notes || undefined
    });
  }

  function applySimilarTransaction(similar: { category: string, subcategory: string }) {
    setCategory(similar.category);
    setSubcategory(similar.subcategory);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <TagIcon className="h-4 w-4 mr-2" />
            Categorize
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
          <DialogDescription>
            Categorize "{transaction.description}" for better financial tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex justify-between gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleSuggestion} 
              disabled={isAiSuggesting}
              className="flex-1"
            >
              {isAiSuggesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
              )}
              AI Suggestion
            </Button>
          </div>

          {similarTransactions && similarTransactions.similarTransactions && similarTransactions.similarTransactions.length > 0 && (
            <div className="space-y-2 mt-2">
              <Label className="text-sm text-gray-500">Similar Transactions</Label>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {similarTransactions.similarTransactions.map((similar, index) => (
                  <div key={index} className="flex justify-between items-center text-sm p-1 border rounded hover:bg-gray-50">
                    <span className="truncate">{similar.description}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => applySimilarTransaction(similar)}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select 
              value={subcategory} 
              onValueChange={setSubcategory}
              disabled={!category || isLoadingSubcategories}
            >
              <SelectTrigger id="subcategory">
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSubcategories ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  subcategories.map((subcat: string) => (
                    <SelectItem key={subcat} value={subcat}>
                      {subcat.charAt(0).toUpperCase() + subcat.slice(1)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              id="tags"
              placeholder="Add tags (press Enter)"
              tags={tags}
              setTags={setTags}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={categorizeMutation.isPending || !category}
            >
              {categorizeMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Categorization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}