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
    text.textContent = label;
    text.htmlFor = `field-${field}`;
    let input;
    if (kind === 'textarea') {
      input = document.createElement('textarea');
    } else if (['collections', 'galleries', 'status', 'active'].includes(kind)) {
      input = document.createElement('select');
      if (kind === 'collections' || kind === 'galleries') {
        await fillSelect(input, kind);
      } else {
        const choices = kind === 'status' ? ['Scheduled', 'Active', 'Closed'] : ['1', '0'];
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

async function showRecords() {
  records = await Museum.api(`/api/entities/${name}`);
  const header = document.getElementById('tableHead');
  const body = document.getElementById('recordRows');
  header.replaceChildren();
  body.replaceChildren();
  const columns = [page.id, ...page.fields.slice(0, 3).map(f => f[0])];
  for (const label of [...columns, ...(allowed ? ['Actions'] : [])]) {
    const th = document.createElement('th');
    th.textContent = label;
    header.append(th);
  }
  for (const item of records) {
    const tr = document.createElement('tr');
    for (const field of columns) {
      const td = document.createElement('td');

    if (field === 'StartDate' || field === 'EndDate') {
      td.textContent = formatDate(item[field]);
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
      tr.append(td);
    }
    body.append(tr);
  }
  if (!records.length) Museum.notify('listStatus', 'No records available yet.');
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
