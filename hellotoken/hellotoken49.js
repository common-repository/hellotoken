(function($) {
    window.mobileCheck = (function() {
        var check = false;

        (function(a) {
            if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
                check = true;
        })(navigator.userAgent||navigator.vendor||window.opera);

        return check;
    })();


    var testEnvironment = (window.location.hostname === 'localhost');
    var pluginURL = ('https:' === document.location.protocol ? 'https://' : 'http://') +
      (testEnvironment ? 'localhost:3000' : 'hellotoken.com');


    var dialog = $('#hellotoken-dialog');
    // HT main class
    function HelloToken(params) {
        // Alias for original HelloToken object
        this.params = params;

        // determine if is demo from wp store
        this.params.is_demo = (params.is_demo == '1');

        // load d
        this.params = $.extend(true, {}, {
            clientID: "",
            numberClickedNeedBuy: 15,
            show_delay: 0,

            // if it should show ht only if tag is present - "<script type="ht"></script>"
            triggerOnTag: false,
            checkForTumblr: false, // if it should check if we are on tumblr post page
            checkForBlogger: false, // check for blogger post page

            // preview mode
            preview: false
        }, params);

        // attempt to load vars from cookie store
        this.helloTokenLoadStore();

        // load iframe into dom
        this.helloTokenLoad();

        // track visit for analytics
        this.helloTokenTrackVisit();

        // Get the time the person started reading the article

        // ht = this;
        // $.ajax({url: pluginURL + "/popup/ping",
        //     type: "HEAD",
        //     timeout:5000,
        //     crossDomain: true,
        //     dataType: "JSONP",
        //     complete: function (jqXHR, textStatus){
        //         console.log("HT: Ping sent to hellotoken servers.");
        //         switch (jqXHR.status){
        //         case 200:
        //             console.log("HT: hellotoken.com reached. Modal loading...");
        //             ht.initialize();
        //             break;
        //         default:
        //             console.log("HT: hellotoken.com not reachable. Status code: "+jqXHR.status);
        //         }
        //     }
        //  });
    }

    // loads content from upstream server (hellotoken.com)
    // future security: wordpress plugin checksum upstream source for authenticity
    // major changes require manual wordpress plugin update
    HelloToken.prototype.helloTokenLoad = function() {
        var popupPath = (this.params.is_demo ? '/popup/demo' : '/popup/index') +
          ('?clientID=' + this.params.clientID) +
          (this.readerID ? ('&readerID=' + this.readerID) : '') +
          ('&url=' + window.location.href);

        this.htDomHTML = '\
            <div id="hellotoken-grayout"></div>\
            <div id="hellotoken-dialog">\
                <iframe id="hellotoken-iframe" src="'+ pluginURL + popupPath + '">\
            </div>';
    };

    HelloToken.prototype.helloTokenLoadStore = function() {
        // get article passes
        try {
          this.readerID = this.helloTokenGetCookie('ht-readerID');
        } catch(e) { this.readerID = null; }
        if (!this.readerID) this.readerID = null;

        try {
            this.articlePasses = JSON.parse(this.helloTokenGetCookie('hellotoken-articlePasses'));
        } catch(e) { this.articlePasses = false; }
        if (!this.articlePasses) this.articlePasses = [];

        try {
            this.articlesTracked = JSON.parse(this.helloTokenGetCookie('hellotoken-articlesTracked'));
        } catch(e) { this.articlesTracked = false; }
        if (!this.articlesTracked) this.articlesTracked = {};
    };


    HelloToken.prototype.helloTokenTrackVisit = function() {
        this.testingType = "default";
        this.arrivalTime = new Date();

        //mixpanel.track("Visit", {
        //    "Client ID": this.params.clientID,
        //    "Domain": window.location.hostname,
        //    "Page": window.location.pathname,
        //    "Time": this.arrivalTime.toISOString(),
        //    "Testing type": this.testingType
        //});

        // commented for the mean time

        var pingImg = document.createElement("img");
        pingImg.src = pluginURL + "/images/ht_logo.png";
        pingImg.style.display = "none";

        document.getElementsByTagName('body')[0].appendChild(pingImg);
        var that = this;
        pingImg.onload = function() {
            console.log("HT: hellotoken.com reached. Modal loading...");
            $(pingImg).remove();
            that.helloTokenInitialize();
        };

        pingImg.onerror = function(data) {
            console.log("HT: hellotoken.com not reachable. Dumping data:");
            $(pingImg).remove();
        };
    };

    // ----- Main Methods ----- //

    HelloToken.prototype.helloTokenReceiveMessage = function(event) {
        if (event.origin !== pluginURL)
            return;

        // See our server code for the syntax of the data string
        if (event.data.substring(0, 8) === "question") {
            // if (freeOver1 && !hasPass1 && !event.target.t.articlesTracked[path]){
            console.log("HT: Question ready on " + pluginURL + " servers.");
            try {
                var visitJSON = $.parseJSON(event.data.substring(8));
                this.testingType = visitJSON.testingType;
                // Load dialog last, since it shows dialog and tracks displaying it
                this.helloTokenLoadDialog(visitJSON.question.alpha_id);
            } catch(err) {
                console.log("HT: Modal closed. Error: "+err);
            }
        } else if (event.data.substring(0, 11) === "setReaderID") {
          this.helloTokenSetCookie("ht-readerID", event.data.split(" ")[1]);
          console.log('HT: new reader.');
        } else if (event.data == "close"){
            if (this.params.preview) {
                return console.log('HT: X-button clicked/close event received in preview mode. Modal closed without redirect');
            }

            var closeTime = new Date().toISOString;
            mixpanel.track("Modal Closed", {
                "Client ID": event.target.t.params.clientID,
                "Domain": window.location.hostname,
                "Page": window.location.pathname,
                "Time": new Date().toISOString(),
                "Time since arrival (seconds)": ((closeTime - this.arrivalTime) / 1000),
                "Testing type": this.testingType
            });

            switch(parseInt(this.params.redirect_type)) {
                case 0:
                    break;
                case 1:
                    window.location.assign(this.params.homeLink);
                    break;
                case 2:
                    if(this.params.redirect_url.indexOf('://') > -1)
                        window.location.assign(this.params.redirect_url);
                    else
                        window.location.assign("http://" + this.params.redirect_url);
                    break;
            }

            // console.log("HT: X-button clicked. No pass consumed, reader redirected, and modal closed.");
            // Allow x-out to just close dialog. TBD if permanent design decision
            this.helloTokenClose();
            console.log("HT: X-button clicked/close event received. Modal closed without redirect.");

        } else if (event.data.substring(0, 13) === "close no pass"){
            this.helloTokenClose();

            console.log("HT: No questions received. Modal closed.");
        } else if (event.data.substring(0, 6) == "answer") {
            mixpanel.track("Question Answered", {
                "Client ID": event.target.t.params.clientID,
                "Domain": window.location.hostname,
                "Page": window.location.pathname,
                "Question": event.data.substring(7),
                "Time": new Date().toISOString(),
                "Testing type": this.testingType
            });

            this.helloTokenClose();
            window.helloTokenArticlePass();
            console.log("HT: Question answered. Modal closed.")
        }
    };

    HelloToken.prototype.helloTokenInitialize = function(){
        // check if it should show the dialog
        if (this.params.triggerOnTag) {
            // don't show if there is not our tag
            if ($('script[type=helloToken]').length == 0){
                console.log("HT: Script not found. Modal closed.");
                return;
            }

            var url = location.href;

            // don't show when we are not on post page of tumblr or blogger
            if (this.params.checkForTumblr && !/\/post\/\d+\/.+/.test(url)){
                console.log("HT: Not on a Tumblr post page. Modal closed.");
                return;
            }

            if (this.params.checkForBlogger && !/\/\d+\/\d+\/.+/.test(url)){
                console.log("HT: Not on a Blogger post page. Modal closed.");
                return;
            }
        }

        var self = this,
            $body = $('body');

        $body.append(this.htDomHTML);

        if ($('#hellotoken-dialog').length > 0)
            console.log("HT: Modal successfully appended.");
        else
            console.log("HT: Modal unsuccessfully appended.");

        // Hide dialog before showing later
        dialog.css('display', 'none');

        // Set limit number
        //$('.ht-limit').text(this.params.numberClickedNeedBuy); // not used

        /* ----- Dialog Closing ----- */

        // // Close dialog upon ESC keypress
        // $('#hellotoken-iframe').keyup(function(e) {
        //     if (e.which == 27) {
        //         console.log('clicked');
        //         $('#hellotoken-dialog .close').click();
        //     }
        // });

        // When not mobile, make sure div always centered
        $(window).resize(function() {
            self.helloTokenBodyStyling();
            //self.set_bmd_position();
        });

        // save permanent data on unload
        $(window).on('unload', function() {
            if (self.params.preview) {
                return;
            }

            var exitTime = new Date();

            mixpanel.track("Page Exited", {
                "Client ID": self.params.clientID,
                "Domain": window.location.hostname,
                "Page": window.location.pathname,
                "Time": exitTime.toISOString(),
                "Time since arrival (seconds)": ((exitTime - self.arrivalTime) / 1000),
                "Testing type": self.testingType
            });
        });

        if (this.params.preview) {
            this.helloTokenShow();
            return;
        }

        // Listen for a message from the iframe
        // anonymous function is a workaround so that function still owned by HT
        window.addEventListener("message", function(event) { self.helloTokenReceiveMessage(event) }, false);

        // Add HT object to the window (used within helloTokenReceiveMessage)
        window.t = this;

        // article pass
        window.helloTokenArticlePass = function() {
            //self.givePass(-1);
            self.helloTokenSetPass();
            self.helloTokenClose();
        }
    };

    HelloToken.prototype.helloTokenClose = function() {
        $('#hellotoken-grayout').remove();
        $('#hellotoken-iframe').fadeOut( 100 );
        $('#hellotoken-dialog').fadeOut( 100 );

        // if (this.params.preview) {
        //     $('#hellotoken-grayout').remove();
        //     $('#hellotoken-dialog').remove();
        // }

        var style = $('body')[0].style;
        style.setProperty('height', 'inherit', 'important');
        style.setProperty('position', 'inherit', 'important');
        style.setProperty('overflow', 'auto', 'important');
    };

    //HelloToken.prototype.hasValidPass = function() {
    //    var numRead = Object.keys(this.articlesTracked).length;
    //    var readsAvailable = this.params.numberClickedNeedBuy;
    //
    //    if (readsAvailable > numRead) {
    //        console.log('HT: Free reads still available');
    //        return true;
    //    }
    //
    //    for (var articlePass in this.articlePasses) {
    //        var pass = this.articlePasses[articlePass];
    //        if (pass.goodFor == -1) {
    //            console.log('HT: unlimited pass found');
    //            return true;
    //        }
    //
    //        readsAvailable += pass.goodFor;
    //        if (readsAvailable >= numRead) {
    //            console.log('HT: limited pass found');
    //            return true;
    //        }
    //    }
    //
    //    return false;
    //};

    // HelloToken.prototype.markArticleRead = function() {
    //     var path = window.location.pathname;
    //     this.articlesTracked[path] = true;
    //     this.helloTokenSaveTracked();
    // }

    HelloToken.prototype.helloTokenShowDialog = function(delay) {
        var that = this;
        if (delay > 0) {
            window.setTimeout(function() {
                that.helloTokenShow();
            }, delay * 1000);
        } else {
            this.helloTokenShow();
        }
    };

    // /**
    //  * A function that first checks if the dialog should be loaded at all
    //  * and then appropriately shows the dialog.
    //  * The main two helper functions are thus helloTokenPassesAndTimer() and helloTokenShow()
    //  * Question argument used to identify the question being shown so it can be tracked by MP.
    //  */
    // HelloToken.prototype.helloTokenLoadDialog = function(question) {
    //     // Number of articles read
    //     var numRead = Object.keys(this.articlesRead).length;
    //     // Free reading over? (either read more articles than allowed, or none allowed at all)
    //     var freeOver = (numRead >= this.params.numberClickedNeedBuy) || (this.params.numberClickedNeedBuy < 1);
    //     // Does the reader have a pass aleady? (Potentially by having the article before.)

    //     var hasPass = this.helloTokenPassesAndTimer();

    //     if ( ! hasPass || this.params.is_demo ||
    //         window.location.hostname == "demo.hellotoken.com") {

    //         this.helloTokenShowDialog(this.params.show_delay);

    //         if (this.params.is_demo)
    //             console.log("HT: Demo version discovered. Modal automatically loaded.");
    //         else
    //             console.log("HT: Free articles over, but no passes found. Modal loaded.");

    //         mixpanel.track("Question Seen", {
    //             "Client ID": this.params.clientID,
    //             "Domain": window.location.hostname,
    //             "Page": window.location.pathname,
    //             "Question": question,
    //             "Time": new Date().toISOString(),
    //             "Testing type": this.testingType
    //         });
    //     } else {
    //         // mark only read if dialog is not present (or answered)
    //         this.markArticleRead();
    //     }
    // }

    HelloToken.prototype.helloTokenLoadDialog = function(question){
        // Article location
        var path = window.location.pathname;
        // Number of articles read
        var numTracked = Object.keys(this.articlesTracked).length;
        // Free reading over? (either read more articles than allowed, or none allowed at all)
        var freeOver = (numTracked >= this.params.numberClickedNeedBuy) || (this.params.numberClickedNeedBuy < 1);
        // Does the reader have a pass aleady? (Potentially by having the article before.)
        var hasPass = this.helloTokenPassesAndTimer();

        // If already exceeded in article number AND article number has returned below limit
        if (!this.articlesTracked[path] && (numTracked < this.params.numberClickedNeedBuy)) {
            // Set state to not exceeded anymore
            this.articlesTracked[path] = true;
            this.helloTokenSaveTracked();
            // It seems like freeover and articlesTracked is redundant except for the cookies part...
        }

        // If free reading over AND no passes given AND article limit exceeded
        // or a demo version--
        if ((freeOver && !hasPass && !this.articlesTracked[path]) ||
            this.params.is_demo || window.location.hostname == "demo.hellotoken.com") {

            if (this.params.is_demo)
                console.log("HT: Demo version discovered. Modal automatically loaded.");
            else
                console.log("HT: Free articles over and no passes found. Modal loaded.");

            mixpanel.track("Question Seen", {
                "Client ID": this.params.clientID,
                "Domain": window.location.hostname,
                "Page": window.location.pathname,
                "Question": question,
                "Time": new Date().toISOString(),
                "Testing type": this.testingType
            });

            this.helloTokenShowDialog(this.params.show_delay);
        } else {
            if (!freeOver)
                console.log("HT: Free articles still remaining.");
            if (hasPass)
                console.log("HT: Passes still remaining.");

            // if (this.articlesTracked[path])
            //     console.log("HT: Article limit not yet passed.")

            console.log("HT: Closing modal.");
        }
    };

    // show ht modal dialog
    HelloToken.prototype.helloTokenShow = function() {
        this.helloTokenBodyStyling();
        $('#hellotoken-grayout').fadeIn( 100 );
        dialog.fadeIn( 100 );

        if ($('#hellotoken-dialog').is(':visible'))
            console.log("HT: Successfully made modal visible.");
        else
            console.log("HT: Unsuccessfully made modal visible.");

        // When modal is active, no need to scroll
        // will possibly add back in preview mode
        if ( ! this.params.preview) {
            var style = $('body')[0].style;
            style.setProperty('height', '100%', 'important');
            style.setProperty('width', '100%', 'important');
            // style.setProperty('position', 'fixed', 'important');
            // style.setProperty('overflow', 'hidden', 'important');
        }
    };

    HelloToken.prototype.helloTokenBodyStyling = function() {
        var body = $('body');
        var grayout = $('#hellotoken-grayout');
        // disregard positioning if this is a mobile device
        if (mobileCheck)
            return;

        var top = this.helloTokenGetNumFromPx(body.css('margin-top'));
        var bottom = this.helloTokenGetNumFromPx(body.css('margin-bottom'));
        var left = this.helloTokenGetNumFromPx(body.css('margin-left'));
        var right = this.helloTokenGetNumFromPx(body.css('margin-right'));

        grayout.css('top', '-' + top + 'px');
        grayout.css('left', '-' + left + 'px');
        grayout.css('width', $(document).width() + right + 'px');
        grayout.css('height', $(document).height() + bottom + 'px');
    };

    HelloToken.prototype.helloTokenGetNumFromPx = function(string)
    {
        var index = string.indexOf('px');
        return parseInt(string.substring(0, index));
    };

    HelloToken.prototype.helloTokenEncrypt = function(str) {
        var b = '';
        for(var i = 0; i < str.length; i++)
            b += String.fromCharCode(69 ^ str.charCodeAt(i));

        return b;
    };

    HelloToken.prototype.helloTokenDecrypt = function(str) {
        var b = '';
        for(var i = 0; i < str.length; i++)
            b += String.fromCharCode(69 ^ str.charCodeAt(i));

        return b;
    };


    // ----- Cookies ----- //
    HelloToken.prototype.helloTokenSetCookie = function(name, value, days) {
        var exp_date = new Date();
        exp_date.setDate(exp_date.getDate() + days);

        value = escape(this.helloTokenEncrypt(value)) + (days == null?'':'; expires=' + exp_date.toUTCString()) + '; path=/';
        document.cookie = name + "=" + value
    };

    HelloToken.prototype.helloTokenGetCookie = function(name) {
        var cookies = document.cookie.split(';');

        for(var i in cookies) {
            var cook = cookies[i];

            x = cook.substr(0, cook.indexOf('='));
            y = cook.substr(cook.indexOf('=') + 1);
            x = x.replace(/^\s+|\s+$/g, '');
            if(x == name)
                return this.helloTokenDecrypt(unescape(y));
        }

        return false;
    };


    HelloToken.prototype.helloTokenSavePasses = function() {
        this.helloTokenSetCookie('hellotoken-articlePasses', JSON.stringify(this.articlePasses), 365);
    };

    HelloToken.prototype.helloTokenSaveTracked = function() {
        this.helloTokenSetCookie('hellotoken-articlesTracked', JSON.stringify(this.articlesTracked), 365);
    };

    // HelloToken.prototype.givePass = function(goodFor) {
    //     var newPass = {
    //         activatedAtLink: window.location.href,
    //         goodFor: goodFor
    //     }

    //     // if for some reason we have different passes for different purposes
    //     this.articlePasses.push(newPass);
    //     this.helloTokenSavePasses();
    // }

    HelloToken.prototype.helloTokenPassesAndTimer = function() {
        if (window.location.name === 'demo.hellotoken.com' || this.params.is_demo) {
            console.log('HT: On demo, so passes invalidated.');
            //return false;
        }

        var href = window.location.href;
        // -- Check for article passes -- //
        var articlePasses = this.articlePasses;
        // console.log("HT: Print articlePasses.");
        // console.dir(articlePasses );
        // Any passes found?
        var foundActiveArticlePass = false;
        // Index of the first (fake) pass?
        var firstArticlePassLocation = -1;


        // Getting around someone else's badly designed JS where they alter the prototype of a built-in JS datatype (JS) messing up our use of arrays.
        // for (var articlePass in articlePasses) {
        // for...of is not universally supported yet
        // for (var articlePass of articlePasses) {
        for (var articlePass = 0; articlePass < articlePasses.length; articlePass += 1) {
            var ht_pass = articlePasses[articlePass];
            // console.log("HT: Print each individual pass key.");
            // console.dir(articlePass);
            // console.log("HT: Print each individual pass.");
            // console.dir(ht_pass);

            // If a ht_pass was found for this specific url (page)
            if (ht_pass.link == href) {
                // Activate the ht_pass if not so already
                // Right now we don't care if it's been activated or not
                // so a ht_pass for an article is permanent
                // if (!ht_pass.activated)
                //     ht_pass.activated = true;

                // TODO TESTING check if article passes has updated
                this.helloTokenSavePasses();
                foundActiveArticlePass = true;

                // Return that a pass has been found
                console.log("HT: Searching for article passes...found a pass for this article.");
                return true;
            }
            // Otherwise, if the pass has no link or activation status, and we haven't found such a pass yet
            // "such" passes are probably the "new" ones that are being sent in the popup code
            else if ((!ht_pass.activated || !ht_pass.link) && firstArticlePassLocation == -1)
                firstArticlePassLocation = articlePass;
            // console.log("firstArticlePassLocation:" +firstArticlePassLocation);
            // console.log("ht_pass.activated:" +ht_pass.activated);
            // console.log("ht_pass.link:" +ht_pass.link);
        }

        // No (real) active passes were found at all
        if (!foundActiveArticlePass) {
            // If we found one of those "fake" passes
            if (firstArticlePassLocation != -1) {

                // Set the link and activation for that fake pass
                // articlePasses[firstArticlePassLocation].link = window.location.href;
                articlePasses[firstArticlePassLocation].activated = true;
                this.helloTokenSavePasses();

                // Set that we actually found a fake pass
                foundActiveArticlePass = true;

                // Return that a pass was found
                console.log("HT: Searching for article passes...found an artificial pass for this article.");
                return true;
            } else {
                console.log("HT: Searching for article passes...no valid article passes found.");
                return false;
            }
        }

        // This should never hit
        return (foundActiveArticlePass);
    };


    HelloToken.prototype.helloTokenSetPass = function() {
        var newPass = {
            link: window.location.href,
            // Allow this pass to be used once for another article
            activated: false
        };

        this.articlePasses.push(newPass);
        this.helloTokenSavePasses();
    };

    // HelloToken.prototype.helloTokenSetPass = function() {
    //     // Create and Add new pass
    //     var newPass = {
    //         link: window.location.href,
    //         activated: false // Allow this pass to be used once for another article
    //     };

    //     this.articlePasses.push(newPass);

    //     // Save article pass state to cookie
    //     this.helloTokenSetCookie('hellotoken-articlePasses', JSON.stringify(this.articlePasses), 365);

    //     this.saved.articleTypeIndex = 0;

    //     this.saveVars();

    //     // Redirect after pass setting; commented for now
    //     // if (passLink !== undefined)
    //     //     window.location = passLink || ht.homeLink;
    // }

    $.extend({
        HelloToken: function(params) {
            return new HelloToken(params);
        }
    });

})(jQuery);
