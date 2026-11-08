(async () => {
  if (!await Museum.init()) return;

    // Hide dashboard card links based on employee roles
  const role = Museum.user.role;

  if (!['Admin', 'Curator'].includes(role)) {
    document.querySelector('.cards a[href="/manage.html?entity=artworks"]')?.remove();
    document.querySelector('.cards a[href="/manage.html?entity=exhibitions"]')?.remove();
  }

  if (!['Admin', 'Sales Staff'].includes(role)) {
    document.querySelector('.cards a[href="/manage.html?entity=visitors"]')?.remove();
    document.querySelector('.cards a[href="/giftshop.html"]')?.remove();
  }

  const stats = [['artworks','countArtworks'],['exhibitions','countExhibitions'],
    ['visitors','countVisitors'],['products','countProducts']];
  for (const [name,id] of stats) {
    try {
      const rows = await Museum.api('/api/entities/' + name);
      document.getElementById(id).textContent = rows.length;
    } catch {
      document.getElementById(id).textContent = '—';
    }
  }
  const section = document.getElementById('dashboardQueries');
  if (!['Admin', 'Sales Staff'].includes(Museum.user.role)) {
    document.getElementById('dashboardSellTicketLink')?.remove();
    document.getElementById('dashboardGiftShopLink')?.remove();
  }
  if (Museum.user.role !== 'Admin') {
    document.getElementById('dashboardReportsLink')?.remove();
    document.getElementById('dashboardQueriesLink')?.remove();
    section.remove();
    return;
  }

  // Show out-of-stock products to Admin only.
  try {
    const products = await Museum.api('/api/sales/out-of-stock');

    if (products.length > 0) {
      const alert = document.getElementById('outOfStockAlert');
      const list = document.getElementById('outOfStockList');

      list.replaceChildren();

      for (const product of products) {
        const item = document.createElement('li');
        item.textContent =
          `${product.ProductName} — 0 units remaining`;
        list.append(item);
      }

      alert.hidden = false;
    }
  } catch (error) {
    Museum.notify('status', error.message, true);
  }



  const panels = [...document.querySelectorAll('[data-query-panel]')];
  document.querySelectorAll('[data-query-tab]').forEach(button => {
    button.addEventListener('click', () => {
      panels.forEach(p => { p.hidden = p.id !== button.dataset.queryTab; });
      document.querySelectorAll('[data-query-tab]').forEach(other => {
        other.classList.toggle('active',other === button);
        other.setAttribute('aria-selected', String(other === button));
      });
    });
  });
  document.querySelector('[data-query-tab]')?.click();
  async function options(url, selectId, idKey, labelKey) {
    const rows = await Museum.api(url);
    const target = document.getElementById(selectId);
    rows.forEach(row => {
      const opt = document.createElement('option');
      opt.value = row[idKey]; opt.textContent = row[labelKey];
      target.append(opt);
    });
  }
  try {
    await Promise.all([
      options('/api/entities/artists','artistId','ArtistID','ArtistName'),
      options('/api/entities/exhibitions','employeeExhibitionId','ExhibitionID','ExhibitionTitle'),
      options('/api/entities/exhibitions','artworkExhibitionId','ExhibitionID','ExhibitionTitle')
    ]);
  } catch(e) { Museum.notify('queryMessage',e.message,true); }
  const specs = [
    ['artistForm','artistId','artworks-by-artist','artistId','artistRows',
      ['ArtistName','ArtworkID','Title','Medium']],
    ['employeeExhibitionForm','employeeExhibitionId','employees-by-exhibition','exhibitionId','employeeExhibitionRows',
      ['ExhibitionTitle','EmployeeID','EmployeeName','JobTitle','AssignmentRole']],
    ['artworkExhibitionForm','artworkExhibitionId','artworks-by-exhibition','exhibitionId','artworkExhibitionRows',
      ['ExhibitionTitle','ArtworkID','Title','Medium']]
  ];
  for (const [formId,inputId,route,param,tableId,columns] of specs) {
    document.getElementById(formId).addEventListener('submit', async event => {
      event.preventDefault();
      const value = document.getElementById(inputId).value;
      try {
        const path = '/api/queries/' + route + '?' + new URLSearchParams({[param]:value});
        const rows = await Museum.api(path);
        Museum.table(tableId,columns,rows);
        Museum.notify('queryMessage',rows.length + ' matching record(s)');
      } catch(e) { Museum.notify('queryMessage',e.message,true); }
    });
  }
})();
