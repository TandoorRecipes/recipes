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
            r = confirm('Click OK to import recipe automatically, click Cancel to import the recipe manually.'); 
            if (r) {
                auto=true
            } else {
                auto=false
            }
            
            var newIframe = document.createElement('iframe');
            newIframe.width = '200';newIframe.height = '200';
            newIframe.src = localStorage.getItem('importURL'); 
            document.body.appendChild(newIframe);


            }
        )();
    }
})();
