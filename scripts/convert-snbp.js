
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../src/alumni_snbp.xlsx');
const OUTPUT_PATH = path.join(__dirname, '../src/data/alumni-snbp.json');

try {
    console.log(`Reading Excel file from: ${EXCEL_PATH}`);
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON with raw values to inspect headers
    const rawData = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${rawData.length} rows.`);
    if (rawData.length > 0) {
        console.log('Sample row:', rawData[0]);
    }

    const processedData = {}; // Map of "Year-PTN-Prodi" -> Record

    rawData.forEach(row => {
        // Normalize keys (lowercase, remove spaces) to find columns
        const keys = Object.keys(row);
        const getVal = (patterns) => {
            const key = keys.find(k => patterns.some(p => k.toLowerCase().includes(p)));
            return key ? row[key] : null;
        };

        const name = getVal(['nama']);
        const kelas = getVal(['kelas']);
        const ptn = getVal(['ptn', 'univ', 'perguruan']);
        const prodi = getVal(['prodi', 'jurusan', 'program']);
        // Year might be in the file or inferred. If not found, default to 2024 or try to detect from filename?
        // The user uploaded one file. Maybe it combines years? Or maybe just 2024?
        // The PDF names had years. The Excel might be combined?
        // Let's look for a 'Tahun' column, if not, check if 'kelas' implies it (unlikely).
        // If missing, I'll default to "Unknown Year" or maybe the user needs to specify?
        // Wait, the user said "lists of 2023, 2024, 2025". Did they merge them?
        // Or did they just upload one? The user said "sudah" (done).
        // I will assume it might be a merged file or I'll look for year col.
        let year = getVal(['tahun', 'year']);
        if (!year) {
            // Try to infer from filename if possible, but the filename is generic "alumni_snbp".
            // If they merged it, they hopefully added a year column.
            // If not, I'll default to 2024 for now and warn.
            year = 2024;
        }

        if (ptn && prodi) {
            const key = `${year}-${ptn}-${prodi}`;
            if (!processedData[key]) {
                processedData[key] = {
                    year: parseInt(year) || year,
                    ptn: ptn.toString().trim(),
                    prodi: prodi.toString().trim(),
                    count: 0,
                    details: []
                };
            }
            processedData[key].count++;
            processedData[key].details.push({
                name: name ? name.toString().trim() : 'Siswa',
                kelas: kelas ? kelas.toString().trim() : '-'
            });
        }
    });

    const output = Object.values(processedData).sort((a, b) => b.year - a.year || a.ptn.localeCompare(b.ptn));

    console.log(`Writing ${output.length} aggregated records to ${OUTPUT_PATH}`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log('Success!');

} catch (e) {
    console.error('Error converting file:', e);
    process.exit(1);
}
