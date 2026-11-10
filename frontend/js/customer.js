(async () => {
  const page = document.body.dataset.customerPage;
  const message = document.getElementById('customerMessage');
  function notify(text, error=false) {
    if (!message) return;
    message.textContent = text;
    message.className = error ? 'notice error' : 'notice';
  }
  async function api(url, options={}) {
    const res = await fetch(url, { credentials:'same-origin',
      headers:{ 'Content-Type':'application/json' }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }
  function formData(names) {
    return Object.fromEntries(names.map(name => [name,
      name === 'password' ? document.getElementById(name).value : document.getElementById(name).value.trim()]));
  }

  if (page === 'register') {
    document.getElementById('registerForm').addEventListener('submit', async e => {
      e.preventDefault();
      try {
        await api('/api/customer/register', { method:'POST',
          body:JSON.stringify(formData(['firstName','lastName','email','password'])) });
        location.replace('/customer-dashboard.html');
      } catch(err) { notify(err.message,true); }
    });
  }

  if (page === 'login') {
    document.getElementById('customerLoginForm').addEventListener('submit', async e => {
      e.preventDefault();
      try {
        await api('/api/customer/login', { method:'POST',
          body:JSON.stringify(formData(['email','password'])) });
        location.replace('/customer-dashboard.html');
      } catch(err) { notify(err.message,true); }
    });
  }

  if (page === 'dashboard') {
    let user;
    try {
      const response=await api('/api/customer/me');
      user=response.user;
      document.getElementById('welcome').textContent =
        'Welcome, '+user.FirstName+'!';
    } catch { location.replace('/login.html'); return; }

    async function reload() {
      const rows = await api('/api/customer/tickets');
      const tbody = document.getElementById('myTickets');
      tbody.replaceChildren();
      if (!rows.length) {
        const tr=document.createElement('tr'), td=document.createElement('td');
        td.colSpan=5; td.textContent='No tickets purchased yet.';
        tr.append(td);tbody.append(tr);return;
      }
      for(const ticket of rows) {
        const tr=document.createElement('tr');
        for(const value of [
          ticket.TicketID, ticket.ExhibitionTitle || 'General admission',
          ticket.TicketType, ticket.VisitDate, '$'+Number(ticket.TicketPrice).toFixed(2)
        ]) {
          const td=document.createElement('td');
          td.textContent=String(value);tr.append(td);
        }
        tbody.append(tr);
      }
    }


    try {
      const exhibitions = await api('/api/public/exhibitions');
      const select = document.getElementById('exhibitionId');
      const visitDateInput = document.getElementById('visitDate');

      select.replaceChildren();

      // Use the museum's local date.
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date());

      const dateValues = Object.fromEntries(
        parts.map(part => [part.type, part.value])
      );

      const today =
        `${dateValues.year}-${dateValues.month}-${dateValues.day}`;

      // First option: General Admission.
      const generalOption = document.createElement('option');
      generalOption.value = 'general';
      generalOption.textContent = 'General Admission';
      select.append(generalOption);

      // Add available exhibitions underneath.
      const available = exhibitions.filter(ex =>
        ['Active', 'Upcoming'].includes(ex.Status) &&
        ex.EndDate >= today
      );

      for (const ex of available) {
        const option = document.createElement('option');
        option.value = ex.ExhibitionID;
        option.textContent =
          ex.ExhibitionTitle +
          ' (' + ex.StartDate + ' to ' + ex.EndDate + ')';

        select.append(option);
      }

      // Update valid dates depending on admission selection.
      function updateVisitDateRange() {
        const chosen = available.find(ex =>
          String(ex.ExhibitionID) === select.value
        );

        visitDateInput.min =
          chosen && chosen.StartDate > today
            ? chosen.StartDate
            : today;

        if (chosen) {
          visitDateInput.max = chosen.EndDate;
        } else {
          // General Admission has no exhibition end date.
          visitDateInput.removeAttribute('max');
        }

        if (
          visitDateInput.value &&
          (
            visitDateInput.value < visitDateInput.min ||
            (chosen && visitDateInput.value > visitDateInput.max)
          )
        ) {
          visitDateInput.value = '';
        }
      }

      select.addEventListener('change', updateVisitDateRange);
      updateVisitDateRange();

      await reload();

    } catch (err) {
      notify(err.message, true);
    }


    document.getElementById('purchaseForm').addEventListener('submit',async e=>{
      e.preventDefault();
      const body={

      exhibitionId:
        document.getElementById('exhibitionId').value === 'general'
          ? null
          : Number(document.getElementById('exhibitionId').value),

        ticketType:document.getElementById('ticketType').value,
        visitDate:document.getElementById('visitDate').value
      };
      try {
        const result=await api('/api/customer/tickets',{
          method:'POST',body:JSON.stringify(body)
        });
        notify('Ticket #'+result.ticketId+' confirmed (demo, no payment).');
        await reload();
      } catch(err) { notify(err.message,true); }
    });
    // CUSTOMER GIFT SHOP
    const giftForm = document.getElementById('customerGiftShopForm');
    const giftSelect = document.getElementById('giftProductId');
    const giftMessage = document.getElementById('giftShopMessage');

    function giftNotify(text, error = false) {
      giftMessage.textContent = text;
      giftMessage.className = error ? 'notice error' : 'notice';
    }

    async function loadGiftShop() {
      const products = await api('/api/customer/giftshop/products');
      const tbody = document.getElementById('giftShopProducts');

      tbody.replaceChildren();
      giftSelect.replaceChildren();

      let availableCount = 0;

      for (const product of products) {
        const available = Number(product.QuantityInStock) > 0;

        const row = document.createElement('tr');

        const values = [
          product.ProductName,
          product.Category,
          '$' + Number(product.CurrentPrice).toFixed(2),
          available
            ? product.QuantityInStock + ' available'
            : 'Out of stock'
        ];

        for (const value of values) {
          const cell = document.createElement('td');
          cell.textContent = String(value);
          row.append(cell);
        }

        tbody.append(row);

        if (available) {
          const option = document.createElement('option');
          option.value = product.ProductID;
          option.textContent = product.ProductName +
            ' — $' + Number(product.CurrentPrice).toFixed(2);

          giftSelect.append(option);
          availableCount++;
        }
      }

      if (products.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'No products available.';
        row.append(cell);
        tbody.append(row);
      }

      giftForm.querySelector('button').disabled =
        availableCount === 0;
    }

    giftForm.addEventListener('submit', async event => {
      event.preventDefault();

      const productId = Number(giftSelect.value);
      const quantity = Number(
        document.getElementById('giftQuantity').value
      );

      try {
        const result = await api(
          '/api/customer/giftshop/purchase',
          {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
          }
        );

        giftNotify(
          'Purchase #' + result.saleId +
          ' confirmed! Total: $' +
          Number(result.total).toFixed(2) +
          '. No payment processed.'
        );

        await loadGiftShop();

      } catch (error) {
        giftNotify(error.message, true);
        try {
          await loadGiftShop();
        } catch (refreshError) {
          giftNotify(refreshError.message, true);
        }
      }
    });

    try {
      await loadGiftShop();
    } catch (error) {
      giftForm.querySelector('button').disabled = true;
      giftNotify(error.message, true);
    }
    document.getElementById('customerLogout').addEventListener('click',async()=>{
      try { await api('/api/customer/logout',{method:'POST'}); }
      finally { location.replace('/login.html'); }
    });
  }
})();
