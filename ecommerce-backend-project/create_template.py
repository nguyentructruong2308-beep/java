import pandas as pd

# Create a DataFrame with the suitable columns
data = {
    'Mã (SKU hoặc ID)': ['AKKO-5075-WHT', 'LOGI-MX3S-GRY', '101', '102'],
    'Số lượng nhập': [10, 5, 20, 15]
}

df = pd.DataFrame(data)

# Create a Pandas Excel writer using XlsxWriter as the engine.
writer = pd.ExcelWriter('import_stock_template.xlsx', engine='xlsxwriter')

# Convert the dataframe to an XlsxWriter Excel object.
df.to_excel(writer, sheet_name='Sheet1', index=False)

# Get the xlsxwriter workbook and worksheet objects.
workbook  = writer.book
worksheet = writer.sheets['Sheet1']

# Add some cell formats.
header_format = workbook.add_format({
    'bold': True,
    'text_wrap': True,
    'valign': 'top',
    'fg_color': '#D7E4BC',
    'border': 1
})

# Write the column headers with the defined format.
for col_num, value in enumerate(df.columns.values):
    worksheet.write(0, col_num, value, header_format)

# Set the column width.
worksheet.set_column('A:A', 25)
worksheet.set_column('B:B', 15)

# Close the Pandas Excel writer and output the Excel file.
writer.close()

print("Excel file 'import_stock_template.xlsx' created successfully.")
