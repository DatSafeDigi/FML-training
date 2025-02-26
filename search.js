const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchText');
const searchResults = document.querySelector('#search-results tbody'); // tbody của bảng
const employeeInfo = document.getElementById('employee-info');
const loadingSpinner = document.getElementById('loading-spinner');

let originalData = []; // Store the original search results

async function handleSearch(event) {
    event.preventDefault();
    console.log('Search initiated');

    const searchInput = document.getElementById('searchText');
    const searchResults = document.querySelector('#search-results tbody');
    const employeeInfo = document.getElementById('employee-info');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (!searchInput || !searchResults || !employeeInfo || !loadingSpinner) {
        console.error('Required elements not found');
        return;
    }

    const searchText = searchInput.value.trim();
    console.log('Searching for:', searchText);

    if (!searchText) {
        alert('Vui lòng nhập mã số nhân viên');
        return;
    }

    try {
        loadingSpinner.style.display = 'block';
        searchResults.innerHTML = '';
        employeeInfo.style.display = 'none';

        const url = 'https://script.google.com/macros/s/AKfycbyP_awlpiX4Uk4-QhiyVT6Rjsm9j6oZQm5jca5mCO26kEZWfT1qawwwfqsc2UaIv08AsQ/exec';
        
        const formData = new FormData();
        formData.append('action', 'searchEmployee');
        formData.append('searchText', searchText);

        console.log('Sending request to:', url);

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response received:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        if (data.result && data.result.length > 0) {
            originalData = [...data.result];
            displayResults(data.result);
            initializeFilters(data.result);
        } else {
            searchResults.innerHTML = '<tr><td colspan="6">Không tìm thấy kết quả.</td></tr>';
            employeeInfo.style.display = 'none';
        }

    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `<tr><td colspan="6">Đã xảy ra lỗi: ${error.message}</td></tr>`;
        employeeInfo.style.display = 'none';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Sửa lại hàm initializeFilters để khởi tạo tất cả các bộ lọc
function initializeFilters(data) {
    const filters = {
        'subject-filter': 'MÔN HỌC',
        'evaluation-filter': 'ĐÁNH GIÁ',
        'validity-filter': 'HIỆU LỰC'
    };

    for (const [filterId, dataField] of Object.entries(filters)) {
        const uniqueValues = [...new Set(data.map(item => item[dataField]))].filter(Boolean);
        const select = document.getElementById(filterId);
        select.innerHTML = '<option value="">Tất cả</option>';
        uniqueValues.sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }
}

function applyFilters() {
    let filteredData = [...originalData];

    const filters = {
        'subject-filter': 'MÔN HỌC',
        'evaluation-filter': 'ĐÁNH GIÁ',
        'validity-filter': 'HIỆU LỰC'
    };

    // Apply dropdown filters
    for (const [filterId, dataField] of Object.entries(filters)) {
        const filterValue = document.getElementById(filterId).value;
        if (filterValue) {
            filteredData = filteredData.filter(item => {
                // Special handling for validity filter
                if (dataField === 'HIỆU LỰC') {
                    const itemValue = (item[dataField] || '').toLowerCase().replace(/\s+/g, ' ').trim();
                    const filterValueLower = filterValue.toLowerCase().replace(/\s+/g, ' ').trim();
                    return itemValue === filterValueLower;
                }
                // Normal handling for other filters
                return item[dataField]?.trim() === filterValue.trim();
            });
        }
    }

    // Apply date range filter
    const dateStart = document.getElementById('date-start').value;
    const dateEnd = document.getElementById('date-end').value;
    if (dateStart && dateEnd) {
        const startDate = new Date(dateStart);
        const endDate = new Date(dateEnd);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        filteredData = filteredData.filter(item => {
            const itemDate = new Date(item["NGÀY THỰC HIỆN"]);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    displayResults(filteredData);
}

function resetFilters() {
    document.getElementById('subject-filter').value = '';
    document.getElementById('evaluation-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('date-start').value = '';
    document.getElementById('date-end').value = '';
    
    // Thêm logging để debug
    console.log('Filters reset');
    console.log('Original data:', originalData);
    
    displayResults(originalData);
}

// Xóa event listener cho nút apply filters vì đã bỏ nút này
// document.getElementById('apply-filters').addEventListener('click', applyFilters);

// Chỉ giữ lại event listener cho nút reset
document.getElementById('reset-filters').addEventListener('click', resetFilters);

function displayResults(results) {
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<tr><td colspan="6">Không có dữ liệu.</td></tr>';
        employeeInfo.style.display = 'none';
        return;
    }

    // Hiển thị thông tin nhân viên
    employeeInfo.style.display = 'block';
    
    const employeeName = document.getElementById('employee-name');
    const employeeId = document.getElementById('employee-id');
    const employeePosition = document.getElementById('employee-position');

    if (results[0]) {
        employeeName.textContent = results[0]["TÊN NHÂN VIÊN"] || 'N/A';
        employeeId.textContent = results[0]["MÃ NV"] || 'N/A';
        employeePosition.textContent = results[0]["NGÀNH ĐÀO TẠO"] || 'N/A';
    }

    // Xóa kết quả cũ và hiển thị kết quả mới
    searchResults.innerHTML = '';
    
    results.forEach(result => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${result["MÔN HỌC"] || ''}</td>
            <td>${result["LẦN THI"] || ''}</td>
            <td>${result["ĐIỂM"] || ''}</td>
            <td>${result["ĐÁNH GIÁ"] || ''}</td>
            <td>${result["NGÀY THỰC HIỆN"] || ''}</td>
            <td>${result["HIỆU LỰC"] || ''}</td>
        `;
        searchResults.appendChild(tr);
    });
}

// Cập nhật setupFilterListeners để tự động áp dụng filter khi thay đổi
function setupFilterListeners() {
    const filters = [
        'subject-filter',
        'evaluation-filter',
        'status-filter',
        'date-start',
        'date-end'
    ];
    
    filters.forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', () => {
            applyFilters(); // Tự động áp dụng filter khi có thay đổi
        });
    });
}

// Cleanup and simplify the event listeners setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Initializing search functionality');
    
    // Get form reference
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchText');
    
    if (!searchForm || !searchInput) {
        console.error('Required elements not found:', {
            searchForm: !!searchForm,
            searchInput: !!searchInput
        });
        return;
    }

    // Remove any existing listeners and add new one
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form submission
        console.log('Search form submitted');
        handleSearch(e);
    });

    // Setup filter listeners
    setupFilterListeners();
});

// Xóa event listener cũ và thêm mới
document.addEventListener('DOMContentLoaded', function() {
    if (searchForm) {
        // Xóa tất cả event listener cũ
        searchForm.replaceWith(searchForm.cloneNode(true));
        
        // Lấy lại reference mới sau khi clone
        const newSearchForm = document.getElementById('searchForm');
        
        // Thêm event listener mới
        newSearchForm.addEventListener('submit', handleSearch);
        
        // Thiết lập các filter listeners
        setupFilterListeners();
    } else {
        console.error('Search form not found');
    }
});

// Gắn sự kiện submit cho form
searchForm.addEventListener('submit', handleSearch);
