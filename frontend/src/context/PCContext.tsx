// frontend/src/context/PCContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Status = "vacant" | "in-use" | "empty";

export interface PC {
  id?: number;
  x: number;
  y: number;
  status: Status;
}

interface PCContextType {
  pcs: PC[];
  vacantCount: number;
  inUseCount: number;
  emptyCount: number;
  totalPCs: number;
  updatePCStatus: (id: number, newStatus: Status) => void;
  refreshPCs: () => void;
}

const PCContext = createContext<PCContextType | undefined>(undefined);

// The master PC data - SINGLE SOURCE OF TRUTH
const MASTER_PCS: PC[] = [
  // --- TOP ROW ---
  { id: 1, x: 320, y: 80, status: "vacant" },
  { id: 2, x: 380, y: 80, status: "in-use" },
  { id: 3, x: 440, y: 80, status: "vacant" },
  { id: 4, x: 500, y: 80, status: "in-use" },
  { x: 560, y: 80, status: "empty" },
  { id: 5, x: 620, y: 80, status: "vacant" },

  // --- MIDDLE VERTICAL COLUMN (LEFT SIDE) ---
  { id: 6, x: 500, y: 190, status: "vacant" },
  { id: 7, x: 560, y: 190, status: "in-use" },
  { id: 8, x: 500, y: 240, status: "vacant" },
  { id: 9, x: 560, y: 240, status: "vacant" },
  { id: 10, x: 500, y: 290, status: "in-use" },
  { id: 11, x: 560, y: 290, status: "vacant" },
  { id: 12, x: 500, y: 340, status: "vacant" },
  { id: 13, x: 560, y: 340, status: "vacant" },
  { id: 14, x: 500, y: 390, status: "in-use" },
  { id: 15, x: 560, y: 390, status: "vacant" },
  { id: 16, x: 500, y: 440, status: "vacant" },
  { id: 17, x: 560, y: 440, status: "vacant" },
  { id: 18, x: 500, y: 490, status: "in-use" },
  { id: 19, x: 560, y: 490, status: "vacant" },
  { id: 20, x: 500, y: 540, status: "vacant" },
  { id: 21, x: 560, y: 540, status: "vacant" },
  { id: 22, x: 500, y: 590, status: "vacant" },
  { id: 23, x: 560, y: 590, status: "in-use" },

  // --- RIGHT SIDE VERTICAL COLUMN ---
  { id: 24, x: 800, y: 120, status: "vacant" },
  { id: 25, x: 800, y: 170, status: "in-use" },
  { id: 26, x: 800, y: 220, status: "vacant" },
  { id: 27, x: 800, y: 270, status: "vacant" },
  { id: 28, x: 800, y: 320, status: "in-use" },
  { id: 29, x: 800, y: 370, status: "vacant" },
  { id: 30, x: 800, y: 420, status: "vacant" },
  { id: 31, x: 800, y: 470, status: "in-use" },
  { id: 32, x: 800, y: 520, status: "vacant" },
  { id: 33, x: 800, y: 570, status: "vacant" },
  { id: 34, x: 800, y: 620, status: "in-use" },
  { id: 35, x: 800, y: 670, status: "vacant" },
  { id: 36, x: 800, y: 720, status: "vacant" },

  // --- BOTTOM ROWS ---
  { id: 37, x: 250, y: 700, status: "vacant" },
  { id: 38, x: 310, y: 700, status: "vacant" },
  { id: 39, x: 370, y: 700, status: "vacant" },
  { id: 40, x: 430, y: 700, status: "vacant" },
  { id: 41, x: 490, y: 700, status: "vacant" },
  { id: 42, x: 550, y: 700, status: "vacant" },
  { id: 43, x: 610, y: 700, status: "vacant" },
  { id: 44, x: 670, y: 700, status: "vacant" },

  { id: 45, x: 280, y: 760, status: "vacant" },
  { id: 46, x: 340, y: 760, status: "vacant" },
  { id: 47, x: 400, y: 760, status: "vacant" },
  { id: 48, x: 460, y: 760, status: "in-use" },
  { id: 49, x: 520, y: 760, status: "vacant" },
  { id: 50, x: 580, y: 760, status: "vacant" },
  { id: 51, x: 640, y: 760, status: "vacant" },
];

export function PCProvider({ children }: { children: ReactNode }) {
  const [pcs, setPcs] = useState<PC[]>(MASTER_PCS);

  // Calculate counts
  const vacantCount = pcs.filter(pc => pc.status === "vacant").length;
  const inUseCount = pcs.filter(pc => pc.status === "in-use").length;
  const emptyCount = pcs.filter(pc => pc.status === "empty").length;
  const totalPCs = pcs.length;

  // Update a single PC's status
  const updatePCStatus = (id: number, newStatus: Status) => {
    setPcs(prevPcs =>
      prevPcs.map(pc =>
        pc.id === id ? { ...pc, status: newStatus } : pc
      )
    );
  };

  // Refresh/reset PCs to original state
  const refreshPCs = () => {
    setPcs(MASTER_PCS);
  };

  return (
    <PCContext.Provider
      value={{
        pcs,
        vacantCount,
        inUseCount,
        emptyCount,
        totalPCs,
        updatePCStatus,
        refreshPCs,
      }}
    >
      {children}
    </PCContext.Provider>
  );
}

// Custom hook to use the PC context
export function usePC() {
  const context = useContext(PCContext);
  if (context === undefined) {
    throw new Error('usePC must be used within a PCProvider');
  }
  return context;
}