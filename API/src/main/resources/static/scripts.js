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

  destroy() {
    console.warn('Destroy method for class missing');
  }

}

/**
 * Helper class to make requests to API
 */
class API {

  static defaults = {
    apiUrl: 'https://fc-battleships.herokuapp.com',
    htmlUrl: 'https://fc-battleships.herokuapp.com/web/',
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
        Html.loadPage('index');
        return false;
      }
      headers['Authorization'] = 'Bearer ' + token;
    }
    const response = await fetch(this.defaults.apiUrl + path, {
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
    const response = await fetch(this.defaults.apiUrl + path, {
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
    Html.loadPage('login');
  }

  static async html(path) {
    const response = await fetch(this.defaults.htmlUrl + path, {
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

  static replaceBody(html) {
    const body = html.substring(html.indexOf('<body>') + 6, html.indexOf('</body>'));
    document.body.innerHTML = body;
    document.dispatchEvent(new CustomEvent('bodyChange'));
  }

  static async loadPage(page) {
    const path = page,
          html = await API.html(path);
    Html.replaceBody(html);
    history.pushState(path, '', path);
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
 * Section for login
 */
class Login extends Section {

  init() {
    console.info('Init Login Section');
    const loginButton = this.element.querySelector('[data-action="login"]');
    loginButton.addEventListener('click', this.login.bind(this));
    const passwordInput = this.element.querySelector('input[type="password"]');
    passwordInput.addEventListener('keydown', this.enter.bind(this));
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
  }

  async login(event) {
    const data = Html.getFormAsObject(event.target.closest('form')),
          response = await API.post('/login', data),
          errorElement = this.element.querySelector('[data-error="login"]');
    errorElement.classList.remove('visible');
    if (response) {
      Cookies.set('token', response.token, `${response.tokenExpiration}ms`);
      Html.loadPage('index');
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
    Html.loadPage('index');
  }

}

/**
 * Section for login
 */
class Signup extends Section {

  static defaults = {
    differentPasswordError: 'Die Passwörter sind nicht identisch.',
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
    Html.loadPage('login');
  }

  index() {
    Html.loadPage('index');
  }

  enter(event) {
    if (event.keyCode !== 13) return;
    this.signup(event);
  }

}

/**
 * Section for index
 */
class Index extends Section {

  async init() {
    console.info('Init Index Section');
    const player = await API.get('/api/players/refresh', true);
    if (player) {
      this.player = player;
      this.processLoggedIn();
    }
    else {
      this.element.querySelector('[data-state="loggedOut"]').classList.remove('d-none');
    }

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
          Html.loadPage('setup');
        }
      });
    });
    const declineButtons = container.querySelectorAll('[data-action="declineRequest"]');
    declineButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const challenger = e.target.closest('[data-challenger]').getAttribute('data-challenger'),
              response = await API.post('/api/players/declineMatch', { target: challenger }, true);
        if (response) {
          Html.loadPage('index');
        }
      });
    });
  }

  displayActiveGames() {
    const container = this.element.querySelector('[data-list="activeGames"]'),
          games = this.player.activeGames,
          html = '<li data-id="{{id}}" data-index="{{index}}"><div class=target></div> {{enemy}}<button class="ml-1" data-action="play">Spielen</button></li>';
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
          Html.loadPage('game');
        }
        else {
          Html.loadPage('setup');
        }
      });
    });
  }

  displaySentRequests() {
    const container = this.element.querySelector('[data-list="sentRequests"]'),
          requests = this.player.sentRequests,
          html = '<li data-target="{{target}}"><div class=target></div> {{target}}<button class="ml-1" data-action="deleteRequest">Löschen</button></li>';
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
          Html.loadPage('index');
        }
      });
    });
  }

  displayArchivedGames() {
    const container = this.element.querySelector('[data-list="archivedGames"]'),
          games = this.player.archiveGames,
          html = '<li data-id="{{id}}"><div class=target></div> {{enemy}} - {{result}}</li>';
    let newHtml = '';
    for (let i = games.length - 1; i >= 0; i--) {
      let tempHtml = html.replaceAll('{{enemy}}', games[i].player2);
      tempHtml = tempHtml.replaceAll('{{id}}', games[i].id);
      tempHtml = games[i].winner === games[i].player1 ? tempHtml.replaceAll('{{result}}', 'Sieg') : tempHtml.replaceAll('{{result}}', 'Niederlage');
      newHtml += tempHtml;
    }
    if (newHtml !== '') container.innerHTML = newHtml;
  }

  logout() {
    Cookies.set('token', '', '0ms');
    this.element.querySelector('[data-state="loggedIn"]').classList.add('d-none');
    this.element.querySelector('[data-state="loggedOut"]').classList.remove('d-none');
  }

  login() {
    Html.loadPage('login');
  }

  signup() {
    Html.loadPage('signup');
  }

  startGame() {
    Html.loadPage('presetup');
  }

  refresh() {
    Html.loadPage('index');
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
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    const playerInput = this.element.querySelector('input[name="target"]');
    playerInput.addEventListener('keydown', this.enter.bind(this));
  }

  async singleplayer() {
    const game = await API.get('/api/setup/singleplayer', true);
    if (game) {
      Cookies.set('currentGame', game.id, '3d');
      Html.loadPage('setup');
    }
  }

  async multiplayer(event) {
    const successElement = this.element.querySelector('[data-success="match"]'),
          errorElement = this.element.querySelector('[data-error="match"]');
    successElement.classList.add('d-none');
    errorElement.classList.add('d-none');
    const data = Html.getFormAsObject(event.target.closest('form')),
          response = await API.post('/api/players/match', data, true);
    if (response) {
      successElement.classList.remove('d-none');
    }
    else {
      errorElement.classList.remove('d-none');
    }
  }

  enter(event) {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    this.multiplayer(event);
  }

  index() {
    Html.loadPage('index');
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
        Html.loadPage('game');
      }
    }
    else {
      Html.loadPage('game');
    }
  }
  
  index() {
    Html.loadPage('index');
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
    this.fetchLoop = window.setInterval(this.fetchGame.bind(this), 2000);
    const indexButton = this.element.querySelector('[data-action="index"]');
    indexButton.addEventListener('click', this.index.bind(this));
    const surrenderButton = this.element.querySelector('[data-action="surrender"]');
    surrenderButton.addEventListener('click', this.surrender.bind(this));
    const confirmSurrenderButton = this.element.querySelector('[data-action="confirmSurrender"]');
    confirmSurrenderButton.addEventListener('click', this.confirmSurrender.bind(this));
  }

  destroy() {
    window.clearInterval(this.fetchLoop);
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
    console.info("Fetch game");
    const game = await API.post('/api/games/getActive', { id: this.id }, true);
    this.game = game;
    this.gameChanged();
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
    this.initTime();
    Board.fill(this.player1Element, this.game.board1.board);
    Board.fill(this.player2Element, this.game.board2.board);
  }

  getTurn() {
    const turnElement = this.element.querySelector('[data-var="turn"]');
    if (this.game.winner === this.game.player1) {
      turnElement.innerText = 'Du hast gewonnen!';
      this.element.querySelector('[data-action="surrender"]').setAttribute('data-enabled', 'false');
    }
    else if (this.game.winner === this.game.player2) {
      turnElement.innerText = 'Du hast verloren!';
      this.element.querySelector('[data-action="surrender"]').setAttribute('data-enabled', 'false');
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
  }

  initTime() {
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
    const startDate = new Date(this.game.startedAt).getTime(),
          endDate = this.game.finishedAt ? new Date(this.game.finishedAt).getTime() : new Date().getTime(),
          diff = endDate - startDate,
          diffMinutes = Math.floor(diff % hours / minutes),
          diffHours = Math.floor(diff % days / hours),
          diffDays = Math.floor(diff / days),
          timeString = `${padZeros(diffDays)}:${padZeros(diffHours)}:${padZeros(diffMinutes)}`;
    this.element.querySelector('[data-var="time"]').innerText = timeString;
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
    Html.loadPage('index');
  }

}

/**
 * Initialize the sections that are currently on the page
 */
(function() {

  const availableSections = {
    'Login': Login,
    'Signup': Signup,
    'Index': Index,
    'Setup': Setup,
    'Presetup': Presetup,
    'Game': Game
  }

  let activeSections = [];

  var initSections = function() {
    for (let i = 0; i < activeSections.length; i++) {
      activeSections[i].destroy();
    }
    activeSections = [];
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => {
      const sectionClass = availableSections[section.getAttribute('data-section')];
      if (sectionClass) {
        activeSections.push(new sectionClass(section));
      }
    });
  }

  initSections();
  document.addEventListener('bodyChange', initSections);

  Html.calcCssVariables();
  window.addEventListener('resize', Html.calcCssVariables);

})();