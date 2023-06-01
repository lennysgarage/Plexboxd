chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        fetch(`https://letterboxd.com/film/${request.title}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "text/html"
                }
            }
        ).then((response) => {
            return response.text();
        }).then((html) => {
            sendResponse(html);
        }).catch((err) => {
            console.error("Something went wrong. ", err)
        });

        return true;
    }
)