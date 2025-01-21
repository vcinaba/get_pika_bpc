const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Path to your CSV file
const csvFilePath = path.join(__dirname, './202412_BPC.csv');
const exportFilePath = path.join(__dirname, './BPC.csv');

// Extract period from the CSV file name
const period = path.basename(csvFilePath, path.extname(csvFilePath)).slice(0, 6);1
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

fs.createReadStream(csvFilePath)
  .pipe(csv({
    separator: ';',
    mapHeaders: ({ header, index }) => header.trim()
  }))
  .on('data', (row) => {
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
  })
  .on('end', () => {
    // Prepare data for export
    const exportData = [];
    for (const [uf, data] of Object.entries(ufData)) {
      exportData.push(`${period},${uf},${data.sum.toFixed(2)},${data.count}`);
    }

    // Append data to the export CSV file
    fs.appendFile(exportFilePath, exportData.join('\n') + '\n', (err) => {
      if (err) {
        console.error(`Error writing to the export file: ${err.message}`);
      } else {
        console.log('Data successfully appended to the export file.');
      }
    });
  })
  .on('error', (error) => {
    console.error(`Error reading the CSV file: ${error.message}`);
  });
