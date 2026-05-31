const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');

// Veritabanımız: Kelimeleri buraya eklemeye devam edeceğiz
const wordDatabase = [
    { almanca: "tisch", turkce: "Masa", artikel: "der", akkusativ: "den Tisch", dativ: "dem Tisch" },
    { almanca: "stuhl", turkce: "Sandalye", artikel: "der", akkusativ: "den Stuhl", dativ: "dem Stuhl" },
    { almanca: "buch", turkce: "Kitap", artikel: "das", akkusativ: "das Buch", dativ: "dem Buch" }
];

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Kelimeyi veritabanında arıyoruz
    const foundWord = wordDatabase.find(item => item.almanca === query);

    resultContainer.classList.remove('hidden');

    if (foundWord) {
        resultContainer.innerHTML = `
            <h2 style="margin-bottom: 1rem; text-transform: capitalize;">${foundWord.artikel} ${foundWord.almanca}</h2>
            <p><strong>Türkçesi:</strong> ${foundWord.turkce}</p>
            <p><strong>Akkusativ:</strong> ${foundWord.akkusativ}</p>
            <p><strong>Dativ:</strong> ${foundWord.dativ}</p>
        `;
    } else {
        resultContainer.innerHTML = `<p>Kelime bulunamadı. Başka bir kelime deneyin.</p>`;
    }
});
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => document.body.classList.toggle('dark-mode'));
const randomWordBtn = document.getElementById('randomWordBtn');
const gameWord = document.getElementById('gameWord');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const gameResult = document.getElementById('gameResult');

let currentWord = null;

// Rastgele kelime getirme butonu
randomWordBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * wordDatabase.length);
    currentWord = wordDatabase[randomIndex];
    gameWord.textContent = currentWord.almanca;
    guessInput.value = '';
    gameResult.textContent = '';
});

// Tahmini kontrol etme butonu
guessBtn.addEventListener('click', () => {
    if (!currentWord) return;
    const guess = guessInput.value.trim().toLowerCase();
    
    if (guess === currentWord.turkce.toLowerCase()) {
        gameResult.textContent = "Doğru!";
        gameResult.style.color = "green";
    } else {
        gameResult.textContent = `Yanlış. Doğrusu: ${currentWord.turkce}`;
        gameResult.style.color = "red";
    }
});