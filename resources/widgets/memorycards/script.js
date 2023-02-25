const socket = io()
const cards = document.querySelectorAll('.memory-card')

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

document.addEventListener('keydown', handleKeydown, false)

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;

    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetBoard();
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function handleKeydown(e) {
  alert(e.key)
  switch (e.key) {
    case 'ArrowLeft':
      calculateCardPosition();
      break;
    case 'ArrowUp':
      alert('up');
      break;
    case 'ArrowRight':
      alert('rght');
      break;
    case 'ArrowDown':
      alert('down');
      break;
  }
}

function calculateCardPosition() {
  document.querySelector('.memory-game').children[2].classList.add('bob')

  cards.forEach(function(card, index) {
    if (card.getAttribute('data-index') == 3) {
      //card.classList.add('bob');
    }
  });
}

(function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * 12);
    card.style.order = randomPos;
  });
})();

cards.forEach(function(card, index) {
  card.setAttribute('data-index', index);
  card.addEventListener('click', flipCard);
});

document.addEventListener('keydown', handleKeys);

