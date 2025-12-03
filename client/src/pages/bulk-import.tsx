import { useState } from "react";
import { useKhata } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Mic, Loader2, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tesseract from "tesseract.js";

export default function BulkImport() {
  const { addBulkEntries } = useKhata();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{ entries: { name: string; item: string; amount: string; date: string; note: string }[] } | null>(null);
  const [activeTab, setActiveTab] = useState("text");

  const handleImport = async () => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    // Simulate processing delay for "Advanced AI" feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const res = addBulkEntries(text);
    setResult(res);
    if (res.errors.length === 0) {
      setText(""); 
    }
    setIsProcessing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setExtractedData(null);
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );

      // Basic regex parsing to simulate extraction
      // Looks for lines like "Ali Chini 200"
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const entries = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          // Naive assumption: First word name, last word price, middle item
          const name = parts[0];
          const amount = parts[parts.length - 1].replace(/[^0-9.]/g, '');
          const item = parts.slice(1, -1).join(' ');
          if (name && amount && !isNaN(parseFloat(amount))) {
             return { name, item, amount, date: "", note: "" };
          }
        }
        return null;
      }).filter(e => e !== null) as { name: string; item: string; amount: string; date: string; note: string }[];

      if (entries.length > 0) {
        setExtractedData({ entries });
      } else {
        setExtractedData({ entries: [] }); // No valid entries found
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    setIsProcessing(true);
    // Simulate Speech-to-Text
    setTimeout(() => {
      const mockVoiceText = `Ali ko 200 ki chini\nAhmed ko 500 ka aata`;
      const parsedText = mockVoiceText
        .replace(/ ko /g, " ")
        .replace(/ ki /g, " ")
        .replace(/ ka /g, " ")
        .split("\n")
        .map(line => {
          const parts = line.split(" ");
          if (parts.length >= 3) {
            const name = parts[0];
            const amount = parts[1];
            const item = parts.slice(2).join(" ");
            return `${name} ${item} ${amount}`;
          }
          return line;
        })
        .join("\n");

      setText(prev => prev ? `${prev}\n${parsedText}` : parsedText);
      setIsProcessing(false);
      setActiveTab("text"); // Switch to text tab to show result
    }, 2000);
  };

  const handleConfirmExtraction = () => {
    if (!extractedData) return;
    
    const lines = extractedData.entries.map(e => `${e.name} ${e.item} ${e.amount}`).join("\n");
    const res = addBulkEntries(lines);
    setResult(res);
    setExtractedData(null);
  };

  const handleEditExtraction = () => {
    if (!extractedData) return;
    const lines = extractedData.entries.map(e => `${e.name} ${e.item} ${e.amount}`).join("\n");
    setText(prev => prev ? `${prev}\n${lines}` : lines);
    setExtractedData(null);
    setActiveTab("text");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-heading font-bold">Bulk Import</h2>
        <p className="text-muted-foreground">Add multiple entries via Text, Image (OCR), or Voice.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Choose your input method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="voice">Voice</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4 mt-4">
                  <Textarea 
                    placeholder={`Ali Chini 200\nFahad Oil 500\nAhmed Daal 120`}
                    className="min-h-[300px] font-mono text-sm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleImport} disabled={!text.trim() || isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isProcessing ? "Processing..." : "Process Import"}
                  </Button>
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-4">
                  {!extractedData ? (
                    <>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                          disabled={isProcessing}
                        />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          {isProcessing ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          ) : (
                            <ImageIcon className="h-8 w-8" />
                          )}
                          <p className="text-sm font-medium">
                            {isProcessing ? "Extracting Text..." : "Upload Image for OCR"}
                          </p>
                          <p className="text-xs">Supports JPG, PNG (Handwritten or Printed)</p>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded-md text-xs font-mono text-muted-foreground">
                        Note: Uses Tesseract.js for extraction. Best for clear, printed text.
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <pre>{JSON.stringify(extractedData, null, 2)}</pre>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md text-sm text-center font-medium">
                        Here is the extracted data. Say YES to add or NO to edit.
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={handleEditExtraction}>
                          NO (Edit)
                        </Button>
                        <Button onClick={handleConfirmExtraction}>
                          YES (Add) <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="voice" className="space-y-4 mt-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4"
                    onClick={!isProcessing ? handleVoiceInput : undefined}
                  >
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isProcessing ? "bg-red-100 animate-pulse" : "bg-primary/10"}`}>
                      {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                      ) : (
                        <Mic className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      <p className="text-sm font-medium">
                        {isProcessing ? "Listening..." : "Tap to Speak"}
                      </p>
                      <p className="text-xs">Say: "Ali ko 200 ki chini"</p>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md text-xs font-mono text-muted-foreground">
                    Simulated Result: Will convert speech to "Ali Chini 200".
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>The system is smart enough to detect names and prices.</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Each line represents one transaction.</li>
                <li>The first word is taken as the <strong>Name</strong>.</li>
                <li>The last number is taken as the <strong>Price</strong>.</li>
                <li>Everything in between is the <strong>Item Name</strong>.</li>
              </ul>
              <div className="mt-4 p-3 bg-background border rounded-md font-mono text-xs">
                Ali Chini 200<br/>
                (Name: Ali, Item: Chini, Price: 200)
              </div>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              {result.success > 0 && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Successfully processed {result.success} entries.
                  </AlertDescription>
                </Alert>
              )}

              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Errors Found</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 text-xs">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.length > 5 && <li>...and {result.errors.length - 5} more errors</li>}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
