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
  const money = n => '$' + Number(n || 0).toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    // Right-align cells whose column header is marked numeric.
    const headers = el(target).closest('table').querySelectorAll('thead th');
    for (const tr of el(target).rows) {
      if (tr.cells.length === 1) continue; // "No records found." row
      [...tr.cells].forEach((td, i) => {
        if (headers[i]?.classList.contains('num')) td.classList.add('num');
      });
    }
  }

  // Render summary figures as stat tiles: [{ label, value, accent? }]
  function renderStats(target, stats) {
    const grid = el(target);
    grid.replaceChildren();
    for (const stat of stats) {
      const tile = document.createElement('div');
      tile.className = 'stat' + (stat.accent ? ' accent' : '');
      const label = document.createElement('span');
      label.className = 'stat-label';
      label.textContent = stat.label;
      const val = document.createElement('span');
      val.className = 'stat-value';
      val.textContent = String(stat.value);
      tile.append(label, val);
      grid.append(tile);
    }
  }

  for (const button of document.querySelectorAll('[data-report-tab]')) {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-report-panel]').forEach(panel => {
        panel.hidden = panel.id !== button.dataset.reportTab;
      });
      document.querySelectorAll('[data-report-tab]').forEach(other => {
        other.setAttribute('aria-selected', String(other === button));
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
      sourceTarget: 'revenueSourceRows',
      sourceCount: 'revenueSourceCount',
      sourceColumns: ['RecordID','Source','RecordedAt','Description','Quantity','UnitPrice','Amount'],
      sourceCurrency: ['UnitPrice','Amount'],
      filters: () => ({
        source: value('revenueSource'),
        ...dateRange('revenueStart','revenueEnd')
      }),
      summarize: rows => [
        { label: 'Total revenue', value: money(sum(rows,'TotalRevenue')), accent: true },
        { label: 'Ticket sales', value: money(sum(rows,'TicketRevenue')) },
        { label: 'Gift shop', value: money(sum(rows,'GiftShopRevenue')) },
        { label: 'Months covered', value: rows.length }
      ]
    },
    {
      form: 'productsForm',
      endpoint: '/api/reports/giftshop-top-products',
      type: 'products',
      result: 'productsResults',
      message: 'productsMessage',
      summary: 'productsSummary',
      sourceTarget: 'productsSourceRows',
      sourceCount: 'productsSourceCount',
      sourceColumns: ['SaleID','SaleDateTime','ProductID','ProductName',
        'UnitsSold','UnitPriceAtSale','LineRevenue'],
      sourceCurrency: ['UnitPriceAtSale','LineRevenue'],
      filters: () => dateRange('productsStart','productsEnd'),
      summarize: rows => [
        { label: 'Sales revenue', value: money(sum(rows,'SalesRevenue')), accent: true },
        { label: 'Units sold', value: sum(rows,'UnitsSold') },
        { label: 'Products sold', value: rows.length },
        { label: 'Top seller', value: rows[0]?.ProductName || '—' }
      ]
    },
    {
      form: 'visitorsForm',
      endpoint: '/api/reports/visitors-by-exhibition',
      type: 'visitors',
      result: 'visitorsResults',
      message: 'visitorsMessage',
      summary: 'visitorsSummary',
      sourceTarget: 'visitorsSourceRows',
      sourceCount: 'visitorsSourceCount',
      sourceColumns: ['TicketID','VisitDate','VisitorID','VisitorName',
        'Exhibition','TicketType','TicketPrice'],
      sourceCurrency: ['TicketPrice'],
      filters: () => dateRange('visitorsStart','visitorsEnd'),
      summarize: rows => [
        { label: 'Ticketed visits', value: sum(rows,'TicketsSold'), accent: true },
        { label: 'Adults', value: sum(rows,'AdultTickets') },
        { label: 'Children', value: sum(rows,'ChildTickets') },
        { label: 'Students', value: sum(rows,'StudentTickets') },
        { label: 'Seniors', value: sum(rows,'SeniorTickets') }
      ]
    }
  ];

  async function generateReport(config) {
    // Hide any previous result immediately; prevents misleading stale data.
    el(config.result).hidden = true;
    const message = el(config.message);
    message.textContent = '';
    message.className = '';

    const button = el(config.form).querySelector('button[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Generating…';

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

      fillTable(config.sourceTarget, config.sourceColumns,
        sourceRows, config.sourceCurrency);
      renderStats(config.summary, config.summarize(rows));
      el(config.sourceCount).textContent =
        sourceRows.length + (sourceRows.length === 1 ? ' record' : ' records');
      el(config.result).hidden = false;
    } catch (err) {
      Museum.notify(config.message, err.message, true);
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  }

  for (const config of reports) {
    el(config.form).addEventListener('submit', event => {
      event.preventDefault();
      generateReport(config);
    });
  }
})();
