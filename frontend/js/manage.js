// One record-management page is reused for five museum tables.
// Table names and fields are fixed here, not entered by the user.
const pages = {
  artists: {
    title: 'Artists', id: 'ArtistID', roles: ['Admin', 'Curator'],
    fields: [['ArtistName', 'Artist name', 'text', true], ['BirthYear', 'Birth year', 'number'],
      ['DeathYear', 'Death year', 'number'], ['Nationality', 'Nationality', 'text'],
      ['Biography', 'Biography', 'textarea']]
  },
  artworks: {
    title: 'Artworks', id: 'ArtworkID', roles: ['Admin', 'Curator'],
    fields: [['CollectionID', 'Collection', 'collections', true],
      ['AccessionNumber', 'Accession number', 'text', true], ['Title', 'Title', 'text', true],
      ['CreationYear', 'Creation year', 'number'], ['Medium', 'Medium', 'text', true],
      ['Dimensions', 'Dimensions', 'text'], ['Description', 'Description', 'textarea']]
  },
  exhibitions: {
    title: 'Exhibitions', id: 'ExhibitionID', roles: ['Admin', 'Curator'],
    fields: [['GalleryID', 'Gallery', 'galleries', true],
      ['ExhibitionTitle', 'Exhibition title', 'text', true], ['StartDate', 'Start date', 'date', true],
      ['EndDate', 'End date', 'date', true], ['Status', 'Status', 'status', true],
      ['Description', 'Description', 'textarea']]
  },
  visitors: {
    title: 'Visitors', id: 'VisitorID', roles: ['Admin', 'Sales Staff'],
    fields: [['FirstName', 'First name', 'text', true], ['LastName', 'Last name', 'text', true],
      ['Email', 'Email', 'email'], ['Phone', 'Phone', 'tel']]
  },
  products: {
    title: 'Gift Shop Products', id: 'ProductID', roles: ['Admin', 'Sales Staff'],
    fields: [['ProductName', 'Product name', 'text', true], ['Category', 'Category', 'text', true],
      ['CurrentPrice', 'Price', 'number', true], ['QuantityInStock', 'Stock', 'number', true],
      ['IsActive', 'Available for sale', 'active', true]]
  }
};

const name = new URLSearchParams(location.search).get('entity');
const page = pages[name];
let records = [];
let editing = null;
let allowed = false;

function formatDate(value) {
  if (!value) return '—';

  const date = String(value).slice(0, 10);
  const [year, month, day] = date.split('-');

  return `${month}/${day}/${year}`;
}

async function fillSelect(select, collection) {
  const rows = await Museum.api(`/api/entities/${collection}`);
  const key = collection === 'collections' ? 'CollectionID' : 'GalleryID';
  const label = collection === 'collections' ? 'CollectionName' : 'GalleryName';
  for (const row of rows) {
    const option = document.createElement('option');
    option.value = row[key];
    option.textContent = row[label];
    select.append(option);
  }
}

async function buildForm() {
  const box = document.getElementById('fields');
  for (const [field, label, kind, required] of page.fields) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const text = document.createElement('label');
    text.textContent = required ? `${label} *` : `${label} (optional)`;
    text.htmlFor = `field-${field}`;
    let input;
    if (kind === 'textarea') {
      input = document.createElement('textarea');
    } else if (['collections', 'galleries', 'status', 'active'].includes(kind)) {
      input = document.createElement('select');
      if (kind === 'collections' || kind === 'galleries') {
        await fillSelect(input, kind);
      } else {
        const choices = kind === 'status' ? ['Upcoming', 'Active', 'Completed'] : ['1', '0'];
        for (const value of choices) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = kind === 'active' ? (value === '1' ? 'Yes' : 'No') : value;
          input.append(option);
        }
      }
    } else {
      input = document.createElement('input');
      input.type = kind;
      if (kind === 'number') {
        input.min = '0';
        input.step = field === 'CurrentPrice' ? '0.01' : '1';
      }
    }
    input.id = `field-${field}`;
    input.required = Boolean(required);
    wrapper.append(text, input);
    box.append(wrapper);
  }
}

function clearForm() {
  editing = null;
  document.getElementById('recordForm').reset();
  document.getElementById('formTitle').textContent = 'Add ' + page.title;
}


function formatMaintenanceDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString();
}

async function showMaintenanceOrders() {
  const section = document.getElementById('maintenanceOrders');

  // Only Admins and Curators can view this history.
  if (
    name !== 'artworks' ||
    !['Admin', 'Curator'].includes(Museum.user.role)
  ) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');

  const body = document.getElementById('maintenanceOrderRows');
  const status = document.getElementById('maintenanceOrderStatus');

  body.replaceChildren();
  status.textContent = '';

  try {
    const orders = await Museum.api(
      '/api/artworks/maintenance/orders'
    );

    if (orders.length === 0) {
      status.textContent = 'No maintenance work orders yet.';
      return;
    }

    for (const order of orders) {
      const row = document.createElement('tr');

      const values = [
        `#${order.MaintenanceID}`,
        order.Title,
        formatMaintenanceDate(order.ReportedAt),
        formatMaintenanceDate(order.ResolvedAt),
        order.Status
      ];

      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value ?? '—';
        row.append(cell);
      }

      body.append(row);
    }

  } catch (error) {
    status.textContent =
      `Unable to load maintenance history: ${error.message}`;
  }
}

async function showRecords() {
  records = await Museum.api(`/api/entities/${name}`);
  // Show a warning whenever artworks need maintenance.
  const maintenanceAlert = document.getElementById('maintenanceAlert');

  if (name === 'artworks') {
    const inactiveArtworks = records.filter(
      artwork => Number(artwork.NeedsMaintenance) === 1
    );

    if (inactiveArtworks.length > 0) {
      const count = inactiveArtworks.length;

      const artworkNames = inactiveArtworks
        .slice(0, 3)
        .map(artwork => artwork.Title)
        .join(', ');

      maintenanceAlert.textContent =
        `Maintenance Alert: ${count} artwork(s) require maintenance. ` +
        `${artworkNames}${count > 3 ? ', and others' : ''}. ` +
        `These artworks have been automatically deactivated ` +
        `and are unavailable for public display.`;

      maintenanceAlert.classList.remove('hidden');
    } else {
      maintenanceAlert.classList.add('hidden');
      maintenanceAlert.textContent = '';
    }
  }
  const header = document.getElementById('tableHead');
  const body = document.getElementById('recordRows');
  header.replaceChildren();
  body.replaceChildren();
  const columns = [
    page.id,
    ...page.fields.slice(0, 3).map(f => f[0]),
    ...(name === 'artworks' ? ['NeedsMaintenance', 'IsActive'] : [])
  ];
  for (const label of [...columns, ...(allowed ? ['Actions'] : [])]) {
    const th = document.createElement('th');
    th.textContent =
    label === 'NeedsMaintenance' ? 'Maintenance' :
    label === 'IsActive' ? 'Display Status' :
    label;
    header.append(th);
  }
  for (const item of records) {
    const tr = document.createElement('tr');
    for (const field of columns) {
      const td = document.createElement('td');

    if (field === 'StartDate' || field === 'EndDate') {
      td.textContent = formatDate(item[field]);
  } else if (field === 'NeedsMaintenance') {
    td.textContent = Number(item[field]) === 1
        ? 'Maintenance Required'
        : 'No Maintenance';
  } else if (field === 'IsActive') {
    td.textContent = Number(item[field]) === 1
        ? 'Active'
        : 'Inactive';
  } else {
    td.textContent = item[field] ?? '—';
}

  tr.append(td);
}
    if (allowed) {
      const td = document.createElement('td');
      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.className = 'btn secondary';
      edit.onclick = () => {
        editing = item[page.id];
        for (const [field] of page.fields) {
          const input = document.getElementById(`field-${field}`);

        if (field === 'StartDate' || field === 'EndDate') {
            input.value = item[field]
              ? String(item[field]).slice(0, 10)
              : '';
        } else {
          input.value = item[field] ?? '';
      }
    }
        document.getElementById('formTitle').textContent = 'Edit record #' + editing;
        window.scrollTo(0, 0);
      };
      const remove = document.createElement('button');
      remove.textContent = name === 'products' ? 'Deactivate' : 'Delete';
      remove.className = 'btn danger';
      remove.onclick = async () => {
        if (!confirm('Confirm removal of this record?')) return;
        try {
          await Museum.api(`/api/entities/${name}/${item[page.id]}`, { method: 'DELETE' });
          Museum.notify('listStatus', 'Record changed successfully.');
          await showRecords();
        } catch (err) { Museum.notify('listStatus', err.message, true); }
      };
      td.append(edit, ' ', remove);

if (name === 'artworks' && Museum.user.role === 'Curator') {
    const needsMaintenance = Number(item.NeedsMaintenance) === 1;

    const maintenanceButton = document.createElement('button');
    maintenanceButton.type = 'button';
    maintenanceButton.className = 'btn secondary';

    maintenanceButton.textContent = needsMaintenance
        ? 'Complete Maintenance'
        : 'Mark for Maintenance';

    maintenanceButton.onclick = async () => {
        const action = needsMaintenance
            ? 'complete maintenance for'
            : 'mark for maintenance';

        if (!confirm(`Are you sure you want to ${action} "${item.Title}"?`)) {
            return;
        }

        try {
            const result = await Museum.api(
                `/api/artworks/${item.ArtworkID}/maintenance`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        needsMaintenance: !needsMaintenance
                    })
                }
            );

            await showRecords();
            Museum.notify('listStatus', result.message);

        } catch (error) {
            Museum.notify('listStatus', error.message, true);
        }
    };

    td.append(' ', maintenanceButton);
}




      tr.append(td);
    }
    body.append(tr);
  }
  if (!records.length) Museum.notify('listStatus', 'No records available yet.');

  await showMaintenanceOrders();
}

(async function start() {
  if (!await Museum.init()) return;
  if (!page) { document.getElementById('content').textContent = 'Unknown page'; return; }
  document.getElementById('pageTitle').textContent = page.title;
  allowed = page.roles.includes(Museum.user.role);
  if (!allowed) document.getElementById('editor').classList.add('hidden');
  try {
    await buildForm();
    await showRecords();
  } catch (err) { Museum.notify('listStatus', err.message, true); }
  document.getElementById('cancelButton').onclick = clearForm;
  document.getElementById('recordForm').onsubmit = async event => {
    event.preventDefault();
    const data = {};
    for (const [field, label, kind] of page.fields) {
      const value = document.getElementById(`field-${field}`).value;
      data[field] = value === '' ? null :
        (['number', 'collections', 'galleries', 'active'].includes(kind) ? Number(value) : value);
    }
    const url = `/api/entities/${name}` + (editing ? `/${editing}` : '');
    try {
      await Museum.api(url, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(data) });
      Museum.notify('formStatus', 'Saved successfully.');
      clearForm();
      await showRecords();
    } catch (err) { Museum.notify('formStatus', err.message, true); }
  };
})();
