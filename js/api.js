window.Luselle = {
  token: () => localStorage.getItem('luselle_token'),
  user: () => { try { return JSON.parse(localStorage.getItem('luselle_user') || 'null'); } catch { return null; } },
  saveAuth(data) { localStorage.setItem('luselle_token', data.token); localStorage.setItem('luselle_user', JSON.stringify(data.user)); },
  clearAuth() { localStorage.removeItem('luselle_token'); localStorage.removeItem('luselle_user'); },
  async api(path, options={}) {
    const headers = { 'Content-Type':'application/json', ...(options.headers||{}) };
    if (this.token()) headers.Authorization = `Bearer ${this.token()}`;
    const response = await fetch(`${window.LUSELLE_API}${path}`, { ...options, headers });
    const data = await response.json().catch(()=>({error:'Respuesta inválida del servidor'}));
    if (!response.ok) { if(response.status===401) this.clearAuth(); throw new Error(data.error || 'Ocurrió un error'); }
    return data;
  },
  money(value) { return value == null ? 'Precio por confirmar' : new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value); },
  date(value) { if(!value) return 'Sin fecha'; const d=new Date(`${value}T12:00:00`); return d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}); },
  escape(value='') { return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  logout() { this.clearAuth(); location.href='login.html'; },
  requireRole(roles) { const u=this.user(); if(!this.token() || !u || !roles.includes(u.role)){ location.href='login.html'; return null; } return u; }
};
