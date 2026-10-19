
"use strict";

// Primeira versão da interface FinanSys.
// Os valores abaixo são demonstrativos, não são dados reais.
const financeSummary = {
  balance: 0,
  income: 0,
  expenses: 0
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

document.getElementById("balance").textContent =
  currencyFormatter.format(financeSummary.balance);

document.getElementById("income").textContent =
  currencyFormatter.format(financeSummary.income);

document.getElementById("expenses").textContent =
  currencyFormatter.format(financeSummary.expenses);

console.log("FinanSys carregado com sucesso.");
