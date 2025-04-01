document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('header nav ul li a');
    const sections = document.querySelectorAll('main section');

    // Function to switch active section
    const switchSection = (targetId) => {
        // Remove active class from all links and sections
        navLinks.forEach(link => link.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        // Add active class to the clicked link
        const activeLink = document.querySelector(`header nav ul li a[href="#${targetId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Add active class to the target section
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
            activeSection.classList.add('active');
        } else {
            // Fallback to dashboard if target not found
            document.querySelector('header nav ul li a[href="#dashboard"]').classList.add('active');
            document.getElementById('dashboard').classList.add('active');
        }
    };

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const targetId = link.getAttribute('href').substring(1); // Get id from href (remove #)
            switchSection(targetId);
        });
    });

    // Initial setup: Ensure the dashboard is active on load (redundant check, good practice)
    if (!document.querySelector('main section.active')) {
        switchSection('dashboard');
    }

    // --- Guest Management Logic ---
    const guestForm = document.getElementById('add-guest-form');
    const guestTableBody = document.getElementById('guest-table-body');
    const searchGuestInput = document.getElementById('search-guest');

    // Function to render the guest list (initially or after changes)
    function renderGuestTable(guests) {
        guestTableBody.innerHTML = ''; // Clear existing rows
        guests.forEach((guest, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', index); // Use index as a simple ID for now
            row.innerHTML = `
                <td>${guest.name}</td>
                <td>${guest.email || '-'}</td>
                <td>${guest.group || '-'}</td>
                <td>${guest.status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm edit-guest"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-guest"><i class="fas fa-trash"></i></button>
                </td>
            `;
            guestTableBody.appendChild(row);
        });
        addTableActionListeners(); // Re-attach listeners after rendering
    }

    // Function to add event listeners to table buttons
    function addTableActionListeners() {
        // Delete Guest Buttons
        document.querySelectorAll('.delete-guest').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const guestName = row.querySelector('td').textContent; // Get name for confirmation
                if (confirm(`Tem certeza que deseja remover "${guestName}" da lista?`)) {
                    const guestId = parseInt(row.getAttribute('data-id'));
                    // In a real app, you'd remove from your data source here
                    console.log(`Deleting guest with ID: ${guestId}`);
                    // For now, just remove the row from the table
                    row.remove();
                    // You might need to re-render or update IDs if using indices
                }
            });
        });

        // Edit Guest Buttons (Placeholder)
        document.querySelectorAll('.edit-guest').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const guestId = parseInt(row.getAttribute('data-id'));
                alert(`Funcionalidade de editar convidado ${guestId} ainda não implementada.`);
                // In a real app, you'd populate the form or open a modal
            });
        });
    }


    // Handle Add Guest Form Submission
    if (guestForm) {
        guestForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newGuest = {
                name: document.getElementById('guest-name').value,
                email: document.getElementById('guest-email').value,
                group: document.getElementById('guest-group').value,
                status: document.getElementById('guest-status').value,
            };

            // In a real app, you'd add this to a persistent data store (e.g., array, localStorage)
            console.log("Adding new guest:", newGuest);

            // Add to table (simple example, doesn't persist)
             const row = document.createElement('tr');
             // Assign a temporary ID - better approach needed for real app
             row.setAttribute('data-id', guestTableBody.children.length);
             row.innerHTML = `
                <td>${newGuest.name}</td>
                <td>${newGuest.email || '-'}</td>
                <td>${newGuest.group || '-'}</td>
                <td>${newGuest.status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm edit-guest"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-guest"><i class="fas fa-trash"></i></button>
                </td>
            `;
            guestTableBody.appendChild(row);
            addTableActionListeners(); // Attach listeners to the new buttons

            guestForm.reset(); // Clear the form
        });
    }

    // Handle Guest Search/Filter
     if (searchGuestInput) {
        searchGuestInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = guestTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const name = row.querySelector('td:first-child').textContent.toLowerCase();
                const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const group = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                if (name.includes(searchTerm) || email.includes(searchTerm) || group.includes(searchTerm)) {
                    row.style.display = ''; // Show row
                } else {
                    row.style.display = 'none'; // Hide row
                }
            });
        });
    }

    // Initial setup for table actions if rows exist on load
    // Initial setup for guest table actions if rows exist on load
    addTableActionListeners();


    // --- Budget Management Logic ---
    const budgetForm = document.getElementById('add-budget-item-form');
    const budgetTableBody = document.getElementById('budget-table-body');
    const searchBudgetInput = document.getElementById('search-budget');
    const totalEstimatedEl = document.getElementById('total-estimated');
    const totalSpentEl = document.getElementById('total-spent');
    const remainingBalanceEl = document.getElementById('remaining-balance');

    // Simple data store for budget items (replace with localStorage or API later)
    let budgetItems = [
        { id: 0, description: "Aluguel Salão", category: "Recepção", estimated: 5000, actual: 5000 },
        { id: 1, description: "Vestido Noiva", category: "Vestuário", estimated: 3000, actual: 2800 }
    ];

    // Helper function to format currency (BRL)
    function formatCurrency(value) {
        return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Function to calculate and update budget summary
    function updateBudgetSummary() {
        const totalEstimated = budgetItems.reduce((sum, item) => sum + (item.estimated || 0), 0);
        const totalSpent = budgetItems.reduce((sum, item) => sum + (item.actual || 0), 0);
        const remainingBalance = totalEstimated - totalSpent;

        totalEstimatedEl.textContent = formatCurrency(totalEstimated);
        totalSpentEl.textContent = formatCurrency(totalSpent);
        remainingBalanceEl.textContent = formatCurrency(remainingBalance);

        // Optional: Add class for negative balance
        remainingBalanceEl.classList.toggle('negative', remainingBalance < 0);
    }


    // Function to render the budget table
    function renderBudgetTable() {
        budgetTableBody.innerHTML = ''; // Clear existing rows
        budgetItems.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            row.innerHTML = `
                <td>${item.description}</td>
                <td>${item.category}</td>
                <td>${formatCurrency(item.estimated)}</td>
                <td>${formatCurrency(item.actual)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm edit-budget"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-budget"><i class="fas fa-trash"></i></button>
                </td>
            `;
            budgetTableBody.appendChild(row);
        });
        addBudgetTableActionListeners(); // Re-attach listeners
        updateBudgetSummary(); // Update summary after rendering
    }

     // Function to add event listeners to budget table buttons
    function addBudgetTableActionListeners() {
        // Delete Budget Item Buttons
        document.querySelectorAll('.delete-budget').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const itemId = parseInt(row.getAttribute('data-id'));
                const itemDescription = row.querySelector('td').textContent;
                if (confirm(`Tem certeza que deseja remover o item "${itemDescription}"?`)) {
                    budgetItems = budgetItems.filter(item => item.id !== itemId);
                    renderBudgetTable(); // Re-render the table and update summary
                }
            });
        });

        // Edit Budget Item Buttons (Placeholder)
        document.querySelectorAll('.edit-budget').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const itemId = parseInt(row.getAttribute('data-id'));
                alert(`Funcionalidade de editar item ${itemId} ainda não implementada.`);
                // In a real app, populate the form or open a modal
            });
        });
    }

    // Handle Add Budget Item Form Submission
    if (budgetForm) {
        budgetForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newItem = {
                // Generate a simple unique ID (replace with better method later)
                id: budgetItems.length > 0 ? Math.max(...budgetItems.map(i => i.id)) + 1 : 0,
                description: document.getElementById('item-description').value,
                category: document.getElementById('item-category').value,
                estimated: parseFloat(document.getElementById('item-estimated-cost').value) || 0,
                actual: parseFloat(document.getElementById('item-actual-cost').value) || 0,
            };

            budgetItems.push(newItem);
            renderBudgetTable(); // Re-render table and update summary
            budgetForm.reset(); // Clear the form
        });
    }

     // Handle Budget Search/Filter
     if (searchBudgetInput) {
        searchBudgetInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = budgetTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const description = row.querySelector('td:first-child').textContent.toLowerCase();
                const category = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                if (description.includes(searchTerm) || category.includes(searchTerm)) {
                    row.style.display = ''; // Show row
                } else {
                    row.style.display = 'none'; // Hide row
                }
            });
        });
    }

    // Initial render of the budget table and summary on load
    // Initial render of the budget table and summary on load
    renderBudgetTable();


    // --- Checklist Management Logic ---
    const taskForm = document.getElementById('add-task-form');
    const taskListUl = document.getElementById('task-list-ul');
    const searchTaskInput = document.getElementById('search-task');
    const filterTaskStatus = document.getElementById('filter-task-status');

    // Simple data store for tasks
    let tasks = [
        { id: 0, description: "Definir data do casamento", category: "Geral", dueDate: "2025-01-15", completed: true },
        { id: 1, description: "Reservar local da recepção", category: "Recepção", dueDate: "2025-03-01", completed: false },
        { id: 2, description: "Contratar fotógrafo", category: "Fornecedores", dueDate: "", completed: false }
    ];

    // Function to render the task list
    function renderTaskList() {
        taskListUl.innerHTML = ''; // Clear existing list
        const searchTerm = searchTaskInput.value.toLowerCase();
        const statusFilter = filterTaskStatus.value;

        const filteredTasks = tasks.filter(task => {
            // Filter by status
            const statusMatch = statusFilter === 'all' ||
                                (statusFilter === 'completed' && task.completed) ||
                                (statusFilter === 'pending' && !task.completed);

            // Filter by search term (description or category)
            const searchMatch = task.description.toLowerCase().includes(searchTerm) ||
                                (task.category && task.category.toLowerCase().includes(searchTerm));

            return statusMatch && searchMatch;
        });


        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            li.setAttribute('data-id', task.id);
            if (task.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-desc">${task.description}</span>
                    ${task.category ? `<span class="task-cat">${task.category}</span>` : ''}
                    ${task.dueDate ? `<span class="task-due">${task.dueDate}</span>` : ''}
                </div>
                <button class="btn btn-danger btn-sm delete-task"><i class="fas fa-trash"></i></button>
            `;
            taskListUl.appendChild(li);
        });

        addTaskActionListeners(); // Re-attach listeners
    }

    // Function to add listeners to task items (checkbox, delete)
    function addTaskActionListeners() {
        // Checkbox listener
        taskListUl.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const li = e.target.closest('.task-item');
                const taskId = parseInt(li.getAttribute('data-id'));
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = e.target.checked;
                    li.classList.toggle('completed', task.completed);
                    // Optionally re-render if filtering is active
                    if (filterTaskStatus.value !== 'all') {
                         renderTaskList();
                    }
                }
            });
        });

        // Delete button listener
        taskListUl.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const li = e.target.closest('.task-item');
                const taskId = parseInt(li.getAttribute('data-id'));
                const taskDescription = li.querySelector('.task-desc').textContent;
                 if (confirm(`Tem certeza que deseja remover a tarefa "${taskDescription}"?`)) {
                    tasks = tasks.filter(t => t.id !== taskId);
                    renderTaskList(); // Re-render the list
                }
            });
        });
    }

    // Handle Add Task Form Submission
    if (taskForm) {
        taskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newTask = {
                id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 0,
                description: document.getElementById('task-description').value,
                category: document.getElementById('task-category').value,
                dueDate: document.getElementById('task-due-date').value,
                completed: false
            };
            tasks.push(newTask);
            renderTaskList();
            taskForm.reset();
        });
    }

    // Handle Task Search Input
    if (searchTaskInput) {
        searchTaskInput.addEventListener('input', renderTaskList);
    }

    // Handle Task Status Filter Change
    if (filterTaskStatus) {
        filterTaskStatus.addEventListener('change', renderTaskList);
    }

    // Initial render of the task list
    // Initial render of the task list
    renderTaskList();


    // --- Vendor Management Logic ---
    const vendorForm = document.getElementById('add-vendor-form');
    const vendorTableBody = document.getElementById('vendor-table-body');
    const searchVendorInput = document.getElementById('search-vendor');

    // Simple data store for vendors
    let vendors = [
        { id: 0, name: "Buffet Alegria", service: "Buffet", contact: "Maria (11) 99999-8888", email: "contato@buffetalegria.com", status: "Contratado", cost: 8000 },
        { id: 1, name: "Foto & Arte", service: "Fotografia", contact: "João Silva", email: "joao@fotoearte.com", status: "Pesquisando", cost: 4500 }
    ];

    // Function to render the vendor table
    function renderVendorTable() {
        vendorTableBody.innerHTML = ''; // Clear existing rows
        const searchTerm = searchVendorInput.value.toLowerCase();

        const filteredVendors = vendors.filter(vendor => {
            return vendor.name.toLowerCase().includes(searchTerm) ||
                   vendor.service.toLowerCase().includes(searchTerm) ||
                   (vendor.contact && vendor.contact.toLowerCase().includes(searchTerm)) ||
                   (vendor.email && vendor.email.toLowerCase().includes(searchTerm));
        });

        filteredVendors.forEach(vendor => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', vendor.id);
            row.innerHTML = `
                <td>${vendor.name}</td>
                <td>${vendor.service}</td>
                <td>${vendor.contact || '-'}</td>
                <td>${vendor.email || '-'}</td>
                <td>${vendor.status}</td>
                <td>${formatCurrency(vendor.cost)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm edit-vendor"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm delete-vendor"><i class="fas fa-trash"></i></button>
                </td>
            `;
            vendorTableBody.appendChild(row);
        });
        addVendorTableActionListeners(); // Re-attach listeners
    }

    // Function to add listeners to vendor table buttons
    function addVendorTableActionListeners() {
        // Delete Vendor Buttons
        document.querySelectorAll('.delete-vendor').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const vendorId = parseInt(row.getAttribute('data-id'));
                const vendorName = row.querySelector('td:first-child').textContent;
                if (confirm(`Tem certeza que deseja remover o fornecedor "${vendorName}"?`)) {
                    vendors = vendors.filter(v => v.id !== vendorId);
                    renderVendorTable(); // Re-render the table
                }
            });
        });

        // Edit Vendor Buttons (Placeholder)
        document.querySelectorAll('.edit-vendor').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const vendorId = parseInt(row.getAttribute('data-id'));
                alert(`Funcionalidade de editar fornecedor ${vendorId} ainda não implementada.`);
                // In a real app, populate the form or open a modal
            });
        });
    }

    // Handle Add Vendor Form Submission
    if (vendorForm) {
        vendorForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newVendor = {
                id: vendors.length > 0 ? Math.max(...vendors.map(v => v.id)) + 1 : 0,
                name: document.getElementById('vendor-name').value,
                service: document.getElementById('vendor-service').value,
                contact: document.getElementById('vendor-contact').value,
                email: document.getElementById('vendor-email').value,
                status: document.getElementById('vendor-status').value,
                cost: parseFloat(document.getElementById('vendor-cost').value) || 0
            };
            vendors.push(newVendor);
            renderVendorTable();
            vendorForm.reset();
        });
    }

    // Handle Vendor Search Input
    if (searchVendorInput) {
        searchVendorInput.addEventListener('input', renderVendorTable);
    }

    // Initial render of the vendor table
    // Initial render of the vendor table
    renderVendorTable();


    // --- Settings & Dashboard Personalization Logic ---
    const settingsForm = document.getElementById('settings-form');
    const weddingDateInput = document.getElementById('wedding-date');
    const couplePhotoUrlInput = document.getElementById('couple-photo-url');
    const timerDisplay = document.getElementById('timer-display');
    const couplePhoto = document.getElementById('couple-photo');
    const noPhotoMessage = document.getElementById('no-photo-message');
    let countdownInterval = null; // To store the interval ID

    // Function to save settings to localStorage
    function saveSettings() {
        const weddingDate = weddingDateInput.value;
        const photoUrl = couplePhotoUrlInput.value;
        localStorage.setItem('weddingDate', weddingDate);
        localStorage.setItem('couplePhotoUrl', photoUrl);
        console.log("Settings saved:", { weddingDate, photoUrl });
        loadSettings(); // Reload settings to update dashboard immediately
        alert("Configurações salvas com sucesso!");
    }

    // Function to load settings from localStorage and update UI
    function loadSettings() {
        const savedDate = localStorage.getItem('weddingDate');
        const savedPhotoUrl = localStorage.getItem('couplePhotoUrl');

        if (savedDate) {
            weddingDateInput.value = savedDate;
            updateCountdown(savedDate);
        } else {
             updateCountdown(null); // Ensure timer shows default if no date
        }

        if (savedPhotoUrl) {
            couplePhotoUrlInput.value = savedPhotoUrl;
            updateCouplePhoto(savedPhotoUrl);
        } else {
            updateCouplePhoto(null); // Ensure photo shows default if no URL
        }
    }

    // Function to update the countdown timer display
    function updateCountdown(targetDateString) {
        if (countdownInterval) {
            clearInterval(countdownInterval); // Clear previous interval
        }

        if (!targetDateString) {
            timerDisplay.textContent = "-- dias, -- horas, -- minutos, -- segundos";
            return;
        }

        const targetDate = new Date(targetDateString + "T00:00:00"); // Assume start of day

        if (isNaN(targetDate.getTime())) {
             timerDisplay.textContent = "Data inválida";
             return;
        }


        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = "O grande dia chegou!";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timerDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }

     // Function to update the couple photo display
    function updateCouplePhoto(photoUrl) {
        if (photoUrl) {
            couplePhoto.src = photoUrl;
            couplePhoto.style.display = 'block'; // Try to show image
            noPhotoMessage.style.display = 'none'; // Hide message initially

            // Handle image loading errors
            couplePhoto.onerror = () => {
                couplePhoto.style.display = 'none'; // Hide broken image icon
                noPhotoMessage.textContent = "Erro ao carregar foto. Verifique a URL.";
                noPhotoMessage.style.display = 'block'; // Show error message
            };
             // Handle successful load (redundant if display is already block, but safe)
             couplePhoto.onload = () => {
                 couplePhoto.style.display = 'block';
                 noPhotoMessage.style.display = 'none';
             }
        } else {
            couplePhoto.src = ''; // Clear src
            couplePhoto.style.display = 'none'; // Hide image element
            noPhotoMessage.textContent = "Adicione uma URL de foto nas Configurações.";
            noPhotoMessage.style.display = 'block'; // Show message
        }
    }

    // Add event listener for settings form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveSettings();
        });
    }

    // Load settings when the page loads
    loadSettings();


    // --- Dark Mode Toggle Logic ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Function to apply the theme based on mode ('light' or 'dark')
    function applyTheme(mode) {
        if (mode === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Change icon to sun
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Change icon to moon
        }
    }

    // Event listener for the toggle button
    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.contains('dark-mode');
        const newMode = isDarkMode ? 'light' : 'dark';
        applyTheme(newMode);
        localStorage.setItem('themeMode', newMode); // Save preference
    });

    // Load saved theme preference on page load
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
        applyTheme(savedMode);
    } else {
        // Optional: Check system preference if no preference saved
        // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        // applyTheme(prefersDark ? 'dark' : 'light');
        applyTheme('light'); // Default to light mode
    }

});

// Placeholder functions (can be removed or implemented later)

function loadBudget() {
    console.log("Loading budget data...");
    // Fetch and display budget data
}

function loadChecklist() {
    console.log("Loading checklist data...");
    // Fetch and display checklist data
}

function loadVendors() {
    console.log("Loading vendor data...");
    // Fetch and display vendor data
}
