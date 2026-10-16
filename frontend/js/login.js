document.getElementById('loginForm').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const message=document.getElementById('message');message.textContent='Signing in…';
  try{
    const response=await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('username').value.trim(),password:document.getElementById('password').value})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Unable to sign in');
    location.replace('/index.html');
  }catch(error){message.textContent=error.message;message.className='notice error';}
});
