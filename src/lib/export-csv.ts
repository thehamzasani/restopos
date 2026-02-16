interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export function exportToCSV({ headers, rows, filename }: ExportData) {
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Handle cells with commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSalesReport(orders: any[]) {
  const headers = [
    'Order Number',
    'Date',
    'Time',
    'Type',
    'Table/Customer',
    'Items',
    'Subtotal',
    'Tax',
    'Total',
    'Payment Method',
    'Status'
  ];

  const rows = orders.map(order => [
    order.orderNumber,
    new Date(order.createdAt).toLocaleDateString(),
    new Date(order.createdAt).toLocaleTimeString(),
    order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway',
    order.orderType === 'DINE_IN' 
      ? `Table ${order.tableId}` 
      : order.customerName || 'Guest',
    order.itemCount,
    order.subtotal,
    order.tax,
    order.total,
    order.paymentMethod,
    order.status
  ]);

  exportToCSV({
    headers,
    rows,
    filename: 'sales_report'
  });
}

export function exportInventoryReport(items: any[]) {
  const headers = [
    'Item Name',
    'Category',
    'Quantity',
    'Unit',
    'Low Stock Threshold',
    'Cost Per Unit',
    'Total Value',
    'Status',
    'Last Restocked'
  ];

  const rows = items.map(item => [
    item.name,
    item.category || 'N/A',
    item.quantity,
    item.unit,
    item.lowStockThreshold,
    item.costPerUnit || '0',
    (parseFloat(item.quantity) * parseFloat(item.costPerUnit || '0')).toFixed(2),
    parseFloat(item.quantity) <= parseFloat(item.lowStockThreshold) ? 'Low Stock' : 'In Stock',
    item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'Never'
  ]);

  exportToCSV({
    headers,
    rows,
    filename: 'inventory_report'
  });
}

export function exportTopItemsReport(items: any[]) {
  const headers = [
    'Rank',
    'Item Name',
    'Category',
    'Quantity Sold',
    'Revenue',
    'Avg Price'
  ];

  const rows = items.map((item, index) => [
    index + 1,
    item.name,
    item.category || 'N/A',
    item.quantity,
    item.revenue,
    (parseFloat(item.revenue) / item.quantity).toFixed(2)
  ]);

  exportToCSV({
    headers,
    rows,
    filename: 'top_items_report'
  });
}