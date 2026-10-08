# StockDesk Offline Inventory Software

Desktop-first inventory software built for offline use.

## Current stage
- Clean landing/home page
- Local Create Account flow
- Local Sign In flow
- SQLite database initialized by Electron
- Initial admin dashboard UI
- Navigation placeholders for future inventory modules

## Run locally
1. Install Node.js LTS.
2. In this repository run:
   `npm install`
3. Run:
   `npm run dev`

The SQLite database is created automatically under Electron's application-data directory. No Supabase, MySQL, or internet connection is required for the application data.

## Next development
Products → Categories → Stock → Purchases → Sales → Suppliers → Staff → Profit & Loss → Reports → Backup/Restore → Windows installer.
