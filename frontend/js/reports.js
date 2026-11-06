(async () => {
  if (!await Museum.init()) return;
  if (Museum.user.role !== 'Admin') {
    document.getElementById('content').textContent = 'Reports are for administrators only.';
    return;
  }
  const el = id => document.getElementById(id);
  const value = id => el(id).value;
  const money = n => '$' + Number(n || 0).toFixed(2);
  const sum = (rows, key) => rows.reduce((t, row) => t + Number(row[key] || 0), 0);
  function urlWithFilters(url, filters) {
    const p = new URLSearchParams();
    for (const [k,v] of Object.entries(filters)) if (v !== '' && v != null) p.set(k,v);
    return url + (p.toString() ? '?' + p : '');
  }
  function dateRange(startId, endId) {
    const startDate=value(startId), endDate=value(endId);
    if (startDate && endDate && startDate>endDate) {
      throw new Error('Start date cannot be after end date.');
    }
    return {startDate,endDate};
  }
  function fillTable(target, cols, rows, currencyColumns=[]) {
    Museum.table(target,cols,rows.map(row => {
      const copy={...row};
      for (const col of currencyColumns) if(copy[col]!=null) copy[col]=Number(copy[col]).toFixed(2);
      return copy;
    }));
  }

  async function getReport(url,target,cols,currencyColumns,messageId) {
    const rows=await Museum.api(url);
    if(!Array.isArray(rows)) throw new Error('Unexpected report data.');
    fillTable(target,cols,rows,currencyColumns);
    Museum.notify(messageId,rows.length+' result row(s).');
    return rows;
  }
  for (const button of document.querySelectorAll('[data-report-tab]')) {
    button.onclick=() => {
      document.querySelectorAll('[data-report-panel]').forEach(panel => {
        panel.hidden=panel.id !== button.dataset.reportTab;
      });
      document.querySelectorAll('[data-report-tab]').forEach(b => {
        const on=b === button;
        b.classList.toggle('secondary',!on);
        b.setAttribute('aria-selected',String(on));
      });
    };
  }
  document.querySelector('[data-report-tab]')?.click();

  async function revenue() {
    try {
      const url=urlWithFilters('/api/reports/combined-revenue',{
        source:value('revenueSource'),...dateRange('revenueStart','revenueEnd')
      });
      const rows=await getReport(url,'revenueRows',
        ['SaleMonth','TicketRevenue','GiftShopRevenue','TotalRevenue'],
        ['TicketRevenue','GiftShopRevenue','TotalRevenue'],'revenueMessage');
      el('revenueSummary').textContent=rows.length+' month(s) | Ticket sales: '+
        money(sum(rows,'TicketRevenue'))+' | Gift shop: '+
        money(sum(rows,'GiftShopRevenue'))+' | Total: '+money(sum(rows,'TotalRevenue'));
    } catch(err) { Museum.notify('revenueMessage',err.message,true); }
  }

  async function tickets() {
    try {
      const url=urlWithFilters('/api/reports/ticket-sales-by-exhibition',{
        exhibitionId:value('salesExhibition'),
        ticketType:value('salesTicketType'),
        ...dateRange('salesStart','salesEnd')
      });
      const rows=await getReport(url,'ticketSalesRows',
        ['ExhibitionTitle','TicketsSold','UniqueVisitors','Revenue'],
        ['Revenue'],'ticketSalesMessage');
      el('ticketSummary').textContent='Tickets sold: '+sum(rows,'TicketsSold')+
        ' | Revenue: '+money(sum(rows,'Revenue'))+
        ' | Exhibition rows: '+rows.length;
    } catch(err) { Museum.notify('ticketSalesMessage',err.message,true); }
  }
  async function inventory() {
    try {
      const threshold=Number(value('inventoryThreshold'));
      if(!Number.isSafeInteger(threshold)||threshold<1) {
        throw new Error('Stock threshold must be a positive whole number.');
      }
      const url=urlWithFilters('/api/reports/giftshop-inventory',{
        category:value('inventoryCategory'),
        threshold,
        stock:value('inventoryStock'),
        ...dateRange('inventoryStart','inventoryEnd')
      });
      const rows=await getReport(url,'inventoryRows',
        ['ProductName','Category','QuantityInStock','StockStatus',
        'ProductStatus','InventoryValue','UnitsSold','SalesRevenue'],
        ['InventoryValue','SalesRevenue'],'inventoryMessage');
      const low=rows.filter(r=>r.StockStatus==='Low Stock'||r.StockStatus==='Out of Stock').length;
      el('inventorySummary').textContent='Matching products: '+rows.length+
        ' | Low/out of stock: '+low+
        ' | Current inventory value: '+money(sum(rows,'InventoryValue'))+
        ' | Period units sold: '+sum(rows,'UnitsSold')+
        ' | Period revenue: '+money(sum(rows,'SalesRevenue'));
    } catch(err) { Museum.notify('inventoryMessage',err.message,true); }
  }

  function selectOption(select, id, text) {
    const option=document.createElement('option');
    option.value=id; option.textContent=text;
    select.append(option);
  }
  async function filters() {
    try {
      const exhibitions=await Museum.api('/api/entities/exhibitions');
      exhibitions.forEach(ex=>selectOption(el('salesExhibition'),
        ex.ExhibitionID,ex.ExhibitionTitle));
    } catch(err) { Museum.notify('ticketSalesMessage',err.message,true); }
    try {
      const products=await Museum.api('/api/entities/products');
      const categories=[...new Set(products.map(p=>p.Category).filter(Boolean))].sort();
      categories.forEach(c=>selectOption(el('inventoryCategory'),c,c));
    } catch(err) { Museum.notify('inventoryMessage',err.message,true); }
  }
  const forms=[
    ['revenueForm',revenue],
    ['ticketSalesForm',tickets],
    ['inventoryForm',inventory]
  ];
  forms.forEach(([id,fn]) => el(id).addEventListener('submit',e=>{
    e.preventDefault(); fn();
  }));
  await filters();
  await Promise.all([revenue(),tickets(),inventory()]);
})();