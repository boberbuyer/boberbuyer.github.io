// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    setupTheme();
    
    // Initialize the app
    init();
});

// Theme Management
function setupTheme() {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = `theme-${storedTheme}`;
    updateThemeIcons(storedTheme);
    
    // Theme toggle buttons
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleHeader = document.getElementById('theme-toggle-header');
    
    [themeToggleBtn, themeToggleHeader].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', toggleTheme);
        }
    });
}

function toggleTheme() {
    const currentTheme = document.body.className.includes('theme-dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.className = `theme-${newTheme}`;
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
    const themeIcons = document.querySelectorAll('#theme-toggle-btn i, #theme-toggle-header i');
    
    themeIcons.forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
}

// Main Initialization
async function init() {
    showLoader();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load data
    try {
        await Promise.all([
            loadBuyLists(),
            loadRules(),
            loadFaq()
        ]);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
    
    // Initialize UI
    initializeUI();
    
    hideLoader();
}

function setupEventListeners() {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        if (window.innerWidth > 768) {
            mainContent.classList.toggle('sidebar-expanded');
        }
    });
    
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        if (window.innerWidth > 768) {
            mainContent.classList.remove('sidebar-expanded');
        }
    });
    
    // Tab navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            openTab(tabId);
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Region buttons
    document.querySelectorAll('.region-button').forEach(button => {
        button.addEventListener('click', () => {
            const region = button.getAttribute('data-region');
            switchRegion(region);
        });
    });
    
    // Language selector
    const langButton = document.getElementById('current-lang');
    const langDropdown = document.getElementById('lang-dropdown');
    
    langButton.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('active');
    });
    
    langDropdown.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            switchLang(lang);
            langDropdown.classList.remove('active');
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clear-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchItems();
            if (clearSearch) {
                clearSearch.classList.toggle('active', searchInput.value.length > 0);
            }
        });
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchItems();
                clearSearch.classList.remove('active');
            }
        });
    }
    
    // Compact mode toggle
    const compactToggle = document.getElementById('compact-toggle');
    const appContainer = document.querySelector('.app-container');
    
    if (compactToggle && appContainer) {
        compactToggle.addEventListener('click', () => {
            appContainer.classList.toggle('compact-mode');
            
            // Update icon
            const icon = compactToggle.querySelector('i');
            if (icon) {
                if (appContainer.classList.contains('compact-mode')) {
                    icon.className = 'fas fa-expand-alt';
                } else {
                    icon.className = 'fas fa-compress-alt';
                }
            }
            
            // Save preference
            localStorage.setItem('compactMode', appContainer.classList.contains('compact-mode'));
        });
    }
    
    // Modal close
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModal = document.querySelector('.close-modal');
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                hideModal();
            }
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }
    
    // Login functionality
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    const loginPanel = document.getElementById('login-panel');
    const loginIframe = document.getElementById('login-iframe');
    const iframeContainer = document.querySelector('#login .form-iframe-container');
    
    if (loginButton && passwordInput) {
        loginButton.addEventListener('click', checkPassword);
        
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }
    
    function checkPassword() {
        const input = passwordInput.value;
        const ADMIN_PASSWORD = '111';
        
        if (input === ADMIN_PASSWORD) {
            if (loginPanel) loginPanel.style.display = 'none';
            if (iframeContainer) iframeContainer.style.display = 'block';
            if (loginIframe) loginIframe.src = 'panel.html';
            if (errorMessage) errorMessage.style.display = 'none';
        } else {
            if (errorMessage) {
                errorMessage.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
                
                // Hide error message after 3 seconds
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
        }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (langButton && langDropdown && !langButton.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('active');
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
            if (langDropdown) langDropdown.classList.remove('active');
            
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
        if (sidebar && mainContent) {
            if (window.innerWidth > 768) {
                if (sidebar.classList.contains('active')) {
                    mainContent.classList.add('sidebar-expanded');
                } else {
                    mainContent.classList.remove('sidebar-expanded');
                }
            } else {
                mainContent.classList.remove('sidebar-expanded');
            }
        }
    });
}

// Initialize UI
function initializeUI() {
    // Set compact mode from localStorage or default to compact mode
    const compactMode = localStorage.getItem('compactMode');
    const appContainer = document.querySelector('.app-container');
    const compactToggle = document.getElementById('compact-toggle');
    
    if (appContainer && compactToggle) {
        // Default to compact mode if not set
        if (compactMode === null) {
            appContainer.classList.add('compact-mode');
            const icon = compactToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-expand-alt';
            localStorage.setItem('compactMode', 'true');
        } else if (compactMode === 'true') {
            appContainer.classList.add('compact-mode');
            const icon = compactToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-expand-alt';
        } else {
            const icon = compactToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-compress-alt';
        }
    }
    
    // Open default tab
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash) && hash !== 'login') {
        openTab(hash);
    } else {
        openTab('buy-list');
    }
    
    // Set default region
    const currentRegion = 'usa';
    switchRegion(currentRegion);
    
    // Set language
    const currentLang = localStorage.getItem('lang') || 'en';
    switchLang(currentLang);
    
    // Expand sidebar on desktop
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar && mainContent) {
            sidebar.classList.add('active');
            mainContent.classList.add('sidebar-expanded');
        }
    }
    
    // Ensure Links accordion is active on init
    const linksAccordionTitle = document.querySelector('#links .accordion-title');
    const linksAccordionContent = linksAccordionTitle?.nextElementSibling;
    if (linksAccordionTitle && linksAccordionContent) {
        linksAccordionTitle.classList.add('active');
        linksAccordionContent.classList.add('active');
    }
}

// Tab Navigation
function openTab(tabId) {
    // Hide all tabs and remove active class from menu links
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    // Show selected tab and add active class to corresponding menu link
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.classList.add('active');
        const navLink = document.querySelector(`[data-tab="${tabId}"]`);
        if (navLink) navLink.classList.add('active');
    }
    
    // Update URL hash
    window.location.hash = tabId;
    
    // Render content based on tab
    if (tabId === 'rules') renderRules();
    if (tabId === 'pickup') renderFaq();
    if (tabId === 'buy-list') renderBuyLists(currentRegion);
    
    // Ensure Links accordion is always active
    const linksAccordionTitle = document.querySelector('#links .accordion-title');
    const linksAccordionContent = linksAccordionTitle?.nextElementSibling;
    if (linksAccordionTitle && linksAccordionContent) {
        linksAccordionTitle.classList.add('active');
        linksAccordionContent.classList.add('active');
    }
    
    // Hide modal and preview
    hideModal();
    hideHoverPreview();
}

// Language Switching
let currentLang = 'en';

function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    // Update language button
    const langButton = document.getElementById('current-lang');
    if (langButton) {
        langButton.textContent = { 'en': '🇺🇸', 'ru': '🇷🇺', 'ua': '🇺🇦' }[lang];
    }
    
    // Update menu items
    const tabTitles = {
        'buy-list': { en: 'Buy List', ru: 'Скуп Лист', ua: 'Скуп Лист' },
        'rules': { en: 'Rules', ru: 'Правила', ua: 'Правила' },
        'pickup': { en: 'Info & Pickup', ru: 'Инфо и Пикап', ua: 'Інфо та Пікап' },
        'links': { en: 'Links', ru: 'Ссылки', ua: 'Посилання' },
        'form': { en: 'Pickup form', ru: 'Форма на пикап', ua: 'Форма на пикап' },
        'login': { en: 'Login', ru: 'Логин', ua: 'Логін' }
    };
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const tabId = link.getAttribute('data-tab');
        const span = link.querySelector('span');
        if (span && tabId && tabTitles[tabId] && tabTitles[tabId][currentLang]) {
            span.textContent = tabTitles[tabId][currentLang];
        }
    });
    
    // Re-render content
    renderRules();
    renderFaq();
    renderBuyLists(currentRegion);
}

// Region Switching
let currentRegion = 'eu';
let buyListDataEU = null;
let buyListDataUSA = null;
let rulesData = null;
let faqData = null;

function switchRegion(region) {
    currentRegion = region;
    
    // Update UI
    document.querySelectorAll('.region-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.region-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activate selected region
    const regionContent = document.getElementById(`region-${region}`);
    const regionButton = document.querySelector(`.region-button[data-region="${region}"]`);
    if (regionContent) regionContent.classList.add('active');
    if (regionButton) regionButton.classList.add('active');
    
    // Render buy list for selected region
    renderBuyLists(region);
}

function toggleAccordion(element) {
    if (!element) return;
    
    const content = element.nextElementSibling;
    if (!content) return;
    
    // Close all other accordions except the Links accordion
    document.querySelectorAll('.accordion-title, .category-title').forEach(title => {
        if (title !== element && !title.closest('#links')) {
            title.classList.remove('active');
            const nextEl = title.nextElementSibling;
            if (nextEl) nextEl.classList.remove('active');
        }
    });
    
    // Toggle the clicked accordion
    element.classList.toggle('active');
    content.classList.toggle('active');
    
    // Scroll into view if opening (except for Links accordion)
    if (element.classList.contains('active') && !element.closest('#links')) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }
}

// Search Functionality
function searchItems() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const input = searchInput.value.toLowerCase().trim();
    const activeRegionContent = document.querySelector('.region-content.active');
    if (!activeRegionContent) return;
    
    const categoryTables = activeRegionContent.querySelectorAll('.category-table');
    let hasResults = false;
    
    categoryTables.forEach(category => {
        const items = category.querySelectorAll('.item:not(:first-child)'); // Skip header row
        let hasVisibleItems = false;
        
        items.forEach(item => {
            const nameEl = item.querySelector('.item-name');
            const percentageEl = item.querySelector('.item-percentage');
            const descriptionEl = item.querySelector('.item-description');
            
            const name = nameEl ? nameEl.textContent.toLowerCase() : '';
            const percentage = percentageEl ? percentageEl.textContent.toLowerCase() : '';
            const description = descriptionEl ? descriptionEl.textContent.toLowerCase() : '';
            
            const isVisible = name.includes(input) || 
                              percentage.includes(input) || 
                              description.includes(input);
            
            item.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                hasVisibleItems = true;
                hasResults = true;
            }
        });
        
        // Show/hide category based on visible items
        category.style.display = hasVisibleItems ? '' : 'none';
        
        // Expand categories with visible items when searching
        if (hasVisibleItems && input.length > 0) {
            const title = category.querySelector('.category-title');
            const content = title?.nextElementSibling;
            if (title && content) {
                title.classList.add('active');
                content.classList.add('active');
            }
        }
    });
    
    // Show a "no results" message if needed
    const noResultsMsg = activeRegionContent.querySelector('.no-results-message');
    
    if (!hasResults && input.length > 0) {
        if (!noResultsMsg) {
            const message = document.createElement('p');
            message.className = 'no-results-message';
            message.textContent = currentLang === 'en' ? 
                'No items found matching your search.' : 
                'Ничего не найдено по вашему запросу.';
            message.style.padding = 'var(--space-md)';
            message.style.textAlign = 'center';
            message.style.color = 'var(--text-secondary)';
            activeRegionContent.appendChild(message);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Image Preview and Modal
function showHoverPreview(src, alt, event) {
    if (!src) return;
    
    const hoverPreview = document.getElementById('hover-preview');
    const hoverPreviewImage = document.getElementById('hover-preview-image');
    
    if (!hoverPreview || !hoverPreviewImage) return;
    
    hoverPreviewImage.src = src;
    hoverPreviewImage.alt = alt || 'Preview';
    hoverPreview.classList.add('active');
    
    // Position the preview near the cursor
    const x = event.clientX + 20;
    const y = event.clientY + 20;
    
    // Adjust position to keep preview within viewport
    const previewRect = hoverPreview.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let posX = x;
    let posY = y;
    
    if (x + previewRect.width > viewportWidth) {
        posX = x - previewRect.width - 40;
    }
    
    if (y + previewRect.height > viewportHeight) {
        posY = y - previewRect.height - 40;
    }
    
    hoverPreview.style.left = `${posX}px`;
    hoverPreview.style.top = `${posY}px`;
}

function hideHoverPreview() {
    const hoverPreview = document.getElementById('hover-preview');
    if (hoverPreview) {
        hoverPreview.classList.remove('active');
    }
}

function showModal(src, alt) {
    if (!src) return;
    
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalImage = document.getElementById('modal-image');
    
    if (!modalBackdrop || !modalImage) return;
    
    modalImage.src = src;
    modalImage.alt = alt || 'Image';
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Data Loading
async function loadBuyLists() {
    try {
        const [euResponse, usaResponse] = await Promise.all([
            fetch('./eu_buy_list.json', { cache: 'no-store' }).then(res => {
                if (!res.ok) throw new Error(`Failed to load EU buy list: ${res.status}`);
                return res.json();
            }),
            fetch('./us_buy_list.json', { cache: 'no-store' }).then(res => {
                if (!res.ok) throw new Error(`Failed to load USA buy list: ${res.status}`);
                return res.json();
            })
        ]);
        
        buyListDataEU = euResponse;
        buyListDataUSA = usaResponse;
        
        // Normalize data
        [buyListDataEU, buyListDataUSA].forEach(data => {
            if (!Array.isArray(data)) {
                console.error('Invalid buy list data format');
                return;
            }
            data.forEach(category => {
                if (!category.items) return;
                category.items.forEach(item => {
                    item.percentage = item.percentage ?? '';
                    item.imageUrl = item.imageUrl ?? '';
                    item.description = item.description ?? '';
                });
            });
        });
        
        return true;
    } catch (error) {
        console.error('Error loading buy lists:', error);
        const errorMessage = `<p style="color: var(--error); padding: var(--space-md);">Error loading buy list: ${error.message}</p>`;
        const euContainer = document.getElementById('region-eu');
        const usaContainer = document.getElementById('region-usa');
        if (euContainer) euContainer.innerHTML = errorMessage;
        if (usaContainer) usaContainer.innerHTML = errorMessage;
        return false;
    }
}

async function loadRules() {
    try {
        const response = await fetch('rules.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load rules: ${response.status}`);
        }
        rulesData = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading rules:', error);
        const rulesContent = document.getElementById('rules-content');
        if (rulesContent) {
            rulesContent.innerHTML = `<p style="color: var(--error); padding: var(--space-md);">Error loading rules: ${error.message}</p>`;
        }
        return false;
    }
}

async function loadFaq() {
    try {
        const response = await fetch('faq.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to load FAQ: ${response.status}`);
        }
        faqData = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading FAQ:', error);
        const pickupContent = document.getElementById('pickup-content');
        if (pickupContent) {
            pickupContent.innerHTML = `<p style="color: var(--error); padding: var(--space-md);">Error loading FAQ: ${error.message}</p>`;
        }
        return false;
    }
}

// Content Rendering
function renderBuyLists(region) {
    const container = document.getElementById(`region-${region}`);
    if (!container) {
        console.error(`Region container not found: region-${region}`);
        return;
    }
    
    const data = region === 'eu' ? buyListDataEU : buyListDataUSA;
    
    if (!data) {
        container.innerHTML = '<p style="padding: var(--space-md);">Loading buy list...</p>';
        return;
    }
    
    renderItems(data, container);
    
    // Re-apply search filter if there's an active search
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim().length > 0) {
        searchItems();
    }
}

function renderItems(data, container) {
    container.innerHTML = '';
    
    if (!data || !Array.isArray(data)) {
        container.innerHTML = '<p style="padding: var(--space-md);">No data available</p>';
        return;
    }
    
    data.forEach(category => {
        if (!category.category || !Array.isArray(category.items)) {
            console.warn('Invalid category data:', category);
            return;
        }
        
        const categoryTable = document.createElement('div');
        categoryTable.className = 'category-table';
        
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.category;
        categoryTitle.addEventListener('click', () => toggleAccordion(categoryTitle));
        
        const tableContent = document.createElement('div');
        tableContent.className = 'table-content';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'item';
        
        const headerName = document.createElement('div');
        headerName.className = 'header-name';
        headerName.textContent = currentLang === 'en' ? 'Item' : 'Предмет';
        
        const headerPercentage = document.createElement('div');
        headerPercentage.className = 'header-name';
        headerPercentage.textContent = currentLang === 'en' ? 'Fee' : 'Комиссия';
        
        const headerDescription = document.createElement('div');
        headerDescription.className = 'header-name';
        headerDescription.textContent = currentLang === 'en' ? 'Info' : 'Инфо';
        
        const headerImage = document.createElement('div');
        headerImage.className = 'header-name';
        headerImage.textContent = currentLang === 'en' ? 'Photo' : 'Фото';
        
        header.appendChild(headerName);
        header.appendChild(headerPercentage);
        header.appendChild(headerDescription);
        header.appendChild(headerImage);
        tableContent.appendChild(header);
        
        // Create items
        category.items.forEach(item => {
            if (!item.name) {
                console.warn('Invalid item data:', item);
                return;
            }
            
            const itemRow = document.createElement('div');
            itemRow.className = 'item';
            
            const itemName = document.createElement('div');
            itemName.className = 'item-name';
            itemName.textContent = item.name;
            
            const itemPercentage = document.createElement('div');
            itemPercentage.className = 'item-percentage';
            itemPercentage.textContent = item.percentage ? `${item.percentage}%` : '-';
            
            const itemDescription = document.createElement('div');
            itemDescription.className = 'item-description';
            itemDescription.textContent = item.description || '-';
            
            const itemImage = document.createElement('div');
            itemImage.className = 'item-image';
            
            if (item.imageUrl) {
                const img = document.createElement('img');
                img.src = item.imageUrl;
                img.alt = item.name;
                img.addEventListener('error', () => {
                    img.remove();
                    itemImage.textContent = '-';
                });
                img.addEventListener('mouseover', (e) => showHoverPreview(item.imageUrl, item.name, e));
                img.addEventListener('mousemove', (e) => showHoverPreview(item.imageUrl, item.name, e));
                img.addEventListener('mouseout', hideHoverPreview);
                img.addEventListener('click', () => showModal(item.imageUrl, item.name));
                itemImage.appendChild(img);
            } else {
                itemImage.textContent = '-';
            }
            
            itemRow.appendChild(itemName);
            itemRow.appendChild(itemPercentage);
            itemRow.appendChild(itemDescription);
            itemRow.appendChild(itemImage);
            tableContent.appendChild(itemRow);
        });
        
        categoryTable.appendChild(categoryTitle);
        categoryTable.appendChild(tableContent);
        container.appendChild(categoryTable);
    });
    
    if (container.innerHTML === '') {
        container.innerHTML = '<p style="padding: var(--space-md);">No items to display.</p>';
    }
}

function renderRules() {
    if (!rulesData) {
        console.warn('No rules data available');
        return;
    }
    
    const container = document.getElementById('rules-content');
    if (!container) {
        console.error('Rules container not found');
        return;
    }
    
    container.innerHTML = '';
    
    rulesData.sections.forEach(section => {
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        
        const title = document.createElement('div');
        title.className = 'accordion-title';
        title.textContent = section.title[currentLang] || section.title.en;
        title.addEventListener('click', () => toggleAccordion(title));
        
        const content = document.createElement('div');
        content.className = 'accordion-content';
        
        const contentItems = section.content[currentLang] || section.content.en;
        contentItems.forEach(item => {
            const paragraph = document.createElement('p');
            paragraph.textContent = item;
            paragraph.style.marginBottom = 'var(--space-sm)';
            content.appendChild(paragraph);
        });
        
        accordion.appendChild(title);
        accordion.appendChild(content);
        container.appendChild(accordion);
    });
}

function renderFaq() {
    if (!faqData) {
        console.warn('No FAQ data available');
        const container = document.getElementById('pickup-content');
        if (container) {
            container.innerHTML = '<p style="padding: var(--space-md);">FAQ data is currently unavailable.</p>';
        }
        return;
    }

    const container = document.getElementById('pickup-content');
    if (!container) {
        console.error('FAQ container not found');
        return;
    }

    container.innerHTML = '';

    faqData.sections.forEach(section => {
        const accordion = document.createElement('div');
        accordion.className = 'accordion faq-accordion';

        const title = document.createElement('div');
        title.className = 'accordion-title';
        title.textContent = section.title[currentLang] || section.title.en;
        title.addEventListener('click', () => toggleAccordion(title));

        const content = document.createElement('div');
        content.className = 'accordion-content';

        const faqList = document.createElement('div');
        faqList.className = 'faq-list';

        const contentItems = section.content[currentLang] || section.content.en;
        contentItems.forEach(item => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = item;
            faqList.appendChild(faqItem);
        });

        content.appendChild(faqList);
        accordion.appendChild(title);
        accordion.appendChild(content);
        container.appendChild(accordion);
    });
}

// Utility Functions
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    
    setTimeout(() => {
        loader.style.display = 'none';
    }, 300);
}
