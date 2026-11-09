(async () => {
  if (!await Museum.init()) return;

  // The backend also independently enforces requireRole('Admin').
  if (Museum.user.role !== 'Admin') {
    document.getElementById('content').textContent =
      'Reports are for administrators only.';
    return;
  }

  const el = id => document.getElementById(id);
  const value = id => el(id).value;
  const money = n => '$' + Number(n || 0).toFixed(2);
  const sum = (rows, key) =>
    rows.reduce((total, row) => total + Number(row[key] || 0), 0);

  function urlWithFilters(url, filters) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val !== '' && val != null) params.set(key, val);
    }
    return url + (params.toString() ? '?' + params.toString() : '');
  }

  function dateRange(startId, endId) {
    const startDate = value(startId);
    const endDate = value(endId);
    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be after end date.');
    }
    return { startDate, endDate };
  }

  function fillTable(target, columns, rows, currencyColumns = []) {
    const formatted = rows.map(row => {
      const record = { ...row };
      for (const column of currencyColumns) {
        if (record[column] != null) {
          record[column] = Number(record[column]).toFixed(2);
        }
      }
      return record;
    });
    // Museum.table uses textContent: source text is safely escaped.
    Museum.table(target, columns, formatted);
  }

  for (const button of document.querySelectorAll('[data-report-tab]')) {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-report-panel]').forEach(panel => {
        panel.hidden = panel.id !== button.dataset.reportTab;
      });
      document.querySelectorAll('[data-report-tab]').forEach(other => {
        const selected = other === button;
        other.classList.toggle('secondary', !selected);
        other.setAttribute('aria-selected', String(selected));
      });
    });
  }
  // This activates the FIRST TAB ONLY; it does not generate any report.
  document.querySelector('[data-report-tab]')?.click();

  const reports = [
    {
      form: 'revenueForm',
      endpoint: '/api/reports/combined-revenue',
      type: 'revenue',
      result: 'revenueResults',
      message: 'revenueMessage',
      summary: 'revenueSummary',
      target: 'revenueRows',
      columns: ['SaleMonth','TicketRevenue','GiftShopRevenue','TotalRevenue'],
      currency: ['TicketRevenue','GiftShopRevenue','TotalRevenue'],
      sourceTarget: 'revenueSourceRows',
      sourceColumns: ['RecordID','Source','RecordedAt','Description','Quantity','UnitPrice','Amount'],
      sourceCurrency: ['UnitPrice','Amount'],
      filters: () => ({
        source: value('revenueSource'),
        ...dateRange('revenueStart','revenueEnd')
      }),
      summarize: rows => rows.length + ' month(s) | Ticket sales: ' +
        money(sum(rows,'TicketRevenue')) + ' | Gift shop: ' +
        money(sum(rows,'GiftShopRevenue')) + ' | Total: ' +
        money(sum(rows,'TotalRevenue'))
    },
    {
      form: 'ticketSalesForm',
      endpoint: '/api/reports/ticket-sales-by-exhibition',
      type: 'tickets',
      result: 'ticketResults',
      message: 'ticketSalesMessage',
      summary: 'ticketSummary',
      target: 'ticketSalesRows',
      columns: ['ExhibitionTitle','TicketsSold','UniqueVisitors','AdultTickets',
        'ChildTickets','StudentTickets','SeniorTickets','Revenue'],
      currency: ['Revenue'],
      sourceTarget: 'ticketSourceRows',
      sourceColumns: ['TicketID','VisitDate','VisitorID','VisitorName',
        'Exhibition','TicketType','TicketPrice'],
      sourceCurrency: ['TicketPrice'],
      filters: () => ({
        exhibitionId: value('salesExhibition'),
        ticketType: value('salesTicketType'),
        ...dateRange('salesStart','salesEnd')
      }),
      summarize: rows => 'Tickets sold: ' + sum(rows,'TicketsSold') +
        ' | Revenue: ' + money(sum(rows,'Revenue')) +
        ' | Exhibition rows: ' + rows.length
    },
    {
      form: 'inventoryForm',
      endpoint: '/api/reports/giftshop-inventory',
      type: 'inventory',
      result: 'inventoryResults',
      message: 'inventoryMessage',
      summary: 'inventorySummary',
      target: 'inventoryRows',
      columns: ['ProductName','Category','QuantityInStock','StockStatus',
        'ProductStatus','InventoryValue','UnitsSold','SalesRevenue'],
      currency: ['InventoryValue','SalesRevenue'],
      sourceTarget: 'inventorySourceRows',
      sourceColumns: ['ProductID','ProductName','Category','QuantityInStock',
        'ProductStatus','SaleID','SaleDateTime','UnitsSold',
        'UnitPriceAtSale','LineRevenue'],
      sourceCurrency: ['UnitPriceAtSale','LineRevenue'],
      filters: () => {
        const threshold = Number(value('inventoryThreshold'));
        if (!Number.isSafeInteger(threshold) || threshold < 1) {
          throw new Error('Stock threshold must be a positive whole number.');
        }
        return {
          category: value('inventoryCategory'),
          threshold,
          stock: value('inventoryStock'),
          ...dateRange('inventoryStart','inventoryEnd')
        };
      },
      summarize: rows => {
        const lowCount = rows.filter(row =>
          row.StockStatus === 'Low Stock' ||
          row.StockStatus === 'Out of Stock').length;
        return 'Products: ' + rows.length + ' | Low/out of stock: ' +
          lowCount + ' | Inventory value: ' +
          money(sum(rows,'InventoryValue')) + ' | Units sold: ' +
          sum(rows,'UnitsSold') + ' | Period revenue: ' +
          money(sum(rows,'SalesRevenue'));
      }
    },
    {
      form: 'productsForm',
      endpoint: '/api/reports/giftshop-top-products',
      type: 'products',
      result: 'productsResults',
      message: 'productsMessage',
      summary: 'productsSummary',
      target: 'productsRows',
      columns: ['ProductID','ProductName','Category','UnitsSold','SaleCount',
        'SalesRevenue'],
      currency: ['SalesRevenue'],
      sourceTarget: 'productsSourceRows',
      sourceColumns: ['SaleID','SaleDateTime','ProductID','ProductName',
        'UnitsSold','UnitPriceAtSale','LineRevenue'],
      sourceCurrency: ['UnitPriceAtSale','LineRevenue'],
      filters: () => dateRange('productsStart','productsEnd'),
      summarize: rows => 'Products sold: ' + rows.length +
        ' | Units sold: ' + sum(rows,'UnitsSold') +
        ' | Sales revenue: ' + money(sum(rows,'SalesRevenue'))
    },
    {
      form: 'visitorsForm',
      endpoint: '/api/reports/visitors-by-exhibition',
      type: 'visitors',
      result: 'visitorsResults',
      message: 'visitorsMessage',
      summary: 'visitorsSummary',
      target: 'visitorsRows',
      columns: ['ExhibitionID','ExhibitionTitle','AdultTickets','ChildTickets',
        'StudentTickets','SeniorTickets','TicketsSold','UniqueVisitors'],
      currency: [],
      sourceTarget: 'visitorsSourceRows',
      sourceColumns: ['TicketID','VisitDate','VisitorID','VisitorName',
        'Exhibition','TicketType','TicketPrice'],
      sourceCurrency: ['TicketPrice'],
      filters: () => dateRange('visitorsStart','visitorsEnd'),
      summarize: rows => 'Ticketed visits: ' + sum(rows,'TicketsSold') +
        ' | Adults: ' + sum(rows,'AdultTickets') +
        ' | Children: ' + sum(rows,'ChildTickets') +
        ' | Students: ' + sum(rows,'StudentTickets') +
        ' | Seniors: ' + sum(rows,'SeniorTickets')
    }
  ];

  async function generateReport(config) {
    // Hide any previous result immediately; prevents misleading stale data.
    el(config.result).hidden = true;
    Museum.notify(config.message, '');

    try {
      const filters = config.filters();
      const reportUrl = urlWithFilters(config.endpoint, filters);
      const sourceUrl = urlWithFilters('/api/reports/source-records',
        { report: config.type, ...filters });

      // Load both the summary AND the actual records behind its totals.
      const [rows, sourceRows] = await Promise.all([
        Museum.api(reportUrl),
        Museum.api(sourceUrl)
      ]);

      if (!Array.isArray(rows) || !Array.isArray(sourceRows)) {
        throw new Error('Unexpected report response.');
      }

      fillTable(config.target, config.columns, rows, config.currency);
      fillTable(config.sourceTarget, config.sourceColumns,
        sourceRows, config.sourceCurrency);
      el(config.summary).textContent = config.summarize(rows);
      el(config.result).hidden = false;
      Museum.notify(config.message,
        'Report generated. ' + sourceRows.length +
        ' underlying source row(s) available below.');
    } catch (err) {
      Museum.notify(config.message, err.message, true);
    }
  }

  for (const config of reports) {
    el(config.form).addEventListener('submit', event => {
      event.preventDefault();
      generateReport(config);
    });
  }

  function selectOption(select, id, text) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = text;
    select.append(option);
  }

  async function loadFilters() {
    try {
      const exhibitions = await Museum.api('/api/entities/exhibitions');
      exhibitions.forEach(ex => selectOption(el('salesExhibition'),
        ex.ExhibitionID, ex.ExhibitionTitle));
    } catch (err) {
      Museum.notify('ticketSalesMessage', err.message, true);
    }

    try {
      const products = await Museum.api('/api/entities/products');
      const categories = [...new Set(products.map(p => p.Category)
        .filter(Boolean))].sort();
      categories.forEach(category =>
        selectOption(el('inventoryCategory'), category, category));
    } catch (err) {
      Museum.notify('inventoryMessage', err.message, true);
    }
  }

  // Loading dropdown filters is okay. Do NOT auto-run any report here.
  await loadFilters();
})();
