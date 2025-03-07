const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Get the yyyymm parameter from command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node get_pika_bpc.js yyyymm (e.g., node get_pika_bpc.js 202412)');
  process.exit(1);
}

const yyyymm = args[0];
if (!/^\d{6}$/.test(yyyymm)) {
  console.error('Error: yyyymm must be a 6-digit number (e.g., 202412)');
  process.exit(1);
}

// Paths to input and output CSV files
const csvFilePath = path.join(__dirname, `./${yyyymm}_BPC.csv`);
const exportFilePath = path.join(__dirname, './BPC.csv');

// Initialize an object to store the sum and count for each UF
const ufData = {
  AC: { sum: 0, count: 0 }, AL: { sum: 0, count: 0 }, AP: { sum: 0, count: 0 },
  AM: { sum: 0, count: 0 }, BA: { sum: 0, count: 0 }, CE: { sum: 0, count: 0 },
  DF: { sum: 0, count: 0 }, ES: { sum: 0, count: 0 }, GO: { sum: 0, count: 0 },
  MA: { sum: 0, count: 0 }, MT: { sum: 0, count: 0 }, MS: { sum: 0, count: 0 },
  MG: { sum: 0, count: 0 }, PA: { sum: 0, count: 0 }, PB: { sum: 0, count: 0 },
  PR: { sum: 0, count: 0 }, PE: { sum: 0, count: 0 }, PI: { sum: 0, count: 0 },
  RJ: { sum: 0, count: 0 }, RN: { sum: 0, count: 0 }, RS: { sum: 0, count: 0 },
  RO: { sum: 0, count: 0 }, RR: { sum: 0, count: 0 }, SC: { sum: 0, count: 0 },
  SP: { sum: 0, count: 0 }, SE: { sum: 0, count: 0 }, TO: { sum: 0, count: 0 },
  Others: { sum: 0, count: 0 }, Total: { sum: 0, count: 0 }
};

console.time('pika-csv');

let lineCount = 0;

// Check if BPC.csv exists; if not, write the header
if (!fs.existsSync(exportFilePath)) {
  fs.writeFileSync(exportFilePath, 'Period,UF,Sum,Count\n');
}

fs.createReadStream(csvFilePath)
  .pipe(csv({
    separator: ';',
    mapHeaders: ({ header, index }) => header.trim()
  }))
  .on('data', (row) => {
    lineCount++;
    const rowValues = Object.values(row);
    const value = parseFloat(rowValues[13].replace(',', '.')); // VALOR PARCELA is at index 13
    const uf = rowValues[2]; // UF is at index 2

    if (!isNaN(value)) {
      ufData.Total.sum += value;
      ufData.Total.count++;

      if (uf in ufData) {
        ufData[uf].sum += value;
        ufData[uf].count++;
      } else {
        ufData.Others.sum += value;
        ufData.Others.count++;
      }
    }

    if (lineCount % 1000000 === 0) {
      console.log(`Processed ${lineCount} rows`);
      console.log('Partial Sums by State:');
      for (const [state, data] of Object.entries(ufData)) {
        if (data.count > 0) {
          console.log(`${state}: Sum = ${data.sum.toFixed(2)}, Count = ${data.count}`);
        }
      }
      console.log('---');
    }
  })
  .on('end', () => {
    console.log(`Finished processing ${lineCount} lines from ${csvFilePath}`);
    console.log('\nFinal Sums by State:');
    for (const [state, data] of Object.entries(ufData)) {
      if (data.count > 0) {
        console.log(`${state}: Sum = ${data.sum.toFixed(2)}, Count = ${data.count}`);
      }
    }

    // Prepare data for export
    const exportData = [];
    for (const [uf, data] of Object.entries(ufData)) {
      if (data.count > 0) { // Only include states with data
        exportData.push(`${yyyymm},${uf},${data.sum.toFixed(2)},${data.count}`);
      }
    }

    // Append data to the export CSV file
    fs.appendFileSync(exportFilePath, exportData.join('\n') + '\n');
    console.log('Data successfully appended to the export file.');
    
    console.timeEnd('pika-csv');
  })
  .on('error', (error) => {
    console.error(`Error reading the CSV file: ${error.message}`);
  });
