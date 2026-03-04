import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { default as ExcelJS } from 'exceljs';
import migrasiService from './src/services/migrasiService.js';
import { createMustahiqSchema } from './src/validations/mustahiqValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    try {
        const filePath = path.join(__dirname, 'test_migration_files', 'testing_distribusi_excel.xlsx');
        const buffer = fs.readFileSync(filePath);

        console.log("Analyzing distribusi_excel fuzzy resolver mappings...");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.getWorksheet('Data Distribusi');

        const headerMap = {};
        sheet.getRow(1).eachCell((cell, colNum) => {
            headerMap[(cell.value || '').toString().trim().toUpperCase()] = colNum;
        });
        const getColIdx = h => headerMap[h.toUpperCase()];

        const resolver = await migrasiService.buildResolvers('distribusi_excel');

        const row = sheet.getRow(2);
        const rowData = {};
        const cols = migrasiService.COLUMN_CONFIG['distribusi_excel'].columns;
        cols.forEach(col => {
            const idx = getColIdx(col.header);
            rowData[col.key] = idx ? row.getCell(idx).value : null;
        });

        const resolved = await resolver(rowData);
        console.log("Warnings:", resolved._fuzzyWarnings);
        console.log("Resolved Object:", JSON.stringify(resolved, null, 2));

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
};

run();
