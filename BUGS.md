# Known Bugs

## PHP Currency Float Precision

**Observed:** `₱1,500.00` rounds to `₱1,499.96`

**Root cause:** Both `parsePHP()` (`src/utils/ledger.js`) and `parseCurrency()` (`src/utils/project.js`) use `Number()` — IEEE-754 double-precision floating point — which introduces rounding errors when summing or multiplying currency values.

**Affects:** Budget calculations, spend map, ledger totals, Kanban progress bars.

**Fix (pending):**
- Store amounts as integer centavos (multiply by 100 on parse, divide by 100 on display)
- Or use a decimal arithmetic library (e.g. `decimal.js`)

**Reproduction:**
- Enter `₱1,500.00` in a ledger record
- View on Overview tab or Kanban card progress bar — may show `₱1,499.96`
- Cumulative error grows as more values are summed
