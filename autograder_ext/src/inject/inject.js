chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    
    if (!document.getElementById("pizzaGenerator") && !document.getElementById("randomPizzas")) return false;

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    // ----------------------------------------------------------

    // helper functions to inject scripts
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
    // not sure if this last one works
    var injectLotsOfThingsIntoPageScript = function() {
      // doesn't run functions
     
      var script = document.createElement('script');
      // var scriptContent = '(' + fun.toString() + ')();';
      var scriptContent = "";
      for (fun in arguments) scriptContent = scriptContent + arguments[fun].toString();
     
      // add script content to the script, and add the script to the body, "running it"
      script.appendChild(document.createTextNode(scriptContent));
      document.body.appendChild(script);
     
      // success
      return true;
    };

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

    function getStudentURL() {
      var studentURL = document.querySelector('#stdURL').value;    // should be moved
      console.log("Running PS Insights Test against: " + studentURL);
      return studentURL;
    }
    injectAnythingIntoPageScript(getStudentURL);

    // Helper function that sorts results in order of impact.
    function sortByImpact(a, b) { return b.impact - a.impact; }
    injectAnythingIntoPageScript(sortByImpact);

    // Our JSONP callback. Checks for errors, then invokes our callback handlers.
    function runPagespeedCallbacksDesktop(result) {
      var psiDiv = document.querySelector("#psiDiv");

      var callbacks = {}

      callbacks.clearScreen = function() {
        if (psiDiv.innerHTML === "Querying the PageSpeed API...") psiDiv.innerHTML = "";
      }

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

      var strategy = "Desktop";
      var apiKey = "AIzaSyAHehZ3CRwWG3cpCGF3WRTLdWxD0XXDdaI";
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
    injectAnythingIntoPageScript(runPagespeedCallbacksDesktop);

    function runPagespeedCallbacksMobile(result) {
      var psiDiv = document.querySelector("#psiDiv");
      var callbacks = {}

      callbacks.clearScreen = function() {
        if (psiDiv.innerHTML === "Querying the PageSpeed API...") psiDiv.innerHTML = "";
      }

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

      var strategy = "Mobile";
      var apiKey = "AIzaSyAHehZ3CRwWG3cpCGF3WRTLdWxD0XXDdaI";
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
    injectAnythingIntoPageScript(runPagespeedCallbacksMobile);

    // Invokes the PageSpeed Insights API. The response will contain
    // JavaScript that invokes our callback with the PageSpeed results.
    // type is a string of either "mobile" or "desktop", indicating strategy
    function runPagespeed(strategy, url) {
      var apiKey = "AIzaSyAHehZ3CRwWG3cpCGF3WRTLdWxD0XXDdaI";  //identified as localhost
      var psiURL = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?';
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      var query = [
        'url=' + url,
        'callback=runPagespeedCallbacks' + strategy,
        'key=' + apiKey,
        'strategy=' + strategy,    // TODO: needs a mobile call too!
      ].join('&');
      s.src = psiURL + query;
      document.head.insertBefore(s, null);
    }
    injectAnythingIntoPageScript(runPagespeed);


    function runTests() {
      var psiDiv = document.querySelector("#psiDiv");
      var strategies = ["Desktop", "Mobile"];
      var waitingText = "Querying the PageSpeed API...";
      psiDiv.innerHTML = waitingText;
      var url = getStudentURL();
      
      // refers to mobile and desktop
      for (s in strategies) {
        currentStrategy = strategies[s];
        runPagespeed(currentStrategy, url);
      }
    }
    injectAnythingIntoPageScript(runTests);


    function takeOverConsole(){
        var fpsArray = [];

        Array.prototype.push = function() {
          var sum = 0;
          for( var i = 0, l = arguments.length; i < l; i++ )
          {
            this[this.length] = arguments[i];
            // alert(fpsArray);
          }

          if ( arguments[0].toString().match(/[1-9]+\.[0-9]+/) === null ) return this.length;

          for(i in fpsArray) {
            sum = sum + fpsArray[i];
          }
          // alert(sum);
          var averageFPS = sum / parseFloat(fpsArray.length);
          alert(averageFPS);  // seems to be working!!!
          return this.length;
        };
        
        var console = window.console;
        if (!console) return;
        function intercept(method){
          var original = console[method];
          console[method] = function(){
            var message = Array.prototype.slice.apply(arguments).join(' ')
            
            // do sneaky stuff



            if (message.indexOf("Average time to generate last 10 frames:") !== -1) {
                var reMS = /[1-9]+\.[0-9]+/;
                var timeMS = parseFloat(message.match(reMS));
                var timeS = timeMS * 0.001;  
                var fps = 1.0 / timeS;
                // alert(fps);    // fps works. sometimes NaN? might need to deal with that.
                fpsArray.push(fps);
            }

            original.call(console, message);
          }
        }
        var methods = ['log', 'warn', 'error']
        for (var i = 0; i < methods.length; i++) {
            intercept(methods[i])
        }
    };

    // inject DOM elements into top of page

    function divBuilder() {
      var scoreResults = document.createElement('div');
      scoreResults.id = "scoreResults";
      scoreResults.style.background = "white";

      // var divInput = document.createElement("div");

      var psiDiv = document.createElement('div');
      psiDiv.id = "psiDiv";

      var fpsDiv = document.createElement('div');
      var textInput = document.createElement("input");
      textInput.id = "stdURL";
      textInput.type = "text";
      textInput.value = "http://www.udacity.com";
      textInput.onkeypress = searchKeyPress.bind(window, event);
      // textInput.onkeypress = searchKeyPress(event); // this might break

      var btnInput = document.createElement("button");
      btnInput.id = "btn";
      btnInput.value = "Score PS Insights";
      // btnInput.onclick = runTests.bind(window, null);   // maybe document?
      btnInput.onclick = runTests;

      var body = document.body;

      body.insertBefore(scoreResults, body.firstChild);

      scoreResults.appendChild(fpsDiv);
      scoreResults.appendChild(psiDiv);
      scoreResults.appendChild(btnInput);
      scoreResults.appendChild(textInput);

    }
    // injectAnythingIntoPageScript(divBuilder);
    runAsPage(divBuilder);

    // function buildTopOfPage() {
    //   divBuilder();
    // }
    // runAsPage(buildTopOfPage);

    //need to run

    // need to scroll
    function scroller () {
      var scrolltimer = window.setInterval(function() {
        console.log("scrolling!");
        scrollBy(0,50);
      }, 1)
      window.setTimeout(clearInterval(scrolltimer), 500);  // do like bind?
    }
    // runAsPage(scroller);


    // runAsPage(arrayPusherHack);
    setTimeout(runAsPage.bind('bullshit', takeOverConsole), 2000);
    // setTimeout(runAsPage.bind('bullshit', startPSI), 1000);
    // setTimeout(runAsPage.bind('bullshit', psiFuncs), 1);
    // runAsPage(buildNewElements);
    // runAsPage(psiFuncs);


	}
	}, 10);
});