(async()=>{
  if(!await Museum.init())return;
  async function refresh(){
    const reports=[
      ['/api/reports/ticket-revenue','ticketReport',['Month','TicketsSold','Revenue']],
      ['/api/reports/giftshop-revenue','shopReport',['ProductName','UnitsSold','Revenue']],
      ['/api/reports/exhibitions','exhibitionReport',['ExhibitionTitle','GalleryName','Status','ArtworkCount']]
    ];
    try{
      for(const [path,id,cols] of reports){const rows=await Museum.api(path);Museum.table(id,cols,rows);}
      Museum.notify('reportMessage','Reports refreshed successfully.');
    }catch(e){Museum.notify('reportMessage',e.message,true);}
  }
  document.getElementById('refreshReports').onclick=refresh;await refresh();
})();