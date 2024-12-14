window.onload = () => {
    console.log("Carregando o script...");

    // Carrega a API do Google assim que a página for carregada
    if (typeof gapi !== "undefined") {
        console.log("Carregando a API do Google...");
        gapi.load('client:auth2', loadClient);
    } else {
        console.error("API do Google não carregada. Verifique a conexão ou o script no HTML.");
        alert("Falha ao carregar a API do Google!");
    }

    checkTermsAndShowButton(); // Inicializa o botão de envio

    // Adiciona eventos ao botão de envio
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('mouseover', showTooltipIfIncomplete);
        submitButton.addEventListener('mouseleave', hideTooltip);
        submitButton.addEventListener('click', handleSubmitClick); // Evento principal
    } else {
        console.error("O botão 'Enviar Confissão' não foi encontrado.");
    }

    console.log("Script carregado com sucesso.");
};

function goToConfessions() {
    window.location.href = "quero-confessar/confissoes.html"; // Caminho botão julgar//"
}

let confessionCodeCounter = 0; // Contador para gerar códigos únicos

// Função para carregar a API do Google e iniciar o cliente
function loadClient() {
    gapi.client
        .init({
            apiKey: 'YOUR_API_KEY_HERE', // Use sua chave de API aqui
            clientId: 'YOUR_CLIENT_ID_HERE', // Use seu Client ID aqui
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        })
        .then(() => {
            console.log("API Google Sheets carregada com sucesso.");
        })
        .catch((error) => {
            console.error("Erro ao inicializar a API do Google:", error);
        });
}

// Verifica se o botão de envio deve estar habilitado
function checkTermsAndShowButton() {
    const termsChecked = document.getElementById('termsCheckbox')?.checked || false;
    const categorySelected = document.querySelector('.category-button.selected-category') !== null;
    const confessionText = document.getElementById('confessionBox')?.value.trim() || "";

    const submitButton = document.getElementById('submitButton');
    if (termsChecked && categorySelected && confessionText !== "") {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
    } else {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.style.cursor = 'not-allowed';
    }
}



// Mostra tooltip se campos não estiverem preenchidos corretamente
function showTooltipIfIncomplete(event) {
    const tooltip = document.getElementById('tooltip');
    const termsChecked = document.getElementById('termsCheckbox')?.checked || false;
    const categorySelected = document.querySelector('.category-button.selected-category') !== null;
    const confessionText = document.getElementById('confessionBox')?.value.trim() || "";

    if (!termsChecked || !categorySelected || confessionText === "") {
        tooltip.textContent = !confessionText
            ? "Escreva sua confissão!"
            : !categorySelected
            ? "Selecione uma categoria!"
            : "Aceite os Termos e Condições!";
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        tooltip.style.display = 'block';
    }
}


// Esconde tooltip
function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

// Marca categoria como selecionada
function selectCategory(categoryName) {
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach((button) => button.classList.remove('selected-category'));

    const selectedButton = document.querySelector(`button[aria-label='Categoria ${categoryName}']`);
    if (selectedButton) {
        selectedButton.classList.add('selected-category');
    } else {
        console.error(`Botão de categoria '${categoryName}' não encontrado.`);
    }

    checkTermsAndShowButton();
}

// Função para transição ao clicar no botão "CONFESSAR"
function startConfession() {
    const title = document.querySelector('h1');
    const infoText = document.querySelector('.info-text');
    const buttonContainer = document.querySelector('.button-container');
    const privacyLink = document.querySelector('.privacy-link');
    const darkMessage = document.getElementById('dark-message');
    const confessionBox = document.getElementById('confessionBox');
    const optionsBanner = document.getElementById('optionsBanner');
    const logoContainer = document.querySelector('.logo-container'); // Selecione o contêiner do logo

    if (!title || !infoText || !buttonContainer || !privacyLink || !darkMessage || !confessionBox || !optionsBanner || !logoContainer) {
        console.error("Um ou mais elementos necessários não foram encontrados.");
        return;
    }

    // Faz o logo desaparecer
    logoContainer.style.opacity = '0';

    // Outros elementos da página também desaparecem
    title.style.opacity = '0';
    infoText.style.opacity = '0';
    buttonContainer.style.opacity = '0';

    setTimeout(() => {
        darkMessage.style.display = 'block';
        darkMessage.style.opacity = '1';

        setTimeout(() => {
            darkMessage.style.opacity = '0';

            setTimeout(() => {
                document.body.style.backgroundColor = '#fff';
                confessionBox.classList.add('expanded');
                confessionBox.style.opacity = '1';
                optionsBanner.style.display = 'block';
                optionsBanner.style.opacity = '1';
            }, 1000);
        }, 3000);
    }, 1000);
}

// Gera um código único usando a data e hora atual, na ordem: hora, minuto, segundo, dia, mês, ano, sem separadores
function generateConfessionCode() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês começa em 0, por isso é incrementado em 1
    const year = String(now.getFullYear());

    return `${hours}${minutes}${seconds}${day}${month}${year}`;
}

// Envia dados para a planilha
function sendToGoogleSheets(confession, category, days) {
    const code = generateConfessionCode(); // Gera o código único usando a data e hora

    const endpoint = "https://api.sheetmonkey.io/form/DHT5hHFrUUDGsg6uzSzBy";
    const data = {
        "Código": code,
        "Categoria": category,
        "Confissão": confession,
        "Data": new Date().toLocaleString("pt-BR"),
    };

    console.log("Enviando dados para a planilha:", data);

    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => {
        if (response.ok) {
            alert(`Confissão enviada com sucesso!\nO código da sua confissão é: ${code}`);
            window.location.href = "confissoes.html";
        } else {
            throw new Error("Erro ao enviar confissão");
        }
    })
    .catch((error) => {
        console.error("Erro ao enviar confissão:", error);
        alert("Erro ao enviar confissão. Tente novamente.");
    });
}




// Tratar clique no botão "Enviar Confissão"
function handleSubmitClick() {
    const confession = document.getElementById('confessionBox').value.trim();
    const category = document.querySelector('.category-button.selected-category')?.innerText || "Sem Categoria";
    const submitButton = document.getElementById('submitButton'); // Identifica o botão

    if (!confession || !category) {
        alert("Preencha todos os campos antes de enviar!");
        return;
    }

    // Desativa o botão para evitar múltiplos cliques
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.cursor = 'not-allowed'; // Alteração visual para indicar desativação
    }

    // Gera o código único da confissão
    const code = generateConfessionCode();

    // Efeito visual de clique no botão
    submitButton.classList.add('clicked');
    setTimeout(() => submitButton.classList.remove('clicked'), 200);

    // Envia os dados para o Google Sheets
    sendToGoogleSheets(confession, category).catch((error) => {
        // Reativa o botão em caso de erro no envio
        console.error("Erro no envio:", error);
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.cursor = 'pointer';
        }
    });
}





// Verifica se o código já está usado na planilha
async function isCodeUsed(code) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1o_YxvOP61KfqGb5Kd4_HcBElvMm8hBCuc2qLB2AHytw',
            range: 'A2:A', // Intervalo onde os códigos são armazenados
        });
        const values = response.result.values;
        return values.some(row => row[0] == code);
    } catch (error) {
        console.error("Erro ao verificar código usado:", error);
        return false;
    }
}
