// Dimensões compactas da grade (8 linhas x 22 colunas) para evitar rolagem excessiva
const LINHAS = 8;
const COLUNAS = 22;

// Banco de dados das 13 palavras (Modelo Espinha Dorsal horizontalizado)
const palavras = [
    {
        numero: 1,
        palavra: "CPU",
        direcao: "V",
        linha: 0,
        coluna: 0,
        pista: "O grande bloco do computador que busca e executa as instruções do programa."
    },
    {
        numero: 2,
        palavra: "DUALCORE",
        direcao: "V",
        linha: 0,
        coluna: 2,
        pista: "Chip que possui exatamente duas unidades de execução completas trabalhando ao mesmo tempo."
    },
    {
        numero: 3,
        palavra: "RAM",
        direcao: "V",
        linha: 0,
        coluna: 18,
        pista: "Memória de trabalho volátil que guarda os programas em execução e seus dados temporários."
    },
    {
        numero: 4,
        palavra: "UC",
        direcao: "H",
        linha: 1,
        coluna: 2,
        pista: "Parte do processador que lê a instrução, interpreta e envia ordens aos demais componentes."
    },
    {
        numero: 5,
        palavra: "MEMORIADEMASSA",
        direcao: "H",
        linha: 1,
        coluna: 5,
        pista: "Camada permanente da hierarquia, não volátil, que guarda os arquivos e programas instalados."
    },
    {
        numero: 6,
        palavra: "DATABUS",
        direcao: "V",
        linha: 1,
        coluna: 12,
        pista: "Grupo de fios do sistema que transporta o valor lido ou as instruções."
    },
    {
        numero: 7,
        palavra: "ULA",
        direcao: "H",
        linha: 2,
        coluna: 0,
        pista: "Circuito do processador que realiza todas as contas matemáticas e operações lógicas."
    },
    {
        numero: 8,
        palavra: "ROM",
        direcao: "V",
        linha: 3,
        coluna: 10,
        pista: "Memória não volátil de fábrica que guarda o firmware de inicialização do sistema."
    },
    {
        numero: 9,
        palavra: "CACHE",
        direcao: "V",
        linha: 3,
        coluna: 19,
        pista: "Memória muito rápida no processador que guarda uma cópia do que foi usado recentemente."
    },
    {
        numero: 10,
        palavra: "MICROCONTROLADOR",
        direcao: "H",
        linha: 4,
        coluna: 0,
        pista: "Chip único que reúne processador, memória e periféricos, usado no núcleo do Arduino Uno."
    },
    {
        numero: 11,
        palavra: "FLASH",
        direcao: "H",
        linha: 4,
        coluna: 17,
        pista: "Memória não volátil e regravável onde fica guardado o programa principal do seu Arduino."
    },
    {
        numero: 12,
        palavra: "EEPROM",
        direcao: "H",
        linha: 7,
        coluna: 1,
        pista: "Pequena memória não volátil do Arduino para guardar dados que sobrevivem ao desligamento."
    },
    {
        numero: 13,
        palavra: "REGISTRADORES",
        direcao: "H",
        linha: 7,
        coluna: 8,
        pista: "Memórias minúsculas e ultrarrápidas dentro do processador que guardam dados usados no exato momento."
    }
];

// Referências dos elementos da página
const tabuleiroEl = document.getElementById("tabuleiro");
const pistasHorizontaisEl = document.getElementById("pistas-horizontais");
const pistasVerticaisEl = document.getElementById("pistas-verticais");
const contadorEl = document.getElementById("contador");
const pistaAtivaEl = document.getElementById("pista-ativa");
const mensagemStatusEl = document.getElementById("mensagem-status");
const btnConferir = document.getElementById("btn-conferir");
const btnReiniciar = document.getElementById("btn-reiniciar");

// Matriz lógica do tabuleiro
const matriz = [];
for (let l = 0; l < LINHAS; l++) {
    matriz[l] = [];
    for (let c = 0; c < COLUNAS; c++) {
        matriz[l][c] = {
            letra: "",
            numeroInicio: null,
            palavrasIds: [],
            input: null
        };
    }
}

let direcaoAtual = "H";
let ultimaCelulaFocada = null;

// Preenche a matriz com as 13 palavras
function preencherMatriz() {
    for (let i = 0; i < palavras.length; i++) {
        const item = palavras[i];

        for (let j = 0; j < item.palavra.length; j++) {
            const l = item.direcao === "V" ? item.linha + j : item.linha;
            const c = item.direcao === "H" ? item.coluna + j : item.coluna;

            matriz[l][c].letra = item.palavra[j];
            matriz[l][c].palavrasIds.push(item.numero);

            if (j === 0) {
                matriz[l][c].numeroInicio = item.numero;
            }
        }
    }
}

// Renderiza o tabuleiro dinamicamente na tela
function montarTabuleiro() {
    tabuleiroEl.innerHTML = "";

    for (let l = 0; l < LINHAS; l++) {
        for (let c = 0; c < COLUNAS; c++) {
            const celula = matriz[l][c];

            if (celula.letra === "") {
                const vazio = document.createElement("div");
                vazio.className = "celula-vazia";
                tabuleiroEl.appendChild(vazio);
            } else {
                const containerCelula = document.createElement("div");
                containerCelula.className = "celula-ativa";

                if (celula.numeroInicio !== null) {
                    const spanNumero = document.createElement("span");
                    spanNumero.className = "numero";
                    spanNumero.textContent = celula.numeroInicio;
                    containerCelula.appendChild(spanNumero);
                }

                const input = document.createElement("input");
                input.type = "text";
                input.maxLength = 1;
                input.autocomplete = "off";
                input.setAttribute("aria-label", `Linha ${l + 1}, coluna ${c + 1}`);

                // Clicar novamente em um cruzamento alterna entre Horizontal e Vertical
                input.addEventListener("click", function () {
                    const chave = `${l}-${c}`;
                    if (ultimaCelulaFocada === chave && celula.palavrasIds.length > 1) {
                        direcaoAtual = direcaoAtual === "H" ? "V" : "H";
                        destacarPalavraAtiva(l, c);
                    }
                    ultimaCelulaFocada = chave;
                });

                input.addEventListener("focus", function () {
                    atualizarDirecaoAoFocar(l, c);
                    destacarPalavraAtiva(l, c);
                });

                // Mantém somente letras maiúsculas sem acento e avança o cursor
                input.addEventListener("input", function () {
                    const textoLimpo = input.value
                        .normalize("NFD")
                        .replace(/[̀-ͯ]/g, "")
                        .replace(/[^a-zA-Z]/g, "")
                        .toUpperCase();

                    input.value = textoLimpo.slice(0, 1);
                    input.classList.remove("correta", "errada");

                    if (input.value !== "") {
                        moverFoco(l, c, 1);
                    }
                });

                // Suporte a Backspace e setas do teclado
                input.addEventListener("keydown", function (evento) {
                    if (evento.key === "Backspace" && input.value === "") {
                        moverFoco(l, c, -1);
                    } else if (evento.key === "ArrowRight") {
                        direcaoAtual = "H";
                        focarSeAtiva(l, c + 1);
                    } else if (evento.key === "ArrowLeft") {
                        direcaoAtual = "H";
                        focarSeAtiva(l, c - 1);
                    } else if (evento.key === "ArrowDown") {
                        direcaoAtual = "V";
                        focarSeAtiva(l + 1, c);
                    } else if (evento.key === "ArrowUp") {
                        direcaoAtual = "V";
                        focarSeAtiva(l - 1, c);
                    }
                });

                celula.input = input;
                containerCelula.appendChild(input);
                tabuleiroEl.appendChild(containerCelula);
            }
        }
    }
}

function atualizarDirecaoAoFocar(l, c) {
    const ids = matriz[l][c].palavrasIds;
    if (ids.length === 1) {
        const palavraObj = palavras.find((p) => p.numero === ids[0]);
        if (palavraObj) {
            direcaoAtual = palavraObj.direcao;
        }
    }
}

// Destaca visualmente a palavra sendo preenchida e mostra sua pista na barra superior
function destacarPalavraAtiva(l, c) {
    for (let r = 0; r < LINHAS; r++) {
        for (let col = 0; col < COLUNAS; col++) {
            if (matriz[r][col].input) {
                matriz[r][col].input.classList.remove("palavra-ativa");
            }
        }
    }

    const itensPista = document.querySelectorAll(".item-pista");
    for (let i = 0; i < itensPista.length; i++) {
        itensPista[i].classList.remove("pista-selecionada");
    }

    const ids = matriz[l][c].palavrasIds;
    let palavraAtiva = null;

    for (let i = 0; i < ids.length; i++) {
        const candidata = palavras.find((p) => p.numero === ids[i]);
        if (candidata && candidata.direcao === direcaoAtual) {
            palavraAtiva = candidata;
            break;
        }
    }

    if (!palavraAtiva && ids.length > 0) {
        palavraAtiva = palavras.find((p) => p.numero === ids[0]);
    }

    if (!palavraAtiva) return;

    for (let j = 0; j < palavraAtiva.palavra.length; j++) {
        const rr = palavraAtiva.direcao === "V" ? palavraAtiva.linha + j : palavraAtiva.linha;
        const cc = palavraAtiva.direcao === "H" ? palavraAtiva.coluna + j : palavraAtiva.coluna;
        if (matriz[rr][cc].input) {
            matriz[rr][cc].input.classList.add("palavra-ativa");
        }
    }

    const pistaEl = document.getElementById(`pista-${palavraAtiva.numero}`);
    if (pistaEl) {
        pistaEl.classList.add("pista-selecionada");
    }

    const textoDir = palavraAtiva.direcao === "H" ? "Horizontal" : "Vertical";
    pistaAtivaEl.innerHTML = `<strong>${palavraAtiva.numero} (${textoDir}):</strong> ${palavraAtiva.pista}`;
}

function moverFoco(l, c, passo) {
    const proximaLinha = direcaoAtual === "V" ? l + passo : l;
    const proximaColuna = direcaoAtual === "H" ? c + passo : c;
    focarSeAtiva(proximaLinha, proximaColuna);
}

function focarSeAtiva(l, c) {
    if (l >= 0 && l < LINHAS && c >= 0 && c < COLUNAS && matriz[l][c].input) {
        matriz[l][c].input.focus();
    }
}

// Monta as listas de pistas Horizontais e Verticais
function montarPistas() {
    pistasHorizontaisEl.innerHTML = "";
    pistasVerticaisEl.innerHTML = "";

    for (let i = 0; i < palavras.length; i++) {
        const item = palavras[i];
        const li = document.createElement("li");
        li.className = "item-pista";
        li.id = `pista-${item.numero}`;
        li.innerHTML = `<strong>${item.numero}.</strong> ${item.pista}`;

        li.addEventListener("click", function () {
            direcaoAtual = item.direcao;
            ultimaCelulaFocada = `${item.linha}-${item.coluna}`;
            const primeiroInput = matriz[item.linha][item.coluna].input;
            if (primeiroInput) {
                primeiroInput.focus();
                destacarPalavraAtiva(item.linha, item.coluna);
            }
        });

        if (item.direcao === "H") {
            pistasHorizontaisEl.appendChild(li);
        } else {
            pistasVerticaisEl.appendChild(li);
        }
    }
}

// Confere todas as palavras do tabuleiro
function conferirJogo() {
    for (let l = 0; l < LINHAS; l++) {
        for (let c = 0; c < COLUNAS; c++) {
            if (matriz[l][c].input) {
                matriz[l][c].input.classList.remove("correta", "errada");
            }
        }
    }

    let acertos = 0;
    const celulasCorretas = new Set();
    const celulasErradas = new Set();

    for (let i = 0; i < palavras.length; i++) {
        const item = palavras[i];
        const pistaEl = document.getElementById(`pista-${item.numero}`);
        pistaEl.classList.remove("pista-correta", "pista-errada");

        let palavraCerta = true;

        for (let j = 0; j < item.palavra.length; j++) {
            const l = item.direcao === "V" ? item.linha + j : item.linha;
            const c = item.direcao === "H" ? item.coluna + j : item.coluna;
            const digitado = matriz[l][c].input.value.toUpperCase();

            if (digitado !== item.palavra[j]) {
                palavraCerta = false;
            }
        }

        if (palavraCerta) {
            acertos++;
            pistaEl.classList.add("pista-correta");
            for (let j = 0; j < item.palavra.length; j++) {
                const l = item.direcao === "V" ? item.linha + j : item.linha;
                const c = item.direcao === "H" ? item.coluna + j : item.coluna;
                celulasCorretas.add(`${l}-${c}`);
            }
        } else {
            pistaEl.classList.add("pista-errada");
            for (let j = 0; j < item.palavra.length; j++) {
                const l = item.direcao === "V" ? item.linha + j : item.linha;
                const c = item.direcao === "H" ? item.coluna + j : item.coluna;
                celulasErradas.add(`${l}-${c}`);
            }
        }
    }

    for (let l = 0; l < LINHAS; l++) {
        for (let c = 0; c < COLUNAS; c++) {
            const input = matriz[l][c].input;
            if (!input) continue;

            const chave = `${l}-${c}`;
            if (celulasCorretas.has(chave)) {
                input.classList.add("correta");
            } else if (celulasErradas.has(chave)) {
                input.classList.add("errada");
            }
        }
    }

    contadorEl.textContent = `${acertos} de ${palavras.length} palavras`;

    if (acertos === palavras.length) {
        mensagemStatusEl.textContent = "Missão cumprida! Todas as 13 palavras corretas!";
        mensagemStatusEl.className = "mensagem-status vitoria";
    } else {
        mensagemStatusEl.textContent = "Revise as palavras em vermelho e tente novamente.";
        mensagemStatusEl.className = "mensagem-status";
    }
}

// Limpa o tabuleiro e reinicia o jogo
function reiniciarJogo() {
    for (let l = 0; l < LINHAS; l++) {
        for (let c = 0; c < COLUNAS; c++) {
            const input = matriz[l][c].input;
            if (input) {
                input.value = "";
                input.classList.remove("correta", "errada", "palavra-ativa");
            }
        }
    }

    for (let i = 0; i < palavras.length; i++) {
        const pistaEl = document.getElementById(`pista-${palavras[i].numero}`);
        if (pistaEl) {
            pistaEl.classList.remove("pista-correta", "pista-errada", "pista-selecionada");
        }
    }

    contadorEl.textContent = `0 de ${palavras.length} palavras`;
    pistaAtivaEl.textContent = "Clique em uma casa ou pista para começar a jogar (sem acentos e sem espaços).";
    mensagemStatusEl.textContent = "";
    mensagemStatusEl.className = "mensagem-status";
    ultimaCelulaFocada = null;
}

btnConferir.addEventListener("click", conferirJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);

preencherMatriz();
montarTabuleiro();
montarPistas();
