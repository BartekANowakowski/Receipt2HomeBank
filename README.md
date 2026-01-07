# Receipt2HomeBank

A mobile-first web application designed to automate receipt entry for [**HomeBank**](https://www.gethomebank.org/en/) personal finance software using AI.

<p align="center">
  <img src=".attachments/screenshot1.png" alt="Scan Receipt" width="30%">
  <img src=".attachments/screenshot2.png" alt="Review Data" width="30%">
  <img src=".attachments/screenshot3.png" alt="Export to HomeBank" width="30%">
</p>

## Core Features

- **AI OCR Scanning**: Uses Gemini 2.5/3 to extract store names, dates, items, and totals from receipt photos.
- **Smart Categorization**: Automatically maps items to your hierarchical HomeBank categories based on AI context.
- **Store Mapping**: Clean up messy OCR store names (e.g., "JM DIERONIMO..." -> "Biedronka") via custom settings.
- **CSV Import (Append Mode)**: Load existing HomeBank CSV files to add new scans to an existing session.
- **Batch Export**: Download a semicolon-separated CSV formatted specifically for HomeBank import.
- **Mobile-First Design**: Optimized for mobile browsers with "Click to Confirm" deletions and camera integration.
- **Persistence**: All settings (Accounts, Categories, Shop Mappings) are saved locally in the browser.

## Workflow

1. **Configure**: Set up your Accounts and Categories in Settings (matches HomeBank setup).
2. **Import (Optional)**: Load an existing CSV if you want to append to a previous list.
3. **Scan**: Take a photo of a receipt.
4. **Review**: Verify items and categories. AI handles math corrections automatically.
5. **Download**: Export the batch as a HomeBank-compatible CSV.

## Technical Setup

- **Frontend**: React 19, Tailwind CSS.
- **AI Engine**: Google Gemini API (`gemini-3-flash-preview`).
- **Permissions**: Requires Camera access for scanning.
- **Environment**: Requires `process.env.API_KEY` for Gemini API calls.

## HomeBank CSV Format
Exports use the standard format:
`Date;Mode;Info;Payee;Memo;Amount;Category;Tags`
*(Semicolon delimited, UTF-8)*
