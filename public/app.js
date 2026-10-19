const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const chartCanvas=$('#progressChart');
if(chartCanvas&&window.Chart)new Chart(chartCanvas,{type:'bar',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{data:[45,65,35,82,55,95,68],backgroundColor:'#7553db',borderRadius:5,barThickness:22}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#837e91',font:{size:11}}},y:{display:false,beginAtZero:true,max:100}},responsive:true,maintainAspectRatio:false}});
$$('.tab').forEach(tab=>tab.addEventListener('click',()=>{$$('.tab').forEach(t=>t.classList.remove('active'));$$('.tab-panel').forEach(p=>p.classList.remove('active'));tab.classList.add('active');$('#'+tab.dataset.tab).classList.add('active')}));
const drop=$('#dropZone');
if(drop){const input=$('input[type=file]',drop);input.addEventListener('change',()=>$('#fileName').textContent=input.files[0]?.name||'');['dragover','dragenter'].forEach(type=>drop.addEventListener(type,event=>{event.preventDefault();drop.style.borderColor='#7553db'}));drop.addEventListener('drop',event=>{event.preventDefault();input.files=event.dataTransfer.files;$('#fileName').textContent=input.files[0]?.name||''})}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const modal=$('#eventModal');
if(modal){
  let events=[],view=new Date();
  const dateKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const eventDateKey=event=>String(event.eventDate).slice(0,10);
  const load=async()=>{events=await (await fetch('/api/events')).json();render()};
  const render=()=>{
    const y=view.getFullYear(),m=view.getMonth();
    $('#monthTitle').textContent=view.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const first=new Date(y,m,1).getDay(),last=new Date(y,m+1,0).getDate(),days=$('#calendarDays');
    days.innerHTML='';
    for(let i=0;i<first;i++)days.innerHTML+='<span class="day muted-day"></span>';
    for(let d=1;d<=last;d++){
      const date=new Date(y,m,d),key=dateKey(date),has=events.some(e=>eventDateKey(e)===key);
      days.innerHTML+=`<span class="day ${has?'has-event':''} ${date.toDateString()===new Date().toDateString()?'today':''}" data-date="${key}">${d}</span>`;
    }
    $('#eventItems').innerHTML=events.length?events.map(e=>`<div class="event-item ${e.status==='Completed'?'completed':''}" data-event-item="${e._id}"><span><b>${esc(e.title)}</b><small>${eventDateKey(e)} · ${e.category}</small></span><span class="event-actions"><button data-complete="${e._id}" aria-label="Toggle event completion">✓</button><button data-delete="${e._id}">×</button></span></div>`).join(''):'<div class="empty">Your calendar is clear.<br>Add a moment worth showing up for.</div>';
    $$('[data-delete]').forEach(button=>button.onclick=async()=>{await fetch('/api/events/'+button.dataset.delete,{method:'DELETE'});load()});
  };
  $('#addEventBtn').onclick=()=>modal.classList.add('open');
  $('#closeModal').onclick=()=>modal.classList.remove('open');
  $('#prevMonth').onclick=()=>{view.setMonth(view.getMonth()-1);render()};
  $('#nextMonth').onclick=()=>{view.setMonth(view.getMonth()+1);render()};
  $('#eventForm').onsubmit=async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});e.target.reset();modal.classList.remove('open');load()};
  load();
}
