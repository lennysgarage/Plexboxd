chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        fetch(`https://letterboxd.com/film/${request.title}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "text/html"
                }
            }
        ).then(function (response) {
            return response.text();
        }).then(function (html) {
            sendResponse(html);
        }).catch(function (err) {
            console.error("Something went wrong. ", err)
        });

        return true;
    }
)