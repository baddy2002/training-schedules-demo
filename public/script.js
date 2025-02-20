document.getElementById('trainingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        altezza: document.getElementById('altezza').value,
        peso: document.getElementById('peso').value,
        sesso: document.getElementById('sesso').value,
        obiettivo: document.getElementById('obiettivo').value,
        giorni: document.getElementById('giorni').value,
        durata: document.getElementById('durata').value,
        esperienza: document.getElementById('esperienza').value,
        problemi: document.getElementById('problemi').value
    };

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Risultato:', data);
        document.getElementById('result').innerText = data.trainingPlan || 'Nessun piano generato.';
    } catch (error) {
        console.error('Errore:', error);
        document.getElementById('result').innerText = 'Errore nella generazione del piano.';
    }
});
