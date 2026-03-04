import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import migrasiService from './src/services/migrasiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    try {
        const filePath = path.join(__dirname, 'test_migration_files', 'testing_distribusi_excel.xlsx');
        const buffer = fs.readFileSync(filePath);
        
        console.log("Analyzing distribusi_excel...");
        const result = await migrasiService.previewExcel(buffer, 'distribusi_excel');
        
        console.log("Valid rows:", result.preview_valid.length);
        console.log("Invalid rows:", result.preview_invalid.length);
        if (result.preview_valid.length > 0) {
            console.log("First valid row data:", JSON.stringify(result.preview_valid[0].data, null, 2));
            if (result.preview_valid[0].koreksi_otomatis) {
                console.log("Warnings:", result.preview_valid[0].koreksi_otomatis);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
