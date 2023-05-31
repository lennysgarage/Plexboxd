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

function updateRatings() {
  let originalTitle = document.querySelector('[data-testid=metadata-title]').textContent.toLowerCase();
  originalTitle = originalTitle.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, digitFromSuperscript);
  originalTitle = originalTitle.replace("'", "");
  originalTitle = originalTitle.replace(" & ", "-");
  originalTitle = originalTitle.replace(/\W/g, "-");
  originalTitle = originalTitle.replace("--", "-"); // blasphemy...

  if (originalTitle.endsWith("-")) {
    originalTitle = originalTitle.substring(0, originalTitle.length - 1)
  }

  // fetch with year first
  let year = document.querySelector('[data-testid=metadata-line1]').textContent;
  year = year.split("    ");
  if (year.length > 1) {
    year = year[0];
  }
  let titleWithYear = originalTitle + "-" + year

  console.log(titleWithYear)
  chrome.runtime.sendMessage({ title: titleWithYear },
    html => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');

      let rating = doc.getElementsByName("twitter:data2")
      if (rating) {
        rating = rating[0].content
        if (rating) {
          rating = rating.split(" ")[0]
        }
      }

      const ratings = document.querySelector('[data-testid="metadata-ratings"]');
      if (ratings) {
        const lImg = document.createElement("img");
        lImg.setAttribute('src', "chrome-extension://__MSG_@@ngilbhhfgkjkfllefakjhieneaoknbfn/../images/letterboxd-decal-dots-pos-rgb-500px.png");
        lImg.setAttribute('height', '16px');
        lImg.setAttribute('width', '16px');
        ratings.appendChild(lImg)

        const div = document.createElement("a");
        div.setAttribute('href', `https://letterboxd.com/film/${titleWithYear}`)
        div.innerText = rating + "/5.00";
        div.classList.add("letterboxd-rating");
        ratings.appendChild(div);

      }
    }
  );

  // check.
  // what if we just send both titles through the message
  // there's always a response tho, the 404 page is html we look through.
  // how would we differienate the responses?
  // do they send a status code?
  // okay yeah check status code, if 404 then check other URL.

  if (document.getElementsByClassName("letterboxd-rating").length < 1) {
    console.log(originalTitle)
    chrome.runtime.sendMessage({ title: originalTitle },
      html => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        let rating = doc.getElementsByName("twitter:data2")
        if (rating) {
          rating = rating[0].content
          if (rating) {
            rating = rating.split(" ")[0]
          }
        }

        const ratings = document.querySelector('[data-testid="metadata-ratings"]');
        if (ratings) {
          const lImg = document.createElement("img");
          lImg.setAttribute('src', "chrome-extension://__MSG_@@ngilbhhfgkjkfllefakjhieneaoknbfn/../images/letterboxd-decal-dots-pos-rgb-500px.png");
          lImg.setAttribute('height', '16px');
          lImg.setAttribute('width', '16px');
          ratings.appendChild(lImg)

          const div = document.createElement("a");
          div.setAttribute('href', `https://letterboxd.com/film/${originalTitle}`)
          div.innerText = rating + "/5.00";
          div.classList.add("letterboxd-rating");
          ratings.appendChild(div);
        }
      }
    );
  }
}

function digitFromSuperscript(superChar) {
  var result = "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(superChar);
  if (result > -1) {
    return "-" + result;
  }

  return superChar;
}

