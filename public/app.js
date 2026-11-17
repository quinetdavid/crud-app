const form = document.getElementById('item-form');
const itemIdInput = document.getElementById('item-id');
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.getElementById('items-table-body');

const API_URL = '/api/items';

// READ: Fetch and display all items on load
async function fetchItems() {
  const response = await fetch(API_URL);
  const items = await response.json();

  tableBody.innerHTML = '';
  if (items.length === 0) {
    tableBody.innerHTML = '<tr class="empty-row"><td colspan="4">No records yet — add one above.</td></tr>';
    return;
  }
  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.description || '-'}</td>
      <td>
        <button class="edit-btn" onclick="startEdit('${item._id}', '${escapeHtml(item.name)}', '${escapeHtml(item.category)}', '${escapeHtml(item.description || '')}')">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteItem('${item._id}')">🗑️ Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// CREATE & UPDATE: Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = itemIdInput.value;
  const payload = {
    name: nameInput.value,
    category: categoryInput.value,
    description: descriptionInput.value
  };

  if (id) {
    // UPDATE existing record
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    // CREATE new record
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  resetForm();
  fetchItems();
});

// Populate form for editing
function startEdit(id, name, category, description) {
  itemIdInput.value = id;
  nameInput.value = name;
  categoryInput.value = category;
  descriptionInput.value = description;
  submitBtn.textContent = '💾 Save';
  cancelBtn.classList.remove('hidden');
}

// Reset form back to Create mode
function resetForm() {
  form.reset();
  itemIdInput.value = '';
  submitBtn.textContent = '➕ Add';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// DELETE: Remove a record
async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  fetchItems();
}

// Prevent quote issues in inline onclick attributes
function escapeHtml(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Initial load
fetchItems();