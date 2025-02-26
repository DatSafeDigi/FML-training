document.addEventListener('DOMContentLoaded', function() {
    const employeeId = localStorage.getItem('employeeId'); 
    const searchResults = document.querySelector('#search-results tbody');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (!employeeId) {
        alert('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        window.location.href = 'login.html';
        return;
    }

    loadingSpinner.style.display = 'block';
    searchResults.innerHTML = '';

    fetch('https://script.google.com/macros/s/AKfycbyP_awlpiX4Uk4-QhiyVT6Rjsm9j6oZQm5jca5mCO26kEZWfT1qawwwfqsc2UaIv08AsQ/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'searchEmployee',
            searchText: employeeId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            searchResults.innerHTML = `<tr><td colspan="6">${data.error}</td></tr>`;
        } else {
            displayResults(data.result);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        searchResults.innerHTML = '<tr><td colspan="6">Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.</td></tr>';
    })
    .finally(() => {
        loadingSpinner.style.display = 'none';
    });

    let allResults = []; // Store all results for filtering

    function displayResults(results) {
        allResults = results; // Store the original results
        updateSubjectFilter(results); // Update subject filter options
        applyFilters(); // Apply filters to display results
    }

    function updateSubjectFilter(results) {
        const subjects = [...new Set(results.map(result => result["MÔN HỌC"]))];
        const subjectFilter = document.getElementById('subject-filter');
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const subjectFilter = document.getElementById('subject-filter').value;
        const evaluationFilter = document.getElementById('evaluation-filter').value;
        const validityFilter = document.getElementById('validity-filter').value;
        const dateStart = document.getElementById('date-start').value;
        const dateEnd = document.getElementById('date-end').value;

        const filteredResults = allResults.filter(result => {
            const matchesSubject = !subjectFilter || result["MÔN HỌC"] === subjectFilter;
            const matchesEvaluation = !evaluationFilter || result["ĐÁNH GIÁ"] === evaluationFilter;
            
            // Updated validity filter check
            const matchesValidity = !validityFilter || 
                (result["HIỆU LỰC"] || '').toLowerCase().replace(/\s+/g, ' ').trim() === 
                validityFilter.toLowerCase().replace(/\s+/g, ' ').trim();
            
            let matchesDate = true;
            if (dateStart && dateEnd) {
                const resultDate = new Date(result["NGÀY THỰC HIỆN"]);
                const start = new Date(dateStart);
                const end = new Date(dateEnd);
                matchesDate = resultDate >= start && resultDate <= end;
            }

            return matchesSubject && matchesEvaluation && matchesValidity && matchesDate;
        });

        // Update table with filtered results
        const searchResults = document.querySelector('#search-results tbody');
        searchResults.innerHTML = '';
        filteredResults.forEach(result => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${result["MÔN HỌC"]}</td>
                <td>${result["LẦN THI"]}</td>
                <td>${result["ĐIỂM"]}</td>
                <td>${result["ĐÁNH GIÁ"]}</td>
                <td>${result["NGÀY THỰC HIỆN"]}</td>
                <td>${result["HIỆU LỰC"]}</td>
            `;
            searchResults.appendChild(tr);
        });
    }

    // Add event listeners for filters
    document.getElementById('subject-filter').addEventListener('change', applyFilters);
    document.getElementById('evaluation-filter').addEventListener('change', applyFilters);
    document.getElementById('validity-filter').addEventListener('change', applyFilters);
    document.getElementById('date-start').addEventListener('change', applyFilters);
    document.getElementById('date-end').addEventListener('change', applyFilters);
});
