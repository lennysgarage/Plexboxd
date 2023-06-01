let lastURL = location.href;
const ratings = '[data-testid="metadata-ratings"]'

new MutationObserver(() => {
  const URL = location.href;
  if (document.querySelector(ratings)) {
    if (URL !== lastURL) {
      lastURL = URL;
      updateRatings();
    }
  }
}).observe(document, { subtree: true, childList: true });

async function updateRatings() {
  const originalTitle = document.querySelector('[data-testid=metadata-title]').textContent.toLowerCase();
  const title = parseMovieTitle(originalTitle);

  // fetch with year first
  const titleWithYear = addYear(title);
  console.log(titleWithYear)

  const movieWithYear = await chrome.runtime.sendMessage({ title: titleWithYear });
  if (!parseHTML(movieWithYear, titleWithYear)) {
    console.log(title)
    const movieWithoutYear = await chrome.runtime.sendMessage({ title: title });

    parseHTML(movieWithoutYear, title)
  }
}

function parseMovieTitle(title) {
  title = title.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, digitFromSuperscript);
  title = title.replace(/'/g, "");
  title = title.replace(/ & /g, "-");
  title = title.replace(/\W/g, "-");
  title = title.replace(/--/g, "-");
  title = title.replace(/-$/, "");


  return title;
}

function addYear(title) {
  let year = document.querySelector('[data-testid=metadata-line1]').textContent;
  year = year.split("    ");
  if (year.length > 1) {
    year = year[0];
  }

  return titleWithYear = title + "-" + year;
}

function parseHTML(html, title) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, 'text/html');

  let rating = doc.getElementsByName("twitter:data2")
  if (rating && rating[0]) {
    rating = rating[0].content
    if (rating) {
      rating = rating.split(" ")[0]
    }
  } else {
    return false;
  }

  const ratings = document.querySelector('[data-testid="metadata-ratings"]');
  if (ratings) {
    const lImg = document.createElement("img");
    lImg.setAttribute('src', "chrome-extension://__MSG_@@ngilbhhfgkjkfllefakjhieneaoknbfn/../images/letterboxd-decal-dots-pos-rgb-500px.png");
    lImg.setAttribute('height', '16px');
    lImg.setAttribute('width', '16px');
    ratings.appendChild(lImg)

    const div = document.createElement("a");
    div.setAttribute('href', `https://letterboxd.com/film/${title}`)
    div.innerText = rating + "/5.00";
    div.classList.add("letterboxd-rating");
    ratings.appendChild(div);

    return true
  }

  return false;
}

function digitFromSuperscript(superChar) {
  var result = "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(superChar);
  if (result > -1) {
    return "-" + result;
  }

  return superChar;
}

