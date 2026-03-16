const API_URL = "https://script.google.com/macros/s/AKfycbxbEwGdAbrcXmtlKKZQ19iZ5i5izSHMKEi5b1ZCTKfI2xT24Ng3oXSpEZU2sGmiCvHYHA/exec";
let allStudents = [];
let isEditMode = false;

async function loadData() {
    const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'getStudents' }) });
    const result = await response.json();
    if (result.status === 'success') {
        allStudents = result.data;
        renderTable(allStudents);
        updateRoomFilter();
    }
}

function renderTable(data) {
    const tbody = document.getElementById('student-list-body');
    tbody.innerHTML = data.map(s => `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-6 py-4 font-medium text-slate-700">${s.student_id}</td>
            <td class="px-6 py-4 text-slate-600">${s.name}</td>
            <td class="px-6 py-4 text-slate-500 text-sm">${s.department} (${s.level})</td>
            <td class="px-6 py-4 text-slate-500">${s.room}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="editStudent('${s.student_id}')" class="text-blue-500 hover:text-blue-700 mx-2">แก้ไข</button>
                <button onclick="deleteStudent('${s.student_id}')" class="text-red-500 hover:text-red-700 mx-2">ลบ</button>
            </td>
        </tr>
    `).join('');
}

function openModal() {
    isEditMode = false;
    document.getElementById('modal-title').innerText = "เพิ่มนักเรียน";
    document.getElementById('m-id').disabled = false;
    clearModal();
    document.getElementById('student-modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('student-modal').classList.add('hidden'); }

function editStudent(id) {
    isEditMode = true;
    const s = allStudents.find(item => item.student_id.toString() === id.toString());
    document.getElementById('m-id').value = s.student_id;
    document.getElementById('m-id').disabled = true;
    document.getElementById('m-name').value = s.name;
    document.getElementById('m-level').value = s.level;
    document.getElementById('m-room').value = s.room;
    document.getElementById('m-dept').value = s.department;
    document.getElementById('modal-title').innerText = "แก้ไขข้อมูลนักเรียน";
    document.getElementById('student-modal').classList.remove('hidden');
}

async function saveStudent() {
    const data = {
        student_id: document.getElementById('m-id').value,
        name: document.getElementById('m-name').value,
        level: document.getElementById('m-level').value,
        room: document.getElementById('m-room').value,
        department: document.getElementById('m-dept').value
    };
    
    const action = isEditMode ? 'updateStudent' : 'addStudent';
    const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: action, data: data }) });
    const res = await response.json();
    if(res.status === 'success') {
        alert(res.message);
        closeModal();
        loadData();
    }
}

async function deleteStudent(id) {
    if(!confirm("ยืนยันการลบนักเรียนรหัส " + id + " ใช่หรือไม่?")) return;
    const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteStudent', student_id: id }) });
    const res = await response.json();
    if(res.status === 'success') { loadData(); }
}

function clearModal() {
    ['m-id', 'm-name', 'm-level', 'm-room', 'm-dept'].forEach(id => document.getElementById(id).value = '');
}

// ระบบ Search
document.getElementById('search-input').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allStudents.filter(s => s.name.toLowerCase().includes(val) || s.student_id.toString().includes(val));
    renderTable(filtered);
});

loadData();