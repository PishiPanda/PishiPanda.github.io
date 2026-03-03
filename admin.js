document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // UI Panels (TABS)
    const tabFondo = document.querySelector('#dashboardSection > div:nth-child(1)'); // Fondo
    const tabApariencia = document.querySelector('#dashboardSection > div:nth-child(2)'); // Apariencia
    const userManagementTab = document.getElementById('userManagementPanel'); // Usuarios

    // Fondo Elements
    const bgUpload = document.getElementById('bgUpload');
    const bgPreview = document.getElementById('bgPreview');
    const saveBgBtn = document.getElementById('saveBgBtn');
    const resetBgBtn = document.getElementById('resetBgBtn');

    // Web Background Elements (NEW)
    const webBgUpload = document.getElementById('webBgUpload');
    const webBgPreview = document.getElementById('webBgPreview');
    const saveWebBgBtn = document.getElementById('saveWebBgBtn');
    const resetWebBgBtn = document.getElementById('resetWebBgBtn');

    // Theme Config Elements (NEW)
    const logoUpload = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');
    const saveThemeBtn = document.getElementById('saveThemeBtn');
    const resetThemeBtn = document.getElementById('resetThemeBtn');

    // User Management Elements
    const newUsername = document.getElementById('newUsername');
    const newPassword = document.getElementById('newPassword');
    const permBg = document.getElementById('permBg');
    const permTheme = document.getElementById('permTheme');
    const createUserBtn = document.getElementById('createUserBtn');
    const usersList = document.getElementById('userListContainer');

    let currentSessionImageData = null;
    let currentSessionWebBgData = null;
    let currentSessionLogoData = null;
    let currentUserSession = null;

    // --- SYSTEM INIT (USERS) ---
    const DEFAULT_USERS = [
        { username: 'admin', password: 'lasexta_admin', role: 'superadmin', permissions: { bg: true, theme: true } },
        { username: 'unpishipanda', password: 'Angel160902', role: 'superadmin', permissions: { bg: true, theme: true } }
    ];

    function getLocalUsers() {
        const stored = localStorage.getItem('lasexta_users');
        if (!stored) {
            localStorage.setItem('lasexta_users', JSON.stringify(DEFAULT_USERS));
            return DEFAULT_USERS;
        }
        return JSON.parse(stored);
    }

    // --- LOGIN LOGIC ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        const allUsers = getLocalUsers();
        const foundUser = allUsers.find(u => u.username === user && u.password === pass);

        if (foundUser) {
            // Login exitoso
            currentUserSession = foundUser;
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');

            checkExistingBackground();
            loadThemeConfigToAdminUI(); // Added to populate inputs on login
            applyPermissionsToUI(foundUser);
        } else {
            loginError.classList.remove('hidden');
        }
    });

    function applyPermissionsToUI(user) {
        // Superadmin o creador: Ve todo
        if (user.role === 'superadmin') {
            tabFondo.style.display = 'block';
            tabApariencia.style.display = 'block';
            userManagementTab.classList.remove('hidden');
            renderUserList();
            return;
        }

        // Usuarios limitados
        userManagementTab.classList.add('hidden'); // Solo superadmins pueden agregar gente

        if (user.permissions.bg) {
            tabFondo.style.display = 'block';
        } else {
            tabFondo.style.display = 'none';
        }

        if (user.permissions.theme) {
            tabApariencia.style.display = 'block';
        } else {
            tabApariencia.style.display = 'none';
        }

        // Si no tiene ningun permiso, mensaje de error amigable (Fallback)
        if (!user.permissions.bg && !user.permissions.theme) {
            dashboardSection.innerHTML = '<div class="glass-panel" style="text-align: center;"><h3>Tu cuenta no tiene permisos asignados.</h3><a href="index.html" style="color: var(--color-primary);">Volver al inicio</a></div>';
        }
    }

    // --- BACKGROUND LOGIC ---
    function checkExistingBackground() {
        // Banner BG
        const savedBg = localStorage.getItem('customLaSextaBg');
        if (savedBg) {
            bgPreview.src = savedBg;
            bgPreview.style.display = 'block';
        }

        // Web BG
        const savedWebBg = localStorage.getItem('customLaSextaWebBg');
        if (savedWebBg) {
            webBgPreview.src = savedWebBg;
            webBgPreview.style.display = 'block';
        }

        // Theme Logo
        const savedLogo = localStorage.getItem('customLaSextaLogo');
        if (savedLogo) {
            logoPreview.src = savedLogo;
            logoPreview.style.display = 'block';
            currentSessionLogoData = savedLogo;
        }
    }

    function loadThemeConfigToAdminUI() {
        const storedThemeJson = localStorage.getItem('lasexta_theme_config');
        if (storedThemeJson) {
            try {
                const config = JSON.parse(storedThemeJson);
                // Populate Colors
                if (config.colors) {
                    if (config.colors.primary) document.getElementById('themeColorPrimary').value = config.colors.primary;
                    if (config.colors.textShadow) document.getElementById('themeTextShadow').value = config.colors.textShadow;
                    if (config.colors.gradTop) document.getElementById('themeGradTop').value = config.colors.gradTop;
                    if (config.colors.gradMid) document.getElementById('themeGradMid').value = config.colors.gradMid;
                    if (config.colors.gradBot) document.getElementById('themeGradBot').value = config.colors.gradBot;
                    if (config.colors.uiText) document.getElementById('themeUITextColor').value = config.colors.uiText;
                    if (config.colors.siteTitleColor) document.getElementById('themeSiteTitleColor').value = config.colors.siteTitleColor;
                }
                // Populate Texts
                if (config.texts) {
                    if (config.texts.siteTitle !== undefined) document.getElementById('textSiteTitle').value = config.texts.siteTitle;
                    if (config.texts.siteSub !== undefined) document.getElementById('textSiteSub').value = config.texts.siteSub;
                    if (config.texts.inputLabel !== undefined) document.getElementById('textInputLabel').value = config.texts.inputLabel;
                    if (config.texts.btnText !== undefined) document.getElementById('textBtn').value = config.texts.btnText;
                }
                // Populate Social Links
                if (config.social) {
                    if (config.social.linkX !== undefined) document.getElementById('linkX').value = config.social.linkX;
                    if (config.social.linkIg !== undefined) document.getElementById('linkIg').value = config.social.linkIg;
                    if (config.social.linkWeb !== undefined) document.getElementById('linkWeb').value = config.social.linkWeb;
                }
            } catch (e) {
                console.error("Error loading theme config into admin UI", e);
            }
        }
    }

    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentSessionImageData = event.target.result;
            bgPreview.src = currentSessionImageData;
            bgPreview.style.display = 'block';
            saveBgBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    saveBgBtn.addEventListener('click', () => {
        if (currentSessionImageData) {
            try {
                localStorage.setItem('customLaSextaBg', currentSessionImageData);
                alert('¡Fondo guardado con éxito! Ahora puedes volver al generador.');
                saveBgBtn.classList.add('hidden');
            } catch (err) {
                alert('Error al guardar. Puede que la imagen sea muy pesada. Intenta comprimirla antes.');
                console.error(err);
            }
        }
    });

    resetBgBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas volver al fondo por defecto original?')) {
            localStorage.removeItem('customLaSextaBg');
            bgPreview.style.display = 'none';
            bgPreview.src = '';
            currentSessionImageData = null;
            saveBgBtn.classList.add('hidden');
            alert('Fondo restaurado al original.');
        }
    });

    // --- WEB BACKGROUND LOGIC ---
    webBgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentSessionWebBgData = event.target.result;
            webBgPreview.src = currentSessionWebBgData;
            webBgPreview.style.display = 'block';
            saveWebBgBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    saveWebBgBtn.addEventListener('click', () => {
        if (currentSessionWebBgData) {
            try {
                localStorage.setItem('customLaSextaWebBg', currentSessionWebBgData);
                alert('¡Fondo de página web guardado con éxito!');
                saveWebBgBtn.classList.add('hidden');
            } catch (err) {
                alert('Error al guardar. Puede que la imagen sea muy pesada.');
                console.error(err);
            }
        }
    });

    resetWebBgBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas volver al fondo animado web original?')) {
            localStorage.removeItem('customLaSextaWebBg');
            webBgPreview.style.display = 'none';
            webBgPreview.src = '';
            currentSessionWebBgData = null;
            saveWebBgBtn.classList.add('hidden');
            alert('Fondo Web restaurado al original.');
        }
    });

    // --- LOGO UPLOAD LOGIC ---
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentSessionLogoData = event.target.result;
            logoPreview.src = currentSessionLogoData;
            logoPreview.style.display = 'block';
            document.getElementById('textSiteTitle').value = ''; // Clear title if logo is used
        };
        reader.readAsDataURL(file);
    });

    // --- THEME BUILDER LOGIC ---
    saveThemeBtn.addEventListener('click', () => {
        const themeConfig = {
            colors: {
                primary: document.getElementById('themeColorPrimary').value,
                textShadow: document.getElementById('themeTextShadow').value,
                gradTop: document.getElementById('themeGradTop').value,
                gradMid: document.getElementById('themeGradMid').value,
                gradBot: document.getElementById('themeGradBot').value,
                uiText: document.getElementById('themeUITextColor').value,
                siteTitleColor: document.getElementById('themeSiteTitleColor').value
            },
            texts: {
                siteTitle: document.getElementById('textSiteTitle').value,
                siteSub: document.getElementById('textSiteSub').value,
                inputLabel: document.getElementById('textInputLabel').value,
                btnText: document.getElementById('textBtn').value
            },
            social: {
                linkX: document.getElementById('linkX').value,
                linkIg: document.getElementById('linkIg').value,
                linkWeb: document.getElementById('linkWeb').value
            }
        };

        try {
            localStorage.setItem('lasexta_theme_config', JSON.stringify(themeConfig));
            // Save logo separately if it exists or was removed
            if (currentSessionLogoData) {
                localStorage.setItem('customLaSextaLogo', currentSessionLogoData);
            } else {
                localStorage.removeItem('customLaSextaLogo');
            }
            alert('¡Configuración de Textos y Colores guardada! Ve a la página principal para ver los cambios.');
        } catch (err) {
            alert('Error al guardar la configuración.');
            console.error(err);
        }
    });

    resetThemeBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que deseas restaurar la estetica naranja y blanca original?')) {
            localStorage.removeItem('lasexta_theme_config');
            localStorage.removeItem('customLaSextaLogo');
            alert('Configuración original restaurada. Los paneles volverán a sus valores por defecto al recargar.');
            location.reload();
        }
    });

    // --- USER MANAGEMENT LOGIC ---
    createUserBtn.addEventListener('click', () => {
        const username = newUsername.value.trim();
        const password = newPassword.value.trim();

        if (username === '' || password === '') {
            alert('El usuario y contraseña no pueden estar vacíos.');
            return;
        }

        let allUsers = getLocalUsers();
        if (allUsers.find(u => u.username === username)) {
            alert('Este nombre de usuario ya existe.');
            return;
        }

        const newUser = {
            username: username,
            password: password,
            role: 'editor', // No son superadmin, solo editores limitados
            permissions: {
                bg: permBg.checked,
                theme: permTheme.checked
            }
        };

        allUsers.push(newUser);
        localStorage.setItem('lasexta_users', JSON.stringify(allUsers));

        // Reset form
        newUsername.value = '';
        newPassword.value = '';
        alert(`Usuario ${username} creado exitosamente.`);
        renderUserList();
    });

    function renderUserList() {
        const allUsers = getLocalUsers();
        usersList.innerHTML = ''; // Limpiar

        allUsers.forEach((u, index) => {
            const userCard = document.createElement('div');
            userCard.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 8px;';

            let badges = '';
            if (u.role === 'superadmin') {
                badges = '<span style="background:var(--color-primary); color:#fff; padding: 2px 6px; border-radius:4px; font-size:0.7rem;">Super Admin</span>';
            } else {
                if (u.permissions.bg) badges += '<span style="background:#444; color:#fff; padding: 2px 6px; border-radius:4px; font-size:0.7rem; margin-right:4px;">Fondo</span>';
                if (u.permissions.theme) badges += '<span style="background:#444; color:#fff; padding: 2px 6px; border-radius:4px; font-size:0.7rem;">Tema</span>';
            }

            userCard.innerHTML = `
                <div>
                    <strong style="color: #fff;">${u.username}</strong>
                    <div style="margin-top: 4px;">${badges}</div>
                </div>
            `;

            // Opcion de borrar solo a los que no son superadmin
            // Y no puedes borrarte a ti mismo si eres unpishipanda (por seguridad)
            if (u.role !== 'superadmin') {
                const delBtn = document.createElement('button');
                delBtn.innerText = 'X';
                delBtn.style.cssText = 'background: rgba(255,0,0,0.2); color: #ff5555; border: 1px solid rgba(255,0,0,0.5); border-radius: 4px; padding: 0.3rem 0.6rem; cursor: pointer;';
                delBtn.onclick = () => deleteUser(index, u.username);
                userCard.appendChild(delBtn);
            }

            usersList.appendChild(userCard);
        });
    }

    window.deleteUser = function (index, username) {
        if (confirm(`¿Seguro que quieres borrar al usuario ${username}?`)) {
            let allUsers = getLocalUsers();
            allUsers.splice(index, 1);
            localStorage.setItem('lasexta_users', JSON.stringify(allUsers));
            renderUserList();
        }
    };
});
