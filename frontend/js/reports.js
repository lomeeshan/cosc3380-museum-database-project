(async () => {
  if (!await Museum.init()) return;

  // API CONTRACT for Zain's backend/routes/reports.js:
  // GET /api/reports/combined-revenue
  //   Params: source=tickets|giftshop|combined, startDate, endDate
  //   Array fields: SaleMonth, TicketRevenue, GiftShopRevenue, TotalRevenue
  // GET /api/reports/ticket-sales-by-exhibition
  //   Params: exhibitionId, ticketType, startDate, endDate (VisitDate)
  //   Array fields: ExhibitionTitle, TicketsSold, UniqueVisitors, Revenue
  // GET /api/reports/giftshop-inventory
  //   Params: category, threshold, stock=all|low
  //   Array fields: ProductName, Category, QuantityInStock,
  //     StockStatus, ProductStatus, InventoryValue, UnitsSold, SalesRevenue
  // Each endpoint must return an array, or [] when no matches exist.
  // Zain must mount the router at /api/reports in backend/server.js.

  const get = id => document.getElementById(id);
  const value = id => get(id).value;

  function validateDates(startId, endId) {
    const start = value(startId);
    const end = value(endId);
    if (start && end && start > end) {
      throw new Error('Start date cannot be after end date.');
    }
  }

  function pathWithFilters(path, filters) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val !== '' && val !== null && val !== undefined) {
        params.set(key, val);
      }
    }
    return path + (params.toString() ? '?' + params.toString() : '');
  }

  function formatMoney(rows, fields) {
    return rows.map(row => {
      const result = { ...row };
      for (const field of fields) {
        if (result[field] != null) {
          const amount = Number(result[field]);
          if (Number.isFinite(amount)) result[field] = amount.toFixed(2);
        }
      }
      return result;
    });
  }

  async function displayReport(url, tableId, fields, moneyFields, messageId) {
    const rows = await Museum.api(url);
    if (!Array.isArray(rows)) {
      throw new Error('The report API must return an array.');
    }
    Museum.table(tableId, fields, formatMoney(rows, moneyFields));
    Museum.notify(messageId, rows.length + ' matching row(s).');
  }

  async function revenueReport() {
    try {
      validateDates('revenueStart', 'revenueEnd');
      const url = pathWithFilters('/api/reports/combined-revenue', {
        source: value('revenueSource'),
        startDate: value('revenueStart'),
        endDate: value('revenueEnd')
      });
      await displayReport(url, 'revenueRows',
        ['SaleMonth', 'TicketRevenue', 'GiftShopRevenue', 'TotalRevenue'],
        ['TicketRevenue', 'GiftShopRevenue', 'TotalRevenue'],
        'revenueMessage');
    } catch (error) {
      Museum.notify('revenueMessage', error.message, true);
    }
  }

  async function ticketSalesReport() {
    try {
      validateDates('salesStart', 'salesEnd');
      const url = pathWithFilters('/api/reports/ticket-sales-by-exhibition', {
        exhibitionId: value('salesExhibition'),
        ticketType: value('salesTicketType'),
        startDate: value('salesStart'),
        endDate: value('salesEnd')
      });
      await displayReport(url, 'ticketSalesRows',
        ['ExhibitionTitle', 'TicketsSold', 'UniqueVisitors', 'Revenue'],
        ['Revenue'], 'ticketSalesMessage');
    } catch (error) {
      Museum.notify('ticketSalesMessage', error.message, true);
    }
  }

  async function inventoryReport() {
    try {
      const threshold = Number(value('inventoryThreshold'));
      if (!Number.isSafeInteger(threshold) || threshold < 1) {
        throw new Error('Stock threshold must be a positive whole number.');
      }
      const url = pathWithFilters('/api/reports/giftshop-inventory', {
        category: value('inventoryCategory'),
        threshold,
        stock: value('inventoryStock')
      });
      await displayReport(url, 'inventoryRows',
        ['ProductName', 'Category', 'QuantityInStock', 'StockStatus',
         'ProductStatus', 'InventoryValue', 'UnitsSold', 'SalesRevenue'],
        ['InventoryValue', 'SalesRevenue'], 'inventoryMessage');
    } catch (error) {
      Museum.notify('inventoryMessage', error.message, true);
    }
  }

  function addOption(select, id, title) {
    const item = document.createElement('option');
    item.value = id;
    item.textContent = title;
    select.appendChild(item);
  }

  async function loadFilters() {
    try {
      const exhibitions = await Museum.api('/api/entities/exhibitions');
      for (const ex of exhibitions) {
        addOption(get('salesExhibition'), ex.ExhibitionID, ex.ExhibitionTitle);
      }
    } catch (error) {
      Museum.notify('ticketSalesMessage',
        'Could not load exhibitions: ' + error.message, true);
    }

    try {
      const products = await Museum.api('/api/entities/products');
      const categories = [...new Set(
        products.map(p => p.Category).filter(Boolean)
      )].sort();
      for (const category of categories) {
        addOption(get('inventoryCategory'), category, category);
      }
    } catch (error) {
      Museum.notify('inventoryMessage',
        'Could not load categories: ' + error.message, true);
    }
  }

  get('revenueForm').addEventListener('submit', event => {
    event.preventDefault();
    revenueReport();
  });
  get('ticketSalesForm').addEventListener('submit', event => {
    event.preventDefault();
    ticketSalesReport();
  });
  get('inventoryForm').addEventListener('submit', event => {
    event.preventDefault();
    inventoryReport();
  });

  await loadFilters();
  await Promise.all([revenueReport(), ticketSalesReport(), inventoryReport()]);
})();
