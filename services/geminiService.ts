
import { GoogleGenAI } from "@google/genai";
import { ReceiptData, AppSettings } from "../types";

export const parseReceiptImage = async (
  base64Image: string, 
  settings: AppSettings,
  onStatusChange?: (status: string) => void
): Promise<ReceiptData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const mimeType = "image/jpeg"; 

  onStatusChange?.("Rozczytywanie paragonu...");

  // Format categories for prompt as full paths "Category: Subcategory"
  const categoryContext = settings.categories.map(c => {
      const fullPath = c.parent ? `${c.parent}: ${c.name}` : c.name;
      return `- ${fullPath}: ${c.description}`;
  }).join('\n');
  
  const shopNames = settings.shopMappings.map(s => s.rawName).join(', ');

  const prompt = `
    Przeanalizuj zdjęcie tego paragonu. Użyj następujących danych konfiguracyjnych:
    
    ZNANE KATEGORIE (Używaj DOKŁADNIE tych nazw, format to Kategoria: Podkategoria lub sama Kategoria):
    ${categoryContext}
    
    ZNANE NAZWY SKLEPÓW (kontekst):
    ${shopNames}

    ZADANIA:
    1. Zidentyfikuj Nazwę Sklepu.
    2. Zidentyfikuj Datę (YYYY-MM-DD).
    3. Zidentyfikuj Kwotę Całkowitą (SUMA/TOTAL).
    4. Wykryj Metodę Płatności.
    5. WYLISTUJ POZYCJE (BARDZO WAŻNE - OBSŁUGA RABATÓW):
       - Jeśli znajdziesz rabat (np. "Promocja", "Rabat", "Upust"), musisz go odjąć od konkretnego produktu, którego dotyczy.
       - Suma wszystkich "price" MUSI równać się Kwocie Całkowitej paragonu.
    6. KATEGORIE: Przypisz kategorię z listy ZNANE KATEGORIE. Staraj się być jak najbardziej precyzyjny (wybieraj podkategorie jeśli pasują).

    Zwróć TYLKO poprawny obiekt JSON:
    {
      "storeName": "string",
      "date": "YYYY-MM-DD",
      "total": number,
      "detectedPaymentMethod": "string",
      "cardLast4": "string (digits only) or null",
      "items": [
        { 
          "name": "string", 
          "originalPrice": number,
          "discount": number,
          "price": number,
          "category": "string (dokładnie z listy ZNANE KATEGORIE)" 
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    onStatusChange?.("Identyfikacja pozycji...");

    const text = response.text;
    if (!text) throw new Error("Brak odpowiedzi od AI");

    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error. Raw Text:", text);
      throw new Error("Nie udało się przetworzyć danych paragonu.");
    }

    onStatusChange?.("Przypisywanie kategorii...");

    let processedStoreName = data.storeName || "Nieznany Sklep";
    const foundShopMap = settings.shopMappings.find(
        m => processedStoreName.toUpperCase().includes(m.rawName.toUpperCase()) || 
             m.rawName.toUpperCase().includes(processedStoreName.toUpperCase())
    );
    if (foundShopMap) {
        processedStoreName = foundShopMap.cleanName;
    }

    onStatusChange?.("Weryfikacja matematyczna...");
    const rawTotal = typeof data.total === 'number' ? data.total : 0;
    let items = Array.isArray(data.items) ? data.items : [];
    
    const firstCategory = settings.categories[0];
    const defaultCatName = firstCategory ? (firstCategory.parent ? `${firstCategory.parent}: ${firstCategory.name}` : firstCategory.name) : "Inne";

    items = items.map((item: any) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const originalPrice = typeof item.originalPrice === 'number' ? item.originalPrice : price;
        const discount = typeof item.discount === 'number' ? item.discount : (originalPrice - price);

        return {
            id: Math.random().toString(36).substr(2, 9),
            name: item.name || "Produkt",
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            category: item.category || defaultCatName
        };
    });

    const sumOfItems = items.reduce((sum: number, item: any) => sum + item.price, 0);
    const diff = rawTotal - sumOfItems;
    let isMathValid = true;

    if (Math.abs(diff) > 0.02) {
        isMathValid = false;
        items.push({
            id: 'adjustment-auto',
            name: diff > 0 ? "Zaokrąglenie / Korekta" : "Nadwyżka sumy",
            price: Number(diff.toFixed(2)),
            originalPrice: Number(diff.toFixed(2)),
            discount: 0,
            category: defaultCatName
        });
    }

    return {
      storeName: processedStoreName,
      date: data.date || new Date().toISOString().split('T')[0],
      total: rawTotal,
      detectedPaymentMethod: data.detectedPaymentMethod || "Gotówka",
      detectedCardLast4: data.cardLast4,
      items: items,
      isMathValid: isMathValid
    };

  } catch (error) {
    console.error("Gemini processing error:", error);
    throw new Error(error instanceof Error ? error.message : "Nie udało się przetworzyć paragonu. Spróbuj ponownie.");
  }
};
