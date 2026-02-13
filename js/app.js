// Core client-side app for BusDZ (LocalStorage-based)
(function(){  // Theme management
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', savedTheme === 'light');
    updateThemeButton(savedTheme);
  }

  function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'light' ? '🌙' : '☀️';
      btn.title = theme === 'light' ? 'Basculer vers le thème sombre' : 'Basculer vers le thème clair';
    }
  }

  function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    const newTheme = isLight ? 'dark' : 'light';
    document.body.classList.toggle('light-theme', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
  }

  // Theme button listener
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  });
    const CITIES = ["Algiers","Oran","Setif","Constantine","Blida","M'sila","Bejaia","Tizi Ouzou"];
  const COMPANIES = ["Sahra Travel","Atlas Bus","Safa Voyages","El-Khayr"];

  // Utilities
  function uid(prefix='id'){return prefix+Math.random().toString(36).slice(2,9)}
  function currency(d){return d.toLocaleString('en-US')+' DZD'}
  function nowDateISO(){return new Date().toISOString().split('T')[0]}

  // LocalStorage helpers
  function get(key, fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch(e){return fallback}}
  function set(key,val){localStorage.setItem(key,JSON.stringify(val))}

  // Seed data
  function seed(){
    if(!localStorage.getItem('trips')){
      const sample = [];
      const basePrices = {"Algiers-Oran":2500,"Algiers-Setif":1800,"Oran-Setif":3200}
      for(let i=0;i<10;i++){
        const from = CITIES[i% CITIES.length];
        const to = CITIES[(i+2)%CITIES.length];
        const company = COMPANIES[i%COMPANIES.length];
        const depHour = 6 + (i%12);
        const dur = 2 + (i%6);
        const price = 1500 + (i*200);
        sample.push({
          id:uid('trip_'),company,from,to,date:nowDateISO(),
          dep:`${String(depHour).padStart(2,'0')}:00`,arr: `${String((depHour+dur)%24).padStart(2,'0')}:00`,
          duration:dur+'h',price,available:40-seedRand(i),bookedSeats:[]
        })
      }
      set('trips',sample)
    }
    if(!localStorage.getItem('users')){
      set('users',[{id:uid('u_'),username:'admin',password:'admin123',role:'admin'}])
    }
    if(!localStorage.getItem('bookings')) set('bookings',[])
  }

  function seedRand(i){return (i*7)%12}

  // Page specific
  function pageIndex(){
    const from = document.getElementById('fromCity');
    const to = document.getElementById('toCity');
    CITIES.forEach(c=>{from.append(new Option(c,c));to.append(new Option(c,c))})
    document.getElementById('year').textContent=new Date().getFullYear();
    document.getElementById('travelDate').value = nowDateISO();

    document.getElementById('searchForm').addEventListener('submit',e=>{
      e.preventDefault();
      const params = {from:from.value,to:to.value,date:document.getElementById('travelDate').value,pax:document.getElementById('paxCount').value}
      set('lastSearch',params);
      location.href='results.html'
    })
  }

  function pageResults(){
    const trips = get('trips',[]);
    const params = get('lastSearch',{})
    const resultsEl = document.getElementById('resultsList');
    const summary = document.getElementById('searchSummary');
    summary.innerHTML = `<strong>📍 ${params.from || 'N/A'}</strong> → <strong>🎯 ${params.to || 'N/A'}</strong> • 📅 ${params.date||''} • 👥 ${params.pax||1} passenger(s)`;

    // populate companies filter
    const companySet = new Set(trips.map(t=>t.company));
    const compSel = document.getElementById('filterCompany');
    companySet.forEach(c=>compSel.append(new Option(c,c)));

    function render(list){
      resultsEl.innerHTML='';
      let filtered = list.filter(t=>{
        if(params.from && t.from!==params.from) return false;
        if(params.to && t.to!==params.to) return false;
        return true
      });
      
      if(filtered.length === 0){
        resultsEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p style="color: var(--muted);">No trips found. Try different dates or cities.</p></div>'
        return
      }

      const bookings = get('bookings',[]);
      filtered.forEach(t=>{
        // Count total booked seats for this trip across all bookings
        const totalBookedSeats = bookings.filter(b=>b.tripId===t.id).reduce((sum,b)=>(b.seats||[]).length+sum,0);
        const availSeats = 40 - totalBookedSeats;
        const div = document.createElement('div');div.className='trip-card';
        const pricePerPax = Math.floor(t.price / params.pax);
        const totalPrice = t.price * params.pax;
        div.innerHTML = `
          <h4>🚌 ${t.company}</h4>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
              <div>
                <div style="font-weight: 700; font-size: 1.1rem;">${t.from}</div>
                <div style="color: var(--muted); font-size: 0.9rem;">📍 Departure</div>
              </div>
              <div style="color: var(--muted); font-size: 0.8rem;">~${t.duration}</div>
              <div style="text-align: right;">
                <div style="font-weight: 700; font-size: 1.1rem;">${t.to}</div>
                <div style="color: var(--muted); font-size: 0.9rem;">Arrival</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
              <div>
                <div style="color: var(--accent); font-weight: 700; font-size: 1.2rem;">🕐 ${t.dep}</div>
              </div>
              <div style="text-align: center; color: var(--muted);">
                <div style="font-size: 0.85rem;">${availSeats} seats available</div>
              </div>
              <div>
                <div style="color: var(--primary); font-weight: 700; font-size: 1.3rem;">${currency(t.price)}</div>
                <div style="color: var(--muted); font-size: 0.75rem;">per person</div>
              </div>
            </div>
          </div>
          <button class="btn primary" data-id="${t.id}" style="width: 100%; margin-top: 1rem;">🎟️ Book Now</button>
        `;
        resultsEl.appendChild(div)
      })
      // hook buttons
      document.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',e=>{
        const tripId = e.currentTarget.dataset.id;
        set('selectedTrip',{tripId,date:params.date,pax:params.pax});
        location.href='seats.html'
      }))
    }

    // sorting/filtering
    function getFiltered(){
      const comp = document.getElementById('filterCompany').value;
      const sort = document.getElementById('sortBy').value;
      let list = trips.slice();
      if(comp && comp!=='all') list = list.filter(t=>t.company===comp);
      if(sort==='priceAsc') list.sort((a,b)=>a.price-b.price);
      if(sort==='priceDesc') list.sort((a,b)=>b.price-a.price);
      if(sort==='timeAsc') list.sort((a,b)=>a.dep.localeCompare(b.dep));
      return list
    }

    document.getElementById('filterCompany').addEventListener('change',()=>render(getFiltered()))
    document.getElementById('sortBy').addEventListener('change',()=>render(getFiltered()))
    render(getFiltered())
  }

  function pageSeats(){
    const sel = get('selectedTrip');
    if(!sel){location.href='index.html';return}
    const trips = get('trips',[]);
    const trip = trips.find(t=>t.id===sel.tripId);
    document.getElementById('tripSummary').innerHTML = `<strong>${trip.company}</strong> • ${trip.from} → ${trip.to} • ${sel.date} • ${sel.pax} pax`;

    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML=''
    const booked = get('bookings',[]).filter(b=>b.tripId===trip.id).flatMap(b=>b.seats||[])
    const totalSeats = 40
    let selected = []

    // Helper to update stats
    function updateStats(){
      const available = totalSeats - booked.length - selected.length;
      document.getElementById('availableSeatsCount').textContent = available;
      document.getElementById('bookedSeatsCount').textContent = booked.length;
      document.getElementById('selectedSeatsCount').textContent = selected.length;
    }

    for(let i=1;i<=totalSeats;i++){
      const s = document.createElement('div'); s.className='seat'; s.textContent=i; s.dataset.seat=i
      if(booked.includes(i)) s.classList.add('occupied')
      s.addEventListener('click',()=>{
        if(s.classList.contains('occupied')) return;
        if(s.classList.contains('selected')){
          s.classList.remove('selected');
          selected=selected.filter(x=>x!==i);
        }
        else{
          if(selected.length>=Number(sel.pax)) return alert('Max seats: '+sel.pax)
          s.classList.add('selected'); selected.push(i)
        }
        set('seatSelection',selected);
        updateStats();
      })
      seatMap.appendChild(s)
    }

    // Initial stats display
    updateStats();

    document.getElementById('proceedPassenger').addEventListener('click',()=>{
      const selSeats = get('seatSelection',[])
      if(selSeats.length!==Number(sel.pax)) return alert('Please select '+sel.pax+' seats')
      set('currentBooking',{tripId:trip.id,date:sel.date,seats:selSeats,price:trip.price,pax:sel.pax,company:trip.company,from:trip.from,to:trip.to,dep:trip.dep})
      location.href='passenger.html'
    })
  }

  function pagePassenger(){
    const cur = get('currentBooking'); if(!cur){location.href='index.html';return}
    const sumEl = document.getElementById('bookingSummary');
    sumEl.innerHTML = `<h4>${cur.company}</h4><p>${cur.from} → ${cur.to}</p><p>${cur.date} • ${cur.dep}</p><p>Seats: ${cur.seats.join(', ')}</p><p><strong>${currency(cur.price)} / pax</strong></p>`

    document.getElementById('passengerForm').addEventListener('submit',e=>{
      e.preventDefault();
      const name = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      if(!name||!phone) return alert('Please fill details')
      const bookings = get('bookings',[]);
      const booking = {id:uid('B_'),tripId:cur.tripId,date:cur.date,seats:cur.seats,price:cur.price,pax:cur.pax,passenger:{name,phone},company:cur.company,from:cur.from,to:cur.to,dep:cur.dep,created:Date.now()}
      bookings.push(booking); set('bookings',bookings)
      // clear seatSelection, currentBooking, set last booking id
      localStorage.removeItem('seatSelection'); localStorage.removeItem('currentBooking'); set('lastBooking',booking.id);
      // notification
      alert('Booking confirmed!');
      location.href='ticket.html'
    })
  }

  function pageTicket(){
    const id = get('lastBooking');
    const booking = get('bookings',[]).find(b=>b.id===id) || get('bookings',[]).slice(-1)[0]
    const wrap = document.getElementById('ticketCard');
    if(!booking){wrap.innerHTML='<p>No booking found.</p>'; return}
    wrap.innerHTML = `
      <div class="ticket">
        <div style="display: grid; grid-template-columns: 1fr 200px; gap: 2rem;">
          <div>
            <h3>🎫 ${booking.id}</h3>
            <div style="margin-top: 1.5rem;">
              <p><strong>Passenger:</strong> ${booking.passenger.name}</p>
              <p><strong>Phone:</strong> ${booking.passenger.phone}</p>
            </div>
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed rgba(255,255,255,0.2);">
              <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><strong>Route:</strong> <span>${booking.from} → ${booking.to}</span></p>
              <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><strong>Date:</strong> <span>${booking.date}</span></p>
              <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><strong>Departure:</strong> <span>${booking.dep}</span></p>
              <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><strong>Seats:</strong> <span>${booking.seats.join(', ')}</span></p>
              <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><strong>Company:</strong> <span>${booking.company}</span></p>
            </div>
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed rgba(255,255,255,0.2);">
              <p style="font-size: 1.3rem;"><strong>Total Price: ${currency(booking.price)}</strong></p>
            </div>
          </div>
          <div id="qrcode" style="display: flex; align-items: center; justify-content: center;"></div>
        </div>
      </div>
    `
    // generate QR
    if(window.QRCode){QRCode.toCanvas(document.getElementById('qrcode'), JSON.stringify({id:booking.id,name:booking.passenger.name,phone:booking.passenger.phone}), {width:160})}
    document.getElementById('downloadTicket').addEventListener('click',()=>window.print())
  }

  function pageAdmin(){
    const loginPanel = document.getElementById('loginPanel');
    const adminApp = document.getElementById('adminApp');
    const tripsList = document.getElementById('tripsList');
    const bookingsList = document.getElementById('bookingsList');

    // ensure admin user exists
    const users = get('users',[]);
    if(!users.some(u=>u.username==='admin')){users.push({id:uid('u_'),username:'admin',password:'admin123'});set('users',users)}

    document.getElementById('adminLogin').addEventListener('submit',e=>{
      e.preventDefault();
      const u=document.getElementById('adminUser').value; const p=document.getElementById('adminPass').value;
      const ok = get('users',[]).find(x=>x.username===u&&x.password===p);
      if(!ok) return alert('Invalid credentials');
      loginPanel.style.display='none'; adminApp.style.display='block'; renderAdmin();
    })

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn){
      logoutBtn.addEventListener('click',()=>{
        loginPanel.style.display='block'; adminApp.style.display='none';
        document.getElementById('adminUser').value='';
        document.getElementById('adminPass').value='';
      })
    }

    function renderAdmin(){
      const trips = get('trips',[]);
      tripsList.innerHTML=''; trips.forEach(t=>{
        const r = document.createElement('div'); r.className='trip-row'; 
        r.innerHTML=`
          <div>
            <div style="font-weight: 700;">${t.company}</div>
            <div style="color: var(--muted); font-size: 0.9rem;">${t.from} → ${t.to} | ${t.dep} | ${currency(t.price)}</div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn" data-id="${t.id}" data-action="edit">✏️ Edit</button>
            <button class="btn" data-id="${t.id}" data-action="del">🗑️ Delete</button>
          </div>
        `;
        tripsList.appendChild(r)
      })
      bookingsList.innerHTML=''; get('bookings',[]).forEach(b=>{
        const br = document.createElement('div'); br.className='trip-row'; 
        br.innerHTML=`
          <div>
            <div style="font-weight: 700;">${b.id}</div>
            <div style="color: var(--muted); font-size: 0.9rem;">${b.passenger.name} • ${b.from} → ${b.to} • Seats: ${b.seats.join(', ')}</div>
          </div>
          <div style="color: var(--accent);">${currency(b.price)}</div>
        `;
        bookingsList.appendChild(br)
      })

      // handlers
      tripsList.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',e=>{
        const id = e.currentTarget.dataset.id; const action = e.currentTarget.dataset.action;
        if(action==='del'){
          if(!confirm('Delete this trip?'))return; const list = get('trips',[]).filter(x=>x.id!==id); set('trips',list); renderAdmin();
        }else if(action==='edit'){
          const trips = get('trips',[]); const t = trips.find(x=>x.id===id); const newCompany = prompt('Company name',t.company); if(newCompany!==null){t.company=newCompany; set('trips',trips); renderAdmin()}
        }
      }))
    }

    document.getElementById('addTripBtn').addEventListener('click',()=>{
      const company = prompt('Company name',COMPANIES[0]); if(!company) return;
      const from = prompt('From city',CITIES[0])||CITIES[0]; const to = prompt('To city',CITIES[1])||CITIES[1]; const dep = prompt('Departure time (HH:MM)','08:00')||'08:00'; const dur = prompt('Duration (e.g. 3h)','3h')||'3h'; const price = Number(prompt('Price (DZD)','2000')||2000);
      const trips = get('trips',[]); trips.push({id:uid('trip_'),company,from,to,dep,arr:'',duration:dur,price,available:40,bookedSeats:[]}); set('trips',trips); renderAdmin();
    })
  }

  // Router
  function init(){ seed(); const id = document.body.id;
    if(id==='page-index') pageIndex();
    if(id==='page-results') pageResults();
    if(id==='page-seats') pageSeats();
    if(id==='page-passenger') pagePassenger();
    if(id==='page-ticket') pageTicket();
    if(id==='page-admin') pageAdmin();
  }

  // initialize
  document.addEventListener('DOMContentLoaded',init)
})();
