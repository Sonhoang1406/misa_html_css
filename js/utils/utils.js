const STORAGE_KEY = 'candidates_demo_v1';


// load từ localStorage
function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error('loadFromStorage error', e);
        return null;
    }
}

// save vào localStorage
function saveToStorage(arr) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
        console.error('saveToStorage error', e);
    }
}

// gen id 
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
/*
  seedFromUrl(url):
  - fetch file JSON (mảng)
  - ensure mỗi item có CandidateID
  - save vào localStorage
  - return mảng
*/
async function seedFromUrl(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        const arr = await res.json();
        if (!Array.isArray(arr)) throw new Error('Data must be array');
        const prepared = arr.map((it, i) => {
            if (!it.CandidateID) it.CandidateID = genId();
            return it;
        });
        saveToStorage(prepared);
        return prepared;
    } catch (err) {
        console.error('seedFromUrl error', err);
        return null;
    }
}

async function ensureSeed(urlOrArray) {
    const cur = loadFromStorage();
    if (cur && Array.isArray(cur)) return cur;
    if (typeof urlOrArray === 'string') {
        const arr = await seedFromUrl(urlOrArray);
        return arr || [];
    } else if (Array.isArray(urlOrArray)) {
        const prepared = urlOrArray.map(it => ({ ...it, CandidateID: it.CandidateID || genId() }));
        saveToStorage(prepared);
        return prepared;
    }
    return [];


}

function escapeHtml(s) {
    if (s === null || s === undefined) return '—';
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString();
}

// function renderTable
function renderTable(data, page = 1, pageSize = 5) {
    const wrap = document.querySelector('.table-wrap');
    if (!wrap) return;

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    totalItems = data.length;
    currentPage = page;
    itemsPerPage = pageSize;

    // Show message if no data found
    if (data.length === 0) {
        wrap.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-content">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h4>Không tìm thấy kết quả</h4>
                    <p>Không có ứng viên nào phù hợp với từ khóa tìm kiếm của bạn</p>
                </div>
            </div>
        `;
        updateTableFooter(0, 0, 0);
        updatePagination(0, page, pageSize);
        return;
    }
    // Build table HTML
    let html = `<table class="candidates-table">
        <thead>
            <tr>
                <th class="col-check"><input type="checkbox" /></th>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Chiến dịch tuyển dụng</th>
                <th>Vị trí tuyển dụng</th>
                <th>Tin tuyển dụng</th>
                <th>Vòng tuyển dụng</th>
                <th>Đánh giá</th>
                <th>Ngày ứng tuyển</th>
                <th>Nguồn ứng viên</th>
                <th>Trình độ đào tạo</th>
                <th>Nơi đào tạo</th>
                <th>Chuyên ngành</th>
                <th>Nơi làm việc gần nhất</th>
                <th>Nhân sự khai thác</th>
                <th>Đơn vị sử dụng</th>
                <th>Phù hợp với chân dung</th>
                <th>Khu vực</th>
                <th>Người giới thiệu</th>
                <th>Thông tin tiếp nhận</th>
                <th>Thuộc kho tiềm năng</th>
                <th>Tài khoản cổng ứng viên</th>
                <th>Thẻ</th>
                <th>Trạng thái</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Địa chỉ</th>
                <th>Lý do loại</th>
                <th>Cộng tác viên</th>
                <th>Ngày tiếp nhận</th>
                <th>Trạng thái mời nhận việc</th>
            </tr>
        </thead>
        <tbody>`;

    paginatedData.forEach(item => {
        const id = item.CandidateID;
        html += `<tr data-id="${escapeHtml(id)}" class="table-row">`;


        html += `<td><input type="checkbox" /></td>`;

        const name = item.CandidateName || '—';
        const initials = (name && name.trim()) ? name.trim().split(/\s+/).slice(-1)[0].slice(0, 1).toUpperCase() : '?';
        const color = item.AvatarColor || '#6c5ce7';
        html += `<td class="d-flex align-items-center">
            <div class="avatar avatar-initials" style="background:${escapeHtml(color)}">${escapeHtml(initials)}</div>
            <div class="name-text">
                ${escapeHtml(name)}<br><span class="sub">Nhân viên</span>
            </div>
        </td>`;

        html += `<td>${escapeHtml(item.Mobile || '—')}</td>`;
        html += `<td>${escapeHtml(item.Email || '—')}</td>`;
        html += `<td>${escapeHtml(item.RecruitmentCampaignNames || '—')}</td>`;
        html += `<td>${escapeHtml(item.JobPositionName || '—')}</td>`;
        html += `<td>${escapeHtml(item.RecruitmentName || '—')}</td>`;
        html += `<td>${escapeHtml(item.RecruitmentRoundName || '—')}</td>`;
        html += `<td>${item.Overall !== null && item.Overall !== undefined ? escapeHtml(item.Overall) : '—'}</td>`;
        html += `<td>${formatDate(item.ApplyDate)}</td>`;
        html += `<td>${escapeHtml(item.ChannelName || '—')}</td>`;
        html += `<td>${escapeHtml(item.EducationDegreeName || '—')}</td>`;
        html += `<td>${escapeHtml(item.EducationPlaceName || '—')}</td>`;
        html += `<td>${escapeHtml(item.EducationMajorName || '—')}</td>`;
        html += `<td>${escapeHtml(item.WorkPlaceRecent || '—')}</td>`;
        html += `<td>${escapeHtml(item.AttractivePersonnel || '—')}</td>`;
        html += `<td>${escapeHtml(item.OrganizationUnitName || '—')}</td>`;
        html += `<td>${item.Overall !== null && item.Overall !== undefined ? escapeHtml(item.Overall) : '—'}</td>`;
        html += `<td>${escapeHtml(item.AreaName || '—')}</td>`;
        html += `<td>${escapeHtml(item.PresenterName || '—')}</td>`;
        html += `<td>${escapeHtml(item.ProbationInfoStatus || '—')}</td>`;
        html += `<td>${item.IsTalentPoolDetail ? 'Có' : '—'}</td>`;
        html += `<td>${escapeHtml(item.AccountPortal || '—')}</td>`;
        html += `<td>${escapeHtml(item.TagInfos || '—')}</td>`;
        html += `<td>${escapeHtml(item.CandidateStatusName || '—')}</td>`;
        html += `<td>${item.Gender === 1 ? 'Nam' : item.Gender === 0 ? 'Nữ' : '—'}</td>`;
        html += `<td>${formatDate(item.Birthday)}</td>`;
        html += `<td>${escapeHtml(item.Address || '—')}</td>`;
        html += `<td>${escapeHtml(item.ReasonRemoved || '—')}</td>`;
        html += `<td>${escapeHtml(item.CollaboratorName || '—')}</td>`;
        html += `<td>${formatDate(item.HireDate)}</td>`;
        html += `<td class="last-cell">${item.OfferStatus === 1 ? 'Đã gửi' : '—'}
            <button class="btn-edit-inline" onclick="openEditCandidateModal('${escapeHtml(id)}')" title="Chỉnh sửa ứng viên">
                <i class="fa-solid fa-pen"></i>
            </button>
        </td>`;

        html += `</tr>`;
    });

    html += '</tbody></table>';
    wrap.innerHTML = html;

    // Update table footer with current count
    updateTableFooter(data.length, startIndex + 1, Math.min(endIndex, data.length));

    // Update pagination
    updatePagination(data.length, page, pageSize);

    // Re-setup table hover events after re-rendering
    if (typeof setupTableHoverEvents === 'function') {
        setupTableHoverEvents();
    }
}

// Update table footer to show current record count
function updateTableFooter(totalCount, startRecord = 1, endRecord = 0) {
    const totalElement = document.querySelector('.table-footer .total strong');
    if (totalElement) {
        totalElement.textContent = totalCount.toLocaleString();
    }

    // Update page info
    const pageInfo = document.querySelector('.table-footer .page-info');
    if (pageInfo) {
        if (totalCount === 0) {
            pageInfo.textContent = '0 bản ghi';
        } else {
            pageInfo.textContent = `${startRecord} - ${endRecord} bản ghi`;
        }
    }
}

// Update pagination controls
function updatePagination(totalCount, currentPage, pageSize) {
    const totalPages = Math.ceil(totalCount / pageSize);

    // Update page size selector
    const pageSizeSelect = document.querySelector('.table-footer select');
    if (pageSizeSelect) {
        pageSizeSelect.value = pageSize;
    }

    // Create pagination controls if they don't exist
    let paginationContainer = document.querySelector('.pagination-controls');
    if (!paginationContainer) {
        const tableFooter = document.querySelector('.table-footer .pager');
        if (tableFooter) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-controls';
            tableFooter.appendChild(paginationContainer);
        }
    }

    if (paginationContainer) {
        let paginationHTML = '';

        if (totalPages > 1) {
            // Previous button
            paginationHTML += `<button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                               onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                               <i class="fa-solid fa-chevron-left"></i>
                              </button>`;


            // Next button
            paginationHTML += `<button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                               onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                               <i class="fa-solid fa-chevron-right"></i>
                              </button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }
}

// Navigate to specific page
function goToPage(page) {
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) return;

    currentPage = page;

    // Re-render table with current data and new page
    if (filteredData.length > 0) {
        renderTable(filteredData, page, itemsPerPage);
    } else {
        const allData = loadFromStorage() || [];
        renderTable(allData, page, itemsPerPage);
    }
}

// Change page size
function changePageSize(newPageSize) {
    itemsPerPage = parseInt(newPageSize);
    currentPage = 1; // Reset to first page

    // Re-render table with new page size
    if (filteredData.length > 0) {
        renderTable(filteredData, 1, itemsPerPage);
    } else {
        const allData = loadFromStorage() || [];
        renderTable(allData, 1, itemsPerPage);
    }
}