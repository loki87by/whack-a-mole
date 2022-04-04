const PRELOAD = document.querySelector(".preload");
const HTML = document.querySelector("html");
const preloadText = document.querySelector(".preload__text");
const HEADER = document.querySelector("header");
const MAIN = document.querySelector("main");
const MENU = document.querySelector(".menu");
const HISCORE = MENU.children[0];
const SCORE = MENU.children[1];
const DAMAGE = MENU.children[2];
const FOOTER = document.querySelector("footer");
const GAME = document.querySelector(".game");
const LEVEL = FOOTER.children[0];
const COUNTDOWN = FOOTER.children[1];
const KICKS = FOOTER.children[2];
const TARGETS = FOOTER.children[3];
const MOLE = document.querySelector(".mole");
const HOLE_CONTAINER = document.querySelector(".game__item");
const WEAPON = document.querySelector(".weapon");
const moleHeight = MOLE.clientHeight;
let holeContainerHeight = HOLE_CONTAINER.clientHeight;

let lastMole;
let timeUp = false;
let score = 0;
let damage = 0;
let drubbing = [];
let gameTime = 30000;
let level = 0;
let hiscore = 0;
let timersArray = [];
let targets = 5;
let kicks = 15;
let minTime = 1000;
let maxTime = 2000;
let lastScore = 0;
let slidePosition = -1;
let started = false;

const randomTime = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

function randomMole() {
  const moles = document.querySelectorAll(".mole");
  const index = Math.floor(Math.random() * moles.length);
  const currentMole = moles[index];
  if (currentMole === lastMole) {
    return randomMole();
  }
  lastMole = currentMole;
  return currentMole;
}

function checkHiscore() {
  const data = localStorage.getItem("hiscore");
  const scoreFromData = JSON.parse(data);
  if (data) {
    hiscore = scoreFromData;
  }
}

function saveScore() {
  if (Math.floor(lastScore / 10) > hiscore) {
    hiscore = Math.floor(lastScore / 10);
    const newData = JSON.stringify(hiscore);
    localStorage.removeItem("hiscore");
    localStorage.setItem("hiscore", newData);
  }
}

function setDrubbing(arg) {
  let drubbingString = "";
  if (!drubbing.some((i) => i === arg)) {
    damage += 12.5;
    if (damage === 100) {
      levelClear();
    }
    drubbing.push(arg);
    drubbing.forEach((i, index) => {
      if (index !== 0) {
        drubbingString += ` `;
      }
      drubbingString += ` url('${window.location.href}/assets/${i}.png'),`;
    });
    drubbingString += ` url('${window.location.href}/assets/mole.png')`;
    const moles = document.querySelectorAll(".mole");
    moles.forEach((i) => {
      i.style = `background-image: ${drubbingString};height: ${holeContainerHeight}px;`;
    });
  }
}

function kick(e) {
  if (!e.isTrusted) {
    return;
  }
  targets -= 1;
  TARGETS.textContent = `Targets: ${targets}`;
  if (targets === 0) {
    levelClear();
  }
  TARGETS.textContent = `Targets: ${targets}`;
  const height = e.target.clientHeight;
  const width = e.target.clientWidth;
  if (
    e.offsetX <= width * 0.3 ||
    e.offsetX >= width * 0.7 ||
    e.offsetY < height * 0.06
  ) {
    return;
  }
  if (e.offsetY <= height * 0.2) {
    setDrubbing("mar");
  } else {
    if (e.offsetX < width * 0.5 && e.offsetY <= height * 0.43) {
      setDrubbing("right-eye");
    } else if (e.offsetX >= width * 0.5 && e.offsetY <= height * 0.43) {
      setDrubbing("left-eye");
    } else {
      if (e.offsetY > height * 0.43 && e.offsetX < width * 0.4) {
        setDrubbing("right-cheek");
      } else if (e.offsetY > height * 0.43 && e.offsetX > width * 0.6) {
        setDrubbing("left-cheek");
      } else {
        if (e.offsetY <= height * 0.5) {
          setDrubbing("nose");
        } else {
          if (e.offsetX >= width * 0.5) {
            setDrubbing("left-tooth");
          } else {
            setDrubbing("right-tooth");
          }
        }
      }
    }
  }
  score += 100 + damage;
  e.target.classList.remove("mole_up");
  SCORE.textContent = `Score: ${Math.floor(score / 10)}`;
  DAMAGE.textContent = `Damage: ${damage}%`;
  HISCORE.textContent = `Hiscore: ${hiscore}`;
}

function end() {
  timeUp = true;
  started = false;
}

function checkCicks() {
  if (kicks === 0) {
    if (damage === 100 || targets === 0) {
      levelClear();
    } else {
      gameOver();
    }
    timersArray.forEach((i) => {
      clearTimeout(i);
    });
  }
}

function openPopup(text1, text2, func) {
  const popup = document.querySelector(".popup");
  popup.classList.add("popup_opened");
  const title = popup.querySelector(".popup__title");
  title.textContent = text1;
  const restart = document.getElementById("restart");
  restart.textContent = "Переиграть уровень";
  restart.addEventListener("click", restartGame);
  const next = document.getElementById("next");
  next.textContent = text2;
  const container = document.querySelector(".popup__container");
  container.appendChild(next);
  next.addEventListener("click", func);
}

function restartGame() {
  score = lastScore;
  closePopup();
  end();
  start();
}

function countdownToScore() {
  if (gameTime / 1000 > 0) {
    setTimeout(() => {
      gameTime -= 1000;
      score += 10;
      COUNTDOWN.textContent = `Countdown: ${gameTime / 1000}`;
      SCORE.textContent = `Score: ${Math.floor(score / 10)}`;
      return countdownToScore();
    }, 100);
  } else {
    return;
  }
}

function nextLevel() {
  countdownToScore();
  setTimeout(() => {
    level++;
    start();
    closePopup();
  }, 3000);
}

function fullRestart() {
  level = 0;
  lastScore = 0;
  restartGame();
}

function levelClear() {
  timersArray.forEach((i) => {
    clearTimeout(i);
  });
  openPopup("Ты справился!", "Следующий уровень", nextLevel);
  end();
}

function gameOver() {
  openPopup("Не справился!", "Начать сначала", fullRestart);
}

function closePopup() {
  const popup = document.querySelector(".popup");
  const restart = document.getElementById("restart");
  restart.removeEventListener("click", restartGame);
  const next = document.getElementById("next");
  next.removeEventListener("click", fullRestart);
  next.removeEventListener("click", nextLevel);
  popup.classList.remove("popup_opened");
}

function peep() {
  const time = randomTime(minTime, maxTime);
  const mole = randomMole();
  mole.classList.add("mole_up");
  setTimeout(() => {
    mole.classList.remove("mole_up");
    if (!timeUp && kicks > 0) {
      saveScore();
      peep();
    }
  }, time);
  GAME.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    kicks -= 1;
    if (kicks < 1) {
      kicks = 0
    }
    KICKS.textContent = `Kicks: ${kicks}`;
    WEAPON.classList.remove("weapon_kicked");
    const left = +WEAPON.style.left.replace("px", "");
    setTimeout(() => {
      WEAPON.classList.add("weapon_kicked");
    }, 300);
    if (e.target.classList.contains("mole_up")) {
      kick(e);
      checkCicks();
    } else {
      checkCicks();
      return;
    }
  });
}

function counter() {
  const countdownTimer = setTimeout(() => {
    gameTime -= 1000;
    COUNTDOWN.textContent = `Countdown: ${gameTime / 1000}`;
    counter();
  }, 1000);
  timersArray.push(countdownTimer);
  if (gameTime === 0) {
    timersArray.forEach((i) => {
      clearTimeout(i);
    });
    gameOver();
  }
}

function copySelector(element, parent) {
  const copy = element.cloneNode(true);
  parent.appendChild(copy);
}

function setLevelData() {
  let firstColor = 'f'
  let secondColor = 'f'
  let thirdColor = level
  drubbing = [];
  timeUp = false;
  damage = 0;
  if (15 - level >= 10) {
    kicks = 15 - level;
  } else {
    kicks = 10;
  }
  if (5 + level < 10) {
    targets = 5 + level;
  } else {
    targets = 10;
  }
  gameTime = (30 - level) * 1000;
  LEVEL.textContent = `Level: ${level + 1}`;
  SCORE.textContent = `Score: ${Math.floor(score / 10)}`;
  HISCORE.textContent = `Hiscore: ${hiscore}`;
  COUNTDOWN.textContent = `Countdown: ${gameTime / 1000}`;
  TARGETS.textContent = `Targets: ${targets}`;
  DAMAGE.textContent = `Damage: ${damage}`;
  KICKS.textContent = `Kicks: ${kicks}`;
  minTime = 1000 - level * 75;
  maxTime = 3000 - level * 100;
  if (level < 3) {
    WEAPON.src="./assets/rolling-pin.png"
    const HOLES = document.querySelectorAll(".game__item")
    if (HOLES.length > 6) {
      for(let i = 6; i < HOLES.length; i++) {
        GAME.removeChild(HOLES[i])
      }
      GAME.style = ''
    }
    firstColor = 'f'
  secondColor = 'f'
  thirdColor = level
  }
  if (level >= 3) {
    copySelector(HOLE_CONTAINER, GAME);
    copySelector(HOLE_CONTAINER, GAME);
    GAME.style =
      "grid-template-columns: repeat(4, 1fr);grid-template-rows: repeat(2, calc((100vh - 15vmin) / 3.2))";
    WEAPON.src = "./assets/pan.png";
    firstColor = level
  }
  if (level >= 5) {
    WEAPON.src = "./assets/hammer.png";
    secondColor = level
    thirdColor = 'f'
  }
  HTML.style.setProperty("--back", `#${firstColor}${firstColor}${secondColor}${secondColor}${thirdColor}${thirdColor}`);
}

function start() {
  if (!started) {
    setLevelData();
    lastScore = score;
    setMolesHeight();
    peep();
    counter();
    started = true;
    const gameTimer = setTimeout(() => {
      timeUp = true;
      started = false;
    }, gameTime);
    timersArray.push(gameTimer);
  }
}

function setMolesHeight() {
  holeContainerHeight = HOLE_CONTAINER.clientHeight;
  const moles = document.querySelectorAll(".mole");
  moles.forEach((item) => {
    item.style = `height: ${holeContainerHeight}px;`;
  });
  WEAPON.style.height = `${holeContainerHeight}px`;
}

checkHiscore();

setMolesHeight();

function weapon(e) {
  if (WEAPON.src === `${window.location.href}/assets/hammer.png`) {
    WEAPON.style.left = `${Math.floor(e.pageX - WEAPON.width * 0.55)}px`;
    WEAPON.style.top = `${Math.floor(e.pageY - WEAPON.height * 0.9)}px`;
  } else if (WEAPON.src === `${window.location.href}/assets/pan.png`) {
    WEAPON.style.left = `${Math.floor(e.pageX - WEAPON.width * 1.1)}px`;
    WEAPON.style.top = `${Math.floor(e.pageY - WEAPON.height / 1.2)}px`;
  } else {
    WEAPON.style.left = `${Math.floor(e.pageX - WEAPON.width * 2.4)}px`;
    WEAPON.style.top = `${
      Math.floor(e.pageY - WEAPON.height * 0.83)
    }px`;
  }
}

function preloadTextShift() {
  let bottom = +preloadText.style.bottom.replace("%", "");
  if (bottom < 125) {
    setTimeout(() => {
      bottom += 1;
      preloadText.style.bottom = `${bottom}%`;
      return preloadTextShift();
    }, 200);
  } else {
    PRELOAD.classList.add("hidden");
    HEADER.classList.remove("hidden");
    MAIN.classList.remove("hidden");
    FOOTER.classList.remove("hidden");
    start();
  }
  if ((bottom % 150 !== 0 && bottom % 25 === 0) || bottom === 0) {
    slidePosition++;
    const slides = document.querySelectorAll(".preload__slide");
    slides.forEach((slide) => {
      slide.style.left = `-${slidePosition * 100}%`;
    });
  }
}

document.addEventListener("DOMContentLoaded", preloadTextShift);
GAME.addEventListener("mousemove", weapon);
