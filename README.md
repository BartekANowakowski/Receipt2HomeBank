# Receipt2HomeBank 🧾➡️💰

**Receipt2HomeBank** is a modern, mobile-first web application that uses Artificial Intelligence (Google Gemini) to scan shopping receipts, extract line items, categorize them, and export the data directly into a CSV format compatible with [HomeBank](http://homebank.free.fr/) personal finance software.

## ✨ Features

*   **AI-Powered OCR**: Instantly extracts store name, date, total amount, payment method, and line items from receipt photos using Google Gemini 2.0 Flash.
*   **Smart Categorization**: Automatically assigns categories to purchased items based on your personal category tree.
*   **Batch Processing**: Scan multiple receipts in one session and export them all at once.
*   **Review & Edit**:
    *   Verify detected prices and sums with built-in math validation.
    *   Edit item names, prices, and categories via a polished mobile interface.
    *   Handle discounts and complex receipt layouts automatically.
*   **Flexible Export**:
    *   **New CSV**: Generate a new timestamped file for import.
    *   **Append Mode**: Add new transactions to an existing local CSV file (great for monthly logs).
*   **Customization**:
    *   **Accounts**: Manage your wallet/bank accounts (PLN, EUR, USD, etc.).
    *   **Categories**: Create and color-code nested categories.
    *   **Shop Mappings**: Map raw receipt names (e.g., "JMP S.A. Biedronka") to clean names (e.g., "Biedronka").
*   **Privacy Focused**: All settings are stored locally in your browser (`localStorage`). CSV files are generated and saved locally on your device.

## 🚀 Getting Started

### Prerequisites

1.  **Google Gemini API Key**: You need a free or paid API key from [Google AI Studio](https://aistudio.google.com/).
2.  **Node.js**: (If running locally)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/receipt2homebank.git
    cd receipt2homebank
    ```

2.  Create an environment variable file (`.env`) in the root directory and add your API key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

3.  Install dependencies (assuming a standard React build setup):
    ```bash
    npm install
    ```

4.  Start the application:
    ```bash
    npm start
    ```

## 📱 Usage Guide

1.  **Setup**: On first launch, go to **Settings** (Gear icon).
    *   **Accounts**: Add your payment accounts (e.g., "Cash", "Credit Card").
    *   **Categories**: Review the default categories or add your own to match your HomeBank configuration.
    *   **Shops**: (Optional) Add mappings if you want to standardize payee names.

2.  **Scan**:
    *   Click the **Scan Receipt** button on the home screen.
    *   Take a photo or upload an image of a receipt.
    *   Select the **Target Account** (Wallet) for this expense.

3.  **Review**:
    *   The app will display the extracted data.
    *   **Math Check**: If the sum of items doesn't match the receipt total, a warning will appear.
    *   **Edit**: Tap any item to change its name, price, or category.
    *   **Add/Remove**: You can add missing items or remove incorrect ones.
    *   Click **Approve** to finish or **Add Next** to scan another receipt immediately.

4.  **Export**:
    *   In the **Session Summary**, review all processed receipts.
    *   Click **New CSV** to download a fresh file.
    *   Click **Add to CSV** to append these transactions to an existing file on your device.

## 📂 CSV Format (HomeBank)

The generated CSV uses the standard HomeBank import format with semi-colon separators:

`Date;Mode;Info;Payee;Memo;Amount;Category;Tags`

*   **Date**: YYYY-MM-DD
*   **Mode**: 1=Credit Card, 3=Cash, 8=Debit/General (Auto-detected).
*   **Payee**: Cleaned store name.
*   **Memo**: List of items in that category (e.g., "Milk, Bread + 2 others").
*   **Amount**: Negative value for expenses.
*   **Category**: The assigned category name.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI/OCR**: Google GenAI SDK (`@google/genai`)
*   **Icons**: Hand-crafted SVGs (Lucide-style)
*   **Storage**: Browser LocalStorage

## 📄 License

This project is open-source and available under the MIT License.