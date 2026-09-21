const originURL = window.location.origin;

const form = document.getElementById('submit-link');
const result = document.getElementById('result');
const submitBtn = document.getElementById('submit-btn');
const input = document.getElementById('url');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = input.value.trim();
    if (!url) return;

    setLoading(true);
    result.innerHTML = '<p class="info">Envoi en cours…</p>';

    try {
        const res = await fetch(`${originURL}/api-v2/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showError(data.error ?? `Erreur HTTP ${res.status}`);
            return;
        }

        showShortLink(data.url, url);
        input.value = '';
    } catch (err) {
        showError(`Erreur réseau : ${err.message}`);
    } finally {
        setLoading(false);
    }
});

function showShortLink(shortId, originalUrl) {
    const shortLink = `${originURL}/api-v2/${shortId}`;

    result.innerHTML = `
        <div class="result">
            <p>Votre lien court est prêt :</p>
            <a class="short-url" href="${shortLink}" target="_blank" rel="noopener">${shortLink}</a>
            <div class="actions">
                <button type="button" class="secondary" id="copy-btn">Copier l'URL</button>
                <button type="button" class="ghost" id="open-btn">Ouvrir</button>
            </div>
            <p class="info" title="${escapeHtml(originalUrl)}">
                Redirige vers&nbsp;: <code>${escapeHtml(truncate(originalUrl, 60))}</code>
            </p>
        </div>
    `;

    document.getElementById('copy-btn').addEventListener('click', (e) =>
        copyToClipboard(e.currentTarget, shortLink)
    );

    document.getElementById('open-btn').addEventListener('click', () => {
        window.open(shortLink, '_blank', 'noopener');
    });
}

async function copyToClipboard(btn, text) {
    const original = btn.textContent;
    try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        btn.textContent = 'Copié !';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = original;
        }, 1800);
    } catch {
        // Fallback si l'API Clipboard n'est pas dispo (HTTP non-localhost)
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.classList.add('copied');
            btn.textContent = 'Copié !';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.textContent = original;
            }, 1800);
        } catch (err) {
            showError(`Impossible de copier : ${err.message}`);
        }
    }
}

function setLoading(on) {
    submitBtn.disabled = on;
    input.disabled = on;
    submitBtn.textContent = on ? 'Envoi…' : "Réduire l'URL";
}

function showError(message) {
    result.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
}