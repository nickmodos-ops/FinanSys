"use strict";

const route = location.pathname.split("/").pop().toLowerCase();
const page = ({ "index.html":"dashboard", "transacoes.html":"transacoes", "relatorios.html":"relatorios", "metas.html":"metas", "orcamentos.html":"orcamentos", "cartoes.html":"cartoes", "perfil.html":"perfil" })[route] || "dashboard";
const names = { dashboard:"Dashboard", transacoes:"Transações", relatorios:"Relatórios", metas:"Metas financeiras", orcamentos:"Orçamentos", cartoes:"Cartões", perfil:"Personalizar perfil" };
const app = document.querySelector("#app");
const STORAGE_KEY = "finansys-data-v1";
const blankData = { transactions: [], goals: [], budgets: [], cards: [] };
let data;
try { data = { ...blankData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } catch { data = { ...blankData }; }
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const savedProfile = JSON.parse(localStorage.getItem("finansys-profile") || "{}");
const displayName = savedProfile.name || "Meu perfil";
document.title = `FinanSys | ${names[page] || names.dashboard}`;
document.querySelectorAll("[data-page]").forEach((link) => {
  link.classList.toggle("active", link.dataset.page === page);
  if (link.dataset.page === page) link.setAttribute("aria-current", "page");
});
document.querySelector("#profile-name-menu").textContent = displayName;
document.querySelector("#profile-avatar").textContent = displayName.trim().charAt(0).toUpperCase() || "N";

const views = {
  dashboard: `<header class="topbar"><div><p class="eyebrow">VISÃO GERAL</p><h1>Dashboard</h1><p class="subtitle">Acompanhe sua vida financeira.</p></div><a class="user-avatar profile-avatar-link" href="perfil.html" aria-label="Personalizar perfil">${escapeHTML(displayName.charAt(0).toUpperCase())}</a></header>
    <section class="welcome"><div><p class="eyebrow">SEU DINHEIRO, SOB CONTROLE</p><h2>Bem-vindo ao FinanSys.</h2><p>Organize suas finanças e acompanhe seu progresso.</p></div><span class="welcome-symbol" aria-hidden="true">↗</span></section>
    <section class="summary-grid"><article class="summary-card balance-card"><p>Saldo total</p><h2 id="balance">R$ 0,00</h2><span class="card-note">Saldo do mês</span></article><article class="summary-card"><p>Receitas do mês</p><h2 id="income">R$ 0,00</h2><span class="card-note positive">↑ Entradas</span></article><article class="summary-card"><p>Despesas do mês</p><h2 id="expenses">R$ 0,00</h2><span class="card-note negative">↓ Saídas</span></article></section>
    <section class="content-grid"><article class="panel"><div class="panel-heading"><div><h3>Visão financeira</h3><p>Resumo das movimentações</p></div><span class="tag">Este mês</span></div><div class="chart-placeholder"><div class="chart-icon">⌁</div><p>Seu gráfico financeiro aparecerá aqui.</p><small>Adicionaremos gráficos interativos em uma próxima etapa.</small></div></article><article class="panel"><div class="panel-heading"><div><h3>Distribuição do saldo</h3><p>Seu planejamento</p></div></div><div class="empty-state"><div class="empty-icon">◎</div><p>Nenhuma movimentação ainda</p><small>Suas informações aparecerão quando cadastrarmos transações.</small></div></article></section>
    <section class="panel transactions-panel"><div class="panel-heading"><div><h3>Últimas transações</h3><p>Movimentações recentes da sua conta</p></div><a class="tag" href="transacoes.html">Ver transações</a></div><div class="empty-state"><div class="empty-icon">↔</div><p>Seu histórico está vazio</p><small>Em breve você poderá cadastrar receitas e despesas.</small></div></section>`,
  transacoes: transactionPage(),
  relatorios: reportsPage(),
  metas: goalsPage(),
  orcamentos: budgetsPage(),
  cartoes: cardsPage(),
  perfil: `<header class="topbar"><div><p class="eyebrow">MINHA CONTA</p><h1>Personalizar perfil</h1><p class="subtitle">Atualize as informações exibidas no FinanSys.</p></div></header><section class="panel profile-panel"><form id="profile-form" class="profile-form"><label>Nome<input name="name" maxlength="50" required value="${escapeHTML(savedProfile.name || "")}" placeholder="Como devemos chamar você?"></label><label>E-mail<input name="email" type="email" maxlength="100" value="${escapeHTML(savedProfile.email || "")}" placeholder="voce@exemplo.com"></label><button class="primary-button" type="submit">Salvar alterações</button></form></section>`
};
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]); }
function simplePage(title, description, emptyTitle, emptyDescription) { return `<header class="topbar"><div><p class="eyebrow">FINANSYS</p><h1>${title}</h1><p class="subtitle">${description}</p></div></header><section class="panel section-page"><div class="empty-state"><div class="empty-icon">◎</div><h3>${emptyTitle}</h3><small>${emptyDescription}</small></div></section>`; }
function pageHeader(title, subtitle) { return `<header class="topbar"><div><p class="eyebrow">FINANSYS</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div></header>`; }
function reportsPage() { return `${pageHeader("Relatórios","Visualize seus gastos e acompanhe o saldo do período.")}<section class="report-toolbar"><label for="report-month">Período</label><input id="report-month" type="month" value="${dateToday().slice(0,7)}"></section><section class="summary-grid report-summary"><article class="summary-card"><p>Receitas no período</p><h2 id="report-income">R$ 0,00</h2></article><article class="summary-card"><p>Despesas no período</p><h2 id="report-expenses">R$ 0,00</h2></article><article class="summary-card balance-card"><p>Saldo do período</p><h2 id="report-balance">R$ 0,00</h2></article></section><section class="panel report-panel"><div class="panel-heading"><div><h3>Despesas por dia</h3><p>O gráfico soma as despesas registradas em cada data.</p></div><span class="tag" id="report-month-label"></span></div><div class="chart-wrap" id="expense-chart"></div></section><section class="panel health-panel"><div><p class="eyebrow">INDICADOR DO PERÍODO</p><h3 id="health-title">Sem dados</h3><p id="health-description">Cadastre receitas e despesas para ver um resumo.</p></div></section>`; }
function dateToday() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function transactionPage() { return `${pageHeader("Transações","Registre receitas e despesas.")}<section class="panel form-panel"><div class="panel-heading"><div><h3>Entrada de dinheiro</h3><p>Informe de onde veio o valor recebido.</p></div></div><form id="income-form" class="data-form"><label>Origem da entrada<input name="description" required maxlength="60" placeholder="Ex.: Salário, venda, transferência"></label><label>Valor recebido (R$)<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0,00"></label><label>Categoria<input name="category" maxlength="40" placeholder="Ex.: Trabalho"></label><label>Data<input name="date" type="date" required value="${dateToday()}"></label><button class="primary-button" type="submit">Registrar entrada</button></form></section><section class="panel form-panel"><div class="panel-heading"><div><h3>Registrar despesa</h3><p>Informe onde o dinheiro foi gasto.</p></div></div><form id="transaction-form" class="data-form"><label>Descrição<input name="description" required maxlength="60" placeholder="Ex.: Mercado"></label><label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0,00"></label><label>Categoria<input name="category" maxlength="40" placeholder="Ex.: Alimentação"></label><label>Data<input name="date" type="date" required value="${dateToday()}"></label><button class="primary-button" type="submit">Adicionar despesa</button></form></section><section class="panel"><div class="panel-heading"><div><h3>Histórico</h3><p>Movimentações cadastradas</p></div><span class="tag" id="tx-count">0 registros</span></div><div class="table-wrap"><table><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Tipo</th><th>Valor</th><th></th></tr></thead><tbody id="tx-list"></tbody></table></div><p id="tx-empty" class="empty-note">Nenhuma transação cadastrada.</p></section>`; }
function goalsPage() { return `${pageHeader("Metas financeiras","Defina objetivos e acompanhe seu progresso.")}<section class="panel form-panel"><form id="goal-form" class="data-form"><label>Nome da meta<input name="name" required maxlength="60" placeholder="Ex.: Reserva de emergência"></label><label>Valor desejado (R$)<input name="target" type="number" min="0.01" step="0.01" required placeholder="0,00"></label><label>Valor já guardado (R$)<input name="saved" type="number" min="0" step="0.01" value="0"></label><button class="primary-button" type="submit">Adicionar meta</button></form></section><section class="panel"><h3>Minhas metas</h3><div id="goal-list" class="item-list"></div><p id="goal-empty" class="empty-note">Nenhuma meta cadastrada.</p></section>`; }
function budgetsPage() { return `${pageHeader("Orçamentos","Defina limites mensais por categoria.")}<section class="panel form-panel"><form id="budget-form" class="data-form"><label>Categoria<input name="category" required maxlength="40" placeholder="Ex.: Alimentação"></label><label>Limite mensal (R$)<input name="limit" type="number" min="0.01" step="0.01" required placeholder="0,00"></label><button class="primary-button" type="submit">Adicionar orçamento</button></form></section><section class="panel"><h3>Orçamentos deste mês</h3><div id="budget-list" class="item-list"></div><p id="budget-empty" class="empty-note">Nenhum orçamento cadastrado.</p></section>`; }
function cardsPage() { return `${pageHeader("Cartões","Cadastre cartões e acompanhe seus limites.")}<section class="panel form-panel"><form id="card-form" class="data-form"><label>Nome do cartão<input name="name" required maxlength="50" placeholder="Ex.: Cartão principal"></label><label>Últimos 4 dígitos<input name="last4" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="1234"></label><label>Limite (R$)<input name="limit" type="number" min="0.01" step="0.01" required placeholder="0,00"></label><label>Dia de vencimento<input name="due" type="number" min="1" max="31" placeholder="10"></label><button class="primary-button" type="submit">Adicionar cartão</button></form></section><section class="panel"><h3>Meus cartões</h3><div id="card-list" class="item-list"></div><p id="card-empty" class="empty-note">Nenhum cartão cadastrado.</p></section>`; }
app.innerHTML = views[page] || views.dashboard;
function persistData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function removeButton(collection,id) { return `<button class="delete-button" type="button" data-remove="${collection}" data-id="${escapeHTML(id)}">Excluir</button>`; }
function renderData() {
  if(page==="transacoes") { const rows=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)); document.querySelector("#tx-list").innerHTML=rows.map(t=>`<tr><td>${escapeHTML(t.description)}</td><td>${escapeHTML(t.category||"—")}</td><td>${new Date(t.date+"T12:00:00").toLocaleDateString("pt-BR")}</td><td>${t.type==="income"?"Receita":"Despesa"}</td><td class="${t.type}">${t.type==="income"?"+":"−"} ${currency.format(t.amount)}</td><td>${removeButton("transactions",t.id)}</td></tr>`).join(""); document.querySelector("#tx-count").textContent=`${rows.length} ${rows.length===1?"registro":"registros"}`; document.querySelector("#tx-empty").hidden=rows.length>0; }
  if(page==="metas") { document.querySelector("#goal-list").innerHTML=data.goals.map(g=>{const pct=Math.min(100,Math.round(g.saved/g.target*100));return `<article class="saved-card"><div class="saved-heading"><strong>${escapeHTML(g.name)}</strong>${removeButton("goals",g.id)}</div><p>${currency.format(g.saved)} de ${currency.format(g.target)} · ${pct}%</p><progress max="100" value="${pct}"></progress><form class="goal-progress" data-goal="${escapeHTML(g.id)}"><label>Valor guardado<input name="saved" type="number" min="0" step="0.01" value="${g.saved}"></label><button class="secondary-button" type="submit">Atualizar</button></form></article>`}).join(""); document.querySelector("#goal-empty").hidden=data.goals.length>0; }
  if(page==="orcamentos") { document.querySelector("#budget-list").innerHTML=data.budgets.map(b=>{const spent=data.transactions.filter(t=>t.type==="expense"&&t.date.startsWith(dateToday().slice(0,7))&&(t.category||"").toLowerCase()===b.category.toLowerCase()).reduce((sum,t)=>sum+t.amount,0);const pct=Math.min(100,Math.round(spent/b.limit*100));return `<article class="saved-card"><div class="saved-heading"><strong>${escapeHTML(b.category)}</strong>${removeButton("budgets",b.id)}</div><p>Gasto ${currency.format(spent)} de ${currency.format(b.limit)} · ${pct}%</p><progress class="${spent>b.limit?"over-budget":""}" max="100" value="${pct}"></progress></article>`}).join(""); document.querySelector("#budget-empty").hidden=data.budgets.length>0; }
  if(page==="cartoes") { document.querySelector("#card-list").innerHTML=data.cards.map(c=>`<article class="saved-card"><div class="saved-heading"><strong>${escapeHTML(c.name)}</strong>${removeButton("cards",c.id)}</div><p>${c.last4?`Final ${escapeHTML(c.last4)} · `:""}Limite ${currency.format(c.limit)}${c.due?` · Vencimento dia ${escapeHTML(c.due)}`:""}</p></article>`).join(""); document.querySelector("#card-empty").hidden=data.cards.length>0; }
}
function attachAddForm(selector,collection,build) { const form=document.querySelector(selector); if(!form)return; form.addEventListener("submit",event=>{event.preventDefault();const item=build(new FormData(form));if(!item)return;data[collection].push(item);persistData();form.reset();const date=form.querySelector('[name="date"]');if(date)date.value=dateToday();renderData();}); }
attachAddForm("#transaction-form","transactions",f=>({id:crypto.randomUUID(),description:f.get("description").trim(),amount:Number(f.get("amount")),type:"expense",category:f.get("category").trim(),date:f.get("date")}));
attachAddForm("#income-form","transactions",f=>({id:crypto.randomUUID(),description:f.get("description").trim(),amount:Number(f.get("amount")),type:"income",category:f.get("category").trim(),date:f.get("date")}));
attachAddForm("#goal-form","goals",f=>({id:crypto.randomUUID(),name:f.get("name").trim(),target:Number(f.get("target")),saved:Number(f.get("saved")||0)}));
attachAddForm("#budget-form","budgets",f=>({id:crypto.randomUUID(),category:f.get("category").trim(),limit:Number(f.get("limit"))}));
attachAddForm("#card-form","cards",f=>({id:crypto.randomUUID(),name:f.get("name").trim(),last4:f.get("last4").trim(),limit:Number(f.get("limit")),due:f.get("due")}));
document.addEventListener("click",event=>{const button=event.target.closest("[data-remove]");if(!button)return;const collection=button.dataset.remove;data[collection]=data[collection].filter(item=>item.id!==button.dataset.id);persistData();renderData();});
document.addEventListener("submit",event=>{const form=event.target.closest("[data-goal]");if(!form)return;event.preventDefault();const goal=data.goals.find(item=>item.id===form.dataset.goal);if(!goal)return;goal.saved=Number(new FormData(form).get("saved"));persistData();renderData();});
renderData();
function renderReport() {
  if (page !== "relatorios") return;
  const month=document.querySelector("#report-month").value || dateToday().slice(0,7);
  const [year,monthNumber]=month.split("-").map(Number);
  const daysInMonth=new Date(year,monthNumber,0).getDate();
  const transactions=data.transactions.filter(t=>t.date.startsWith(month));
  const income=transactions.filter(t=>t.type==="income").reduce((sum,t)=>sum+t.amount,0);
  const expenses=transactions.filter(t=>t.type==="expense").reduce((sum,t)=>sum+t.amount,0);
  const balance=income-expenses;
  document.querySelector("#report-income").textContent=currency.format(income);
  document.querySelector("#report-expenses").textContent=currency.format(expenses);
  document.querySelector("#report-balance").textContent=currency.format(balance);
  document.querySelector("#report-month-label").textContent=new Date(year,monthNumber-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  const daily=Array(daysInMonth).fill(0);
  transactions.filter(t=>t.type==="expense").forEach(t=>{const day=Number(t.date.slice(8,10));if(day>=1&&day<=daysInMonth)daily[day-1]+=t.amount;});
  const maxValue=Math.max(...daily,1); const axisMax=maxValue===1?100:Math.ceil(maxValue/4/10)*10*4;
  const W=800,H=330,left=64,right=18,top=20,bottom=48,plotW=W-left-right,plotH=H-top-bottom,slot=plotW/daysInMonth,barW=Math.max(2,slot*.66);
  const grid=Array.from({length:5},(_,i)=>{const val=axisMax*(4-i)/4,y=top+plotH*i/4;return `<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" class="chart-gridline"/><text x="${left-8}" y="${y+4}" text-anchor="end" class="chart-axis-label">${Math.round(val)}</text>`}).join("");
  const bars=daily.map((value,index)=>{const height=value/axisMax*plotH,x=left+index*slot+(slot-barW)/2,y=top+plotH-height;const date=`${year}-${String(monthNumber).padStart(2,"0")}-${String(index+1).padStart(2,"0")}`;return `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(value?2:0,height)}" rx="2" class="expense-bar"><title>${new Date(date+"T12:00:00").toLocaleDateString("pt-BR")}: ${currency.format(value)}</title></rect>`}).join("");
  const labels=Array.from({length:daysInMonth},(_,i)=>i+1).filter(d=>d===1||d%5===0||d===daysInMonth).map(d=>`<text x="${left+(d-.5)*slot}" y="${H-16}" text-anchor="middle" class="chart-axis-label">${d}</text>`).join("");
  document.querySelector("#expense-chart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Despesas por dia no mês selecionado">${grid}${bars}${labels}<text x="${W/2}" y="${H-1}" text-anchor="middle" class="chart-axis-label">Dia do mês</text></svg><p class="chart-legend"><span></span> Despesas (R$)</p>`;
  const title=document.querySelector("#health-title"),description=document.querySelector("#health-description"),panel=document.querySelector(".health-panel");
  panel.classList.remove("health-positive","health-warning","health-neutral");
  if(!transactions.length){title.textContent="Sem dados no período";description.textContent="Cadastre receitas e despesas para acompanhar seu fluxo financeiro.";panel.classList.add("health-neutral");}
  else if(balance>0){title.textContent="Saldo positivo";description.textContent=`As receitas superam as despesas em ${currency.format(balance)} neste período.`;panel.classList.add("health-positive");}
  else if(balance<0){title.textContent="Atenção às despesas";description.textContent=`As despesas superam as receitas em ${currency.format(Math.abs(balance))} neste período.`;panel.classList.add("health-warning");}
  else {title.textContent="Entradas e saídas equilibradas";description.textContent="As receitas e despesas registradas têm o mesmo total neste período.";panel.classList.add("health-neutral");}
}
if(page==="relatorios") document.querySelector("#report-month").addEventListener("change",renderReport);
renderReport();
if (page === "dashboard") {
  const month=dateToday().slice(0,7);
  const tx=data.transactions.filter(t=>t.date.startsWith(month));
  const income=tx.filter(t=>t.type==="income").reduce((sum,t)=>sum+t.amount,0);
  const expenses=tx.filter(t=>t.type==="expense").reduce((sum,t)=>sum+t.amount,0);
  document.querySelector("#balance").textContent=currency.format(income-expenses);
  document.querySelector("#income").textContent=currency.format(income);
  document.querySelector("#expenses").textContent=currency.format(expenses);
}
const profileForm = document.querySelector("#profile-form");
if (profileForm) profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(profileForm);
  localStorage.setItem("finansys-profile", JSON.stringify({ name: data.get("name").trim(), email: data.get("email").trim() }));
  location.href = "perfil.html?salvo=1";
});
if (new URLSearchParams(location.search).get("salvo") === "1") {
  const message = document.createElement("p");
  message.className = "success-message";
  message.setAttribute("role", "status");
  message.textContent = "Perfil salvo com sucesso.";
  app.querySelector(".profile-panel")?.prepend(message);
}
