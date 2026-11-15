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

  if (page !== 'dashboard') return;

  const { make, media, formatDate, money, productImage, reveal,
    EXHIBITION_MEDIA, TICKET_PRICES } = Site;
  const el = id => document.getElementById(id);

  // ---------- Account ----------
  try {
    const { user } = await api('/api/customer/me');
    el('welcome').textContent = user.FirstName + '.';
  } catch { location.replace('/login.html'); return; }

  el('customerLogout').addEventListener('click', async () => {
    try { await api('/api/customer/logout', { method:'POST' }); }
    finally { location.replace('/login.html'); }
  });

  // ---------- My tickets ----------
  function ticketCard(ticket) {
    const card = make('article', 'ticket');
    const main = make('div', 'main-part');
    main.append(
      make('span', 'kicker', ticket.TicketType + ' admission'),
      make('h3', '', ticket.ExhibitionTitle || 'General admission'),
      make('div', 'when', formatDate(ticket.VisitDate,
        { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
    );
    const stub = make('div', 'stub');
    const price = make('div');
    price.append(make('small', 'muted', 'Paid'), make('strong', '', money(ticket.TicketPrice)));
    stub.append(price, make('span', 'id', '#' + ticket.TicketID));
    card.append(main, stub);
    return card;
  }

  async function loadTickets() {
    const rows = await api('/api/customer/tickets');
    const box = el('myTickets');
    box.replaceChildren();
    el('statTickets').textContent = rows.length;

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = rows.map(t => t.VisitDate).filter(d => d && d >= today).sort();
    el('statNextVisit').textContent = upcoming.length
      ? formatDate(upcoming[0], { month: 'short', day: 'numeric' }) : 'Not booked';

    if (!rows.length) {
      const empty = make('div', 'empty-state');
      empty.append(make('p', '', 'No tickets yet. Your first visit is one click away.'));
      const link = make('a', 'btn secondary', 'Book a visit');
      link.href = '#book';
      empty.append(link);
      box.append(empty);
      return;
    }
    rows.forEach((ticket, i) => {
      const card = ticketCard(ticket);
      card.style.animationDelay = Math.min(i, 8) * 60 + 'ms';
      box.append(card);
    });
  }

  // ---------- Booking ----------
  const select = el('exhibitionId');
  const visitDate = el('visitDate');
  const bookButton = el('purchaseForm').querySelector('button[type="submit"]');
  const today = new Date().toISOString().slice(0, 10);
  visitDate.min = today;
  let available = [];

  const chosenType = () =>
    document.querySelector('input[name="ticketType"]:checked')?.value || 'Adult';

  function updateTotal() {
    el('bookTotal').textContent = '$' + (TICKET_PRICES[chosenType()] ?? 0);
  }

  // Show the chosen exhibition's artwork beside the form.
  function updatePreview() {
    const chosen = available.find(ex => String(ex.ExhibitionID) === select.value);
    const box = el('bookMedia');
    box.querySelector('.art-image, .image-unavailable, .exhibit-banner')?.remove();
    if (!chosen) {
      el('bookTitle').textContent = 'No exhibitions available';
      el('bookMeta').textContent = '';
      el('bookStatus').textContent = 'Exhibition';
      visitDate.value = '';
      return;
    }
    box.prepend(media(EXHIBITION_MEDIA[chosen.ExhibitionTitle], 'exhibitions', chosen.ExhibitionTitle));
    el('bookTitle').textContent = chosen.ExhibitionTitle;
    el('bookStatus').textContent = chosen.Status === 'Active' ? 'On view now' : 'Coming soon';
    el('bookMeta').textContent = [chosen.GalleryName,
      formatDate(chosen.StartDate) + ' – ' + formatDate(chosen.EndDate)].filter(Boolean).join(' · ');

    visitDate.min = chosen.StartDate > today ? chosen.StartDate : today;
    visitDate.max = chosen.EndDate;
    if (visitDate.value && (visitDate.value < visitDate.min || visitDate.value > visitDate.max)) {
      visitDate.value = '';
    }
  }

  document.querySelectorAll('input[name="ticketType"]').forEach(radio =>
    radio.addEventListener('change', updateTotal));
  select.addEventListener('change', updatePreview);

  try {
    const exhibitions = await api('/api/public/exhibitions');
    select.replaceChildren();
    available = exhibitions.filter(ex =>
      ['Active','Upcoming'].includes(ex.Status) && ex.EndDate >= today);
    if (!available.length) {
      const opt = make('option', '', 'No exhibitions available');
      opt.value = '';
      select.append(opt);
      bookButton.disabled = true;
    }
    for (const ex of available) {
      const opt = make('option', '', ex.ExhibitionTitle);
      opt.value = ex.ExhibitionID;
      select.append(opt);
    }
    updatePreview();
    updateTotal();
    await loadTickets();
  } catch (err) { notify(err.message, true); }

  el('purchaseForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = {
      exhibitionId: Number(select.value),
      ticketType: chosenType(),
      visitDate: visitDate.value
    };
    const label = bookButton.innerHTML;
    bookButton.disabled = true;
    bookButton.textContent = 'Reserving…';
    try {
      const result = await api('/api/customer/tickets', { method:'POST', body:JSON.stringify(body) });
      notify('Ticket #' + result.ticketId + ' confirmed. See you on ' +
        formatDate(body.visitDate, { month: 'long', day: 'numeric' }) + '!');
      await loadTickets();
    } catch (err) { notify(err.message, true); }
    finally {
      bookButton.disabled = false;
      bookButton.innerHTML = label;
    }
  });

  // ---------- Gift shop ----------
  const giftMessage = el('giftShopMessage');
  function giftNotify(text, error = false) {
    giftMessage.textContent = text;
    giftMessage.className = error ? 'notice error' : 'notice';
  }

  function productCard(product) {
    const stock = Number(product.QuantityInStock);
    const inStock = stock > 0;
    const card = make('article', 'product reveal' + (inStock ? '' : ' sold-out'));

    const thumb = make('div', 'thumb');
    const src = productImage(product.ProductName);
    if (src) {
      const img = make('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      thumb.append(img);
    } else {
      thumb.append(make('span', 'monogram', product.ProductName.trim().charAt(0)));
    }
    if (!inStock) thumb.append(make('span', 'tag out', 'Sold out'));
    else if (stock <= 5) thumb.append(make('span', 'tag low', 'Only ' + stock + ' left'));

    const info = make('div', 'info');
    info.append(
      make('span', 'cat', product.Category),
      make('h3', '', product.ProductName),
      make('span', 'price-tag', money(product.CurrentPrice))
    );

    const buy = make('form', 'buy');
    const qty = make('input');
    qty.type = 'number';
    qty.min = 1;
    qty.max = Math.min(20, Math.max(stock, 1));
    qty.value = 1;
    qty.required = true;
    qty.setAttribute('aria-label', 'Quantity of ' + product.ProductName);
    const button = make('button', 'btn', inStock ? 'Buy now' : 'Sold out');
    button.type = 'submit';
    button.disabled = !inStock;
    qty.disabled = !inStock;
    buy.append(qty, button);

    buy.addEventListener('submit', async event => {
      event.preventDefault();
      button.disabled = true;
      button.textContent = 'Buying…';
      try {
        const result = await api('/api/customer/giftshop/purchase', {
          method: 'POST',
          body: JSON.stringify({ productId: Number(product.ProductID), quantity: Number(qty.value) })
        });
        giftNotify('Order #' + result.saleId + ' confirmed: ' + qty.value + ' × ' +
          product.ProductName + ' for ' + money(result.total) + '. (Demo, no payment processed.)');
      } catch (error) {
        giftNotify(error.message, true);
      }
      giftMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { await loadGiftShop(); } catch (e) { giftNotify(e.message, true); }
    });

    info.append(buy);
    card.append(thumb, info);
    return card;
  }

  async function loadGiftShop() {
    const products = await api('/api/customer/giftshop/products');
    const box = el('giftShopProducts');
    box.replaceChildren();
    if (!products.length) {
      box.append(make('div', 'empty-state', 'The store is restocking. Check back soon.'));
      return;
    }
    // In-stock items first.
    products.sort((a, b) => (Number(b.QuantityInStock) > 0) - (Number(a.QuantityInStock) > 0));
    for (const product of products) box.append(productCard(product));
    reveal(box);
  }

  try { await loadGiftShop(); }
  catch (error) { giftNotify(error.message, true); }
})();
