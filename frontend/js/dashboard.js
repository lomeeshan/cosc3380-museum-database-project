(async()=>{
  if(!await Museum.init())return;
   // Only Admins can see Queries and Reports. (CHECKPOINT 3 FEEDBACK)
  if (Museum.user.role !== 'Admin') {
    document.querySelectorAll(
      'a[href="/queries.html"], a[href="/reports.html"]'
    ).forEach(link => link.remove());
  }
  const stats=[['artworks','countArtworks'],['exhibitions','countExhibitions'],['visitors','countVisitors'],['products','countProducts']];
  for(const [name,id] of stats){try{const rows=await Museum.api(`/api/entities/${name}`);document.getElementById(id).textContent=rows.length+(rows.length===250?'+':'');}catch(error){Museum.notify('status',error.message,true);}}
})();
