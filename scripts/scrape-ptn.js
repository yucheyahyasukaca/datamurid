const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = 'https://eduzone.id/daftar-passing-grade-ptn/';
const OUTPUT_FILE = path.join(__dirname, '../src/data/ptn-data.json');

// Helper to fetch HTML content
async function fetchHtml(url) {
    try {
        console.log(`Fetching: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null; // Continue processing other items
    }
}

async function startScraping() {
    console.log('Starting scraping process...');

    // 1. Fetch main page
    const mainHtml = await fetchHtml(BASE_URL);
    if (!mainHtml) {
        console.error('Failed to load main page. Aborting.');
        return;
    }

    const $ = cheerio.load(mainHtml);
    const universityLinks = [];

    // 2. Find all "Lihat PG" links
    $('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href');

        if (text === 'Lihat PG' && href && href.includes('eduzone.id/passing-grade-')) {
            const tr = $(el).closest('tr');
            let univName = '';
            if (tr.length > 0) {
                // columns: Kode, Nama Universitas, Akronim, Link
                univName = $(tr).find('td').eq(1).text().trim();
            }

            universityLinks.push({
                url: href,
                name: univName || href.split('/').filter(Boolean).pop().replace('passing-grade-', '').toUpperCase()
            });
        }
    });

    console.log(`Found ${universityLinks.length} universities.`);

    const allData = [];

    // 3. Visit each university page
    // Using for...of loop to process sequentially
    for (const [index, univ] of universityLinks.entries()) {
        console.log(`[${index + 1}/${universityLinks.length}] Processing ${univ.name}...`);

        const pageHtml = await fetchHtml(univ.url);
        if (!pageHtml) continue;

        const $page = cheerio.load(pageHtml);
        const prodiList = [];

        // 4. Extract data from table
        $page('table').each((i, table) => {
            const rows = $page(table).find('tr');
            if (rows.length < 5) return; // skip small layout tables

            // Check headers to confirm it's the right table
            const headerRow = rows.eq(0);
            const headerText = headerRow.text().replace(/\s+/g, ' ').toUpperCase();

            const isTargetTable =
                (headerText.includes('PROGRAM STUDI') || headerText.includes('PRODI')) &&
                (headerText.includes('PASSING GRADE') || headerText.includes('PG') || headerText.includes('DAYA'));

            if (!isTargetTable) {
                return;
            }

            // Attempt to find Category (SNBP vs SNBT)
            let category = 'UMUM';

            // Search strategy:
            // 1. Look for nearest preceding header (h1-h6) or strong/p with specific text
            // 2. Look for nearest preceding paragraph that might contain keywords

            // We use a helper to check text
            const checkText = (txt) => {
                if (!txt) return null;
                txt = txt.toUpperCase();
                if (txt.includes('SNBP') || txt.includes('PRESTASI')) return 'SNBP';
                if (txt.includes('SNBT') || txt.includes('TEST') || txt.includes('UTBK') || txt.includes('SBMPTN')) return 'SNBT';
                return null;
            };

            // Strategy 1: Previous siblings
            let siblings = $page(table).prevAll();
            for (let k = 0; k < siblings.length; k++) {
                const node = siblings.eq(k);
                const tag = node.prop('tagName');
                // Stop if we hit another table, meaning this header belongs to this table only
                if (tag === 'TABLE') break;

                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'STRONG'].includes(tag)) {
                    const found = checkText(node.text());
                    if (found) {
                        category = found;
                        break;
                    }
                }
            }

            // Strategy 2: If inside a container/div
            if (category === 'UMUM') {
                let parentPrev = $page(table).parent().prevAll();
                for (let k = 0; k < parentPrev.length; k++) {
                    const node = parentPrev.eq(k);
                    const tag = node.prop('tagName');
                    if (tag === 'TABLE') break;
                    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag)) {
                        const found = checkText(node.text());
                        if (found) {
                            category = found;
                            break;
                        }
                    }
                }
            }

            // Iterate rows (skip header)
            rows.each((j, row) => {
                if (j === 0) return; // skip header

                const cols = $page(row).find('td');
                if (cols.length >= 6) {
                    const prodi = cols.eq(0).text().trim();
                    const jenjang = cols.eq(1).text().trim();
                    const passingGrade = cols.eq(2).text().trim();
                    const keketatan = cols.eq(3).text().trim();

                    const dayaTampungStr = cols.eq(4).text().trim().replace('.', '');
                    const peminatStr = cols.eq(5).text().trim().replace('.', '');

                    if (prodi && passingGrade) {
                        prodiList.push({
                            prodi,
                            jenjang,
                            passingGrade,
                            keketatan,
                            dayaTampung: parseInt(dayaTampungStr) || 0,
                            peminat: parseInt(peminatStr) || 0,
                            category
                        });
                    }
                }
            });
        });

        if (prodiList.length > 0) {
            allData.push({
                university: univ.name,
                url: univ.url,
                programs: prodiList
            });
            console.log(`   -> Extracted ${prodiList.length} programs.`);
        } else {
            console.warn(`   -> No data found for ${univ.name}`);
        }

        // Polite delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 5. Save Data
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
    console.log(`\nSuccess! Data saved to ${OUTPUT_FILE}`);
    console.log(`Total Universities: ${allData.length}`);
}

startScraping();
