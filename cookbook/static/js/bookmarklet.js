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
            var recipe = document.documentElement.innerHTML
            var form = document.createElement("form");
            var windowName = "ImportRecipe"
            form.setAttribute("method", "post");
            form.setAttribute("action", localStorage.getItem('importURL'));
            form.setAttribute("target",'importRecipe');  
            var params = { 'recipe' : recipe,'url': window.location}; 
            
            for (var i in params) {
                if (params.hasOwnProperty(i)) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = i;
                    input.value = params[i];
                    form.appendChild(input);
                }
                }              
                document.body.appendChild(form);                       
                window.open('', windowName);
                form.target = windowName;
                form.submit();                 
                document.body.removeChild(form);  
            }
        )();
    }
})();
