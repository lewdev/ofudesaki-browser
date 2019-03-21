const APP_DATA_KEY = "ofudesaki-analysis";
const output = document.getElementById("output");
const keywordDiv = document.getElementById("keyword");
const verseListDiv = document.getElementById("verseList");
const verseDisplayDiv = document.getElementById("verseDisplay");
const EM_HEAVY_CHECK = "&#9989;"; //✅
const EM_CROSS_MARK = "&#10060;"; //❌
let keywords = {};
let ofData = null;
let data = {
  'keywordCount': "",
  'partVerse': "",
};
window.onload = function() {
  initJsonData();
};
function loadData() {
  loadLocalStorageData();
  ofData['verses'].map(verse => {
    const partVerse = verse['part'] + ":" + verse['verse'];
    verse['en_6th_ed'].replace(/[^\w\s]/g,"").toLowerCase().split(/\s+/g).map(word => {
      if (word) {
        if (keywords[word]) {
          keywords[word]['count']++;
          const verses = keywords[word]['verses'];
          if (!verses.includes(partVerse)) {
            verses.push(partVerse);
          }
        }
        else {
          keywords[word] = { 'count': 1, 'verses': [partVerse] };
        }
      }
    });
  });
  showKeywordModal(data['keywordCount']);
  showVerse(data['versePart'], data['keywordCount'].split(" ")[0]);
}
function displayData() {
  output.innerHTML = "loading...";
  //console.log("output keywords.size=" + Object.keys(keywords).length);
  const textOutput = [];
  Object.keys(keywords).sort().map(key => {
    textOutput.push("<a href='#verse' class='keyword'>" + key + " (" + keywords[key]['count'] + ")</span>");
  });
  output.innerHTML = textOutput.join("");

  //add keyword onclick functionality
  const keywordLinks = document.querySelectorAll(".keyword");
  console.log("keywordLinks.length=" + keywordLinks.length);
  const size = keywordLinks.length;
  for (let i = 0; i < size; i++) {
    const keywordLink = keywordLinks[i];
    keywordLink.onclick = function() {
      const keywordCount = keywordLink.innerHTML;
      showKeywordModal(keywordCount);
    };
  }
}
function showKeywordModal(keywordCount) {
  if (!keywordCount) {
    return;
  }
  data['keywordCount'] = keywordCount;
  const keywordCountArr = keywordCount.split(" ");
  const keyword = keywordCountArr[0];
  const count = keywordCountArr[1];
  const linkStart = "<a href='#verse' class='verse-link'>";
  const linkEnd = "</a>";
  keywordDiv.innerHTML = "<strong>Keyword:</strong> " + keyword;
  verseListDiv.innerHTML = "<strong>Verses " + count + ":</strong> "
    + linkStart + keywords[keyword]['verses'].join(linkEnd + ", " + linkStart) + linkEnd;

  const verseLinks = verseListDiv.querySelectorAll('.verse-link');
  const size = verseLinks.length;
  for (let j = 0; j < size; j++) {
    const verseLink = verseLinks[j];
    const versePart = verseLink.innerHTML;
    verseLink.onclick = function() {
      showVerse(versePart, keyword);
    };
  }
  showVerse(verseLinks[0].innerHTML, keyword);
}
function showVerse(versePart, keyword) {
  data['versePart'] = versePart;
  const verse = getByVersePart(versePart);
  if (verse) {
    const roArr = verse['ro'].split(/\s{2,}/g);
    const kanjiArr = verse['kanji'].split(/\s{2,}/g);
    const replacement = '<span class="highlight">' + keyword + '</span>';
    const regex = new RegExp(keyword, "ig");
    const enVerse = verse['en_6th_ed'].replace(regex, replacement);
    verseDisplayDiv.innerHTML = "<blockquote>" + roArr.join("<br/>") + "</blockquote>"
      + "<blockquote>" + verse['jp1'] + "<br/>"
      + verse['jp2'] + "</blockquote>"
      + "<blockquote>" + enVerse + "</blockquote>"
      + "<blockquote>" + kanjiArr.join("<br/>") + "</blockquote>"
      + "<blockquote><p align='right'>Ofudesaki " + verse['part'] + ":" + verse['verse'] + "</p></blockquote>"
      + "In Life of Oyasama?: " + (verse['in_life_of_oyasama']  ? EM_HEAVY_CHECK : EM_CROSS_MARK)
      + "In Doctrine?: " + (verse['in_doctrine']  ? EM_HEAVY_CHECK : EM_CROSS_MARK)
    ;
  }
}
function getByVersePart(versePart) {
  if (versePart) {
    const versePartArr = versePart.split(":");
    const partNum = parseInt(versePartArr[0]);
    const verseNum = parseInt(versePartArr[1]);
    const size = ofData['verses'].length;
    for (let i = 0; i < size; i++) {
      const verse = ofData['verses'][i];
      if (partNum === verse['part'] && verseNum === verse['verse']) {
        console.log(verse);
        return verse;
      }
    }
  }
  return null;  
}
function initJsonData() {
  fetch('ofudesaki.json')
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      ofData = myJson;
      if (ofData) {
        loadData();
        displayData();
      }
      else {
        alert('data not loaded');
      }
    })
  ;
}
function loadLocalStorageData() {
  const localData = window.localStorage.getItem(APP_DATA_KEY);
  if (localData) {
    const parsedData = JSON.parse(localData);
    if (parsedData) {
      data = parsedData;
    }
  }
}
function saveData() {
  window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}
window.addEventListener('unload', function(event) {
  saveData();
});