let lastURL = location.href;
const ratings = '[data-testid="metadata-ratings"]';
const preplay = '[data-testid="preplay-thirdTitle"]';

new MutationObserver(() => {
  const URL = location.href;
  if (document.querySelector(ratings) || document.querySelector(preplay)) {
    if (URL !== lastURL) {
      lastURL = URL;
      if (document.querySelector(ratings)) {
        updateRatings("plex");
      } else {
        updateRatings("local");
      }
    }
  }
}).observe(document, { subtree: true, childList: true });

async function updateRatings(mode) {
  let originalTitle;
  if (mode === "plex") {
    originalTitle = document.querySelector('[data-testid=metadata-title]').textContent.toLowerCase();
  } else {
    originalTitle = document.querySelector('[data-testid="preplay-mainTitle"]').textContent.toLowerCase();
  }
  const title = parseMovieTitle(originalTitle);

  // fetch with year first
  let titleWithYear = addYear(title, mode);
  console.log(titleWithYear);

  const movieWithYear = await chrome.runtime.sendMessage({ title: titleWithYear });
  if (!updateSingleMovieRating(movieWithYear, titleWithYear, mode)) {
    console.log(title)
    const movieWithoutYear = await chrome.runtime.sendMessage({ title: title });

    updateSingleMovieRating(movieWithoutYear, title, mode)
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

function addYear(title, mode) {
  let year;
  if (mode === "plex") {
    year = document.querySelector('[data-testid=metadata-line1]').textContent;
  } else {
    year = document.querySelector('[data-testid="preplay-mainTitle"]').parentElement.children[1].children[0].textContent;
  }
  year = year.split("    ");
  if (year.length > 1) {
    year = year[0];
  }

  return titleWithYear = title + "-" + year;

}

function updateSingleMovieRating(html, title, mode) {
  let rating;
  rating = parseHTML(html)
  if (rating) {
    return addRating(title, rating, mode)
  }
  return false;
}

function parseHTML(html) {
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

  return rating;
}

function addRating(title, rating, mode) {
  let ratings;
  if (mode === "plex") {
    ratings = document.querySelector('[data-testid="metadata-ratings"]');
  } else {
    ratings = document.querySelector('[data-testid="preplay-mainTitle"]').parentElement.children[2];
  }
  if (ratings) {
    const span = document.createElement("span");
    ratings.appendChild(span);
    const div = document.createElement("div");
    div.classList.add('letterboxd-rating-container');
    span.appendChild(div);


    const lImg = document.createElement("img");
    lImg.setAttribute('src', "chrome-extension://__MSG_@@nofkoinidebfleimhjmilhhbbecaalhh/../images/letterboxd-decal-dots-pos-rgb-500px.png");
    lImg.setAttribute('width', '16px');
    lImg.setAttribute('height', '16px');
    lImg.classList.add('letterboxd-img');
    div.appendChild(lImg)

    const a = document.createElement("a");
    a.setAttribute('href', `https://letterboxd.com/film/${title}`)
    a.innerText = rating + "/5.00";
    a.classList.add("letterboxd-rating");
    div.appendChild(a);

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

