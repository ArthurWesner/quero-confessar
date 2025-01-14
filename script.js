window.onload = () => {
    console.log("Carregando o script...");

    // Evento no campo de texto
    const confessionBox = document.getElementById('confessionBox');
    confessionBox.addEventListener('input', checkTermsAndShowButton);

    // Evento na caixa de seleção
    const termsCheckbox = document.getElementById('termsCheckbox');
    termsCheckbox.addEventListener('change', checkTermsAndShowButton);

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
    window.location.href = "confissoes.html"; // Botão Julgar
}

let confessionCodeCounter = 0; // Contador para gerar códigos únicos

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

document.querySelectorAll('.category-button').forEach(button => {
    button.addEventListener('click', () => {
        const categoryName = button.textContent.trim(); // Obtém o texto do botão clicado
        selectCategory(categoryName); // Chama a função
    });
});

// Função para transição ao clicar no botão "CONFESSAR"
function startConfession() {
    console.log("Iniciando animação do botão 'CONFESSAR'");

    const bannerContainer = document.querySelector('.banner-container'); // Seleciona o container do banner
    const darkMessage = document.getElementById('dark-message');
    const confessionBox = document.getElementById('confessionBox');
    const optionsBanner = document.getElementById('optionsBanner');
    const body = document.body; // Seleciona o corpo da página

    if (!bannerContainer || !darkMessage || !confessionBox || !optionsBanner || !body) {
        console.error("Alguns elementos necessários não foram encontrados.");
        return;
    }

    // Esconde o banner com uma transição suave
    bannerContainer.style.transition = 'opacity 1s ease';
    bannerContainer.style.opacity = '0';

    setTimeout(() => {
        // Após a transição, oculta completamente o banner
        bannerContainer.style.display = 'none';

        // Exibe a mensagem sombria
        console.log("Exibindo mensagem sombria.");
        darkMessage.style.display = 'block';
        darkMessage.style.opacity = '1';

        setTimeout(() => {
            console.log("Ocultando mensagem sombria.");
            darkMessage.style.opacity = '0';

            setTimeout(() => {
                console.log("Mudando o fundo para branco e exibindo a caixa de texto e opções.");

                // Muda o fundo da página para branco
                body.style.transition = 'background-color 1s ease';
                body.style.backgroundColor = '#ffffff'; // Define o fundo branco

                // Exibe a caixa de texto e os botões com animação
                confessionBox.style.display = 'block';
                confessionBox.style.opacity = '1';
                confessionBox.classList.add('expanded'); // Adiciona uma animação suave para a caixa de texto

                optionsBanner.style.display = 'flex';
                optionsBanner.style.opacity = '1';
            }, 1000); // Espera mais 1 segundo após a mensagem sombria desaparecer
        }, 3000); // A frase sombria vai desaparecer após 3 segundos
    }, 1000); // Espera 1 segundo para dar tempo da transição de opacidade do banner
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
function sendToGoogleSheets(confession, category) {
    const code = generateConfessionCode(); // Gera o código único usando a data e hora

    const endpoint = "https://api.sheetmonkey.io/form/DHT5hHFrUUDGsg6uzSzBy";
    const data = {
        "Código": code,
        "Categoria": category,
        "Confissão": confession,
        "Data": new Date().toLocaleString("pt-BR"),
        "TOKEN_VERIFICATION": "front_token_01"
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


function formatConfessionText(text) {
    return text.replace(/\n/g, '<br>'); // Substitui '\n' por '<br>'
}

// Tratar clique no botão de envio
function handleSubmitClick() {
    const confessionBox = document.getElementById('confessionBox');
    const category = document.querySelector('.category-button.selected-category')?.textContent.trim();

    if (!confessionBox || !category) {
        alert("Preencha todos os campos e selecione uma categoria.");
        return;
    }

    const confession = confessionBox.value.trim();
    if (confession === "") {
        alert("Escreva sua confissão!");
        return;
    }

    sendToGoogleSheets(confession, category);
}
