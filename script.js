const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const convertBtn = document.getElementById("convert-btn");
const resetBtn = document.getElementById("reset-btn");
const resultDiv = document.getElementById("result");
const spinner = document.getElementById("spinner");
const toggleThemeBtn = document.getElementById("toggle-theme");
const historyList = document.getElementById("history-list");
const amountInput = document.getElementById("amount");

const currencies = ["EUR", "USD", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"];
const API_KEY = "b0c9c99a494de4f7b9c509b3";

function populateSelects() {
  currencies.forEach(currency => {
    const optFrom = document.createElement("option");
    optFrom.value = currency;
    optFrom.textContent = currency;
    fromCurrency.appendChild(optFrom);

    const optTo = document.createElement("option");
    optTo.value = currency;
    optTo.textContent = currency;
    toCurrency.appendChild(optTo);
  });

  fromCurrency.value = "EUR";
  toCurrency.value = "USD";
}

function loadHistory() {
  historyList.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("history")) || [];
  history.slice(0, 5).forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.amount} ${item.from} → ${item.result} ${item.to}`;
    historyList.appendChild(li);
  });
}

async function getRate(from) {
  const cacheKey = `rate_${from}`;
  const cache = JSON.parse(localStorage.getItem(cacheKey));
  const now = Date.now();

  if (cache && (now - cache.timestamp) < 3600000) {
    return cache.rates;
  }

  const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`);
  const data = await res.json();
  if (data.result !== "success") throw new Error("API error");

  localStorage.setItem(cacheKey, JSON.stringify({ rates: data.conversion_rates, timestamp: now }));
  return data.conversion_rates;
}

async function convert() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    resultDiv.textContent = "Montant invalide.";
    resultDiv.className = "error";
    return;
  }

  spinner.style.display = "block";
  resultDiv.textContent = "";
  resultDiv.className = "";

  try {
    const rates = await getRate(from);
    const rate = rates[to];
    const result = (amount * rate).toFixed(2);

    resultDiv.innerHTML = `${amount} ${from} = ${result} ${to}<br>Taux : 1 ${from} = ${rate.toFixed(4)} ${to}`;
    resultDiv.className = "success";

    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift({ amount, from, to, result });
    localStorage.setItem("history", JSON.stringify(history));
    loadHistory();
  } catch (err) {
    resultDiv.textContent = "Erreur lors de la conversion.";
    resultDiv.className = "error";
  } finally {
    spinner.style.display = "none";
  }
}

function resetFields() {
  amountInput.value = "";
  resultDiv.textContent = "";
  resultDiv.className = "";
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

function setThemeByTime() {
  const hour = new Date().getHours();
  if (hour < 7 || hour >= 19) {
    document.body.classList.add("dark-mode");
  }
}

amountInput.addEventListener("input", () => {
  if (parseFloat(amountInput.value) > 0) {
    amountInput.style.borderColor = "#4caf50";
  } else {
    amountInput.style.borderColor = "#e74c3c";
  }
});

populateSelects();
loadHistory();
setThemeByTime();

convertBtn.addEventListener("click", convert);
resetBtn.addEventListener("click", resetFields);
toggleThemeBtn.addEventListener("click", toggleTheme);
