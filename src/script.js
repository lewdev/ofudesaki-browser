const APP_DATA_KEY = "ofudesaki-browser";
const FAV_DATA_KEY = "ofudesaki-browser-favorites";

const VIEWS = ["verse", "group", "search", "favorites"];
const LANGUAGES = ["Romanized", "Japanese", "English", "Portuguese", "Kanji"];
const VERSE_VIEW = "verse";
const READ_VIEW = "group";
const SEARCH_VIEW = "search";
const FAVORITES_VIEW = "favorites";
const VERSE_VIEW_INDEX = VIEWS.indexOf(VERSE_VIEW);
const READ_VIEW_INDEX = VIEWS.indexOf(READ_VIEW);
const SEARCH_VIEW_INDEX = VIEWS.indexOf(SEARCH_VIEW);
const FAVORITES_VIEW_INDEX = VIEWS.indexOf(FAVORITES_VIEW);
const LAST_VERSE_GROUP_PART = 17;
const PART_COUNT = 18;

const EM_HEAVY_CHECK = "&#9989;"; //✅
const EM_CROSS_MARK = "&#10060;"; //❌

const verseDisplay = document.getElementById("verseDisplay");
const partSelect = document.getElementById("partSelect");
const verseSelect = document.getElementById("verseSelect");
const verseGroupSelect = document.getElementById("verseGroupSelect");

const verseNavTop = document.getElementById("verseNavTop");
const verseNavBottom = document.getElementById("verseNavBottom");
const verseNavTemplate = verseNavTop.cloneNode(true);

//const verseOptionTemplate = document.getElementById("verseOptionsRow");
const verseOptionTemplate = document.querySelector(".verse-options");

const searchTxt = document.getElementById("searchTxt");
const searchBtn = document.getElementById("searchBtn");
const searchClearBtn = document.getElementById("searchClearBtn");
const searchResults = document.getElementById("searchResults");

const groupView = document.getElementById("groupView");
const favoritesView = document.getElementById("favoritesView");

const hideButtonLabelCbx = document.getElementById("hideButtonLabelCbx");

let count = 0;
let data = {
  'view': 0,
  'selectedPart': 1,
  'selectedVerse': 1,
  'selectedVerseGroup': "1:1-20",
  'searchStr': "",
  'hideButtonLabel': false,
  'verseOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': true,
    'showPortuguese': true,
    'showKanji': true,
    'showEnglish2': false
  },
  'groupOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': true,
    'showPortuguese': true,
    'showKanji': false,
    'showEnglish2': false
  },
  'searchOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': true,
    'showPortuguese': true,
    'showKanji': true,
    'showEnglish2': false
  },
  'favoritesOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': true,
    'showPortuguese': true,
    'showKanji': true,
    'showEnglish2': false
  },
  "isDataLoaded": false, // "localStorage" with default data is prevented.
};
let favoritesData = {
  'favorites': [],
  'bookmark': 0
};
let ofData = null;
let keywords = null;
let selectedVerse = null;

function myParseInt(str) {
  return parseInt(str, 10);
}
function initUi() {
  partSelect.onchange = function(e) {
    selectPart(myParseInt(partSelect.value));
    selectVerse(1);
    displayVerseView();
  };
  verseSelect.onchange = function() {
    selectVerse(myParseInt(verseSelect.value));
    displayVerseView();
  };
  verseGroupSelect.onchange = function() {
    selectVerseGroup(verseGroupSelect.value);
    displayReadView();
  };
  selectVerseGroup(data['selectedVerseGroup']);
  selectPart(data['selectedPart']);
  selectVerse(data['selectedVerse']);
  displayView(data['view']);
  searchTxt.onkeyup = function(e) {
    if (e.keyCode === 13) { search(); }
  };
  searchTxt.value = data['searchStr'];
  searchBtn.onclick = function() { search(); };
  searchClearBtn.onclick = function() {
    searchTxt.value = "";
    searchTxt.focus();
  };
  initMenuLabels();
}
function initMenuLabels() {
  const menuDiv = document.querySelector(".of-bottom-menu");
  if (data['hideButtonLabel']) {
    addClassName(menuDiv, 'of-hide-labels');
  }
  hideButtonLabelCbx.checked = data['hideButtonLabel'];
  hideButtonLabelCbx.onclick = function() {
    const optionFlag = data['hideButtonLabel'];
    if (optionFlag === 'undefined') {
      optionFlag = false;
    }
    data['hideButtonLabel'] = !optionFlag;
    this.checked = !optionFlag;
    if (!optionFlag) {
      addClassName(menuDiv, 'of-hide-labels');
    }
    else {
      removeClassName(menuDiv, 'of-hide-labels');
    }
  };
}
function search() {
  data['searchStr'] = searchTxt.value.trim();
  displaySearchView();
}
function renderView() {
  if (data['view'] === VERSE_VIEW_INDEX) {
    displayVerseView();
  }
  else if (data['view'] === READ_VIEW_INDEX) {
    displayReadView();
  }
  else if (data['view'] === SEARCH_VIEW_INDEX) {
    displaySearchView();
  }
  else if (data['view'] === FAVORITES_VIEW_INDEX) {
    displayFavoritesView();
  }
}
function selectPart(part) {
  data['selectedPart'] = part;
  partSelect.value = data['selectedPart'];
  displayVerseSelect(part);
}
function selectVerse(verseNum) {
  data['selectedVerse'] = verseNum;
  verseSelect.value = data['selectedVerse'];
}
function selectVerseGroup(verseGroupStr) {
  data['selectedVerseGroup'] = verseGroupStr;
  verseGroupSelect.value = data['selectedVerseGroup'];
}
function getById(id) {
  let size = ofData['verses'].length;
  if (id <= 0) {
    return ofData['verses'][size - 1]
  }
  else if (id > size) {
    return ofData['verses'][0];
  }
  return ofData['verses'][id - 1];
}
function getByPartAndVerse(partNum, verseNum) {
  let size = ofData['verses'].length;
  for (let i = 0; i < size; i++) {
    const verse = ofData['verses'][i];
    if (verse['part'] === partNum && verse['verse'] === verseNum) {
      return verse;
    }
  }
  return null;
}
function displayView(viewCode) {
  data['view'] = viewCode;
  //hide other views
  VIEWS.map(viewName => {
    const viewDiv = document.getElementById(viewName + "View");
    if (viewDiv) {
      viewDiv.style.display = "none";
    }
    const viewDivs = document.querySelectorAll("." + viewName + "-view");
    for (let i = 0; i < viewDivs.length; i++) {
      viewDivs[i].style.display = "none";
    }
    const menuItem = document.getElementById(viewName + "ViewMenuItem");
    if (!menuItem) {
      console.log(viewName + "ViewMenuItem not found.");
    }
    removeClassName(menuItem, "selected");
  })
  const viewName = VIEWS[viewCode];
  const viewDiv = document.getElementById(viewName + "View");
  viewDiv.style.display = "block";
  const viewElems = document.querySelectorAll("." + viewName + "-view");
  for (let i = 0; i < viewElems.length; i++) {
    viewElems[i].style.display = "block";
  }
  const menuItem = document.querySelector("#" + viewName + "ViewMenuItem");
  addClassName(menuItem, "selected");
  //hide footer when in search view
  const isSearchView = viewCode === SEARCH_VIEW_INDEX;
  verseNavTop.style.display = isSearchView ? 'none' : 'block';
  verseNavBottom.style.display = isSearchView ? 'none' : 'block';
  renderView();
}
function displayVerseView() {
  const partNum = data['selectedPart'];
  const verseNum = data['selectedVerse'];
  selectedVerse = getByPartAndVerse(partNum, verseNum);
  //id,part,verse,in_doctrine,in_life_of_oyasama,en_6th_ed,romanization,jp1,jp2,kanji,en
  if (selectedVerse) {
    const verseStr = "Verse " + selectedVerse['part'] + ":" + selectedVerse['verse']
    displayVerseNavBtns(verseStr);
    verseDisplay.innerHTML = displayVerseByViewStr(selectedVerse, VERSE_VIEW, null);
    applyVerseControls(verseDisplay, selectedVerse);
  }
  else {
    verseDisplay.innerHTML = "Verse " + partNum + ":" + verseNum + " not found!";
  }
}
function applyVerseControls(verseDisplay, selectedVerse) {
  if (!verseDisplay || !selectedVerse) {
    return;
  }
  console.log("verseDisplay found");
  const verseBtn = verseDisplay.querySelector(".verse-btn");
  const readBtn = verseDisplay.querySelector(".read-btn");
  const favoriteBtn = verseDisplay.querySelector(".favorite-btn");
  const bookmarkBtn = verseDisplay.querySelector(".bookmark-btn");

  let part = selectedVerse['part'];
  let verse = selectedVerse['verse'];
  if (verseBtn) {
    verseBtn.onclick = function() {
      console.log("verseBtn onclick part=" + part + ", verse=" + verse);
      selectPart(part);
      selectVerse(verse);
      displayView(VERSE_VIEW_INDEX);
    };
  }
  if (readBtn) {
    const verseGroup = getVerseGroupByPartVerse(part, verse);
    readBtn.onclick = function() {
      console.log("readBtn onclick");
      selectVerseGroup(verseGroup);
      displayView(READ_VIEW_INDEX);
      window.location.hash = "verse" + part + "-" + verse;
      console.log(part + ":" + verse);
    };
  }
  favoriteBtn.onclick = function() {
    //TODO
  };
  bookmarkBtn.onclick = function() {
    //TODO
  };
}
function getVerseGroupByPartVerse(part, verse) {
  if (!part || !verse) {
    console.log("ERROR: getVerseGroupByPartVerse parameters (part, verse) are not valid.")
    return;
  }
  const groups = ofData['verseGroups'][part - 1]['groups'];
  if (groups) {
    for (let i = 0; i < groups.length; i++) {
      const verseGroupStr = groups[i];
      const verseStrArr = verseGroupStr.split("-");
      const startVerse = parseInt(verseStrArr[0]);
      const endVerse = parseInt(verseStrArr[1]);
      if (verse >= startVerse && verse <= endVerse) {
        return part + ":" + verseGroupStr;
      }
    }
  }
  console.log("ERROR: getVerseGroupByPartVerse parameters (" + part + ", " + verse + ") not found.")
  return null;
}
function parseVerseGroup(partVerseGroupStr) {
  if (!partVerseGroupStr) {
    return null;
  }
  const partVerseGroupArr = partVerseGroupStr.split(":");
  const partNum = myParseInt(partVerseGroupArr[0]);
  const verseGroupStr = partVerseGroupArr[1];
  const verseGroupArr = verseGroupStr.split("-");
  const startVerseNum = myParseInt(verseGroupArr[0]);
  const endVerseNum = myParseInt(verseGroupArr[1]);
  return {
    part: partNum,
    startVerse: startVerseNum,
    endVerse: endVerseNum,
    verseGroup: verseGroupStr //i.e. 1-21
  }
}
function displayReadView() {
  const partVerseGroupStr = data['selectedVerseGroup'];
  const verseGroup = parseVerseGroup(partVerseGroupStr);
  if (verseGroup) {
    groupView.innerHTML = "";
    for (let verseNum = verseGroup.startVerse; verseNum <= verseGroup.endVerse; verseNum++) {
      const verse = getByPartAndVerse(verseGroup.part, verseNum);
      const elem = document.createElement("div");
      elem.innerHTML = displayVerseByViewStr(verse, READ_VIEW, null);
      applyVerseControls(elem, verse);
      groupView.appendChild(elem);
    }
    displayReadNavBtns(verseGroup.part, verseGroup.verseGroup);
  }
}
function displayReadNavBtns(partNum, verseGroupStr) {
  console.log("displayReadNavBtns verseGroupStr=" + verseGroupStr);
  let prevVerseGroupStr = "";
  let nextVerseGroupStr = "";
  const verseGroup = ofData['verseGroups'][partNum - 1];
  console.log('verseGroup=' + verseGroup['groups']);
  const size = verseGroup['groups'].length;
  for (let j = 0; j < size; j++) {
    const group = verseGroup['groups'][j];
    if (verseGroupStr === group) {
      //prev
      if (j > 0) {
        prevVerseGroupStr = partNum + ":" + verseGroup['groups'][j - 1];
      }
      else {
        if (partNum === 1) {
          const lastVerseGroups = ofData['verseGroups'][LAST_VERSE_GROUP_PART - 1]['groups'];
          prevVerseGroupStr = LAST_VERSE_GROUP_PART + ":" + lastVerseGroups[lastVerseGroups.length - 1];
        }
        else {
          const prevPart = partNum - 1;
          const prevVerseGroups = ofData['verseGroups'][prevPart - 1]['groups'];
          prevVerseGroupStr = prevPart + ":" + prevVerseGroups[prevVerseGroups.length - 1];
        }
      }
      //next
      if (j < size - 1) {
        nextVerseGroupStr = partNum + ":" + verseGroup['groups'][j + 1];
      }
      else {
        if (partNum === LAST_VERSE_GROUP_PART) {
          const firstVerseGroups = ofData['verseGroups'][0]['groups'];
          nextVerseGroupStr = 1 + ":" + firstVerseGroups[0];
        }
        else {
          const nextVerseGroups = ofData['verseGroups'][partNum]['groups'];
          nextVerseGroupStr = (partNum + 1) + ":" + nextVerseGroups[0];
        }
      }
    }
  }
  console.log("prevVerseGroupStr=" + prevVerseGroupStr + ", nextVerseGroupStr=" + nextVerseGroupStr);
  displayVerseGroupNavBtns(prevVerseGroupStr, nextVerseGroupStr);
}
function displayFavoritesView() {
  //favoritesView
  //show bookmarked
  //show favorites
}
function displaySearchView() {
  const searchStr = data['searchStr'];
  if (searchStr) {
    let count = 0;
    let resultDivArr = [];
    let size = ofData['verses'].length;
    searchResults.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const verse = ofData['verses'][i];
      const re = new RegExp(searchStr, 'i');
      const elem = document.createElement("div");
      const searchBodyArr = [];
      if (data['searchOptions']['showRomanized']) { searchBodyArr.push(verse['ro']); }
      if (data['searchOptions']['showJapanese']) { searchBodyArr.push(verse['jp1'] + verse['jp2']); }
      if (data['searchOptions']['showEnglish']) { searchBodyArr.push(verse['en_6th_ed']); }
      if (data['searchOptions']['showPortuguese']) { searchBodyArr.push(verse['pt']); }
      if (data['searchOptions']['showKanji']) { searchBodyArr.push(verse['kanji']); }
      const matchResult = (searchBodyArr.join(" ")).match(re);
      if (matchResult) {
        count++;
        elem.innerHTML = displayVerseByViewStr(verse, SEARCH_VIEW, searchStr);
        applyVerseControls(elem, verse);
        resultDivArr.push(elem);
      }
    }
    const yieldsDiv = document.createElement("div");
    yieldsDiv.innerHTML = '<p>Search "' + searchStr + '" yields ' + count + ' results.</p>';
    searchResults.appendChild(yieldsDiv);
    for (let i = 0; i < resultDivArr.length; i++) {
      searchResults.appendChild(resultDivArr[i]);
    }
  }
  else {
    searchResults.innerHTML = "<p>Enter a search term.</p>";
  }
  searchTxt.select();
}
function displayVerseGroupSelect() {
  let options = [];
  ofData['verseGroups'].map(verseGroup => {
    const part = verseGroup['part'];
    options.push('<option value="" disabled="true">- Part ' + part + ' -</option>');
    verseGroup['groups'].map(group => {
      const partVerseGroup = part + ":" + group;
      options.push('<option value="' + partVerseGroup + '">' + partVerseGroup + '</option>');
    });
  });
  verseGroupSelect.innerHTML = options.join("");
}
function displayVerseGroupNavBtns(prevVerseGroupStr, nextVerseGroupStr) {
  const prevFunc = function() {
    selectVerseGroup(prevVerseGroupStr);
    displayReadView();
  };
  const nextFunc = function() {
    selectVerseGroup(nextVerseGroupStr);
    displayReadView();
  };
  setupNav(verseNavTop, data['selectedVerseGroup'], prevFunc, nextFunc);
  setupNav(verseNavBottom, data['selectedVerseGroup'], prevFunc, nextFunc);
}
function displayVerseNavBtns(verseStr) {
  const prevVerse = getById(selectedVerse.id - 1);
  const nextVerse = getById(selectedVerse.id + 1);
  const prevFunc = function() {
    selectPart(prevVerse['part']);
    selectVerse(prevVerse['verse']);
    displayVerseView();
  };
  const nextFunc = function() {
    selectPart(nextVerse['part']);
    selectVerse(nextVerse['verse']);
    displayVerseView();
  };
  setupNav(verseNavTop, verseStr, prevFunc, nextFunc);
  setupNav(verseNavBottom, verseStr, prevFunc, nextFunc);
}
function setupNav(versNav, middleStr, prevFunc, nextFunc) {
  //copy template
  versNav.innerHTML = verseNavTemplate.innerHTML;
  //find the buttons and middle elements
  const prevVerseBtn = versNav.getElementsByClassName('verse-nav-prev-btn')[0];
  const nextVerseBtn = versNav.getElementsByClassName('verse-nav-next-btn')[0];
  const verseMiddle = versNav.getElementsByClassName('verse-nav-middle')[0];
  prevVerseBtn.onclick = prevFunc;
  nextVerseBtn.onclick = nextFunc;
  verseMiddle.innerHTML = middleStr;
}
function displayVerseByViewStr(verse, viewName, highlight) {
  highlight = highlight || false;
  if (verse) {
    const verseStr = verse['part'] + ":" + verse['verse'];
    const ro = highlightText(verse['ro'].split(/\s{2,}/g).join("<br/>"), highlight);
    const kanji = highlightText(verse['kanji'].split(/\s{2,}/g).join("<br/>"), highlight);
    const english = highlightText(verse['en_6th_ed'], highlight);
    const pt = highlightText(verse['pt'], highlight);
    const japanese = highlightText(verse['jp1'] + "<br/>" + verse['jp2'], highlight);
    return '<div class="verse-display">'
      + (data[viewName + 'Options']['showRomanized'] ? "<blockquote>" + ro + "</blockquote>" : '')
      + (data[viewName + 'Options']['showJapanese'] ? "<blockquote>" + japanese + "</blockquote>" : '')
      + (data[viewName + 'Options']['showEnglish'] ?  "<blockquote>" + english + "</blockquote>" : '')
      //+ (data[viewName + 'Options']['showEnglish2'] ?  "<blockquote>" + verse['en'] + "</blockquote>" : '')
      + (data[viewName + 'Options']['showPortuguese'] ?  "<blockquote>" + pt + "</blockquote>" : '')
      + (data[viewName + 'Options']['showKanji'] ? "<blockquote>" + kanji + "</blockquote>" : '')
      + '<table class="of-verse-controls"><tbody><tr>'
      + '<td>'
      + '<button class="favorite-btn btn circle"><i class="fa fa-fw fa-star"></i></button>'
      + '<button class="bookmark-btn btn circle"><i class="fa fa-fw fa-bookmark"></i></button>'
      + '</td>'
      + '<td>'
      + (verse['in_life_of_oyasama']  ? '<span class="of-tag">Life of Oyasama</span>' : '')
      +  (verse['in_doctrine']  ? '<span class="of-tag">Doctrine</span>' : '')
      + "</td><td>" + verseStr + '</td>'
      + '<td>'
      + (viewName !== 'group' ? '<button class="read-btn btn circle"><i class="fab fa-fw fa-readme"></i></button>' : "")
      + (viewName !== 'verse' ? '<button class="verse-btn btn circle"><i class="fa fa-fw fa-eye"></i></button>' : "")
      + '</td>'
      + '</tr></tbody></table>'
      + "</div>"
    ;
  }
  return "Verse not found.";
}
function highlightText(str, search) {
  if (!search) {
    return str;
  }
  const re = new RegExp(search, "i");
  const highlight = '<span class="highlight">' + str.match(re) + '</span>';
  return str.replace(re, highlight);
}
function initViewOptions() {
  VIEWS.map(viewName => {
    //create show toggle tables
    console.log(viewName);
    const optionsDiv = verseOptionTemplate.cloneNode(true);
    const inputs = optionsDiv.querySelectorAll("input");
    const labels = optionsDiv.querySelectorAll("label");
    for (let j = 0; j < inputs.length; j++) {
      const input = inputs[j];
      const id = input.id.replace("-verse", "-" + viewName);
      const optionName = input.id.replace("-verse","").replace("show","").replace("Cbx","");
      input.id = id;
      input.onchange = function() { toggleOption(viewName, optionName); };
      input.checked = data[viewName + "Options"]["show" + optionName];
    }
    for (let j = 0; j < labels.length; j++) {
      labels[j].htmlFor = labels[j].htmlFor.replace("-verse", "-" + viewName);
    }
    let viewOptionsDiv = document.getElementById(viewName + "OptionsRow");
    viewOptionsDiv.innerHTML = "";
    viewOptionsDiv.appendChild(optionsDiv);

    //configure menu links
    const menuLink = document.getElementById(viewName + "ViewMenuItem")
    menuLink.onclick = function() {
      const index = VIEWS.indexOf(viewName);
      displayView(index);
    };
  });

}
function toggleOption(viewName, optionName) {
  const input = document.getElementById("show" + optionName + "Cbx-" + viewName);
  if (input) {
    const optionFlag = data[viewName + "Options"]["show" + optionName];
    if (optionFlag === 'undefined') {
      optionFlag = false;
    }
    data[viewName + "Options"]["show" + optionName] = !optionFlag;
    input.checked = !optionFlag;
  }
  renderView();
}
function displayPartSelect() {
  let options = [];
  for (let i = 1; i <= PART_COUNT; i++) {
    options.push('<option value="' + i + '">' + i + '</option>');
  }
  partSelect.innerHTML = options.join("");
}
function displayVerseSelect(part) {
  let options = [];
  ofData['verses'].map(verse => {
    if (verse['part'] === myParseInt(part)) {
      const verseNum = verse['verse'];
      const selected = data['selectedVerse'] === verseNum ? ' selected="selected"' : '';
      options.push('<option value="' + verseNum + '"' + selected + '>' + verseNum + '</option>');
    }
  });
  verseSelect.innerHTML = options.join("");
  verseSelect.value = data['selectedVerse'];
}
function displayData() {
  displayPartSelect();
  displayVerseSelect(data['selectedPart']);
  displayVerseGroupSelect();
}
window.onload = function() {
  loadData().then(function() {
    return makeRequest('ofudesaki.json');
  })
  .then(function (request) {
    ofData = JSON.parse(request.responseText);
    return makeRequest('keywords.json');
  })
  .then(function (request) {
    keywords = JSON.parse(request.responseText);
    displayData();
    initUi();
    initViewOptions();
    data['isDataLoaded'] = true;
  })
  .catch(function (error) { console.log('Something went wrong.', error); });
};
window.onunload = function() {
  saveData();
};
/*
window.addEventListener("beforeunload", function (e) { saveData(); });
window.addEventListener("unload", function (e) { saveData(); });
*/
function loadData() {
  var promise = new Promise(function(resolve, reject) {
    const localData = window.localStorage.getItem(APP_DATA_KEY);
    const localFavData = window.localStorage.getItem(FAV_DATA_KEY);
    if (localData) {
      const parsedData = JSON.parse(localData);
      const parsedFavData = JSON.parse(localFavData);
      if (parsedData) {
        data = parsedData;
        if (parsedFavData) {
          favoritesData = parsedFavData;
        }
        else {
          console.log("fav data not loaded.")
        }
        correctData();
        resolve("Data loaded from local storage.");
      }
      else {
        reject(Error("Failed to load data from local storage."));
      }
    }
  });
  return promise;
}
function saveData() {
  //this prevents refreshing sequentially too fast from overwriting your saved data.
  if (data['isDataLoaded']) {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
    window.localStorage.setItem(FAVE_DATA_KEY, JSON.stringify(favoritesData));
  }
}
function correctData() {
  if (!data['favoritesOptions']) {
    data['favoritesOptions'] = {
      'showRomanized': true,
      'showJapanese': true,
      'showEnglish': true,
      'showPortuguese': true,
      'showKanji': true,
      'showEnglish2': false
    };
  }
}
/**
 * Promise-based XMLHttpRequest method.
 * @param {string} url Expected location of REST URL.
 * @param {string} method Possible values: GET, POST, PUT
 */
const makeRequest = function (url, method = "GET") {
  var request = new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    // Setup our listener to process compeleted requests
    request.onreadystatechange = function () {
      // Only run if the request is complete
      if (request.readyState !== 4) return;
      // Process the response
      if (request.status >= 200 && request.status < 300) {
        // If successful
        resolve(request);
      }
      else {
        // If failed
        reject({
          status: request.status,
          statusText: request.statusText
        });
      }
    };
    request.open(method || 'GET', url, true);
    request.send();
  });
};
function toggleClass(elem, className) {
  let classes = elem.className.split(/\s+/);
  let length = classes.length;
  for (let i = 0; i < length; i++) {
    if (classes[i] === className) {
      classes.splice(i, 1);
      break;
    }
  }
  if (length === classes.length) {//The className is not found
    classes.push(className);
  }
  elem.className = classes.join(' ');
}
function removeClassName(elem, className) {
  let classes = elem.className.split(/\s+/);
  let length = classes.length;
  for (let i = 0; i < length; i++) {
    if (classes[i] === className) {
      classes.splice(i, 1);
      break;
    }
  }
  elem.className = classes.join(' ');
}
function addClassName(elem, className) {
  let classes = elem.className.split(/\s+/);
  classes.push(className);
  elem.className = classes.join(' ');
}

//ui.js, source: PureCSS
(function (window, document) {
  var layout = document.getElementById('layout'),
    menu = document.getElementById('menu'),
    menuLink = document.getElementById('menuLink'),
    content = document.getElementById('main')
  ;
  function toggleAll(e) {
    var active = 'active';
    e.preventDefault();
    toggleClass(layout, active);
    toggleClass(menu, active);
    toggleClass(menuLink, active);
  }
  menuLink.onclick = function (e) {
    toggleAll(e);
  };
  content.onclick = function (e) {
    if (menu.className.indexOf('active') !== -1) {
      toggleAll(e);
    }
  };
}
(window, window.document));
