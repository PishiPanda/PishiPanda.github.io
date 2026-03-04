// Configuración del Canvas (Tamaño Portada Twitter)
const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 500;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bannerCanvas');
    const ctx = canvas.getContext('2d');    // --- MULTI-LANGUAGE DICTIONARY ---
    const translations = {
        es: {
            siteSubtitle: "Personaliza tu banner de Twitter al instante",
            inputLabel: "Tu Nombre",
            inputPlaceholder: "Escribe tu nombre aquí",
            colorLabel: "Color del Texto",
            countryLabel: "Selecciona tu Región",
            downloadBtn: "Descargar Banner",
            previewLabel: "VISTA PREVIA (1500x500 px)",
            defaultName: "TU NOMBRE",
            mx: "México", ar: "Argentina", br: "Brasil"
        },
        en: {
            siteSubtitle: "Customize your Twitter banner instantly",
            inputLabel: "Your Name",
            inputPlaceholder: "Type your name here",
            colorLabel: "Text Color",
            countryLabel: "Select your Region",
            downloadBtn: "Download Banner",
            previewLabel: "PREVIEW (1500x500 px)",
            defaultName: "YOUR NAME",
            mx: "Mexico", ar: "Argentina", br: "Brazil"
        },
        pt: {
            siteSubtitle: "Personalize seu banner do Twitter instantaneamente",
            inputLabel: "Seu Nome",
            inputPlaceholder: "Digite seu nome aqui",
            colorLabel: "Cor do Texto",
            countryLabel: "Selecione sua Região",
            downloadBtn: "Baixar Banner",
            previewLabel: "PRÉ-VISUALIZAÇÃO (1500x500 px)",
            defaultName: "SEU NOME",
            mx: "México", ar: "Argentina", br: "Brasil"
        }
    };

    let currentLang = localStorage.getItem('lasexta_lang') || 'es';

    // UI Elements
    const nameInput = document.getElementById('nameInput');
    const bannerColorPicker = document.getElementById('bannerColorPicker');
    const colorHexDisplay = document.getElementById('colorHexDisplay');
    const downloadBtn = document.getElementById('downloadBtn');

    // Variables para configuración global
    let customBgImage = null;
    let customBgLoaded = false;
    let countryBgImages = {};
    let currentCountry = 'default'; // 'mx', 'ar', 'br', 'ec', 'col', 'vzla', 'cl', 'pe', 'esp', or 'default'

    // Attempt to preload country images
    ['mx', 'ar', 'br', 'ec', 'col', 'vzla', 'cl', 'pe', 'esp'].forEach(country => {
        const img = new Image();
        img.src = `bg_${country}.png`;
        img.onload = () => { countryBgImages[country] = img; };
    });

    // Also reload the generic default one just to ensure it's loaded as fallback
    let defaultBgImage = new Image();
    let defaultBgLoaded = false;
    defaultBgImage.onload = () => {
        defaultBgLoaded = true;
        countryBgImages['default'] = defaultBgImage;
        if (ctx) drawBanner(nameInput ? nameInput.value : 'Tu Nombre');
    };
    defaultBgImage.src = 'bg_mx.png'; // Usar un banner real por defecto

    let globalThemeConfig = {
        gradTop: '#ff9900',
        gradMid: '#ff4400',
        gradBot: '#990000',
        textShadow: 'rgba(255, 50, 0, 0.8)'
    };

    // --- APPLY THEME CONFIG & DOM INJECTIONS ---
    function applyGlobalTheme() {
        // 1. Web Background Image
        const savedWebBg = localStorage.getItem('customLaSextaWebBg');
        if (savedWebBg) {
            // Check if we are in index.html, it uses esports-bg
            const esportsBg = document.querySelector('.esports-bg');
            if (esportsBg) {
                // To replace the ::before pseudo-element background, we can inject a style tag
                const style = document.createElement('style');
                style.innerHTML = `.esports-bg::before { background-image: url('${savedWebBg}') !important; opacity: 0.12 !important; }`;
                document.head.appendChild(style);
            }
        }

        // 2. Load Color/Text Config JSON
        const rawConfig = localStorage.getItem('lasexta_theme_config');
        if (rawConfig) {
            try {
                const config = JSON.parse(rawConfig);

                // CSS Variables
                document.documentElement.style.setProperty('--color-primary', config.colors.primary);

                // Convert hex to rgb for flares
                const hex = config.colors.primary.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                document.documentElement.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);

                document.documentElement.style.setProperty('--color-text-main', config.colors.uiText);
                document.documentElement.style.setProperty('--color-site-title', config.colors.siteTitleColor || '#ffffff');

                // DOM Texts
                const siteTitle = document.getElementById('siteTitle');
                if (siteTitle && config.texts.siteTitle) siteTitle.innerText = config.texts.siteTitle;

                const siteSubtitle = document.getElementById('siteSubtitle');
                if (siteSubtitle && config.texts.siteSub) siteSubtitle.innerText = config.texts.siteSub;

                const inputLabel = document.getElementById('inputLabel');
                if (inputLabel && config.texts.inputLabel) inputLabel.innerText = config.texts.inputLabel;

                const downloadBtnText = document.getElementById('downloadBtnText');
                if (downloadBtnText && config.texts.btnText) downloadBtnText.innerText = config.texts.btnText;

                // Sync Javascript Variables for Canvas
                globalThemeConfig.gradTop = config.colors.gradTop || globalThemeConfig.gradTop;
                globalThemeConfig.gradMid = config.colors.gradMid || globalThemeConfig.gradMid;
                globalThemeConfig.gradBot = config.colors.gradBot || globalThemeConfig.gradBot;

                // Convert hex shadow to rgba
                const sHex = config.colors.textShadow.replace('#', '');
                const sr = parseInt(sHex.substring(0, 2), 16);
                const sg = parseInt(sHex.substring(2, 4), 16);
                const sb = parseInt(sHex.substring(4, 6), 16);
                globalThemeConfig.textShadow = `rgba(${sr}, ${sg}, ${sb}, 0.8)`;

            } catch (e) {
                console.error("Error parsing theme config", e);
            }
        }

        // 3. Web Logo Upload (Overwrites siteTitle text if it exists)
        const savedLogo = localStorage.getItem('customLaSextaLogo');
        if (savedLogo) {
            const siteTitle = document.getElementById('siteTitle');
            if (siteTitle) {
                siteTitle.innerHTML = `<img src="${savedLogo}" alt="La Sexta Logo" style="max-height: 48px; width: auto; object-fit: contain;">`;
            }
        }
    }

    // Call it before canvas drawing
    applyGlobalTheme();

    // PURGAR FONDOS DE PRUEBA DEL ADMIN QUE ESTAN BLOQUEANDO A LOS PAISES
    localStorage.removeItem('customLaSextaBg');
    customBgImage = null;
    customBgLoaded = false;

    // Country selection listeners
    const countryBtns = document.querySelectorAll('.country-btn');
    countryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active from all
            countryBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            const targetBtn = e.target.closest('.country-btn');
            targetBtn.classList.add('active');

            // Set current country state and redraw
            currentCountry = targetBtn.getAttribute('data-country');
            if (ctx) drawBanner(nameInput.value);
        });
    });

    // Inicializar tamaño interno del canvas para máxima calidad
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Precargar fuente esperando a que esté disponible
    document.fonts.ready.then(() => {
        drawBanner(nameInput.value || 'Tu Nombre');
    });

    // --- SISTEMA DE TRADUCCION NUEVO Y SEGURO ---
    window.setLanguage = function (lang) {
        localStorage.setItem('lasexta_lang_v3', lang);

        // Update active button classes
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.innerText.toLowerCase() === lang.toLowerCase()) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Translate standard text
        document.querySelectorAll(`[data-tr-${lang}]`).forEach(el => {
            el.innerText = el.getAttribute(`data-tr-${lang}`);
        });

        // Translate placeholders
        document.querySelectorAll(`[data-plc-${lang}]`).forEach(el => {
            el.placeholder = el.getAttribute(`data-plc-${lang}`);
        });

        // Ensure Canvas renders default text if empty
        if (ctx && typeof drawBanner === 'function') {
            drawBanner(nameInput.value);
        }
    };

    // Auto-init language on load
    const savedLang = localStorage.getItem('lasexta_lang_v3') || 'es';
    window.setLanguage(savedLang);

    // Event listeners
    nameInput.addEventListener('input', (e) => {
        drawBanner(e.target.value);
    });

    if (bannerColorPicker) {
        bannerColorPicker.addEventListener('input', (e) => {
            if (colorHexDisplay) colorHexDisplay.textContent = e.target.value;
            drawBanner(nameInput.value || 'Tu Nombre');
        });
    }

    downloadBtn.addEventListener('click', downloadBanner);

    function drawBanner(nameStr) {
        // Limpiar lienzo
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (customBgLoaded && customBgImage) {
            // Dibujar fondo personalizado si existe
            ctx.drawImage(customBgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            drawBackground();
        }

        let defaultName = "TU NOMBRE";
        const currentLang = localStorage.getItem('lasexta_lang_v3');
        if (currentLang === 'en') defaultName = "YOUR NAME";
        if (currentLang === 'br') defaultName = "SEU NOME";

        // 3. Dibujar el texto centrado
        drawText(nameStr || defaultName);
    }

    function drawBackground() {
        ctx.fillStyle = globalThemeConfig.gradTop;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // --- DRAW EXACT BACKGROUND IMAGE STACKING ---
        // Priority 1: Selected Country Background (bg_mx.png, bg_ar.png, bg_br.png, etc)
        // Priority 2: Fallback Generic Default Background (default_banner_bg.png)

        if (currentCountry !== 'default' && countryBgImages[currentCountry]) {
            drawCoverImage(countryBgImages[currentCountry]);
            return;
        }

        if (countryBgImages['default']) {
            drawCoverImage(countryBgImages['default']);
            return;
        }

        // Draw animated abstract elements if absolute failures
        drawAbstractElements();
    }

    function drawCoverImage(imgSource) {
        // Logica para hacer que la imagen abarque todo el canvas (cover) sin deformarse
        const scale = Math.max(CANVAS_WIDTH / imgSource.width, CANVAS_HEIGHT / imgSource.height);
        const x = (CANVAS_WIDTH / 2) - (imgSource.width / 2) * scale;
        const y = (CANVAS_HEIGHT / 2) - (imgSource.height / 2) * scale;
        ctx.drawImage(imgSource, x, y, imgSource.width * scale, imgSource.height * scale);
    }

    function drawAbstractElements() {
        // Formas naranjas
        const orangeGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        orangeGradient.addColorStop(0, 'rgba(255, 102, 0, 0.4)');
        orangeGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');

        // Línea diagonal decorativa 1
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH * 0.2, -100);
        ctx.lineTo(CANVAS_WIDTH * 0.4, CANVAS_HEIGHT + 100);
        ctx.lineWidth = 100;
        ctx.strokeStyle = orangeGradient;
        ctx.stroke();

        // Línea diagonal decorativa 2
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH * 0.8, -100);
        ctx.lineTo(CANVAS_WIDTH * 0.6, CANVAS_HEIGHT + 100);
        ctx.lineWidth = 40;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.stroke();

        // Círculo difuminado en la esquina
        const circleGrad = ctx.createRadialGradient(
            CANVAS_WIDTH, 0, 0,
            CANVAS_WIDTH, 0, 400
        );
        circleGrad.addColorStop(0, 'rgba(255, 102, 0, 0.15)');
        circleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = circleGrad;
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH, 0, 500, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawText(text) {
        // --- TEXTO PRINCIPAL (OVERWAVE RESTAURATION W/ FALLBACK FOR NUMBERS) ---
        let fontSize = 210; // Texto base inicial
        ctx.font = `italic 800 ${fontSize}px "DharmaGothic", "Overwave", "Outfit", sans-serif`;
        // Cambio de alineación al centro izquierdo del bounding box según la imagen
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // --- BOUNDING BOX SETTINGS (BASADO EN RECUADRO ROJO) ---
        // Coordenadas estimadas de la caja roja en un canvas 1500x500 (100% escala)
        const boxX = CANVAS_WIDTH * 0.45; // Empieza aprox 45% a la derecha (dejando espacio para la bandera)
        const boxY = CANVAS_HEIGHT * 0.4; // Ajuste vertical
        const boxWidth = CANVAS_WIDTH * 0.52; // Ancho máximo permitido del recuadro rojo

        // Reducir tamaño de fuente si el texto es más ancho que el boxWidth
        while (ctx.measureText(text.toUpperCase()).width > boxWidth && fontSize > 30) {
            fontSize -= 4;
            ctx.font = `italic 800 ${fontSize}px "DharmaGothic", "Overwave", "Outfit", sans-serif`;
        }
        // --------------------------

        // Solo el color naranja plano o el color seleccionado por el usuario
        const pickedColor = bannerColorPicker ? bannerColorPicker.value : null;
        ctx.fillStyle = pickedColor || globalThemeConfig.gradMid || '#ff5500';

        // Sin brillos nip resplandores para garantizar legibilidad
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.letterSpacing = '5px';

        ctx.fillText(text.toUpperCase(), boxX, boxY);
    }

    function downloadBanner() {
        // Convertir canvas a URL local de data base64 (Formato Image/PNG)
        try {
            const dataURL = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');

            const nameVal = nameInput.value.trim();
            const suffix = nameVal ? `_${nameVal.replace(/\s+/g, '')}` : '';

            a.href = dataURL;
            a.download = `Banner_LaSexta${suffix}.png`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            console.error("Canvas Download Blocked:", e);
            alert("⚠️ BLOQUEO DE SEGURIDAD DEL NAVEGADOR\\n\\nTu navegador (Chrome) bloquea las descargas automáticas cuando abres los archivos directamente desde tu disco.\\n\\nSOLUCIÓN DEFINITIVA:\\nVe a la carpeta de tu proyecto y haz DOBLE CLIC en el archivo 'INICIAR_GENERADOR.bat'. Eso abrirá la página correctamente y ¡el botón de descargar funcionará perfecto!");
        }
    }
});
