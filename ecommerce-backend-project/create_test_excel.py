from openpyxl import Workbook
import random

wb = Workbook()
ws = wb.active
ws.title = "Import Stock"

# Header
ws.append(["Product ID", "Variant ID", "Quantity"])

# Data
# Product ID | Variant ID | Quantity
data = [
    [1, None, 50],
    [2, None, 20],
    [1, 1, 10],
    [3, None, 100],
    [4, None, 5],
    [5, 2, 15]
]

for row in data:
    # Convert None to empty string if needed, but openpyxl handles None as empty cell usually
    # ExcelService expects numeric or string.
    ws.append(row)

output_file = "inventory_test.xlsx"
wb.save(output_file)
print(f"Successfully created {output_file}")
