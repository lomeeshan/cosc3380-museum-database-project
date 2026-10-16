window.Museum = {
  user: null,
  async api(path, options={}) {
    const response=await fetch(path,{
      credentials:'same-origin',
      headers:{'Content-Type':'application/json',...(options.headers||{})},
      ...options
    });
    let data;
    try{data=await response.json();}catch{data={};}
    if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
    return data;
  },
  notify(id,message,error=false){
    const area=document.getElementById(id);
    if(!area)return;
    area.textContent=message;area.className='notice'+(error?' error':'');
  },
  table(id,columns,rows){
    const body=document.getElementById(id);body.replaceChildren();
    if(!rows.length){const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=columns.length;cell.textContent='No records found.';row.appendChild(cell);body.appendChild(row);return;}
    for(const record of rows){
      const tr=document.createElement('tr');
      for(const col of columns){const td=document.createElement('td');td.textContent=record[col]==null?'—':String(record[col]);tr.appendChild(td);}body.appendChild(tr);
    }
  },
  async init(){
    try{const r=await this.api('/api/auth/me');this.user=r.user;}
    catch{location.replace('/login.html');return false;}
    const layout=document.createElement('div');layout.className='shell';
    const sidebar=document.createElement('aside');sidebar.className='sidebar';
    sidebar.innerHTML=`<div class="brand">MFA <span>Museum</span></div><nav>
      <div class="navgroup">Overview</div><a class="navlink" href="/index.html">Dashboard</a>
      <div class="navgroup">Collections</div><a class="navlink" href="/manage.html?entity=artists">Artists</a>
      <a class="navlink" href="/manage.html?entity=artworks">Artworks</a>
      <a class="navlink" href="/manage.html?entity=exhibitions">Exhibitions</a>
      <div class="navgroup">Operations</div><a class="navlink" href="/manage.html?entity=visitors">Visitors</a>
      <a class="navlink" href="/tickets.html">Tickets</a><a class="navlink" href="/giftshop.html">Gift Shop</a>
      <div class="navgroup">Analysis</div><a class="navlink" href="/queries.html">Queries</a><a class="navlink" href="/reports.html">Reports</a></nav>`;
    const main=document.createElement('div');main.className='main';
    const bar=document.createElement('header');bar.className='topbar';
    const span=document.createElement('span');span.textContent='Museum Management System';
    const controls=document.createElement('div');controls.className='actions';
    const profile=document.createElement('small');profile.textContent=`${this.user.firstName} · ${this.user.role}`;
    const logout=document.createElement('button');logout.className='btn secondary';logout.textContent='Log out';
    logout.onclick=async()=>{await this.api('/api/auth/logout',{method:'POST'});location.replace('/login.html');};
    controls.append(profile,logout);bar.append(span,controls);main.append(bar);
    const content=document.getElementById('content');content.className='content';main.append(content);
    layout.append(sidebar,main);document.body.replaceChildren(layout);
    for(const link of sidebar.querySelectorAll('a')){
      if(link.getAttribute('href')===location.pathname+location.search)link.classList.add('active');
    }
    return true;
  }
};
