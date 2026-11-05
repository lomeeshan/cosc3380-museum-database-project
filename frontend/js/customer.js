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
    } catch { location.replace('/customer-login.html'); return; }

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
      const exhibitions=await api('/api/public/exhibitions');
      const select=document.getElementById('exhibitionId');
      select.replaceChildren();
      const today=new Date().toISOString().slice(0,10);
      document.getElementById('visitDate').min=today;
      const available=exhibitions.filter(ex =>
        ['Active','Upcoming'].includes(ex.Status) && ex.EndDate>=today);
      if (!available.length) {
        const opt=document.createElement('option');
        opt.textContent='No exhibitions available';
        opt.value='';select.append(opt);
        document.querySelector('#purchaseForm button').disabled=true;
      }
      available.forEach(ex=>{
        const opt=document.createElement('option');
        opt.value=ex.ExhibitionID;
        opt.textContent=ex.ExhibitionTitle+' ('+ex.StartDate+' to '+ex.EndDate+')';
        select.append(opt);
        const visitDateInput=document.getElementById('visitDate');
function updateVisitDateRange(){
  const chosen=available.find(ex=>String(ex.ExhibitionID)===select.value);
  if(!chosen){ visitDateInput.value=''; return; }
  visitDateInput.min=chosen.StartDate>today?chosen.StartDate:today;
  visitDateInput.max=chosen.EndDate;
  if(visitDateInput.value && (visitDateInput.value<visitDateInput.min ||
     visitDateInput.value>visitDateInput.max)) visitDateInput.value='';
}
select.addEventListener('change',updateVisitDateRange);
updateVisitDateRange();

      });
      await reload();
    } catch(err) { notify(err.message,true); }

    document.getElementById('purchaseForm').addEventListener('submit',async e=>{
      e.preventDefault();
      const body={
        exhibitionId:Number(document.getElementById('exhibitionId').value),
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
    document.getElementById('customerLogout').addEventListener('click',async()=>{
      try { await api('/api/customer/logout',{method:'POST'}); }
      finally { location.replace('/customer-login.html'); }
    });
  }
})();
