chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    
    if (!document.getElementById("pizzaGenerator") && !document.getElementById("randomPizzas")) return false;

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    // ----------------------------------------------------------

    var runAsPage = function(fun) {
      // only run functions
      if (!typeof fun === 'function') return false;
     
      var script = document.createElement('script');
      var scriptContent = '(' + fun.toString() + ')();';
      // var scriptContent = fun.toString();   // if nothing happens, this is why
     
      // add script content to the script, and add the script to the body, "running it"
      script.appendChild(document.createTextNode(scriptContent));
      document.body.appendChild(script);
     
      // success
      return true;
    };

    var injectAnythingIntoPageScript = function(js) {
      // doesn't run functions
     
      var script = document.createElement('script');
      // var scriptContent = '(' + fun.toString() + ')();';
      var scriptContent = js.toString();
     
      // add script content to the script, and add the script to the body, "running it"
      script.appendChild(document.createTextNode(scriptContent));
      document.body.appendChild(script);
     
      // success
      return true;
    };
    // var injectLotsOfThingsIntoPageScript = function() {
    //   // doesn't run functions
     
    //   var script = document.createElement('script');
    //   // var scriptContent = '(' + fun.toString() + ')();';
    //   var scriptContent = "";
    //   for (fun in arguments) scriptContent = scriptContent + arguments[fun].toString();
     
    //   // add script content to the script, and add the script to the body, "running it"
    //   script.appendChild(document.createTextNode(scriptContent));
    //   document.body.appendChild(script);
     
    //   // success
    //   return true;
    // };

    // psi api
    function searchKeyPress(e) {
      
      // look for window.event in case event isn't passed in
      if (typeof e == 'undefined' && window.event) { e = window.event; }
      if (e.keyCode == 13)
      {
        document.getElementById('btn').click();
      }
    }
    injectAnythingIntoPageScript(searchKeyPress);

    // var psiDiv = document.querySelector("#PSI");


    function getStudentURL() {
      studentURL = document.querySelector('#stdURL').value;    // should be moved
      console.log("Running PS Insights Test against: " + studentURL);
      return studentURL;
    }
    injectAnythingIntoPageScript(getStudentURL);

    var studentURL = "";
    injectAnythingIntoPageScript('var studentURL = "";');
    var apiKey = "AIzaSyAHehZ3CRwWG3cpCGF3WRTLdWxD0XXDdaI";  //identified as localhost
    var psiURL = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?';

    var waitingText = "Querying the PageSpeed API...";

    // Object that will hold the callbacks that process results from the
    // PageSpeed Insights API.
    var callbacks = {}


    callbacks.clearScreen = function() {
      if (psiDiv.innerHTML === waitingText) psiDiv.innerHTML = "";
    }
    injectAnythingIntoPageScript(callbacks.clearScreen);

    callbacks.displayScore = function(result, strategy) {
      var score = result.score;
      var div = document.createElement("div");
      div.innerHTML = strategy + " Score: " + score;
      psiDiv.insertBefore(div, null);
    }

    callbacks.displayTopPageSpeedSuggestions = function(result) {
      // console.log(result);
      var results = [];
      var ruleResults = result.formattedResults.ruleResults;

      for (var i in ruleResults) {
        var ruleResult = ruleResults[i];
        // Don't display lower-impact suggestions.
        if (ruleResult.ruleImpact < 3.0) continue;
        results.push({name: ruleResult.localizedRuleName,
                      impact: ruleResult.ruleImpact,
                      // url: ruleResult.urlBlocks[0].header.args[0].value
                    });
      }
      results.sort(sortByImpact);
      var ul = document.createElement('ul');
      for (var i = 0, len = results.length; i < len; ++i) {
        var r = document.createElement('li');
        // var a = document.createElement('a');
        // a.href = results[i].url;
        // a.innerHTML = results[i].name;
        // r.appendChild(a);
        r.innerHTML = results[i].name;
        ul.insertBefore(r, null);
      }
      if (ul.hasChildNodes()) {
        // document.body.insertBefore(ul, null);
        psiDiv.appendChild(ul, null);
      } else {
        var div = document.createElement('div');
        div.innerHTML = 'No high impact suggestions. Good job!';
        // document.body.insertBefore(div, null);
        psiDiv.appendChild(div, null);
      }
    };

    // Helper function that sorts results in order of impact.
    function sortByImpact(a, b) { return b.impact - a.impact; }

    // Our JSONP callback. Checks for errors, then invokes our callback handlers.
    function runPagespeedCallbacksDesktop(result) {
      var strategy = "Desktop";
      if (result.error) {
        var errors = result.error.errors;
        for (var i = 0, len = errors.length; i < len; ++i) {
          if (errors[i].reason == 'badRequest' && apiKey == 'yourAPIKey') {
            alert('Please specify your Google API key in the apiKey variable.');
          } else {
            psiDiv.text = "Could not execute PageSpeed Insights Test. See below.\n" + errors[i].message;
          }
        }
        psiDiv.text = errors;
        return;
      }

      // Dispatch to each function on the callbacks object.
      for (var fn in callbacks) {
        var f = callbacks[fn];
        if (typeof f == 'function') {
          callbacks[fn](result, strategy);
        }
      }
    }

    function runPagespeedCallbacksMobile(result) {
      var strategy = "Mobile";
      if (result.error) {
        var errors = result.error.errors;
        for (var i = 0, len = errors.length; i < len; ++i) {
          if (errors[i].reason == 'badRequest' && apiKey == 'yourAPIKey') {
            alert('Please specify your Google API key in the apiKey variable.');
          } else {
            psiDiv.text = "Could not execute PageSpeed Insights Test. See below.\n" + errors[i].message;
          }
        }
        psiDiv.text = errors;
        return;
      }

      // Dispatch to each function on the callbacks object.
      for (var fn in callbacks) {
        var f = callbacks[fn];
        if (typeof f == 'function') {
          callbacks[fn](result, strategy);
        }
      }
    }

    // Invokes the PageSpeed Insights API. The response will contain
    // JavaScript that invokes our callback with the PageSpeed results.
    // type is a string of either "mobile" or "desktop", indicating strategy
    function runPagespeed(strategy) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      var query = [
        'url=' + studentURL,
        'callback=runPagespeedCallbacks' + strategy,
        'key=' + apiKey,
        'strategy=' + strategy,    // TODO: needs a mobile call too!
      ].join('&');
      s.src = psiURL + query;
      document.head.insertBefore(s, null);
    }

    var strategies = ["Desktop", "Mobile"];

    function runTests() {
      psiDiv.innerHTML = waitingText;
      getStudentURL();
      
      // refers to mobile and desktop
      for (s in strategies) {
        currentStrategy = strategies[s];
        runPagespeed(currentStrategy);
      }
    }
    injectAnythingIntoPageScript(runTests);

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
                // alert(fps);    // fps works. sometimes NaN? might need to deal with that.
                fpsArray.push(fps);
            }

            original.call(console, message);
          }
        }
        var methods = ['log', 'warn', 'error']
        for (var i = 0; i < methods.length; i++)
            intercept(methods[i])
    };
    
    


    // inject DOM elements into top of page

    function globals() {
      var divInput = document.createElement("div");
      var psiDiv = document.createElement('div');
      var fpsDiv = document.createElement('div');
      var textInput = document.createElement("input");
      textInput.id = "stdURL";
      textInput.type = "text";
      textInput.value = "http://www.udacity.com";
      textInput.onkeypress = searchKeyPress.bind(window, event);

      var btnInput = document.createElement("button");
      btnInput.id = "btn";
      btnInput.value = "Score PS Insights";
      btnInput.onclick = runtests.bind(window, null);   // maybe document?

      var body = document.body;

      body.insertBefore(fpsDiv, body.firstChild);
      body.insertBefore(psiDiv, body.firstChild);
      body.insertBefore(btnInput, body.firstChild);
      body.insertBefore(textInput, body.firstChild);

      var fpsArray = [];
      Array.prototype.push = function() {
        for( var i = 0, l = arguments.length; i < l; i++ )
        {
          this[this.length] = arguments[i];
          calcFPS();
        }
        alert(fpsArray);
        return this.length;
      };
    }
    
    // fps
    // function to update fps
    function calcFPS() {
      var sum = 0.0;
      for(i in fpsArray) {
        sum = sum + i;
      }
      alert(sum);
    }
    injectAnythingIntoPageScript(calcFPS);

    // need to scroll
    var scrolltimer = setInterval(function() {
      console.log("scroll");
      scrollBy(0,5);
    }, 1)
    setTimeout(clearInterval(scrolltimer), 100);  // do like bind?


    injectAnythingIntoPageScript(globals);
    // runAsPage(arrayPusherHack);
    setTimeout(runAsPage.bind('bullshit', takeOverConsole), 2000);
    // setTimeout(runAsPage.bind('bullshit', startPSI), 1000);
    // setTimeout(runAsPage.bind('bullshit', psiFuncs), 1);
    // runAsPage(buildNewElements);
    // runAsPage(psiFuncs);


	}
	}, 10);
});