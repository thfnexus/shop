import { useState } from "react";
import { useRoute } from "wouter";
import { useKhata } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Plus, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function KhataDetails() {
  const [, params] = useRoute("/khata/:id");
  const { getKhata, addEntry } = useKhata();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form state
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"credit" | "debit">("credit");

  const khata = getKhata(params?.id || "");

  if (!khata) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">Khata Not Found</h2>
        <Link href="/khatas">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Button>
        </Link>
      </div>
    );
  }

  const handleAddEntry = () => {
    if (!item || !price) return;
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return;

    addEntry(khata.id, item, priceNum, type);
    setItem("");
    setPrice("");
    setType("credit");
    setIsAddOpen(false);
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("AlHamd Super Store", 14, 22);
    
    doc.setFontSize(10);
    doc.text("WhatsApp: 0300-6764066", 14, 28);
    doc.text("Call Support: 0342-3209895", 14, 33);
    
    doc.setFontSize(12);
    doc.text(`Customer: ${khata.name}`, 14, 42);
    doc.text(`Date: ${format(new Date(), "PPP")}`, 14, 48);
    doc.text(`Invoice #: INV-${Math.floor(Math.random() * 10000)}`, 14, 54);

    // Table
    const tableData = khata.entries.map(entry => [
      format(new Date(entry.date), "yyyy-MM-dd"),
      entry.item,
      entry.type === "credit" ? "Udhaar" : "Payment",
      entry.type === "credit" ? entry.price.toFixed(2) : `-${entry.price.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Item', 'Type', 'Amount']],
      body: tableData,
      foot: [['', '', 'Total Due', khata.total.toFixed(2)]],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }, // Blue header
    });

    doc.save(`invoice_${khata.name}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/khatas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold">{khata.name}</h1>
          <p className="text-muted-foreground">Account Details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateInvoice}>
                <FileText className="mr-2 h-4 w-4" /> Invoice
              </Button>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Item Name</Label>
                      <Input 
                        placeholder="e.g. Sugar, Rice, Payment" 
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₨)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={type} onValueChange={(v: "credit" | "debit") => setType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Udhaar (Credit)</SelectItem>
                          <SelectItem value="debit">Payment Received (Debit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddEntry}>Add Entry</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {khata.entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No entries yet. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...khata.entries].reverse().map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">{entry.item}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.type === 'credit' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {entry.type === 'credit' ? 'Udhaar' : 'Payment'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                           entry.type === 'credit' ? 'text-destructive' : 'text-success'
                        }`}>
                          {entry.type === 'credit' ? '+' : '-'} ₨ {entry.price.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary-foreground/80 text-sm font-normal">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono">₨ {khata.total.toLocaleString()}</div>
              <p className="text-sm text-primary-foreground/60 mt-2">
                Net balance to be received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={generateInvoice}>
                <Download className="mr-2 h-4 w-4" /> Download Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
