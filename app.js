const form = document.querySelector('#meal-form');
const receiptList = document.querySelector('#receipt-list');
const receiptTotal = document.querySelector('#receipt-total');
const receiptNote = document.querySelector('#receipt-note');

function formatPrice(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function getChecked(name) {
  return form.querySelector(`input[name="${name}"]:checked`);
}

function updateReceipt() {
  const base = getChecked('base');
  const protein = getChecked('protein');
  const extras = [...form.querySelectorAll('input[name="extras"]:checked')];
  const sauce = form.elements.sauce.selectedOptions[0];
  const notes = form.elements.notes.value.trim();
  const items = [base, protein, ...extras, sauce].filter(Boolean);
  const total = items.reduce((sum, item) => sum + Number(item.dataset.price || 0), 0);

  receiptList.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.value || item.textContent} — ${formatPrice(Number(item.dataset.price || 0))}`;
    receiptList.appendChild(li);
  });

  receiptTotal.textContent = formatPrice(total);
  receiptNote.textContent = notes ? `Consigne : ${notes}` : 'Aucune consigne spéciale.';
}

form.addEventListener('input', updateReceipt);
updateReceipt();
