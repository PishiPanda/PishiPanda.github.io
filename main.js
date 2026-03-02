// Configuración del Canvas (Tamaño Portada Twitter)
const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 500;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bannerCanvas');
    const ctx = canvas.getContext('2d');
    const nameInput = document.getElementById('nameInput');
    const bannerColorPicker = document.getElementById('bannerColorPicker');
    const colorHexDisplay = document.getElementById('colorHexDisplay');
    const downloadBtn = document.getElementById('downloadBtn');

    // Variables para configuración global
    let customBgImage = null;
    let customBgLoaded = false;
    let globalThemeConfig = {
        hashTop: '#SOMOSESTRAL',
        hashBot: '#VOLARDENOVO',
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
                globalThemeConfig.hashTop = config.texts.hashTop || globalThemeConfig.hashTop;
                globalThemeConfig.hashBot = config.texts.hashBot || globalThemeConfig.hashBot;
                globalThemeConfig.gradTop = config.colors.gradTop || globalThemeConfig.gradTop;
                globalThemeConfig.gradMid = config.colors.gradMid || globalThemeConfig.gradMid;
                globalThemeConfig.gradBot = config.colors.gradBot || globalThemeConfig.gradBot;

                // Convert hex shadow to rgba
                const sHex = config.colors.textShadow.replace('#', '');
                const sr = parseInt(sHex.substring(0, 2), 16);
                const sg = parseInt(sHex.substring(2, 4), 16);
                const sb = parseInt(sHex.substring(4, 6), 16);
                globalThemeConfig.textShadow = `rgba(${sr}, ${sg}, ${sb}, 0.8)`;

                // Apply Social Links
                if (config.social) {
                    const iconX = document.getElementById('iconX');
                    if (iconX) {
                        if (config.social.linkX === '') { iconX.style.display = 'none'; }
                        else if (config.social.linkX) { iconX.style.display = 'flex'; iconX.href = config.social.linkX; }
                    }

                    const iconIg = document.getElementById('iconIg');
                    if (iconIg) {
                        if (config.social.linkIg === '') { iconIg.style.display = 'none'; }
                        else if (config.social.linkIg) { iconIg.style.display = 'flex'; iconIg.href = config.social.linkIg; }
                    }

                    const iconWeb = document.getElementById('iconWeb');
                    if (iconWeb) {
                        if (config.social.linkWeb === '') { iconWeb.style.display = 'none'; }
                        else if (config.social.linkWeb) { iconWeb.style.display = 'flex'; iconWeb.href = config.social.linkWeb; }
                    }
                }

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

    // Intentar cargar fondo del BANNER de localStorage
    const savedBg = localStorage.getItem('customLaSextaBg');
    if (savedBg) {
        customBgImage = new Image();
        customBgImage.onload = () => {
            customBgLoaded = true;
            // Redibujar una vez cargada para asegurar que se muestre en el primer render
            if (ctx) drawBanner(nameInput ? nameInput.value : 'Tu Nombre');
        };
        customBgImage.src = savedBg;
    }

    // Inicializar tamaño interno del canvas para máxima calidad
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Precargar fuente esperando a que esté disponible
    document.fonts.ready.then(() => {
        drawBanner(nameInput.value || 'Tu Nombre');
    });

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
            // 1. Dibujar fondo premium por defecto
            drawBackground();

            // 2. Dibujar elementos gráficos abstractos por defecto
            drawAbstractElements();
        }

        // 3. Dibujar el texto centrado
        drawText(nameStr || 'Tu Nombre');
    }

    function drawBackground() {
        // Gradiente principal oscuro radial central
        const bgGradient = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
        );
        bgGradient.addColorStop(0, '#1a1a24');
        bgGradient.addColorStop(1, '#0a0a0c');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
        // --- TEXTO PRINCIPAL (OVERWAVE STYLE) ---
        let fontSize = 160; // Texto base más grande
        ctx.font = `400 ${fontSize}px "Overwave", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // --- AUTO-SCALING LOGIC ---
        // Max width permitido para el nombre (dejando 100px de padding por lado)
        const maxWidth = CANVAS_WIDTH - 200;

        // Reducir tamaño de fuente si el texto es muy ancho
        while (ctx.measureText(text.toUpperCase()).width > maxWidth && fontSize > 40) {
            fontSize -= 4;
            ctx.font = `400 ${fontSize}px "Overwave", sans-serif`;
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

        ctx.fillText(text.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

        // Hastag inferior izquierdo
        ctx.shadowBlur = 0; // Quitar glow para texto pequeño
        ctx.font = '600 22px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'left';
        ctx.letterSpacing = '2px';
        ctx.fillText(globalThemeConfig.hashBot, 60, CANVAS_HEIGHT - 60);

        // Hashtag superior derecho
        ctx.font = '600 22px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.textAlign = 'right';
        ctx.letterSpacing = '2px';
        ctx.fillText(globalThemeConfig.hashTop, CANVAS_WIDTH - 60, 60);
    }

    function downloadBanner() {
        // Convertir canvas a URL local de data base64 (Formato Image/PNG)
        // Y forzar decarga con API de <a> 

        const dataURL = canvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');

        const nameVal = nameInput.value.trim();
        const suffix = nameVal ? `_${nameVal.replace(/\s+/g, '')}` : '';

        a.href = dataURL;
        a.download = `Banner_LaSexta${suffix}.png`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
