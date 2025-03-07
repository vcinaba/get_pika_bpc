# get_pika_bpc

This project processes large CSV files (~1GB each) from the Brazilian government's transparency portal (Benefício de Prestação Continuada - BPC) dataset. It reads a specified CSV file based on a `yyyymm` parameter (e.g., `202412`), calculates the sum and count of payment amounts (`VALOR PARCELA`) by Brazilian state (UF), and appends the results to `BPC.csv`. The script also logs progress and partial sums every 1,000,000 rows.

## Prerequisites

- **Node.js**: Version 22.13.1 or higher (tested with v22.13.1).
- **npm**: Comes with Node.js for package management.

## Setup

1. **Clone the Repository**:
  ```bash
  git clone https://github.com/vcinaba/get_pika_bpc.git
  cd get_pika_bpc
  ```
2. **Install Dependencies**: Install the required csv-parser package:
  ```bash
  npm install
  ```

## Downloading the Data
The BPC dataset files are not included in this repository due to their size (~1GB each). You need to download them manually:

1. **Visit the Download Page:**:
- URL: https://portaldatransparencia.gov.br/download-de-dados/bpc
- This link is also stored in link_site.txt in the repository.
2. **Download the File**:
- Select the desired year and month (e.g., 202412 for December 2024).
- Download the corresponding ZIP file (e.g., 202412_BPC.zip).
3. **Unzip the File**:
- Extract the ZIP file to the project directory (get_pika_bpc/).
- Ensure the extracted CSV file is named like 202412_BPC.csv and placed in the root folder.

## CSV Data Format

The script assumes the input CSV (e.g., 202412_BPC.csv) is semicolon-separated (;) and contains:

- Column 2: Brazilian state code (UF, e.g., SP, RJ, MG).
- Column 3: Payment amount (VALOR PARCELA, e.g., 1234,56), using a comma as the decimal separator.

## Running the Script
  1. **Execute the Script:**:
  ```bash
  node get_pika_bpc.js 202501
  ```
  2. **Output:**
  - The script logs progress every 1,000,000 rows with partial sums to the console:
  ```bash
    Processed 1000000 rows
    Partial Sums by State:
    SP: Sum = 12345678.90, Count = 100000
    RJ: Sum = 9876543.21, Count = 80000
    ...
    ---
    Processed 2000000 rows
    Partial Sums by State:
    SP: Sum = 24691357.80, Count = 200000
    RJ: Sum = 19753086.42, Count = 160000
    ...
    ---
    Finished processing 2501234 lines from ./202412_BPC.csv
    Final Sums by State:
    SP: Sum = 30864197.25, Count = 250000
    RJ: Sum = 24691357.80, Count = 200000
    ...
    Total: Sum = 98765432.10, Count = 750000
    Data successfully appended to the export file.
    pika-csv: 43.940s
  ```
  - Results are appended to BPC.csv in the format:
  ```bash
    Period,UF,Sum,Count
    202201,AC,30848567.67,25451
    ...
    202412,SP,30864197.25,250000
    202412,RJ,24691357.80,200000
    ...
    202412,Total,98765432.10,750000
  ```

## Notes
  - **File Size**: Each input CSV file is approximately 1GB, so downloading and unzipping is done manually to avoid repository bloat.
  - **Delimiter**: The script uses semicolons (;) as separators for input files, matching the BPC dataset format.
  - **Decimal Format**: Payment amounts use commas (e.g., 1234,56), which are converted to dots (e.g., 1234.56) for processing.
  - **Output File**: Results are appended to BPC.csv. If it doesn’t exist, the script creates it with a header.
  - **Error Handling**: If the input file is missing or malformed, the script will log an error and exit.
  - **States:** Covers all 27 Brazilian states (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO), with "Others" for invalid states and "Total" for all entries.
