(function(){

    var v = "1.3.2";

    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
        var done = false;
        var script = document.createElement("script");
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
        script.onload = script.onreadystatechange = function(){
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                done = true;
                initBookmarklet();
            }
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    } else {
        initBookmarklet();
    }
    function initBookmarklet() {
        (window.bookmarkletTandoor = function() {
            let recipe = document.documentElement.outerHTML
            let windowName = "ImportRecipe"
            let url = localStorage.getItem('importURL')
            let redirect = localStorage.getItem('redirectURL')
            let token = localStorage.getItem('token')
            let params = { 'url': window.location.protocol + '//' + window.location.host + window.location.pathname, 'html' : recipe}; 
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);

            // listen for `onload` event
            xhr.onload = () => {
                // process response
                if (xhr.readyState == 4 && xhr.status == 201) {
                    // parse JSON data
                    window.open(redirect.concat('?id=', JSON.parse(xhr.response).id) )
                } else {
                    console.error('Error!');
                }
            };
            xhr.send(JSON.stringify(params));
            }
        )();
    }
})();