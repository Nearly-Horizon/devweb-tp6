const originURL = window.location.origin;

const form = document.getElementById('submit-link');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('url').value;

    try {
        const res = await fetch(`${originURL}/api-v2/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await res.json();

        if (!res.ok) {
            result.innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }

        const shortLink = `${originURL}/api-v2/${data.url}`;
        result.innerHTML = `
            <div class="result">
                <p>Lien court : <a href="${shortLink}">${shortLink}</a></p>
                <button id="copy-btn">Copier l'URL</button>
            </div>
        `;

        document.getElementById('copy-btn').addEventListener('click', async () => {
            await navigator.clipboard.writeText(shortLink);
            document.getElementById('copy-btn').textContent = 'Copié !';
        });
    } catch (err) {
        result.innerHTML = `<p class="error">Erreur réseau : ${err.message}</p>`;
    }
});