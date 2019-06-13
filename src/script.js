const APP_DATA_KEY = "ofudesaki-browser";

const VIEWS = ["verse", "group", "search"];
const LANGUAGES = ["Romanized", "Japanese", "English", "Portuguese", "Kanji"];
const VERSE_VIEW = "verse";
const READ_VIEW = "group";
const SEARCH_VIEW = "search";
const VERSE_VIEW_INDEX = VIEWS.indexOf(VERSE_VIEW);
const READ_VIEW_INDEX = VIEWS.indexOf(READ_VIEW);
const SEARCH_VIEW_INDEX = VIEWS.indexOf(SEARCH_VIEW);
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

let count = 0;
let data = {
  'view': 0,
  'selectedPart': 1,
  'selectedVerse': 1,
  'selectedVerseGroup': "1:1-20",
  'searchStr': "",
  'verseOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': true,
    'showPortuguese': false,
    'showKanji': true,
    'showEnglish2': false
  },
  'groupOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': false,
    'showPortuguese': false,
    'showKanji': false,
    'showEnglish2': false
  },
  'searchOptions': {
    'showRomanized': true,
    'showJapanese': true,
    'showEnglish': true,
    'showPortuguese': false,
    'showKanji': true,
    'showEnglish2': false
  },
  "isDataLoaded": false, // "localStorage" with default data is prevented.
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
  verseSelect.value = data['selectedVerse'];
  //selectVerse(data['selectedVerse']);
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
}
function selectPart(part) {
  data['selectedPart'] = part;
  partSelect.value = data['selectedPart'];
  //data['selectedVerse'] = 1;
  displayVerseSelect(part);
  //displayVerseView();
}
function selectVerse(verseNum) {
  console.log("selectVerse(verseNum) verseNum=" + verseNum);
  data['selectedVerse'] = verseNum;
  verseSelect.value = data['selectedVerse'];
  //displayVerseView();
}
function selectVerseGroup(verseGroupStr) {
  data['selectedVerseGroup'] = verseGroupStr;
  verseGroupSelect.value = data['selectedVerseGroup'];
  //displayReadView();
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
  })
  const viewName = VIEWS[viewCode];
  const viewDiv = document.getElementById(viewName + "View");
  viewDiv.style.display = "block";
  const viewElems = document.querySelectorAll("." + viewName + "-view");
  for (let i = 0; i < viewElems.length; i++) {
    viewElems[i].style.display = "block";
  }
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
  }
  else {
    verseDisplay.innerHTML = "Verse " + partNum + ":" + verseNum + " not found!";
  }
}
function displayReadView() {
  const partVerseGroupArr = data['selectedVerseGroup'].split(":");
  const partNum = myParseInt(partVerseGroupArr[0]);
  const verseGroupStr = partVerseGroupArr[1];
  const verseGroupArr = verseGroupStr.split("-");
  const startVerseNum = myParseInt(verseGroupArr[0]);
  const endVerseNum = myParseInt(verseGroupArr[1]);
  let outputArr = [];
  for (let verseNum = startVerseNum; verseNum <= endVerseNum; verseNum++) {
    const verse = getByPartAndVerse(partNum, verseNum);
    outputArr.push(displayVerseByViewStr(verse, READ_VIEW, null));
  }
  groupView.innerHTML = outputArr.join("");
  //TODO
  displayReadNavBtns(partNum, verseGroupStr);
}
function displayReadNavBtns(partNum, verseGroupStr) {
  let prevVerseGroupStr = "";
  let nextVerseGroupStr = "";
  const verseGroup = ofData['verseGroups'][partNum - 1];
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
  //console.log("prevVerseGroupStr=" + prevVerseGroupStr + ", nextVerseGroupStr=" + nextVerseGroupStr);
  displayVerseGroupNavBtns(prevVerseGroupStr, nextVerseGroupStr);
}
function displaySearchView() {
  const searchStr = data['searchStr'];
  if (searchStr) {
    let count = 0;
    let resultStrArr = [];
    let size = ofData['verses'].length;
    for (let i = 0; i < size; i++) {
      const verse = ofData['verses'][i];
      const re = new RegExp(searchStr, 'i');
      const searchBodyArr = [];
      if (data['searchOptions']['showRomanized']) { searchBodyArr.push(verse['ro']); }
      if (data['searchOptions']['showJapanese']) { searchBodyArr.push(verse['jp1'] + verse['jp2']); }
      if (data['searchOptions']['showEnglish']) { searchBodyArr.push(verse['en_6th_ed']); }
      if (data['searchOptions']['showPortuguese']) { searchBodyArr.push(verse['pt']); }
      if (data['searchOptions']['showKanji']) { searchBodyArr.push(verse['kanji']); }
      const matchResult = (searchBodyArr.join(" ")).match(re);
      if (matchResult) {
        count++;
        resultStrArr.push(displayVerseByViewStr(verse, SEARCH_VIEW, searchStr));
      }
    }
    resultStrArr.unshift('<p>Search "' + searchStr + '" yields ' + count + ' results.</p>');
    searchResults.innerHTML = resultStrArr.join("");
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
    //data['selectedVerseGroup'] = prevVerseGroupStr;
    displayReadView();
  };
  const nextFunc = function() {
    selectVerseGroup(prevVerseGroupStr);
    //data['selectedVerseGroup'] = nextVerseGroupStr;
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
    const verseStr = verse['part'] + ":" + verse['verse']
    const ro = highlightText(verse['ro'].split(/\s{2,}/g).join("<br/>"), highlight);
    const kanji = highlightText(verse['kanji'].split(/\s{2,}/g).join("<br/>"), highlight);
    const english = highlightText(verse['en_6th_ed'], highlight);
    const pt = highlightText(verse['pt'], highlight);
    const japanese = highlightText(verse['jp1'] + "<br/>" + verse['jp2'], highlight);
    return '<div class="verse-display">' + (data[viewName + 'Options']['showRomanized'] ? "<blockquote>" + ro + "</blockquote>" : '')
      + (data[viewName + 'Options']['showJapanese'] ? "<blockquote>" + japanese + "</blockquote>" : '')
      + (data[viewName + 'Options']['showEnglish'] ?  "<blockquote>" + english + "</blockquote>" : '')
      //+ (data[viewName + 'Options']['showEnglish2'] ?  "<blockquote>" + verse['en'] + "</blockquote>" : '')
      + (data[viewName + 'Options']['showPortuguese'] ?  "<blockquote>" + pt + "</blockquote>" : '')
      + (data[viewName + 'Options']['showKanji'] ? "<blockquote>" + kanji + "</blockquote>" : '')
      + '<table class="full-width"><tbody><tr><td>'
      + 'In Life of Oyasama?: ' + (verse['in_life_of_oyasama']  ? EM_HEAVY_CHECK : EM_CROSS_MARK)
      + "In Doctrine?: " + (verse['in_doctrine']  ? EM_HEAVY_CHECK : EM_CROSS_MARK)
      + "</td><td>" + verseStr + '</td></tr></tbody></table>'
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
      data['view'] = index;
      displayView(index);
    };
  });
}
function toggleOption(viewName, optionName) {
  const input = document.getElementById("show" + optionName + "Cbx-" + viewName);
  if (input) {
    const optionFlag = data[viewName + "Options"]["show" + optionName];
    if (optionFlag !== 'undefined') {
      data[viewName + "Options"]["show" + optionName] = !optionFlag;
      input.checked = !optionFlag;
    }
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
    console.log("111 selectedVerse=" + data['selectedVerse']);
    makeRequest('ofudesaki.json').then(function (request) {
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
  })
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
    if (localData) {
      const parsedData = JSON.parse(localData);
      if (parsedData) {
        data = parsedData;
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
