// 1. Inisialisasi Elemen HTML
const expenseForm = document.getElementById('expense-form');
const itemNameInput = document.getElementById('item-name');
const itemAmountInput = document.getElementById('item-amount');
const itemCategoryInput = document.getElementById('item-category');
const itemDateInput = document.getElementById('item-date');
const transactionList = document.getElementById('transaction-list');
const totalBalance = document.getElementById('total-balance');

// Elemen Tambahan Fitur Opsional
const spendingLimitInput = document.getElementById('spending-limit');
const limitWarning = document.getElementById('limit-warning');
const balanceSection = document.getElementById('balance-section');
const newCategoryName = document.getElementById('new-category-name');
const addCategoryBtn = document.getElementById('add-category-btn');
const monthFilter = document.getElementById('month-filter');

let myChart = null;

// 2. Ambil Data dari Local Storage (jika kosong, gunakan nilai default)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('customCategories')) || ['Food', 'Transport', 'Fun'];
let budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || 0;

// Set nilai input limit di layar sesuai data local storage
spendingLimitInput.value = budgetLimit > 0 ? budgetLimit : '';

// 3. Fungsi untuk memperbarui pilihan dropdown kategori di HTML
function renderCategories() {
    itemCategoryInput.innerHTML = '<option value="" disabled selected>Select Category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        itemCategoryInput.appendChild(option);
    });
}

// 4. Fungsi mendapatkan data yang sudah difilter berdasarkan bulan (Tantangan 2)
function getFilteredTransactions() {
    const selectedMonth = monthFilter.value;
    if (selectedMonth === 'all') return transactions;

    return transactions.filter(item => {
        // Format tanggal adalah YYYY-MM-DD, kita ambil bagian bulannya (MM)
        const itemMonth = item.date.split('-')[1];
        return itemMonth === selectedMonth;
    });
}

// 5. Fungsi hitung saldo & Beri Highlight Merah jika over-budget (Tantangan 4)
function updateTotalBalance() {
    const filteredData = getFilteredTransactions();
    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
    totalBalance.textContent = `Rp ${total.toLocaleString('id-ID')}`;

    // Cek apakah melewati limit
    if (budgetLimit > 0 && total > budgetLimit) {
        balanceSection.style.backgroundColor = '#fee2e2'; // Ganti background jadi merah muda
        limitWarning.style.display = 'block'; // Munculkan teks peringatan
    } else {
        balanceSection.style.backgroundColor = '#2563eb'; // Kembalikan ke biru default
        limitWarning.style.display = 'none';
    }
}

// 6. Fungsi Menampilkan Daftar Transaksi
function renderTransactions() {
    transactionList.innerHTML = '';
    const filteredData = getFilteredTransactions();

    filteredData.forEach((item) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '10px 0';
        li.style.borderBottom = '1px solid #eee';

        li.innerHTML = `
            <span><strong>${item.name}</strong> (${item.category}) <br><small style="color:#777">${item.date}</small></span>
            <div>
                <span>Rp ${item.amount.toLocaleString('id-ID')}</span>
                <button onclick="deleteTransaction(${item.id})" style="padding: 4px 8px; margin-left: 10px; background-color: #ef4444; font-size: 12px; border: none; color: white; border-radius: 4px; cursor: pointer;">Hapus</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
}

// 7. Fungsi Update Pie Chart secara dinamis
function updateChart() {
    const filteredData = getFilteredTransactions();
    
    // Siapkan object penampung hitungan berdasarkan kategori aktif
    const chartData = {};
    categories.forEach(cat => chartData[cat] = 0);

    filteredData.forEach(item => {
        if (chartData[item.category] !== undefined) {
            chartData[item.category] += item.amount;
        }
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (myChart) myChart.destroy();

    // Generate warna acak untuk kategori kustom agar fleksibel
    const colors = categories.map((_, index) => {
        const defaultColors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'];
        return defaultColors[index] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
    });

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: categories.map(cat => chartData[cat]),
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 8. Event Listener untuk aksi pengguna
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const newTransaction = {
        id: Date.now(),
        name: itemNameInput.value,
        amount: parseFloat(itemAmountInput.value),
        category: itemCategoryInput.value,
        date: itemDateInput.value
    };

    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    expenseForm.reset();
    updateUI();
});

// Aksi Tambah Kategori Kustom (Tantangan 1)
addCategoryBtn.addEventListener('click', function() {
    const catName = newCategoryName.value.trim();
    if (catName && !categories.includes(catName)) {
        categories.push(catName);
        localStorage.setItem('customCategories', JSON.stringify(categories));
        newCategoryName.value = '';
        renderCategories();
        updateChart();
        alert(`Kategori "${catName}" berhasil ditambahkan!`);
    }
});

// Aksi Mengubah Batas Budget (Tantangan 4)
spendingLimitInput.addEventListener('input', function() {
    budgetLimit = parseFloat(spendingLimitInput.value) || 0;
    localStorage.setItem('budgetLimit', budgetLimit);
    updateTotalBalance();
});

// Aksi Mengubah Filter Bulan (Tantangan 2)
monthFilter.addEventListener('change', updateUI);

window.deleteTransaction = function(id) {
    transactions = transactions.filter(item => item.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
};

function updateUI() {
    renderTransactions();
    updateTotalBalance();
    updateChart();
}

// Jalankan Pertama Kali saat Halaman Dibuka
renderCategories();
updateUI();