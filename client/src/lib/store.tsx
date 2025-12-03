import React, { createContext, useContext, useState, useEffect } from "react";
import { format } from "date-fns";

// --- Types ---
export type Entry = {
  id: string;
  date: string;
  item: string;
  price: number;
  type: "credit" | "debit"; // credit = udhaar given (positive for us), debit = payment received (reduces udhaar)
};

export type Khata = {
  id: string;
  name: string;
  entries: Entry[];
  total: number; // Calculated
  updatedAt: string;
};

type KhataContextType = {
  khatas: Khata[];
  createKhata: (name: string) => void;
  addEntry: (khataId: string, item: string, price: number, type?: "credit" | "debit") => void;
  addBulkEntries: (text: string) => { success: number; errors: string[], status: string, added: {name: string, item: string, price: number}[] };
  getKhata: (idOrName: string) => Khata | undefined;
  deleteKhata: (id: string) => void;
};

// --- Mock Data ---
const INITIAL_KHATAS: Khata[] = [
  {
    id: "k1",
    name: "Ali",
    entries: [
      { id: "e1", date: "2025-01-15", item: "Chini", price: 200, type: "credit" },
      { id: "e2", date: "2025-01-16", item: "Aata", price: 300, type: "credit" },
      { id: "e3", date: "2025-01-20", item: "Payment", price: 100, type: "debit" },
    ],
    total: 400,
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: "k2",
    name: "Fahad",
    entries: [
      { id: "e4", date: "2025-01-18", item: "Oil", price: 500, type: "credit" },
    ],
    total: 500,
    updatedAt: "2025-01-18T14:30:00Z",
  },
];

const KhataContext = createContext<KhataContextType | undefined>(undefined);

export function KhataProvider({ children }: { children: React.ReactNode }) {
  const [khatas, setKhatas] = useState<Khata[]>(INITIAL_KHATAS);

  // Recalculate totals whenever entries change (helper)
  const calculateTotal = (entries: Entry[]) => {
    return entries.reduce((acc, curr) => {
      return curr.type === "credit" ? acc + curr.price : acc - curr.price;
    }, 0);
  };

  const createKhata = (name: string) => {
    if (khatas.some(k => k.name.toLowerCase() === name.toLowerCase())) {
      // In a real app, we might return an error or handle duplicates differently
      // For now, we just don't create a duplicate
      return;
    }
    const newKhata: Khata = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      entries: [],
      total: 0,
      updatedAt: new Date().toISOString(),
    };
    setKhatas(prev => [newKhata, ...prev]);
  };

  const addEntry = (khataId: string, item: string, price: number, type: "credit" | "debit" = "credit") => {
    setKhatas(prev => prev.map(k => {
      if (k.id === khataId) {
        const newEntry: Entry = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          item,
          price,
          type
        };
        const updatedEntries = [...k.entries, newEntry];
        return {
          ...k,
          entries: updatedEntries,
          total: calculateTotal(updatedEntries),
          updatedAt: new Date().toISOString(),
        };
      }
      return k;
    }));
  };

  const addBulkEntries = (text: string) => {
    const lines = text.split("\n").filter(l => l.trim());
    let successCount = 0;
    const errors: string[] = [];
    const added: {name: string, item: string, price: number}[] = [];

    // We need to update state, but since we might update the same khata multiple times,
    // we should do it in a functional way that accumulates changes.
    // For simplicity in this prototype, we'll process sequentially on a copy.
    
    let currentKhatas = [...khatas];

    lines.forEach((line, index) => {
      // Expected format: "Name Item Price" or "Name Item Price" (flexible spaces)
      // Regex to capture: Name (word), Item (words), Price (digits at end)
      // Simple parser: 
      // 1. Split by space
      // 2. First part = Name
      // 3. Last part = Price
      // 4. Middle = Item
      
      const parts = line.trim().split(/\s+/);
      if (parts.length < 3) {
        errors.push(`Line ${index + 1}: Invalid format (needs Name Item Price)`);
        return;
      }

      const priceStr = parts[parts.length - 1];
      const price = parseFloat(priceStr);
      
      if (isNaN(price)) {
        errors.push(`Line ${index + 1}: Invalid price`);
        return;
      }

      const name = parts[0];
      const item = parts.slice(1, -1).join(" ");

      // Find or create Khata
      let khataIndex = currentKhatas.findIndex(k => k.name.toLowerCase() === name.toLowerCase());
      
      if (khataIndex === -1) {
        // Create new implicitly
        const newKhata: Khata = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          entries: [],
          total: 0,
          updatedAt: new Date().toISOString(),
        };
        currentKhatas.push(newKhata);
        khataIndex = currentKhatas.length - 1;
      }

      // Add entry
      const newEntry: Entry = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        item,
        price,
        type: "credit" // Bulk add assumes adding udhaar
      };
      
      currentKhatas[khataIndex].entries.push(newEntry);
      currentKhatas[khataIndex].total = calculateTotal(currentKhatas[khataIndex].entries);
      currentKhatas[khataIndex].updatedAt = new Date().toISOString();
      successCount++;
      added.push({ name, item, price });
    });

    setKhatas(currentKhatas);
    return { success: successCount, errors, status: "success", added };
  };

  const getKhata = (idOrName: string) => {
    return khatas.find(k => k.id === idOrName || k.name.toLowerCase() === idOrName.toLowerCase());
  };

  const deleteKhata = (id: string) => {
    setKhatas(prev => prev.filter(k => k.id !== id));
  };

  return (
    <KhataContext.Provider value={{ khatas, createKhata, addEntry, addBulkEntries, getKhata, deleteKhata }}>
      {children}
    </KhataContext.Provider>
  );
}

export const useKhata = () => {
  const context = useContext(KhataContext);
  if (!context) throw new Error("useKhata must be used within a KhataProvider");
  return context;
};
