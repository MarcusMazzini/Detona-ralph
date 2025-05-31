const state = {
  // Propriedade 'view': Contém referências aos elementos HTML da interface do usuário.
  // Isso permite que o JavaScript manipule esses elementos facilmente.
  view: {
    // Seleciona todos os elementos HTML com a classe "square".
    // Estes são os 9 quadrados onde o inimigo pode aparecer.
    squares: document.querySelectorAll(".square"),
    // Seleciona o elemento HTML com o ID "time-left".
    // Este elemento exibirá o tempo restante do jogo.
    timeLeft: document.querySelector("#time-left"),
    // Seleciona o elemento HTML com o ID "score".
    // Este elemento exibirá a pontuação atual do jogador.
    score: document.querySelector("#score"),
    // Seleciona o elemento HTML de áudio com o ID "audioHit".
    // Este áudio será reproduzido quando o jogador acertar o inimigo.
    audioHit: document.querySelector("#audioHit"),
    // Seleciona o elemento HTML com o ID "lives".
    // Este elemento exibirá o número de vidas restantes do jogador.
    lives: document.querySelector("#lives"),
  },
  // Propriedade 'values': Contém variáveis que armazenam o estado atual do jogo
  // e configurações importantes.
  values: {
    // ID do timer (setInterval) responsável por mover o inimigo.
    // Usado para poder parar o timer mais tarde com clearInterval.
    timerId: null,
    // ID do timer (setInterval) responsável pela contagem regressiva do tempo.
    // Usado para poder parar o timer mais tarde com clearInterval.
    countDownTimerId: null,
    // Velocidade do jogo em milissegundos.
    // Define o intervalo de tempo em que o inimigo muda de posição (1000ms = 1 segundo).
    gameVelocity: 1000,
    // Armazena o ID do quadrado onde o inimigo está atualmente posicionado.
    // É usado para verificar se o clique do jogador foi um acerto.
    hitPosition: 0,
    // Armazena a pontuação atual do jogador.
    result: 0,
    // Armazena o tempo restante do jogo em segundos, começando em 60.
    currentTime: 60,
    // Armazena o número de vidas restantes do jogador, começando com 3.
    lives: 3,
  },
};

/**
 * Função para tocar um som de áudio.
 * Cria um novo objeto Audio e o reproduz.
 *
 * @param {string} audioName - O nome do arquivo de áudio (sem a extensão, ex: "hit").
 * Assume que o arquivo está em `./src/audios/` e é `.m4a`.
 * @param {number} [volume=0.2] - O volume do áudio (opcional, padrão 0.2).
 */
function playSound(audioName, volume = 0.2) {
  // Constrói o caminho completo do arquivo de áudio.
  let audio = new Audio(`./src/audios/${audioName}.m4a`);
  // Define o volume do áudio.
  audio.volume = volume;
  // Toca o áudio.
  audio.play();
}

/**
 * Move o inimigo para um quadrado aleatório no tabuleiro.
 * Remove a classe "enemy" de todos os quadrados e adiciona a um novo quadrado aleatório.
 * Atualiza a posição de acerto (hitPosition) no estado do jogo.
 */
function randomSquare() {
  // Itera sobre cada quadrado no array 'squares'.
  state.view.squares.forEach((square) => {
    // Remove a classe "enemy" de cada quadrado.
    // Isso garante que o inimigo desapareça de sua posição anterior.
    square.classList.remove("enemy");
  });

  // Gera um número inteiro aleatório entre 0 e 8 (inclusive).
  // Este número será o índice do quadrado onde o inimigo aparecerá.
  let randomNumber = Math.floor(Math.random() * 9);
  // Seleciona o quadrado correspondente ao número aleatório gerado.
  let randomSquare = state.view.squares[randomNumber];
  // Adiciona a classe "enemy" ao quadrado selecionado.
  // Isso faz com que o inimigo apareça visualmente neste quadrado.
  randomSquare.classList.add("enemy");
  // Atualiza a propriedade 'hitPosition' no objeto 'state.values'
  // com o ID do quadrado onde o inimigo está agora.
  state.values.hitPosition = randomSquare.id;
}

/**
 * Inicia o movimento do inimigo em intervalos regulares.
 * Usa `setInterval` para chamar a função `randomSquare` a cada `gameVelocity` milissegundos.
 */
function moveEnemy() {
  // Atribui o ID do setInterval à propriedade 'timerId' no objeto 'state.values'.
  // Isso permite que o timer seja parado posteriormente usando clearInterval(state.values.timerId).
  state.values.timerId = setInterval(randomSquare, state.values.gameVelocity);
}

/**
 * Adiciona event listeners de "mousedown" (clique do mouse) a todos os quadrados do tabuleiro.
 * Verifica se o clique foi um acerto (no inimigo) ou um erro.
 * Atualiza a pontuação ou as vidas de acordo.
 */
function addListenerHitBox() {
  // Itera sobre cada quadrado no array 'squares'.
  state.view.squares.forEach((square) => {
    // Adiciona um event listener para o evento "mousedown" (quando o botão do mouse é pressionado)
    // a cada quadrado.
    square.addEventListener("mousedown", () => {
      // Esta função de callback será executada toda vez que um quadrado for clicado.

      // Verifica se o ID do quadrado que foi clicado é igual à 'hitPosition' (onde o inimigo está).
      if (square.id === state.values.hitPosition) {
        // Se a condição for verdadeira (o jogador acertou o inimigo):
        state.values.result++; // Incrementa a pontuação do jogador.
        state.view.score.textContent = state.values.result; // Atualiza o texto do elemento HTML do score.
        state.values.hitPosition = null; // Limpa a 'hitPosition' para evitar que o jogador
        // clique múltiplas vezes no mesmo inimigo e ganhe pontos extras.

        // Toca o som de acerto.
        state.view.audioHit.play();
        // Reinicia o áudio para o início. Isso é importante para que o som possa
        // ser reproduzido novamente imediatamente em cliques rápidos.
        state.view.audioHit.currentTime = 0;

        // Remove a classe "enemy" do quadrado clicado imediatamente.
        // Isso faz com que o inimigo desapareça assim que é acertado,
        // em vez de esperar a próxima mudança de posição.
        square.classList.remove("enemy");
      } else {
        // Se a condição for falsa (o jogador errou o inimigo):
        state.values.lives--; // Decrementa o número de vidas do jogador.
        // Atualiza o texto do elemento HTML das vidas para refletir a nova contagem (ex: "x2", "x1").
        state.view.lives.textContent = "x" + state.values.lives;
        // Verifica se o número de vidas chegou a zero ou menos.
        if (state.values.lives <= 0) {
          // Se as vidas acabaram, chama a função 'endGame' com uma mensagem de erro.
          endGame("Suas vidas acabaram!");
        }
      }
    });
  });
}

/**
 * Gerencia a contagem regressiva do tempo do jogo.
 * Diminui o tempo a cada segundo e atualiza a exibição.
 * Chama a função de fim de jogo quando o tempo chega a zero.
 */
function countDown() {
  state.values.currentTime--; // Decrementa o tempo restante em 1 segundo.
  state.view.timeLeft.textContent = state.values.currentTime; // Atualiza o texto do elemento HTML do tempo.

  // Verifica se o tempo restante chegou a zero ou menos.
  if (state.values.currentTime <= 0) {
    // Se o tempo acabou, chama a função 'endGame' com uma mensagem.
    endGame("O tempo acabou!");
  }
}

/**
 * Lida com o fim do jogo, seja por tempo esgotado ou vidas zeradas.
 * Para todos os timers, exibe uma mensagem de "Game Over" e limpa o tabuleiro.
 *
 * @param {string} message - A mensagem específica do motivo do fim do jogo (ex: "O tempo acabou!").
 */
function endGame(message) {
  // Para o timer que move o inimigo.
  clearInterval(state.values.timerId);
  // Para o timer da contagem regressiva.
  clearInterval(state.values.countDownTimerId);

  // Exibe um alerta com a mensagem de fim de jogo e a pontuação final do jogador.
  alert(
    "Game Over! " + message + " O seu resultado foi: " + state.values.result
  );

  // Remove a classe "enemy" de todos os quadrados para garantir que o tabuleiro
  // esteja limpo após o fim do jogo.
  state.view.squares.forEach((square) => {
    square.classList.remove("enemy");
  });
}

/**
 * Inicializa o jogo.
 * Esta função é o ponto de entrada para iniciar todas as funcionalidades do jogo.
 */
function initialize() {
  // Define a pontuação inicial no elemento HTML do score.
  state.view.score.textContent = state.values.result;
  // Define o tempo inicial no elemento HTML do tempo restante.
  state.view.timeLeft.textContent = state.values.currentTime;
  // Define o número de vidas inicial no elemento HTML das vidas (ex: "x3").
  state.view.lives.textContent = "x" + state.values.lives;

  // Inicia o movimento do inimigo.
  moveEnemy();
  // Adiciona os event listeners de clique a todos os quadrados do tabuleiro.
  addListenerHitBox();
  // Inicia o timer da contagem regressiva do tempo.
  state.values.countDownTimerId = setInterval(countDown, 1000);
}

// Chama a função de inicialização para começar o jogo quando o script é carregado.
initialize();
