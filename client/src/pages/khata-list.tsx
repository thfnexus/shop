import { useState } from "react";
import { useKhata } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Search, Plus, User, ChevronRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function KhataList() {
  const { khatas, createKhata, deleteKhata } = useKhata();
  const [search, setSearch] = useState("");
  const [newKhataName, setNewKhataName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredKhatas = khatas.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newKhataName.trim()) return;
    createKhata(newKhataName);
    setNewKhataName("");
    setIsDialogOpen(false);
    toast({
      title: "Khata Created",
      description: `Successfully created khata for ${newKhataName}`,
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault(); // Prevent navigation
    if (confirm(`Are you sure you want to delete ${name}'s khata? This cannot be undone.`)) {
      deleteKhata(id);
      toast({
        title: "Khata Deleted",
        description: `${name}'s khata has been removed.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold">All Khatas</h2>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Khata
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Khata</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Ali Khan" 
                  value={newKhataName}
                  onChange={(e) => setNewKhataName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search customers..." 
          className="pl-10 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredKhatas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-lg border border-dashed">
            No khatas found. Create one to get started.
          </div>
        ) : (
          filteredKhatas.map((khata) => (
            <Link key={khata.id} href={`/khata/${khata.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, khata.id, khata.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium truncate pr-8">{khata.name}</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Balance</p>
                      <p className="text-2xl font-bold font-mono text-primary">₨ {khata.total.toLocaleString()}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Last updated: {new Date(khata.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
