const form = document.getElementById('item-form');
const tableBody = document.getElementById('items-table-body');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const API_URL = '/api/items';
let items = []; // all records, kept in memory

// ---------- READ ----------
async function fetchItems() {
  items = await (await fetch(API_URL)).json();
  renderTable();
}

function renderTable() {
  tableBody.innerHTML = '';

  if (items.length === 0) {
    tableBody.innerHTML = '<tr class="empty-row"><td colspan="4">No records yet — add one above.</td></tr>';
    return;
  }

  for (const item of items) {
    const row = document.createElement('tr');

    const cells = [item.name, item.category, item.description || '-'].map(text => {
      const td = document.createElement('td');
      td.textContent = text; // safe: no HTML injection
      return td;
    });

    const actions = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️ Edit';
    editBtn.dataset.id = item._id;
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '🗑️ Delete';
    delBtn.dataset.id = item._id;
    actions.append(editBtn, delBtn);

    row.append(...cells, actions);
    tableBody.appendChild(row);
  }
}

// ---------- CREATE / UPDATE ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('item-id').value;
  const payload = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value
  };

  // PUT if editing an existing record, POST otherwise
  await fetch(id ? `${API_URL}/${id}` : API_URL, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  resetForm();
  fetchItems();
});

// ---------- EDIT ----------
tableBody.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('edit-btn')) {
    const item = items.find(i => i._id === id);
    document.getElementById('item-id').value = item._id;
    document.getElementById('name').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('description').value = item.description || '';
    submitBtn.textContent = '💾 Save';
    cancelBtn.classList.remove('hidden');
    document.getElementById('name').focus();
  }

  if (e.target.classList.contains('delete-btn')) {
    deleteItem(id);
  }
});

// ---------- DELETE ----------
async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  fetchItems();
}

// ---------- RESET ----------
function resetForm() {
  form.reset();
  document.getElementById('item-id').value = '';
  submitBtn.textContent = '➕ Add';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// Initial load
fetchItems();