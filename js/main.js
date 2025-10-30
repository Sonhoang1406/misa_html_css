
// Global variables
let isEditMode = false;
let editingCandidateId = null;
let currentPage = 1;
let itemsPerPage = 10;
let totalItems = 0;
let filteredData = [];

// Modal Functions
function openAddCandidateModal() {
    isEditMode = false;
    editingCandidateId = null;
    const modal = document.getElementById('addCandidateModal');
    if (modal) {
        // Set title for add mode
        const title = modal.querySelector('.modal-title');
        if (title) {
            title.textContent = 'Thêm ứng viên';
        }

        // Set button text for add mode
        const saveBtn = modal.querySelector('.btn-primary');
        if (saveBtn) {
            saveBtn.textContent = 'Lưu';
        }

        modal.style.display = 'flex';
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

function openEditCandidateModal(candidateId) {
    console.log('Opening edit modal for candidate:', candidateId);

    isEditMode = true;
    editingCandidateId = candidateId;

    const modal = document.getElementById('addCandidateModal');
    if (modal) {
        // Set title for edit mode
        const title = modal.querySelector('.modal-title');
        if (title) {
            title.textContent = 'Chỉnh sửa thông tin ứng viên';
        }

        // Set button text for edit mode
        const saveBtn = modal.querySelector('.btn-primary');
        if (saveBtn) {
            saveBtn.textContent = 'Cập nhật';
        }

        modal.style.display = 'flex';
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Load candidate data with small delay to ensure modal is fully displayed
        setTimeout(() => {
            loadCandidateData(candidateId);
        }, 100);
    }
}

function closeAddCandidateModal() {
    const modal = document.getElementById('addCandidateModal');
    if (modal) {
        modal.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = 'auto';

        // Reset form
        resetAddCandidateForm();

        // Reset edit mode
        isEditMode = false;
        editingCandidateId = null;
    }
}

// Load candidate data into form for editing
function loadCandidateData(candidateId) {
    console.log('Loading candidate data for ID:', candidateId, 'Type:', typeof candidateId);

    const candidates = loadFromStorage() || [];

    // Convert candidateId to number if it's a string, or try both string and number comparison
    const candidate = candidates.find(c =>
        c.CandidateID === candidateId ||
        c.CandidateID === parseInt(candidateId) ||
        c.CandidateID === candidateId.toString()
    );

    if (!candidate) {
        console.error('Candidate not found:', candidateId);
        console.log('Available candidates:', candidates.map(c => ({ id: c.CandidateID, name: c.CandidateName, type: typeof c.CandidateID })));
        return;
    }

    console.log('Found candidate:', candidate);

    const modal = document.getElementById('addCandidateModal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }

    // Clear validation errors first
    clearValidationErrors();

    // Load name
    const nameInput = modal.querySelector('.name-input');
    console.log('Name input element:', nameInput);
    if (nameInput) {
        nameInput.value = candidate.CandidateName || '';
        console.log('Set name to:', candidate.CandidateName);
    }

    // Load birth date (ngày sinh)
    const birthDateInputs = modal.querySelectorAll('.date-input');
    const birthDateInput = birthDateInputs[0]; // First date input is birth date
    console.log('Birth date input element:', birthDateInput);
    if (birthDateInput && candidate.Birthday) {
        const birthDate = new Date(candidate.Birthday);
        const formattedDate = birthDate.toISOString().split('T')[0];
        birthDateInput.value = formattedDate;
        console.log('Set birth date to:', formattedDate);
    }

    // Load gender
    const allSelects = modal.querySelectorAll('.form-select');
    const genderSelect = allSelects[0]; // First select is gender
    console.log('Gender select element:', genderSelect);
    if (genderSelect) {
        if (candidate.Gender === 1) {
            genderSelect.value = 'male';
        } else if (candidate.Gender === 0) {
            genderSelect.value = 'female';
        } else {
            genderSelect.selectedIndex = 0; // Default option
        }
        console.log('Set gender to:', candidate.Gender);
    }

    // Load region
    const regionSelect = modal.querySelector('.input-with-action .form-select');
    console.log('Region select element:', regionSelect);
    if (regionSelect && candidate.AreaName) {
        // Try to find matching option
        const options = regionSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent.includes(candidate.AreaName) || options[i].value === candidate.AreaName) {
                regionSelect.selectedIndex = i;
                break;
            }
        }
        console.log('Set region to:', candidate.AreaName);
    }

    // Load phone
    const phoneInput = modal.querySelector('input[type="tel"]');
    console.log('Phone input element:', phoneInput);
    if (phoneInput) {
        phoneInput.value = candidate.Mobile || '';
        console.log('Set phone to:', candidate.Mobile);
    }

    // Load email
    const emailInput = modal.querySelector('input[type="email"]');
    console.log('Email input element:', emailInput);
    if (emailInput) {
        emailInput.value = candidate.Email || '';
        console.log('Set email to:', candidate.Email);
    }

    // Load address
    const allFormInputs = modal.querySelectorAll('.form-input');
    const addressInput = Array.from(allFormInputs).find(input =>
        input.placeholder && input.placeholder.includes('địa chỉ')
    );
    console.log('Address input element:', addressInput);
    if (addressInput) {
        addressInput.value = candidate.Address || '';
        console.log('Set address to:', candidate.Address);
    }

    // Load apply date (ngày ứng tuyển) 
    const applyDateInput = birthDateInputs[1];
    console.log('Apply date input element:', applyDateInput);
    if (applyDateInput && candidate.ApplyDate) {
        const applyDate = new Date(candidate.ApplyDate);
        const formattedDate = applyDate.toISOString().split('T')[0];
        applyDateInput.value = formattedDate;
        console.log('Set apply date to:', formattedDate);
    }

    // Load source (nguồn ứng viên) 
    if (allSelects.length > 1 && candidate.ChannelName) {
        const sourceSelect = allSelects[1];
        console.log('Source select element:', sourceSelect);
        const sourceOptions = sourceSelect.options;
        for (let i = 0; i < sourceOptions.length; i++) {
            if (sourceOptions[i].textContent.includes(candidate.ChannelName) || sourceOptions[i].value === candidate.ChannelName) {
                sourceSelect.selectedIndex = i;
                break;
            }
        }
        console.log('Set source to:', candidate.ChannelName);
    }

    // Load recruiter (nhân sự khai thác) 
    if (allSelects.length > 2 && candidate.AttractivePersonnel) {
        const recruiterSelect = allSelects[2];
        console.log('Recruiter select element:', recruiterSelect);
        const recruiterOptions = recruiterSelect.options;
        for (let i = 0; i < recruiterOptions.length; i++) {
            if (recruiterOptions[i].textContent.includes(candidate.AttractivePersonnel) || recruiterOptions[i].value === candidate.AttractivePersonnel) {
                recruiterSelect.selectedIndex = i;
                break;
            }
        }
        console.log('Set recruiter to:', candidate.AttractivePersonnel);
    }

    // Load collaborator (cộng tác viên)
    if (allSelects.length > 3 && candidate.CollaboratorName) {
        const collaboratorSelect = allSelects[3];
        console.log('Collaborator select element:', collaboratorSelect);
        const collaboratorOptions = collaboratorSelect.options;
        for (let i = 0; i < collaboratorOptions.length; i++) {
            if (collaboratorOptions[i].textContent.includes(candidate.CollaboratorName) || collaboratorOptions[i].value === candidate.CollaboratorName) {
                collaboratorSelect.selectedIndex = i;
                break;
            }
        }
        console.log('Set collaborator to:', candidate.CollaboratorName);
    }

    console.log('Finished loading candidate data');
}

function resetAddCandidateForm() {
    const modal = document.getElementById('addCandidateModal');
    if (modal) {
        // Clear validation errors first
        clearValidationErrors();

        // Reset all input fields
        const inputs = modal.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="date"]');
        inputs.forEach(input => {
            if (!input.readonly) {
                input.value = '';
            }
        });

        // Reset all select fields
        const selects = modal.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });

        // Reset apply date to current date
        const applyDateInput = modal.querySelector('input[type="date"][value="2025-10-29"]');
        if (applyDateInput) {
            applyDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
}

function saveCandidate() {
    const modal = document.getElementById('addCandidateModal');
    if (!modal) return;

    // Clear previous errors
    clearValidationErrors();

    // Get form data
    const allSelects = modal.querySelectorAll('.form-select');
    const allDateInputs = modal.querySelectorAll('.date-input');
    const allFormInputs = modal.querySelectorAll('.form-input');

    // Find address input
    const addressInput = Array.from(allFormInputs).find(input =>
        input.placeholder && input.placeholder.includes('địa chỉ')
    );

    const formData = {
        name: modal.querySelector('.name-input')?.value.trim() || '',
        birthDate: allDateInputs[0]?.value || '',
        gender: allSelects[0]?.value || '',
        region: modal.querySelector('.input-with-action .form-select')?.value || '',
        phone: modal.querySelector('input[type="tel"]')?.value.trim() || '',
        email: modal.querySelector('input[type="email"]')?.value.trim() || '',
        address: addressInput?.value.trim() || '',
        applyDate: allDateInputs[1]?.value || '',
        source: allSelects[1]?.value || '',
        recruiter: allSelects[2]?.value || '',
        collaborator: allSelects[3]?.value || ''
    };

    // Validation
    const errors = validateCandidateData(formData);
    if (errors.length > 0) {
        displayValidationErrors(errors);
        return;
    }

    // Get existing candidates
    const existingCandidates = loadFromStorage() || [];

    if (isEditMode && editingCandidateId) {
        // Edit mode: update existing candidate
        const candidateIndex = existingCandidates.findIndex(c =>
            c.CandidateID === editingCandidateId ||
            c.CandidateID === parseInt(editingCandidateId) ||
            c.CandidateID === editingCandidateId.toString()
        );

        if (candidateIndex !== -1) {
            const existingCandidate = existingCandidates[candidateIndex];

            // Update candidate object
            const updatedCandidate = {
                ...existingCandidate,
                CandidateName: formData.name,
                Mobile: formData.phone,
                Email: formData.email,
                Gender: formData.gender === 'male' ? 1 : formData.gender === 'female' ? 0 : existingCandidate.Gender,
                Birthday: formData.birthDate ? new Date(formData.birthDate).toISOString() : existingCandidate.Birthday,
                Address: formData.address,
                ApplyDate: formData.applyDate ? new Date(formData.applyDate).toISOString() : existingCandidate.ApplyDate,
                ChannelName: formData.source || existingCandidate.ChannelName,
                AreaName: formData.region || existingCandidate.AreaName,
                AttractivePersonnel: formData.recruiter || existingCandidate.AttractivePersonnel,
                CollaboratorName: formData.collaborator || existingCandidate.CollaboratorName,
                MonthOfBirthday: formData.birthDate ? new Date(formData.birthDate).getMonth() + 1 : existingCandidate.MonthOfBirthday,
                YearOfBirthday: formData.birthDate ? new Date(formData.birthDate).getFullYear() : existingCandidate.YearOfBirthday
            };

            existingCandidates[candidateIndex] = updatedCandidate;

            // Save to localStorage
            saveToStorage(existingCandidates);

            // Re-render table
            filteredData = existingCandidates;
            renderTable(existingCandidates, currentPage, itemsPerPage);

            // Close modal
            closeAddCandidateModal();

            // Show success message
            showSuccessMessage('Đã cập nhật thông tin ứng viên thành công!');
        } else {
            console.error('Candidate not found for editing:', editingCandidateId);
        }
    } else {
        // Add mode: create new candidate
        // Generate avatar color
        const avatarColors = ['#EDC201', '#21AAEA', '#a4cf32', '#64D271', '#AA64E3', '#39C5AB', '#E83950'];
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        // Create new candidate object matching the JSON structure
        const newCandidate = {
            CountTask: null,
            CandidateName: formData.name,
            Mobile: formData.phone,
            Email: formData.email,
            RecruitmentCampaignNames: null,
            JobPositionName: null,
            RecruitmentName: null,
            RecruitmentRoundName: "Ứng tuyển",
            Score: 0.0000,
            ApplyDate: formData.applyDate ? new Date(formData.applyDate).toISOString() : new Date().toISOString(),
            ChannelName: formData.source || null,
            EducationDegreeName: null,
            EducationPlaceName: null,
            EducationMajorName: null,
            WorkPlaceRecent: null,
            AttractivePersonnel: formData.recruiter || null,
            OrganizationUnitName: null,
            Overall: null,
            AreaName: formData.region || null,
            PresenterName: null,
            ProbationInfoStatus: null,
            IsTalentPoolDetail: 0,
            AccountPortal: null,
            TagInfos: null,
            CandidateStatusID: 1,
            Gender: formData.gender === 'male' ? 1 : formData.gender === 'female' ? 0 : null,
            Birthday: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
            Address: formData.address,
            ReasonRemoved: null,
            CollaboratorName: formData.collaborator || null,
            HireDate: null,
            OfferStatus: null,
            RecruitmentChannelID: null,
            CandidateID: genId(),
            RecruitmentID: null,
            Avatar: null,
            AvatarColor: randomColor,
            Active: 1,
            CandidateStatusName: null,
            IsNew: 1,
            IsSelfUpdate: 0,
            IsNewProbationInfo: 0,
            IsSentProbationInfo: 0,
            RecruitmentStatusReal: null,
            RecruitmentStatus: null,
            IsOutOfCapcity: null,
            BirthdayFormat: 3,
            MonthOfBirthday: formData.birthDate ? new Date(formData.birthDate).getMonth() + 1 : 1,
            YearOfBirthday: formData.birthDate ? new Date(formData.birthDate).getFullYear() : 1970,
            IsMultiNews: 0,
            IsEmployee: null,
            CustomInforFields: "{}",
            PresenterOUID: null,
            PresenterOUName: null,
            CandidateType: 0,
            UnreadEmailQuantity: 0,
            EmployeeBlackListIDs: null,
            RecruitmentCampaignIDs: null,
            CandidateConvertID: genId(),
            SentPropose: null,
            UnreadCommentQuantity: 0,
            StatusTrain: null,
            IsSendTrain: null,
            ProposeOfferStatus: null,
            IsDuplicate: 0
        };

        // Add new candidate to the beginning of the array (top of table)
        existingCandidates.unshift(newCandidate);

        // Save to localStorage
        saveToStorage(existingCandidates);

        // Re-render table
        filteredData = existingCandidates;
        renderTable(existingCandidates, currentPage, itemsPerPage);

        // Close modal
        closeAddCandidateModal();

        // Show success message
        showSuccessMessage('Đã thêm ứng viên thành công!');
    }
}

// Validation function
function validateCandidateData(data) {
    const errors = [];

    // Required fields validation
    if (!data.name) {
        errors.push({
            field: 'name',
            message: 'Họ và tên không được để trống'
        });
    }

    // Name format validation
    if (data.name && data.name.length < 2) {
        errors.push({
            field: 'name',
            message: 'Họ và tên phải có ít nhất 2 ký tự'
        });
    }

    // Email validation
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push({
                field: 'email',
                message: 'Email không đúng định dạng'
            });
        }
    }

    // Phone validation
    if (data.phone) {
        const phoneRegex = /^[\d\s\+\-\(\)\.]+$/;
        if (!phoneRegex.test(data.phone)) {
            errors.push({
                field: 'phone',
                message: 'Số điện thoại không đúng định dạng'
            });
        }
    }

    // Date validation
    if (data.birthDate) {
        const birthYear = new Date(data.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        if (birthYear > currentYear || birthYear < (currentYear - 100)) {
            errors.push({
                field: 'birthDate',
                message: 'Ngày sinh không hợp lệ'
            });
        }
    }

    return errors;
}

// Display validation errors
function displayValidationErrors(errors) {
    errors.forEach(error => {
        const field = getFieldElement(error.field);
        if (field) {
            showFieldError(field, error.message);
        }
    });
}

// Clear validation errors
function clearValidationErrors() {
    const modal = document.getElementById('addCandidateModal');
    if (!modal) return;

    const errorElements = modal.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());

    const fieldsWithError = modal.querySelectorAll('.field-error-input');
    fieldsWithError.forEach(field => {
        field.classList.remove('field-error-input');
    });
}

// Get field element by field name
function getFieldElement(fieldName) {
    const modal = document.getElementById('addCandidateModal');
    if (!modal) return null;

    switch (fieldName) {
        case 'name':
            return modal.querySelector('.name-input');
        case 'email':
            return modal.querySelector('input[type="email"]');
        case 'phone':
            return modal.querySelector('input[type="tel"]');
        case 'birthDate':
            return modal.querySelector('.date-input');
        default:
            return null;
    }
}

// Show field error
function showFieldError(field, message) {
    if (!field) return;

    // Add error class to field
    field.classList.add('field-error-input');

    // Create error message element
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;

    // Insert error message after field
    field.parentNode.insertBefore(errorEl, field.nextSibling);
}

// Show success message
function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', function (event) {
    const modal = document.getElementById('addCandidateModal');
    if (modal && event.target === modal) {
        closeAddCandidateModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeAddCandidateModal();
    }
});

(async function init() {
    const seedUrl = 'js/data/candidates.json';
    // Chỉ ensure seed: nếu localStorage rỗng -> load từ file JSON
    await ensureSeed(seedUrl);

    //get data from localStorage
    const candidates = function getData() { return loadFromStorage() || []; }
    // render table with pagination
    const allCandidates = candidates();
    filteredData = allCandidates;
    renderTable(allCandidates, 1, 10);

    // Add event listener to "Thêm ứng viên" button
    const addCandidateBtn = document.querySelector('.btn.primary');
    if (addCandidateBtn && addCandidateBtn.textContent.includes('Thêm ứng viên')) {
        addCandidateBtn.addEventListener('click', openAddCandidateModal);
    }

    // Add real-time validation listeners
    setupValidationListeners();

    // Setup search functionality
    setupSearchFunctionality();

    // Setup fixed edit button
    setupFixedEditButton();

    // Setup table hover events for fixed edit button
    setupTableHoverEvents();
})();

// Setup real-time validation
function setupValidationListeners() {
    // Delay to ensure modal exists
    setTimeout(() => {
        const modal = document.getElementById('addCandidateModal');
        if (!modal) return;

        // Name field validation
        const nameInput = modal.querySelector('.name-input');
        if (nameInput) {
            nameInput.addEventListener('blur', function () {
                validateSingleField('name', this.value.trim());
            });
        }

        // Email field validation
        const emailInput = modal.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', function () {
                validateSingleField('email', this.value.trim());
            });
        }

        // Phone field validation
        const phoneInput = modal.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('blur', function () {
                validateSingleField('phone', this.value.trim());
            });
        }

        // Birth date validation
        const dateInput = modal.querySelector('.date-input');
        if (dateInput) {
            dateInput.addEventListener('change', function () {
                validateSingleField('birthDate', this.value);
            });
        }
    }, 1000);
}

// Validate single field
function validateSingleField(fieldName, value) {
    const field = getFieldElement(fieldName);
    if (!field) return;

    // Clear existing error for this field
    clearFieldError(field);

    // Validate based on field type
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'email':
            if (value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Email không đúng định dạng';
                }
            }
            break;

        case 'phone':
            if (value) {
                const phoneRegex = /^[\d\s\+\-\(\)\.]+$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Số điện thoại không đúng định dạng';
                }
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }
}

// Clear error for specific field
function clearFieldError(field) {
    if (!field) return;

    // Remove error class
    field.classList.remove('field-error-input');

    // Remove error message
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) {
        errorEl.remove();
    }
}

// Make functions available globally for onclick handlers
window.openEditCandidateModal = openEditCandidateModal;
window.goToPage = goToPage;
window.changePageSize = changePageSize;

// Fixed edit button management
let currentHoveredRow = null;
let currentCandidateId = null;

function setupFixedEditButton() {
    const fixedEditBtn = document.getElementById('fixedEditBtn');
    const btnEditFixed = fixedEditBtn?.querySelector('.btn-edit-fixed');

    if (btnEditFixed) {
        btnEditFixed.addEventListener('click', function () {
            if (currentCandidateId) {
                openEditCandidateModal(currentCandidateId);
            }
        });
    }
}

function setupTableHoverEvents() {
    console.log('Setting up table hover events...');
    // Use event delegation for dynamically created table rows
    const tableWrap = document.querySelector('.table-wrap');
    const fixedEditBtn = document.getElementById('fixedEditBtn');

    console.log('tableWrap:', tableWrap, 'fixedEditBtn:', fixedEditBtn);

    if (tableWrap && fixedEditBtn) {
        tableWrap.addEventListener('mouseenter', function (e) {
            const row = e.target.closest('tr[data-id]');
            if (row) {
                console.log('Mouse entered row:', row.getAttribute('data-id'));
                currentHoveredRow = row;
                currentCandidateId = row.getAttribute('data-id');
                fixedEditBtn.classList.add('show');
            }
        }, true);

        tableWrap.addEventListener('mouseleave', function (e) {
            const row = e.target.closest('tr[data-id]');
            if (row) {
                // Check if we're not moving to another row
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !relatedTarget.closest('tr[data-id]')) {
                    currentHoveredRow = null;
                    currentCandidateId = null;
                    fixedEditBtn.classList.remove('show');
                }
            }
        }, true);

        // Hide button when leaving table area completely
        tableWrap.addEventListener('mouseleave', function (e) {
            if (!e.relatedTarget || !tableWrap.contains(e.relatedTarget)) {
                currentHoveredRow = null;
                currentCandidateId = null;
                fixedEditBtn.classList.remove('show');
            }
        });
    }
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-box input[type="text"]');
    if (searchInput) {
        // Add event listeners for real-time search
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keyup', handleSearch);
    }
}

// Debounce function to improve performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const allCandidates = loadFromStorage() || [];

    if (searchTerm === '') {
        // If search is empty, show all candidates
        filteredData = allCandidates;
        renderTable(allCandidates, 1, itemsPerPage);
    } else {
        // Filter candidates based on search term
        const filteredCandidates = searchCandidates(allCandidates, searchTerm);
        filteredData = filteredCandidates;
        renderTable(filteredCandidates, 1, itemsPerPage);
    }

    // Reset to first page when searching
    currentPage = 1;
}
function searchCandidates(candidates, searchTerm) {
    if (!Array.isArray(candidates)) return [];
    const raw = (searchTerm || '').trim();
    if (!raw) return candidates.slice(); // nếu không có searchTerm, trả về toàn bộ

    const searchLower = raw.toLowerCase();
    const searchPhone = raw.replace(/\D/g, '');

    return candidates.filter(candidate => {
        // safe getters
        const name = (candidate.CandidateName || '').toString().toLowerCase();
        const email = (candidate.Email || '').toString().toLowerCase();

        // phone normalized
        const phone = (candidate.Mobile || '').toString().replace(/\D/g, '');

        // tìm theo tên (case-insensitive)
        if (name.includes(searchLower)) return true;

        // tìm theo email (case-insensitive)
        if (email.includes(searchLower)) return true;

        // tìm theo số điện thoại 
        if (searchPhone && phone.includes(searchPhone)) return true;

        return false;
    });
}