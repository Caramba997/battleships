/**
 * Abstract class for all sections
 */
class Section {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    console.warn('Init method for class missing');
  }

  afterInit() {
    Html.sectionLoadComplete();
  }

  destroy() {
    console.warn('Destroy method for class missing');
  }

}

/**
 * Helper class to make requests to API
 */
class API {

  static defaults = {
    // apiHost: 'http://192.168.178.61:8080',
    // htmlHost: 'http://192.168.178.61:5500',
    apiHost: 'http://localhost:8080',
    htmlHost: 'http://localhost:5500',
    htmlPrefix: '/',
    htmlSuffix: '.html',
    // apiHost: 'https://fc-battleships.herokuapp.com',
    // htmlHost: 'https://fc-battleships.herokuapp.com',
    // htmlPrefix: '/web/',
    // htmlSuffix: '',
    version: 'v1.3',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  static async post(path, data, authorization = false) {
    const headers = this.defaults.headers;
    if (authorization) {
      const token = Cookies.get('token');
      if (!token) {
        console.error('Post error: No auth token present');
        Html.loadSection('home');
        return false;
      }
      headers['Authorization'] = 'Bearer ' + token;
    }
    const response = await fetch(this.defaults.apiHost + path, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: headers
    }).then((response) => {
      if (response.status === 200) return response.json();
      if (response.status === 403) this.resetAuth();
      throw `Server responded with status ${response.status}`;
    }).then((result) => {
      return result;
    }).catch((error) => {
      console.error(`Error on post request to ${path}:\n`, error);
    });
    return response;
  }

  static async get(path, authorization = false) {
    const headers = this.defaults.headers;
    if (authorization) {
      const token = Cookies.get('token');
      if (!token) {
        console.error('Post error: No auth token present');
        return false;
      }
      headers['Authorization'] = 'Bearer ' + token;
    }
    const response = await fetch(this.defaults.apiHost + path, {
      method: 'GET',
      headers: headers
    }).then((response) => {
      if (response.status === 200) return response.json();
      if (response.status === 403) this.resetAuth();
      throw `Server responded with status ${response.status}`;
    }).then((result) => {
      return result;
    }).catch((error) => {
      console.error(`Error on get request to ${path}:\n`, error);
    });
    return response;
  }

  static resetAuth() {
    Cookies.set('token', '', '0ms');
    Html.loadSection('login');
  }

  static async html(path) {
    const response = await fetch(this.defaults.htmlHost + this.defaults.htmlPrefix + path + this.defaults.htmlSuffix, {
      method: 'GET'
    }).then((response) => {
      if (response.status === 200) return response.text();
      throw `Server responded with status ${response.status}`;
    }).then((result) => {
      return result;
    }).catch((error) => {
      console.error(`Error on html request to ${path}:\n`, error);
    });
    return response;
  }

}

/**
 * Helper class for html operations
 */
class Html {

  static getFormAsObject(form) {
    const formData = new FormData(form),
          jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });
    return jsonData;
  }

  static async loadSection(page) {
    const loadingContainer = document.querySelector('#loading-container'),
          sectionContainer = document.querySelector('#section-container');
    sectionContainer.classList.add('loading');
    sectionContainer.innerHTML = '';
    loadingContainer.classList.add('loading');
    const newHtml = await API.html(page),
          newSection = newHtml.substring(newHtml.indexOf('<body>') + 6, newHtml.indexOf('</body>')),
          tempHtml = document.createElement('DIV');
    tempHtml.innerHTML = newSection;
    sectionContainer.appendChild(tempHtml.children[0]);
    document.dispatchEvent(new CustomEvent('sectionChange'));
  }

  static sectionLoadComplete() {
    const loadingContainer = document.querySelector('#loading-container'),
          sectionContainer = document.querySelector('#section-container');
    loadingContainer.classList.remove('loading');
    sectionContainer.classList.remove('loading');
  }

  static calcCssVariables() {
    const preferredAspectRatio = 16 / 9,
          windowWidth = window.innerWidth,
          windowHeight = window.innerHeight,
          aspectRatio = windowWidth / windowHeight;
    let screenWidth = 1600,
        screenHeight = 900,
        backgroundFieldSize = Math.ceil(screenWidth / 16),
        fontSize = 16,
        fieldSize = 35;
    if (aspectRatio > preferredAspectRatio) {
      // Width is bigger
      const factor = windowHeight / 9;
      screenWidth = Math.ceil(factor * 16);
      screenHeight = windowHeight;
      backgroundFieldSize = Math.ceil(windowWidth / 16);
      fontSize = Math.ceil(windowWidth / 160 * 2);
      fieldSize = Math.ceil(windowHeight / 90 * 5);
    }
    else {
      // Height is bigger
      const factor = windowWidth / 16;
      screenWidth = windowWidth;
      screenHeight = Math.ceil(factor * 9);
      backgroundFieldSize = windowHeight / 9;
      fontSize = Math.ceil(windowHeight / 90 * 2);
      fieldSize = Math.ceil(windowWidth / 160 * 5);
    }
    const root = document.querySelector(':root');
    root.style.setProperty('--screen-width', screenWidth + 'px');
    root.style.setProperty('--screen-height', screenHeight + 'px');
    root.style.setProperty('--background-field-size', backgroundFieldSize + 'px');
    root.style.setProperty('--base-font-size', fontSize + 'px');
    root.style.setProperty('--field-size', fieldSize + 'px');
  }

  static openModal(name) {
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    modal.setAttribute('data-visible', 'true');
    modal.querySelector('[data-action="close"]').addEventListener('click', (e) => {
      e.target.closest('.modal').setAttribute('data-visible', 'false');
    }, { once: true });
  }

  static closeModal(name) {
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    modal.setAttribute('data-visible', 'false');
  }

  static calcTime(date1, date2) {
    var padZeros = function(number) {
      let string = '' + number;
      while (string.length < 2) {
        string = '0' + string;
      }
      return string;
    }
    const seconds = 1000,
          minutes = seconds * 60,
          hours = minutes * 60,
          days = hours * 24;
    const startDate = date1.getTime(),
          endDate = date2.getTime(),
          diff = endDate - startDate,
          diffSeconds = Math.floor(diff % minutes / seconds),
          diffMinutes = Math.floor(diff % hours / minutes),
          diffHours = Math.floor(diff % days / hours),
          diffDays = Math.floor(diff / days);
    return `${padZeros(diffDays)}:${padZeros(diffHours)}:${padZeros(diffMinutes)}:${padZeros(diffSeconds)}`;
  }

}

/**
 * Helper class to work with cookies
 */
class Cookies {

  /**
   * Get the cookie for a given name, returns an empty string if cookie does not exist.
   */
  static get(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return false;
  };

  /**
   * Set a cookie with name, value and expire. If expire is undefined, it will be a session cookie. Expire may have one of the following formats:
   * - 365d (365 days)
   * - 3h (3 hours)
   * - 3m (3 minutes)
   * - 3s (3 seconds)
   * - 3ms (3 milliseconds)
   */
  static set(cname, cvalue, expire = false) {
    if (expire) {
      var d = new Date();
      if (expire.match(/\d{1,3}d$/)) {
        const exdays = parseInt(expire);
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
      }
      else if (expire.match(/\d{1,3}h$/)) {
        const exhours = parseInt(expire);
        d.setTime(d.getTime() + (exhours*60*60*1000));
      }
      else if (expire.match(/\d{1,3}m$/)) {
        const exminutes = parseInt(expire);
        d.setTime(d.getTime() + (exminutes*60*1000));
      }
      else if (expire.match(/\d{1,3}s$/)) {
        const exseconds = parseInt(expire);
        d.setTime(d.getTime() + (exseconds*1000));
      }
      else if (expire.match(/\d{1,3}ms$/)) {
        const exmilliseconds = parseInt(expire);
        d.setTime(d.getTime() + (exmilliseconds));
      }
      else {
        console.error(`Expire time invalid of cookie "${cname}" invalid`);
        return;
      }
      var expires = 'expires='+ d.toUTCString();
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }
    else {
      document.cookie = cname + '=' + cvalue + ';path=/';
    }
  };

}

/**
 * Helper class to work with game boards
 */
class Board {

  static fill(element, data) {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const field = this.coordToField(x, y),
              fieldData = data[x][y];
        element.querySelector(`[data-field="${field}"]`).setAttribute('data-type', fieldData);
      }
    }
  }

  static coordToField(x, y) {
    const xValues = "ABCDEFGHIJ";
    return `${xValues.substring(x, x + 1)}${y + 1}`;
  }

  static fieldToCoord(field) {
    const xValues = "ABCDEFGHIJ",
          x = xValues.indexOf(field.substring(0, 1)),
          y = parseInt(field.substring(1, field.length)) - 1;
    return [x, y];
  }

}

/**
 * Section for background
 */
class Background extends Section {

  animations = [
    {
      name: 'WATER',
      time: 10
    },
    {
      name: 'LIFEBELT',
      time: 10
    },
    {
      name: 'SUNK',
      time: 10
    },
    {
      name: 'MISS',
      time: 10
    }
  ];

  init() {
    console.info('Init Login Section');
    this.interval = window.setInterval(this.randomAnimation.bind(this), 2000);
  }

  destroy() {
    window.clearInterval(this.interval);
  }

  randomAnimation() {
    const x = Math.floor(Math.random() * 16) + 1,
          y = Math.floor(Math.random() * 9) + 1,
          animation = Math.floor(Math.random() * 4),
          field = this.element.querySelector(`#background-container tr:nth-of-type(${y}) td:nth-of-type(${x})`);
    field.setAttribute('data-animation', this.animations[animation].name);
    window.setTimeout(() => {
      field.removeAttribute('data-animation');
    }, this.animations[animation].time * 1000);
  }

}

/**
 * Section for index
 */
class Home extends Section {

  async init() {
    console.info('Init Home Section');
    const player = await API.get('/api/players/refresh', true);
    if (player) {
      this.player = player;
      this.processLoggedIn();
    }
    else {
      this.element.querySelector('[data-state="loggedOut"]').classList.remove('d-none');
    }

    this.element.querySelector('[data-var="version"]').innerText = API.defaults.version;

    const logoutButton = this.element.querySelector('[data-action="logout"]');
    logoutButton.addEventListener('click', this.logout.bind(this));
    const loginButton = this.element.querySelector('[data-action="login"]');
    loginButton.addEventListener('click', this.login.bind(this));
    const signupButton = this.element.querySelector('[data-action="signup"]');
    signupButton.addEventListener('click', this.signup.bind(this));
    const startButton = this.element.querySelector('[data-action="start"]');
    startButton.addEventListener('click', this.startGame.bind(this));
    const refreshButton = this.element.querySelector('[data-action="refresh"]');
    refreshButton.addEventListener('click', this.refresh.bind(this));
    this.afterInit();
  }

  processLoggedIn() {
    this.element.querySelector('[data-state="loggedIn"]').classList.remove('d-none');
    this.element.querySelector('[data-var="username"]').innerText = this.player.username;
    this.displayOpenRequests();
    this.displayActiveGames();
    this.displaySentRequests();
    this.displayArchivedGames();
  }

  displayOpenRequests() {
    const container = this.element.querySelector('[data-list="openRequests"]'),
          requests = this.player.openRequests,
          html = '<li data-challenger="{{challenger}}">Von {{challenger}}<button class="ml-1" data-action="acceptRequest">Annehmen</button><button class="ml-02" data-action="declineRequest">Ablehnen</button></li>';
    let newHtml = '';
    for (let i = requests.length - 1; i >= 0; i--) {
      const tempHtml = html.replaceAll('{{challenger}}', requests[i].challenger);
      newHtml += tempHtml;
    }
    if (newHtml !== '') container.innerHTML = newHtml;
    const acceptButtons = container.querySelectorAll('[data-action="acceptRequest"]');
    acceptButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const challenger = e.target.closest('[data-challenger]').getAttribute('data-challenger'),
              response = await API.post('/api/players/acceptMatch', { target: challenger }, true);
        if (response) {
          Cookies.set('currentGame', response.id, '3d');
          Html.loadSection('setup');
        }
      });
    });
    const declineButtons = container.querySelectorAll('[data-action="declineRequest"]');
    declineButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const challenger = e.target.closest('[data-challenger]').getAttribute('data-challenger'),
              response = await API.post('/api/players/declineMatch', { target: challenger }, true);
        if (response) {
          Html.loadSection('home');
        }
      });
    });
  }

  displayActiveGames() {
    const container = this.element.querySelector('[data-list="activeGames"]'),
          games = this.player.activeGames,
          html = '<li data-id="{{id}}" data-index="{{index}}"><div class="target"></div> {{enemy}}<button class="ml-1" data-action="play">Spielen</button></li>';
    let newHtml = '';
    for (let i = games.length - 1; i >= 0; i--) {
      let tempHtml = html.replaceAll('{{enemy}}', games[i].player2);
      tempHtml = tempHtml.replaceAll('{{id}}', games[i].id);
      tempHtml = tempHtml.replaceAll('{{index}}', i);
      newHtml += tempHtml;
    }
    if (newHtml !== '') container.innerHTML = newHtml;
    const playButtons = container.querySelectorAll('[data-action="play"]');
    playButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const id = e.target.closest('[data-id]').getAttribute('data-id'),
              index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'));
        Cookies.set('currentGame', id, '3d');
        if (games[index].board1.valid) {
          Html.loadSection('game');
        }
        else {
          Html.loadSection('setup');
        }
      });
      const index = parseInt(button.closest('[data-index]').getAttribute('data-index'));
      if ((games[index].state === 'STARTED' && games[index].turn === games[index].player1) || (games[index].state === 'SETUP' && !games[index].board1.valid)) button.setAttribute('data-turn', 'true');
    });
  }

  displaySentRequests() {
    const container = this.element.querySelector('[data-list="sentRequests"]'),
          requests = this.player.sentRequests,
          html = '<li data-target="{{target}}"><div class="target"></div> {{target}}<button class="ml-1" data-action="deleteRequest">L??schen</button></li>';
    let newHtml = '';
    for (let i = requests.length - 1; i >= 0; i--) {
      const tempHtml = html.replaceAll('{{target}}', requests[i].target);
      newHtml += tempHtml;
    }
    if (newHtml !== '') container.innerHTML = newHtml;
    const deleteButtons = container.querySelectorAll('[data-action="deleteRequest"]');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const target = e.target.closest('[data-target]').getAttribute('data-target'),
              response = await API.post('/api/players/deleteMatch', { target: target }, true);
        if (response) {
          Html.loadSection('home');
        }
      });
    });
  }

  displayArchivedGames() {
    const container = this.element.querySelector('[data-list="archivedGames"]'),
          games = this.player.archiveGames,
          html = '<li data-target="{{enemy}}" data-id="{{id}}"><div class="target"></div> {{enemy}} - {{result}}<button class="ml-1" data-action="archive">&#128269;</button><button class="ml-02" data-action="rematch">Nochmal</button><div data-error="match" class="error ml-1">Fehler</div></li>';
    let newHtml = '';
    for (let i = games.length - 1; i >= 0; i--) {
      let tempHtml = html.replaceAll('{{enemy}}', games[i].player2);
      tempHtml = tempHtml.replaceAll('{{id}}', games[i].id);
      tempHtml = games[i].winner === games[i].player1 ? tempHtml.replaceAll('{{result}}', 'Sieg') : tempHtml.replaceAll('{{result}}', 'Niederlage');
      newHtml += tempHtml;
    }
    if (newHtml !== '') container.innerHTML = newHtml;
    const rematchButtons = container.querySelectorAll('[data-action="rematch"]');
    rematchButtons.forEach((button) => {
      const target = button.closest('[data-target]').getAttribute('data-target');
      if (!this.rematchPossible(target)) {
        button.classList.add('d-none');
        return;
      }
      button.addEventListener('click', async (e) => {
        const errorElement = e.target.parentElement.querySelector('[data-error="match"]'),
              data = { target: e.target.closest('[data-target]').getAttribute('data-target') },
              response = await API.post('/api/players/match', data, true);
        if (response) {
          this.refresh();
        }
        else {
          errorElement.classList.add('visible');
        }
      });
    });
    const archiveButtons = container.querySelectorAll('[data-action="archive"]');
    archiveButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const id = e.target.closest('[data-id]').getAttribute('data-id');
        Cookies.set('currentGame', id, '3d');
        Html.loadSection('archive');
      });
    });
    const archiveItems = container.querySelectorAll('li');
    if (archiveItems.length > 5) {
      const moreButton = this.element.querySelector('[data-action="more"]'),
            lessButton = this.element.querySelector('[data-action="less"]');
      moreButton.classList.remove('d-none');
      for (let i = 5; i < archiveItems.length; i++) {
        archiveItems[i].classList.add('d-none');
      }
      moreButton.addEventListener('click', () => {
        for (let i = 5; i < archiveItems.length; i++) {
          archiveItems[i].classList.remove('d-none');
          moreButton.classList.add('d-none');
          lessButton.classList.remove('d-none');
        }
      });
      lessButton.addEventListener('click', () => {
        for (let i = 5; i < archiveItems.length; i++) {
          archiveItems[i].classList.add('d-none');
          lessButton.classList.add('d-none');
          moreButton.classList.remove('d-none');
        }
      });
    }
  }

  rematchPossible(player) {
    if (player === 'KI-Gegner') return false;
    const openRequests = this.player.openRequests;
    for (let i = 0; i < openRequests.length; i++) {
      if (openRequests[i].challenger === player) {
        return false;
      }
    }
    const activeGames = this.player.activeGames;
    for (let i = 0; i < activeGames.length; i++) {
      if (activeGames[i].player2 === player) {
        return false;
      }
    }
    const sentRequests = this.player.sentRequests;
    for (let i = 0; i < sentRequests.length; i++) {
      if (sentRequests[i].target === player) {
        return false;
      }
    }
    return true;
  }

  logout() {
    Cookies.set('token', '', '0ms');
    this.element.querySelector('[data-state="loggedIn"]').classList.add('d-none');
    this.element.querySelector('[data-state="loggedOut"]').classList.remove('d-none');
  }

  login() {
    Html.loadSection('login');
  }

  signup() {
    Html.loadSection('signup');
  }

  startGame() {
    Html.loadSection('presetup');
  }

  refresh() {
    Html.loadSection('home');
  }

}

/**
 * Section for login
 */
class Login extends Section {

  init() {
    console.info('Init Login Section');
    const loginButton = this.element.querySelector('[data-action="login"]');
    loginButton.addEventListener('click', this.login.bind(this));
    const passwordInput = this.element.querySelector('input[type="password"]');
    passwordInput.addEventListener('keydown', this.enter.bind(this));
    const signupButton = this.element.querySelector('[data-action="signup"]');
    signupButton.addEventListener('click', this.signup.bind(this));
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    this.afterInit();
  }

  async login(event) {
    const data = Html.getFormAsObject(event.target.closest('form')),
          response = await API.post('/login', data),
          errorElement = this.element.querySelector('[data-error="login"]');
    errorElement.classList.remove('visible');
    if (response) {
      Cookies.set('token', response.token, `${response.tokenExpiration}ms`);
      Html.loadSection('home');
    }
    else {
      errorElement.classList.add('visible');
    }
  }

  enter(event) {
    if (event.keyCode !== 13) return;
    this.login(event);
  }

  index() {
    Html.loadSection('home');
  }

  signup() {
    Html.loadSection('signup');
  }

}

/**
 * Section for login
 */
class Signup extends Section {

  static defaults = {
    differentPasswordError: 'Die Passw??rter sind nicht identisch.',
    signupError: 'Registrieren fehlgeschlagen. Entweder ist der Username schon vergeben oder der Server nicht erreichbar.'
  }

  init() {
    console.info('Init Signup Section');
    const signupButton = this.element.querySelector('[data-action="signup"]');
    signupButton.addEventListener('click', this.signup.bind(this));
    const loginButton = this.element.querySelector('[data-action="login"]');
    loginButton.addEventListener('click', this.login.bind(this));
    const passwordInput = this.element.querySelector('input[type="password"]:not([name])');
    passwordInput.addEventListener('keydown', this.enter.bind(this));
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    this.afterInit();
  }

  async signup(event) {
    const passwordElements = this.element.querySelectorAll('input[type="password"]'),
          errorElement = this.element.querySelector('[data-error="signup"]');
    errorElement.classList.remove('visible');
    let password = null,
        valid = true;
    passwordElements.forEach((element) => {
      if (password === null) {
        password = element.value;
      }
      else if (password !== element.value) {
        valid = false;
      }
    });
    if (!valid) {
      errorElement.innerText = Signup.defaults.differentPasswordError;
      errorElement.classList.add('visible');
      return;
    }
    const data = Html.getFormAsObject(event.target.closest('form')),
          response = await API.post('/signup', data);
    if (response) {
      this.element.querySelector('[data-state="success"]').classList.remove('d-none');
      this.element.querySelector('[data-state="signup"]').classList.add('d-none');
    }
    else {
      errorElement.innerText = Signup.defaults.signupError;
      errorElement.classList.add('visible');
    }
  }

  login() {
    Html.loadSection('login');
  }

  index() {
    Html.loadSection('home');
  }

  enter(event) {
    if (event.keyCode !== 13) return;
    this.login(event);
  }

}

/**
 * Section for presetup
 */
class Presetup extends Section {

  init() {
    console.info('Init Presetup Section');
    const singleplayerButton = this.element.querySelector('[data-action="singleplayer"]');
    singleplayerButton.addEventListener('click', this.singleplayer.bind(this));
    const multiplayerButton = this.element.querySelector('[data-action="multiplayer"]');
    multiplayerButton.addEventListener('click', this.multiplayer.bind(this));
    const randomButton = this.element.querySelector('[data-action="random"]');
    randomButton.addEventListener('click', this.random.bind(this));
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    const playerInput = this.element.querySelector('input[name="target"]');
    playerInput.addEventListener('keydown', this.enter.bind(this));
    this.afterInit();
  }

  async singleplayer() {
    const game = await API.get('/api/setup/singleplayer', true);
    if (game) {
      Cookies.set('currentGame', game.id, '3d');
      Html.loadSection('setup');
    }
  }

  async multiplayer(event) {
    const successElement = this.element.querySelector('[data-success="match"]'),
          errorElement = this.element.querySelector('[data-error="match"]');
    successElement.classList.add('d-none');
    errorElement.classList.remove('visible');
    const data = Html.getFormAsObject(event.target.closest('form')),
          response = await API.post('/api/players/match', data, true);
    if (response) {
      successElement.classList.remove('d-none');
    }
    else {
      errorElement.classList.add('visible');
    }
  }

  async random() {
    const successElement = this.element.querySelector('[data-success="random"]'),
          errorElement = this.element.querySelector('[data-error="random"]');
    successElement.classList.add('d-none');
    errorElement.classList.remove('visible');
    const response = await API.get('/api/players/randomMatch', true);
    if (response) {
      successElement.classList.remove('d-none');
      successElement.querySelector('[data-var="enemy"]').innerText = response.target;
    }
    else {
      errorElement.classList.add('visible');
    }
  }

  enter(event) {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    this.multiplayer(event);
  }

  index() {
    Html.loadSection('home');
  }

}

/**
 * Section for setup
 */
class Setup extends Section {

  async init() {
    console.info('Init Setup Section');
    const gameId = Cookies.get('currentGame'),
          game = await API.post('/api/games/getActive', { id: gameId }, true);
    if (!game) return;
    this.game = game;
    this.shipsChanged();
    this.clearPreview();
    if (game.state === 'SETUP') {
      const randomButton = this.element.querySelector('[data-action="random"]');
      randomButton.addEventListener('click', this.random.bind(this));
      const shipButtons = this.element.querySelectorAll('[data-ship]');
      shipButtons.forEach((button) => {
        button.addEventListener('click', this.selectShip.bind(this));
      });
      const rotateButton = this.element.querySelector('[data-tool="rotate"]');
      rotateButton.addEventListener('click', this.rotate.bind(this));
      const removeButton = this.element.querySelector('[data-tool="remove"]');
      removeButton.addEventListener('click', this.remove.bind(this));
      this.element.querySelector('[data-board="player"]').addEventListener('mouseleave', this.clearBoardPreview.bind(this));
      const fields = this.element.querySelectorAll('[data-board="player"] [data-field]');
      fields.forEach((field) => {
        field.addEventListener('click', this.placeShip.bind(this));
        field.addEventListener('mouseover', this.preview.bind(this));
      });
      this.afterInit();
    }
    else {
      const buttons = this.element.querySelectorAll('button:not([data-action="start"])');
      buttons.forEach((button) => {
        button.setAttribute('data-enabled', 'false');
      });
    }
    const startButton = this.element.querySelector('[data-action="start"]');
    startButton.addEventListener('click', this.start.bind(this));
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
  }

  placeShip(event) {
    if (this.currentShip && !this.currentShip.coordinates) {
      const [x, y] = Board.fieldToCoord(event.target.getAttribute('data-field')),
            ship = this.currentShip;
      if (!this.validateShip(x, y)) {
        this.shipInvalid();
        return;
      }
      const board = this.game.board1.board;
      ship.coordinates = [];
      for (let i = 0; i < ship.length; i++) {
        const ix = ship.direction === 0 ? x + i : x,
              iy = ship.direction === 1 ? y + i : y,
              coord = { x: ix, y: iy };
        ship.coordinates.push(coord);
        board[ix][iy] = 'SHIP';
      }
      this.selectField(x, y);
      this.shipsChanged();
      const activeShipButton = this.element.querySelector('[data-ship][data-selected="true"]');
      activeShipButton.click();
    }
  }

  validateShip(x, y) {
    const ship = this.currentShip;
    if (ship.direction === 0 && x + ship.length - 1 >= 10) return false;
    if (ship.direction === 1 && y + ship.length - 1 >= 10) return false;
    const board = this.game.board1.board;
    for (let i = 0; i < ship.length; i++) {
      const ix = ship.direction === 0 ? x + i : x,
            iy = ship.direction === 1 ? y + i : y;
      for (let xVar = -1; xVar <= 1; xVar++) {
        for (let yVar = -1; yVar <= 1; yVar++) {
          const checkX = ix + xVar,
                checkY = iy + yVar;
          if (checkX < 0 || checkX >= 10 || checkY < 0 || checkY >= 10) continue;
          if (board[checkX][checkY] == 'SHIP') return false;
        }
      }
    }
    return true;
  }

  shipInvalid() {
    console.warn('Ship invalid');
  }

  preview(event) {
    const ship = this.currentShip;
    if (ship && !ship.coordinates) {
      this.clearBoardPreview();
      event.target.classList.add('pointer');
      const [x, y] = Board.fieldToCoord(event.target.getAttribute('data-field'));
      if (this.validateShip(x, y)) {
        for (let i = 0; i < ship.length; i++) {
          const ix = ship.direction === 0 ? x + i : x,
                iy = ship.direction === 1 ? y + i : y;
          this.element.querySelector(`[data-board="player"] [data-field="${Board.coordToField(ix, iy)}"]`).setAttribute('data-preview', 'valid');
        }
      }
      else {
        this.element.querySelector(`[data-board="player"] [data-field="${Board.coordToField(x, y)}"]`).setAttribute('data-preview', 'invalid');
      }
    }
  }

  clearBoardPreview() {
    const fields = this.element.querySelectorAll('[data-board="player"] [data-field]'),
          removePointer = this.currentShip && this.currentShip.coordinates ? false : true;
    fields.forEach((field) => {
      field.removeAttribute('data-preview');
      if (removePointer) field.classList.remove('pointer');
    });
  }

  selectShip(event) {
    const target = event.target,
          shipButtons = this.element.querySelectorAll('[data-ship]');
    shipButtons.forEach((button) => {
      button.setAttribute('data-selected', 'false');
    });
    target.setAttribute('data-selected', 'true');
    const ships = this.game.board1.ships,
          shipName = target.getAttribute('data-ship');
    for (let i = 0; i < ships.length; i++) {
      if (ships[i].name === shipName) {
        this.currentShip = ships[i];
        break;
      }
    }
    const rotateButton = this.element.querySelector('[data-tool="rotate"]'),
          removeButton = this.element.querySelector('[data-tool="remove"]');
    if (this.currentShip.coordinates) {
      rotateButton.setAttribute('data-enabled', 'false');
      removeButton.setAttribute('data-enabled', 'true');
      this.selectField(this.currentShip.coordinates[0].x, this.currentShip.coordinates[0].y);
    }
    else {
      rotateButton.setAttribute('data-enabled', 'true');
      removeButton.setAttribute('data-enabled', 'false');
      this.removePointerFromBoard();
    }
    this.previewChanged();
    this.shipsChanged();
  }

  selectField(x, y) {
    this.removePointerFromBoard();
    this.element.querySelector(`[data-board="player"] [data-field="${Board.coordToField(x, y)}"]`).classList.add('pointer');
  }

  removePointerFromBoard() {
    const fields = this.element.querySelectorAll('[data-board="player"] [data-field]');
    fields.forEach((field) => {
      field.classList.remove('pointer');
    });
  }

  previewChanged() {
    this.clearPreview();
    const previewElement = this.element.querySelector('[data-board="preview"]'),
          ship = this.currentShip;
    previewElement.querySelector('[data-field="A1"]').classList.add('pointer');
    for (let k = 0; k < ship.length; k++) {
      let x = 0,
          y = 0;
      if (ship.direction === 0) {
        x += k;
      }
      else {
        y += k;
      }
      previewElement.querySelector(`[data-field="${Board.coordToField(x, y)}"]`).setAttribute('data-type', 'SHIP');
    }
  }

  clearPreview() {
    const previewElement = this.element.querySelector('[data-board="preview"]');
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const field = Board.coordToField(x, y);
        previewElement.querySelector(`[data-field="${field}"]`).setAttribute('data-type', 'WATER');
      }
    }
  }

  shipsChanged() {
    const ships = this.game.board1.ships,
          shipsElement = this.element.querySelector('.ships'),
          boardElement = this.element.querySelector('[data-board="player"]'),
          startButton = this.element.querySelector('[data-action="start"]'),
          fields = this.element.querySelectorAll('[data-board="player"] [data-field]');
    fields.forEach((field) => {
      field.removeAttribute('data-preview');
    });
    let allPlaced = true;
    for (let i = 0; i < ships.length; i++) {
      const ship = ships[i];
      const shipButton = shipsElement.querySelector(`[data-ship="${ship.name}"]`);
      if (ship.coordinates) {
        shipButton.setAttribute('data-placed', 'true');
      }
      else {
        allPlaced = false;
        shipButton.setAttribute('data-placed', 'false');
      }
    }
    if (allPlaced) {
      startButton.setAttribute('data-enabled', 'true');
    }
    else {
      startButton.setAttribute('data-enabled', 'false');
    }
    Board.fill(boardElement, this.game.board1.board);
  }

  rotate() {
    const ship = this.currentShip;
    if (ship) {
      ship.direction = (ship.direction + 1) % 2;
    }
    this.previewChanged();
  }

  remove() {
    const coordinates = this.currentShip.coordinates;
    for (let i = 0; i < coordinates.length; i++) {
      this.game.board1.board[coordinates[i].x][coordinates[i].y] = 'WATER';
    }
    this.currentShip.coordinates = null;
    this.removePointerFromBoard();
    this.shipsChanged();
    const activeShipButton = this.element.querySelector('[data-ship][data-selected="true"]');
    activeShipButton.click();
  }

  async random() {
    const board = await API.get('/api/setup/random', true);
    this.game.board1 = board;
    this.shipsChanged();
    const activeShipButton = this.element.querySelector('[data-ship][data-selected="true"]');
    if (activeShipButton) activeShipButton.click();
  }

  async start() {
    if (this.game.state === 'SETUP') {
      const response = await API.post('/api/setup/start', { id: this.game.id, ships: this.game.board1.ships }, true);
      if (response) {
        Html.loadSection('game');
      }
    }
    else {
      Html.loadSection('game');
    }
  }
  
  index() {
    Html.loadSection('home');
  }

}

/**
 * Section for game
 */
class Game extends Section {

  async init() {
    console.info('Init Game Section');
    this.id = Cookies.get('currentGame');
    const game = await API.post('/api/games/getActive', { id: this.id }, true);
    if (!game) return;
    this.game = game;
    this.player1Element = this.element.querySelector('.board[data-player="1"]');
    this.player2Element = this.element.querySelector('.board[data-player="2"]');
    this.player2Element.addEventListener('mouseleave', this.clearShotPreview.bind(this));
    const fields = this.player2Element.querySelectorAll('[data-field]');
    fields.forEach((field) => {
      field.addEventListener('click', this.shoot.bind(this));
      field.addEventListener('mouseover', this.shotPreview.bind(this));
    });
    this.gameChanged();
    this.initTime();
    this.fetchLoop = window.setInterval(this.fetchGame.bind(this), 2000);
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    const surrenderButton = this.element.querySelector('[data-action="surrender"]');
    surrenderButton.addEventListener('click', this.surrender.bind(this));
    const confirmSurrenderButton = this.element.querySelector('[data-action="confirmSurrender"]');
    confirmSurrenderButton.addEventListener('click', this.confirmSurrender.bind(this));
    this.afterInit();
  }

  destroy() {
    if (this.fetchLoop) {
      window.clearInterval(this.fetchLoop);
    }
    if (this.timeLoop) {
      window.clearInterval(this.timeLoop);
    }
  }

  async shoot(event) {
    if (this.game.state !== 'STARTED' || this.game.turn === this.game.player2) return;
    const field = event.target.getAttribute('data-field'),
          [x, y] = Board.fieldToCoord(field);
    if (this.validateShot(x, y)) {
      const id = Cookies.get('currentGame'),
            data = { id: id, coordinate: { x: x, y: y } },
            response = await API.post('/api/games/shoot', data, true);
      if (response) {
        this.game = response;
        this.gameChanged();
      }
    }
  }

  async fetchGame() {
    if ((this.game.turn === this.game.player1 && this.game.state === 'STARTED') || this.game.state === 'FINISHED' || this.game.state === 'CANCELLED') return;
    const game = await API.post('/api/games/getActive', { id: this.id }, true);
    if (game) {
      this.game = game;
      this.gameChanged();
    }
  }

  shotPreview(event) {
    if (this.game.state !== 'STARTED' || this.game.turn === this.game.player2) return;
    this.clearShotPreview();
    const field = event.target.getAttribute('data-field'),
          [x, y] = Board.fieldToCoord(field);
    if (this.validateShot(x, y)) {
      event.target.setAttribute('data-target', 'valid');
    }
    else {
      event.target.setAttribute('data-target', 'invalid');
    }
  }

  clearShotPreview() {
    const fields = this.player2Element.querySelectorAll('[data-field]');
    fields.forEach((field) => {
      field.removeAttribute('data-target');
    });
  }

  validateShot(x, y) {
    const field = this.game.board2.board[x][y];
    if (field === 'UNKNOWN') return true;
    return false;
  }

  gameChanged() {
    this.clearShotPreview();
    this.getTurn();
    Board.fill(this.player1Element, this.game.board1.board);
    Board.fill(this.player2Element, this.game.board2.board);
  }

  getTurn() {
    const turnElement = this.element.querySelector('[data-var="turn"]');
    let finished = false;
    if (this.game.winner === this.game.player1 && this.game.turn === this.game.player2) {
      turnElement.innerText = 'Dein Gegner hat aufgegeben!';
      finished = true;
    }
    else if (this.game.winner === this.game.player1) {
      turnElement.innerText = 'Du hast gewonnen!';
      finished = true;
    }
    else if (this.game.winner === this.game.player2 && this.game.turn === this.game.player1) {
      turnElement.innerText = 'Du hast aufgegeben!';
      finished = true;
    }
    else if (this.game.winner === this.game.player2) {
      turnElement.innerText = 'Du hast verloren!';
      finished = true;
    }
    else if (!this.game.board2.valid) {
      turnElement.innerText = 'Die Flotte deines Gegners ist noch nicht bereit.';
    }
    else if (this.game.turn === this.game.player1) {
      turnElement.innerText = 'Du bist dran!';
    }
    else if (this.game.turn === this.game.player2) {
      turnElement.innerText = 'Warten auf Gegner...';
    }
    if (finished) {
      this.element.querySelector('[data-action="surrender"]').setAttribute('data-enabled', 'false');
      this.destroy();
      Html.loadSection('archive');
    }
  }

  initTime() {
    this.startDate = new Date(this.game.startedAt);
    const endDate = new Date();
    this.element.querySelector('[data-var="time"]').innerText = Html.calcTime(this.startDate, endDate);
    this.timeLoop = window.setInterval(() => {
      const endDate = new Date();
      this.element.querySelector('[data-var="time"]').innerText = Html.calcTime(this.startDate, endDate);
    }, 1000);
  }

  surrender() {
    Html.openModal('surrender');
  }

  async confirmSurrender() {
    const response = await API.post('/api/games/surrender', { id: this.id }, true);
    if (response) {
      this.game = response;
      this.gameChanged();
      Html.closeModal('surrender');
    }
  }

  index() {
    Html.loadSection('home');
  }

}

/**
 * Section for archive
 */
class Archive extends Section {

  retries = 10;

  async init() {
    console.info('Init Archive Section');
    this.id = Cookies.get('currentGame');
    const game = await API.post('/api/games/getArchived', { id: this.id }, true);
    if (!game) {
      console.info('Retry fetching archived game');
      this.retries--;
      if (this.retries < 0) {
        console.error('Retrieving archived game failed');
        Html.loadSection('home');
        return;
      }
      window.setTimeout(this.init.bind(this), 1000)
      return;
    }
    this.game = game;
    this.player1Element = this.element.querySelector('.board[data-player="1"]');
    this.player2Element = this.element.querySelector('.board[data-player="2"]');
    this.showStatistics();
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    this.afterInit();
  }

  showStatistics() {
    this.getWinner();
    this.initTime();
    this.calcStatistics(this.game.board1, 2);
    this.calcStatistics(this.game.board2, 1);
    Board.fill(this.player1Element, this.game.board1.board);
    Board.fill(this.player2Element, this.game.board2.board);
  }

  getWinner() {
    const turnElement = this.element.querySelector('[data-var="winner"]');
    if (this.game.winner === this.game.player1 && this.game.turn === this.game.player2) {
      turnElement.innerText = 'Dein Gegner hat aufgegeben!';
    }
    else if (this.game.winner === this.game.player1) {
      turnElement.innerText = 'Du hast gewonnen!';
    }
    else if (this.game.winner === this.game.player2 && this.game.turn === this.game.player1) {
      turnElement.innerText = 'Du hast aufgegeben!';
    }
    else if (this.game.winner === this.game.player2) {
      turnElement.innerText = 'Du hast verloren!';
    }
  }

  initTime() {
    const startDate = new Date(this.game.startedAt),
          endDate = new Date(this.game.finishedAt);
    this.element.querySelector('[data-var="time"]').innerText = Html.calcTime(startDate, endDate);
  }

  calcStatistics(board, player) {
    let shots = 0,
        hits = 0,
        misses = 0,
        ratio = 0,
        sunk = 0;
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (board.board[x][y] === 'MISS') {
          shots++;
          misses++;
        }
        else if (board.board[x][y] === 'HIT') {
          shots++;
          hits++;
        }
        else if (board.board[x][y] === 'SUNK') {
          shots++;
          hits++;
        }
      }
    }
    if (shots > 0) ratio = Math.round(hits * 100 / shots);
    for (let i = 0; i < board.ships.length; i++) {
      if (board.ships[i].sunk) sunk++;
    }
    this.element.querySelector(`[data-var="shots${player}"]`).innerText = shots;
    this.element.querySelector(`[data-var="hits${player}"]`).innerText = hits;
    this.element.querySelector(`[data-var="misses${player}"]`).innerText = misses;
    this.element.querySelector(`[data-var="ratio${player}"]`).innerText = ratio + '%';
    this.element.querySelector(`[data-var="sunk${player}"]`).innerText = sunk;
  }



  index() {
    Html.loadSection('home');
  }

}

/**
 * Initialize the sections that are currently on the page
 */
(function() {

  const availableSections = {
    'Background': Background,
    'Home': Home,
    'Login': Login,
    'Signup': Signup,
    'Setup': Setup,
    'Presetup': Presetup,
    'Game': Game,
    'Archive': Archive
  }

  let activeSections = [];

  var initSections = function() {
    for (let i = 0; i < activeSections.length; i++) {
      activeSections[i].destroy();
    }
    activeSections = [];
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => {
      const sectionName = section.getAttribute('data-section'),
            sectionClass = availableSections[sectionName];
      if (sectionClass) {
        try {
          activeSections.push(new sectionClass(section));
        }
        catch (e) {
          console.error(e);
        }
      }
      else {
        console.warn('Unknown section: ' + sectionName);
      }
    });
  };

  document.addEventListener('sectionLoadComplete', Html.sectionLoadComplete);
  document.addEventListener('sectionChange', initSections);
  window.addEventListener('resize', Html.calcCssVariables);

  Html.calcCssVariables();
  Html.loadSection('home');

})();