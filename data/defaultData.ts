
import { AppSettings } from "../types";

export const DEFAULT_SETTINGS: AppSettings = {
  accounts: [
    { name: "Gotówka", currency: "PLN" },
    { name: "Visa Gold", currency: "PLN" },
    { name: "MasterCard Debit", currency: "PLN" },
    { name: "Revolut", currency: "EUR" }
  ],
  shopMappings: [
    { rawName: "CARREFOUR POLSKA SP. Z O.O.", cleanName: "Carrefour" },
    { rawName: "JM DIERONIMO MARTINS", cleanName: "Biedronka" },
    { rawName: "ROSSMANN SDP", cleanName: "Rossmann" },
    { rawName: "ZABKA POLSKA", cleanName: "Żabka" },
    { rawName: "SHELL POLSKA", cleanName: "Shell" },
    { rawName: "BP EUROPA SE", cleanName: "BP" }
  ],
  categories: [
    // Parent categories with distinct colors
    { name: "Żywność", description: "Wszystko co dotyczy jedzenia i picia.", color: "#4F46E5" }, // Indigo
    { name: "Dom", description: "Wydatki na utrzymanie domu i chemię.", color: "#059669" },      // Emerald
    { name: "Transport", description: "Paliwo, bilety, serwis auta.", color: "#E11D48" },      // Rose
    { name: "Zdrowie", description: "Apteka, lekarze, badania.", color: "#D97706" },          // Amber
    { name: "Rozrywka", description: "Kino, gry, hobby.", color: "#7C3AED" },               // Violet
    
    // Subcategories
    { name: "Zakupy spożywcze", parent: "Żywność", description: "Codzienne zakupy w marketach." },
    { name: "Restauracje i bary", parent: "Żywność", description: "Jedzenie poza domem." },
    { name: "Alkohol", parent: "Żywność", description: "Napoje wyskokowe." },
    
    { name: "Chemia i kosmetyki", parent: "Dom", description: "Środki czystości, mydła, szampony." },
    { name: "RTV i AGD", parent: "Dom", description: "Sprzęt elektroniczny i wyposażenie." },
    
    { name: "Paliwo", parent: "Transport", description: "Benzyna, Diesel, LPG." },
    { name: "Komunikacja miejska", parent: "Transport", description: "Bilety ZTM, PKP, Uber." },
    
    { name: "Leki", parent: "Zdrowie", description: "Zakupy w aptece." }
  ]
};

export const PRESET_COLORS = [
    "#4F46E5", "#059669", "#E11D48", "#D97706", "#0891B2", 
    "#7C3AED", "#C026D3", "#EA580C", "#65A30D", "#0D9488", 
    "#2563EB", "#DB2777", "#475569", "#78350F", "#DC2626"
];
