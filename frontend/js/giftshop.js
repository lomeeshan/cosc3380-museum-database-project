(async()=>{
  if(!await Museum.init())return;
  if(!['Admin','Sales Staff'].includes(Museum.user.role)){Museum.notify('saleMessage','Gift shop sales require Admin or Sales Staff permission.',true);document.getElementById('saleForm').classList.add('hidden');return;}
  async function refresh(){
    const products=await Museum.api('/api/entities/products');
    Museum.table('productRows',['ProductName','Category','CurrentPrice','QuantityInStock','IsActive'],products);
    const select=document.getElementById('productId');select.replaceChildren();
    for(const p of products.filter(p=>p.IsActive&&p.QuantityInStock>0)){
      const option=document.createElement('option');option.value=p.ProductID;option.textContent=`${p.ProductName} · $${p.CurrentPrice} (${p.QuantityInStock} available)`;select.append(option);
    }
    const sales=await Museum.api('/api/sales');Museum.table('saleRows',['SaleID','SaleDateTime','PaymentMethod','SaleStatus','Total'],sales);
  }
  document.getElementById('saleForm').onsubmit=async ev=>{
    ev.preventDefault();try{
      const data=await Museum.api('/api/sales',{method:'POST',body:JSON.stringify({paymentMethod:document.getElementById('paymentMethod').value,items:[{productId:Number(document.getElementById('productId').value),quantity:Number(document.getElementById('quantity').value)}]})});
      Museum.notify(
  'saleMessage',
  `${data.message}. Sale #${data.saleId}, total $${data.total.toFixed(2)}`
);

const warning = document.getElementById('lowStockMessage');

if (data.lowStockAlerts && data.lowStockAlerts.length > 0) {
  warning.textContent = data.lowStockAlerts.map(product =>
    `Low Stock Alert: ${product.productName} now has ${product.quantityInStock} units remaining. The product was automatically deactivated. Please restock it.`
  ).join(' ');

  warning.className = 'notice low-stock-warning';
} else {
  warning.textContent = '';
  warning.className = 'hidden';
}

await refresh();
    }catch(error){Museum.notify('saleMessage',error.message,true);}
  };
  try{await refresh();}catch(error){Museum.notify('saleMessage',error.message,true);}
})();