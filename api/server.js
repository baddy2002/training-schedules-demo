import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import axios from "axios";

dotenv.config();


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;  // Porta Vercel
const TMP_FOLDER = '/tmp'; // Cartella in cui salvare il file

app.use(express.static(path.resolve())); // Usa `path.resolve()` per gestire il path
app.use(express.json());

app.post('/api/generate', async (req, res) => {
    const formData = req.body;

    // Costruisci il prompt per il modello
    const prompt = `
Crea un piano di allenamento personalizzato per una persona con le seguenti caratteristiche 
                     che gli permette di raggiungere i propri obiettivi allenandosi tanti giorni alla settimana
                    come indicato dai dati sottostanti: 
- Altezza: ${formData.altezza} cm
- Peso: ${formData.peso} kg
- Sesso: ${formData.sesso}
- Obiettivi: ${formData.obiettivo}
- Giorni allenamento settimanali: ${formData.giorni}
- Durata singolo allenamento: ${formData.durata}
- Esperienza: ${formData.esperienza}
- Problemi fisici: ${formData.problemi || 'Nessuno'}
Si prega di rispondere con il piano di allenamento completo, compreso il riscaldamento, 
                    diversi esercizi con quantità di serie, numero di ripetizioni e tempi di riposo tra ripetizioni e serie, 
                    pianificare la suddivisione dell'allenamento in base al numero di giornate deciso dall'utente nei dati
                     sopra riportati. indicare SOLO quanto richiesto senza inviare altre informazioni`;

    try {
        // URL dell'endpoint del modello su Hugging Face (es. Falcon-40B)
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const headers = {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        };
        const bodyRequest = {
            model: process.env.GROQ_LLAMA_MODEL,
            temperature: parseFloat(process.env.GROQ_LLAMA_TEMPERATURE),
            top_p: parseFloat(process.env.GROQ_LLAMA_TOP_P),
            messages: [{role: "user", content: prompt}]
        }
        console.log("Inviando headers:", headers);
        const response = await axios.post(apiUrl,  bodyRequest , {headers: headers});

        // Estrai il testo generato (la struttura della risposta varia in base al modello)
        const generatedText = response.data.choices[0].message.content;

        console.log("Risultato generato:", generatedText);

        // Salva il risultato in un file nella cartella /tmp
        const filePath = path.join(TMP_FOLDER, 'training_plan.txt');
        fs.writeFile(filePath, generatedText, (err) => {
            if (err) {
                console.error('Errore nel salvataggio del file:', err);
            } else {
                console.log(`File salvato in ${filePath}`);
            }
        });

        res.json({ trainingPlan: generatedText });
    } catch (error) {
        console.error('Errore nella chiamata API:', error);
        res.status(500).json({ error: 'Errore nella generazione del piano' });
    }
});
/*

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

*/
export default app;
