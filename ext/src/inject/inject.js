chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    
    if (!document.getElementById("pizzaGenerator") && !document.getElementById("randomPizzas")) return false;

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    // ----------------------------------------------------------
    
    console.log("We're fucking in!");

    function takeOverConsole(){
        var console = window.console;
        if (!console) return;
        function intercept(method){
          var original = console[method];
          console[method] = function(){
            var message = Array.prototype.slice.apply(arguments).join(' ')
            // do sneaky stuff
            if (message.indexOf("Average time to generate last 10 frames:") !== -1) {
                var reMS = /[1-9]+\.[0-9]+/;
                var timeMS = parseFloat(message.match(reMS)[0]);
                var timeS = timeMS * 0.001;  
                var fps = 1.0 / timeS;
                alert(fps);
            }

            original.call(console, message);
          }
        }
        var methods = ['log', 'warn', 'error']
        for (var i = 0; i < methods.length; i++)
            intercept(methods[i])
    };

    var runAsPage = function(fun) {
      // only run functions
      if (!typeof fun === 'function') return false;
     
      var script = document.createElement('script');
      var scriptContent = '(' + fun.toString() + ')();';
     
      // add script content to the script, and add the script to the body, "running it"
      script.appendChild(document.createTextNode(scriptContent));
      document.body.appendChild(script);
     
      // success
      return true;
    };
    
    setTimeout(runAsPage.bind('bullshit', takeOverConsole), 2000);


	}
	}, 10);
});