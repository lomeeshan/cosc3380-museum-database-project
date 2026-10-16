(async()=>{
  if(!await Museum.init())return;
  const stats=[['artworks','countArtworks'],['exhibitions','countExhibitions'],['visitors','countVisitors'],['products','countProducts']];
  for(const [name,id] of stats){try{const rows=await Museum.api(`/api/entities/${name}`);document.getElementById(id).textContent=rows.length+(rows.length===250?'+':'');}catch(error){Museum.notify('status',error.message,true);}}
})();
