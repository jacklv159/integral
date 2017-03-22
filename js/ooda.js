/**
 * Created by kris on 2017/3/22.
 */
/*
 release under MIT license
 */
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a)return a(o, !0);
                if (i)return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {exports: {}};
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)s(r[o]);
    return s
})({
    1: [function (require, module, exports) {
        (function () {
            var Class =
                function (obj) {
                    var obj = obj || {};
                    var Constructor = function () {
                        if (this._init) this._init.apply(this, arguments)
                    };
                    Constructor.prototype = clone(obj);
                    Constructor.prototype.constructor = Constructor;
                    classify(Constructor);
                    Constructor.prototype.setOptions = Class.setOptions;
                    Constructor.prototype.getOptions = Class.getOptions;
                    return Constructor
                };
            Class.extend = function (prop) {
                var self = this;
                var prototype = this.prototype;
                var newObj = merge(prototype, prop);
                for (var i in prop)if (typeof prop[i] == "function" && /_super/.test(prop[i].toString())) newObj[i] =
                    function (name, method) {
                        return function () {
                            this._super = prototype[name];
                            var ret = method.apply(this, arguments);
                            return ret
                        }
                    }(i, prop[i]);
                return Class(newObj)
            };
            Class.implement = function (objArr) {
                var obj = merge(this.prototype, implement(objArr));
                this.prototype = obj;
                return obj
            };
            Class.getOptions = function (name) {
                var options;
                if (type(this) == "Function") options = this.prototype.options; else options = this.options;
                if (options)return name ? options[name] : options; else return name ? undefined : {};
                return this.prototype.options || {}
            };
            Class.setOptions =
                function (options) {
                    var original;
                    var obj;
                    if (type(this) == "Function") {
                        original = this.prototype.options;
                        obj = jQuery.extend(true, {}, original, options);
                        this.prototype.options = obj
                    } else {
                        original = this.options;
                        obj = jQuery.extend(true, {}, original, options);
                        this.options = obj
                    }
                    return obj
                };
            function clone(args) {
                var F = function () {
                };
                if (typeof args == "function") F.prototype = args.prototype; else F.prototype = args.prototype || args;
                return new F
            }

            function remove(obj, name, effect) {
                if (effect) {
                    var newObj = {};
                    for (var i in obj)newObj[i] = obj[i]
                } else delete obj[name];
                return newObj
            }

            function type(o) {
                var toString = Object.prototype.toString;
                var typeList = {
                    "[object Object]": "Object",
                    "[object Function]": "Function",
                    "[object Array]": "Array"
                };
                return typeList[toString.call(o)]
            }

            function merge(oldObj, newObj, preserve) {
                if (oldObj && newObj) {
                    oldObj = clone(oldObj);
                    newObj = clone(newObj);
                    for (var i in newObj) {
                        var newProp = newObj[i];
                        if (type(newProp) == "Object") oldObj[i] = merge(oldObj[i], newProp); else if (preserve && oldObj[i]) oldObj[i] = oldObj[i]; else oldObj[i] = newProp
                    }
                    return oldObj
                } else return oldObj ||
                    (newObj || {})
            }

            function implement(args) {
                var collection = {};
                args = type(args) == "Array" ? args : [args];
                for (var i = 0; i < args.length; i++) {
                    if (type(args[i]) == "Function") args[i] = args[i].prototype;
                    var safe = remove(args[i], "_init", true);
                    if (safe.implement) collection = implement(safe.implement); else collection = merge(collection, safe)
                }
                return collection
            }

            function classify(Constructor) {
                Constructor.extend = Class.extend;
                Constructor.implement = Class.implement;
                Constructor.getOptions = Class.getOptions;
                Constructor.setOptions = Class.setOptions
            }

            module.exports = Class
        })()
    }, {}],
    2: [function (require, module, exports) {
        (function () {
            var Log = require("../Util/Log");
            var Class = require("../Class/Class");
            var Messenger = require("../Lib/Messenger");
            var queryStringToJSON = require("../Util/queryStringToJSON");
            var interactDialog = Class({
                dialogIsFixed: false, _init: function (options) {
                    $.extend(this, options);
                    this.openDialog()
                }, setDialogHeight: function (height) {
                    var that = this;
                    var dialogW = {login: 430, setPwd: 550};
                    that.dialog.size(dialogW[this.type], height).getElem(".login_iframe").attr("height",
                        height)
                }, closeDialog: function (data) {
                    this.closeEvent.call(this, data);
                    this.dialog.close()
                }, loginSuccess: /\.vipglobal\.hk$/.test(window.location.hostname) ? function () {
                        var that = this;
                        $.ajax({
                            url: "//www.vip.com/ajax/getCookie.php",
                            dataType: "jsonp",
                            jsonpCallback: "_getCookie"
                        }).done(function (re) {
                            if (re.code == 200 && (re.data && re.data.length)) {
                                var i = 0, list = re.data, len = list.length, re_chinese = /[^\u0000-\u00FF]/, item;
                                for (; i < len; i++) {
                                    item = list[i];
                                    if (item["expire"] < 0) $.Cookie.del(item["key"], ".vipglobal.hk", "/"); else $.Cookie.set(item["key"],
                                        re_chinese.test(item["value"]) ? escape(item["value"]) : item["value"], ".vipglobal.hk", "/", item["expire"] / 3600)
                                }
                                that.closeDialog.call(that);
                                that.loginEvent.call(that)
                            } else Log("Cookie\u63a5\u53e3\u6ca1\u6570\u636e!")
                        }).fail(function () {
                            Log("Cookie\u63a5\u53e3\u65e0\u6cd5\u8bbf\u95ee!")
                        })
                    } : function () {
                        var that = this;
                        that.closeDialog.call(that);
                        that.loginEvent.call(that)
                    }, setPwdSuccess: function () {
                    this.setPwdEvent.call(this)
                }, loginEvent: $.noop, setPwdEvent: $.noop, closeEvent: $.noop, openDialog: function () {
                    var that =
                        this;
                    if (this.type == "login") {
                        var size = {w: 430, h: 610};
                        var frameUrl = "https://passport.vip.com/login?gotype=2";
                        var iframeHtml = '<iframe class="login_iframe" frameborder="0" scrolling="no" width="' + size.w + '" height="' + size.h + '" src="' + frameUrl + '">';
                        var dialog = $.Dialog({
                            model: true,
                            elStyle: "login_dialog",
                            opacity: 0.3,
                            size: [430, 610],
                            content: iframeHtml,
                            isFixed: that.dialogIsFixed,
                            custom: true,
                            showEvent: function () {
                                if (that.type == "login") {
                                    var messenger = new Messenger("loginDialog", "vip.com");
                                    messenger.listen(function (msg) {
                                        Log(msg);
                                        var queryObj = queryStringToJSON(msg);
                                        var method = queryObj["method"];
                                        var args = queryObj.args;
                                        that[method].call(that, args)
                                    })
                                }
                            }
                        }).open();
                        that.dialog = dialog
                    } else if (this.type === "setPwd") {
                        var setPayPwdCom = "//member.vipstatic.com/js/public/safe/1/set-pay-password-component.js";
                        setTimeout(function () {
                                $.ajax({
                                    url: setPayPwdCom, dataType: "script", success: function () {
                                        new SetPayPwd({
                                            isBg: true, hasPhoneTip: false, show: true, finish: function () {
                                                that.setPwdSuccess()
                                            }, success: function () {
                                            }, error: function () {
                                            }, cancel: function () {
                                                that.closeEvent.call(that)
                                            }
                                        })
                                    }
                                })
                            },
                            10)
                    }
                }
            });
            module.exports = {
                login: {
                    init: function (options) {
                        options = $.extend({type: "login"}, options);
                        return new interactDialog(options)
                    }
                }, setPwd: {
                    init: function (options) {
                        options = $.extend({type: "setPwd"}, options);
                        return new interactDialog(options)
                    }
                }
            }
        })()
    }, {"../Class/Class": 1, "../Lib/Messenger": 9, "../Util/Log": 37, "../Util/queryStringToJSON": 48}],
    3: [function (require, module, exports) {
        (function () {
            var Storage = require("../Util/Storage");
            var Listeners = require("../Util/Listeners");
            var Cookie = require("../Util/Cookie");
            var cutString = require("../Util/CutString");
            Cookie = new Cookie({path: "/", domain: ".vip.com"});
            var srcUrl = encodeURIComponent(window.location.href);
            var Member = {
                info: null, chk: function () {
                    var loginID = Cookie.get("VipLID");
                    var account = Cookie.get("login_username");
                    var jqHeaderLog = $("#J_head_log");

                    function xss(val) {
                        var reg = /['"<>&]+/;
                        val = val.toString();
                        if (reg.test(val)) {
                            val = val.replace(/</g, "&lt;");
                            val = val.replace(/>/g, "&gt;");
                            val = val.replace(/"/g, "&quot;");
                            val = val.replace(/'/g, "&#39;");
                            val = val.replace(/&/g,
                                "&amp;")
                        }
                        return val
                    }

                    if (loginID) {
                        var afterTxt = $("#J_header_logAfter").html() || "";
                        var userName = Cookie.get("VipRNAME");
                        jqHeaderLog.addClass("login_after").removeClass("login_before").html(afterTxt.replace("{$J_header_account}", cutString(xss(userName), 9)));
                        $("#J_header_lnkLogOut").on("click", function () {
                            location.href = VIPSHOP.userHost + "/logout?src=" + srcUrl
                        });
                        this.info = {
                            "account": account,
                            "level": parseInt(Cookie.get("VipMonopoly")),
                            "nickname": userName
                        };
                        Listeners.pub("loginSuccess").success();
                        return
                    }
                    jqHeaderLog.addClass("login_before").removeClass("login_after").html($("#J_header_logBefor").html());
                    $("#J_header_lnkLogin").on("click", function () {
                        location.href = VIPSHOP.userHost + "/login?src=" + srcUrl
                    });
                    $("#J_header_lnkRegister").on("click", function () {
                        location.href = VIPSHOP.userHost + "/register?src=" + srcUrl
                    });
                    Listeners.pub("unLogin").success();
                    return
                }, viewed: function (cookie_name, merchandise_id) {
                    var viewed = Cookie.get(cookie_name);
                    if (viewed == "")var arViewed = []; else var arViewed = viewed.split(",");
                    var viewed = -1;
                    for (var i = 0; i < arViewed.length; i++)if (arViewed[i] == merchandise_id) viewed = i;
                    if (viewed == -1 && arViewed.length >=
                        5) arViewed.shift(); else if (viewed > -1) arViewed.splice(viewed, 1);
                    arViewed.push(merchandise_id);
                    var domain = document.domain.split(".");
                    domain.shift();
                    var rootDomain = domain.join(".");
                    Cookie.set(cookie_name, arViewed.join(","), rootDomain)
                }, setViewed: function (channel, merchandise) {
                    var data = Storage.get(channel), arrMer = !!data ? data : [], newMer = [];
                    if (arrMer) {
                        var arrLength = arguments.length > 2 ? arguments[2] : 5, forLength = arrLength;
                        if (arrMer.length < arrLength) forLength = arrMer.length;
                        for (var i = 0; i < forLength; i++)if (arrMer[i].id !=
                            merchandise.id) newMer.push(arrMer[i]);
                        if (newMer.length >= arrLength) newMer.shift()
                    }
                    newMer.push(merchandise);
                    Storage.set(channel, newMer)
                }, getViewed: function (channel) {
                    var data = Storage.get(channel);
                    return !!data ? data : []
                }
            };
            module.exports = Member
        })()
    }, {"../Util/Cookie": 27, "../Util/CutString": 29, "../Util/Listeners": 35, "../Util/Storage": 43}],
    4: [function (require, module, exports) {
        (function () {
            function fn_onlineService() {
                var openner = null;
                var chatUrl = "//800.vip.com/live800/chatClient/chatbox.jsp?companyID=8900&configID=13&codeType=custom";
                chatUrl += "&enterurl=" + encodeURIComponent(document.referrer || document.URL);
                chatUrl += "&t=" + (new Date).getTime();
                try {
                    openner = window.open(chatUrl, "chatbox143639", "toolbar=0,scrollbars=0,location=0,menubar=0,resizable=1,width=900,height=720");
                    return openner
                } catch (e) {
                }
            }

            module.exports = fn_onlineService
        })()
    }, {}],
    5: [function (require, module, exports) {
        (function () {
            var Detect = require("../Util/Detect.js");
            var Listeners = require("../Util/Listeners.js");
            $(function () {
                Listeners.pub("ready.first").success()
            });
            Listeners.sub("ready.first").onsuccess(function () {
                setTimeout(function () {
                        Listeners.pub("ready.second").success()
                    },
                    2E3)
            });
            $(window).on("load.Listeners", function () {
                Listeners.sub("ready.second").onsuccess(function () {
                    Listeners.pub("ready.third").success();
                    Listeners.pub("winLoaded").success()
                })
            });
            Listeners.sub("ready.third").onsuccess(function () {
                setTimeout(function () {
                    Listeners.pub("ready.four").success()
                }, 800)
            });
            Listeners.sub("ready.four").onsuccess(function () {
                $(window).one("scroll", function () {
                    Listeners.pub("ready.five").success()
                })
            });
            Listeners.sub("ready.first").onsuccess(function () {
                if (Detect.isIE6) $("body").on({
                    mouseenter: function () {
                        $(this).addClass($(this).data("hover"))
                    },
                    mouseleave: function () {
                        $(this).removeClass($(this).data("hover"))
                    }
                }, "[data-hover]");
                if (Detect.mobile) {
                    $(".device-pc").removeClass("device-pc");
                    $("body").on("touchstart", function (e) {
                        var jqTarget = $(e.target);
                        var isInner = false;
                        if (typeof jqTarget.data("touch") == "undefined") {
                            isInner = true;
                            jqTarget = jqTarget.closest("[data-touch]")
                        }
                        $("[data-touch]").not(jqTarget).removeClass(function () {
                            var className = $(this).data("touch") || "z-touch";
                            $(this).removeClass(className)
                        });
                        if (jqTarget.length != 0) {
                            var className = jqTarget.data("touch") ||
                                "z-touch";
                            if (!jqTarget.hasClass(className)) jqTarget.addClass(className); else if (!isInner) jqTarget.removeClass(className)
                        }
                    })
                }
                _lazyLoad()
            });
            Listeners.sub("ready.second").onsuccess(function () {
                _lazyLoad()
            });
            Listeners.sub("ready.third").onsuccess(function () {
                _lazyLoad()
            });
            function _lazyLoad() {
                if ($(".lazy").length > 0) $(".lazy").lazyload({threshold: 200})
            }

            (function () {
                var count = 1;
                setInterval(function () {
                    Listeners.pub("interval", "interval.1000").success();
                    if (count % 2 === 0) Listeners.pub("interval.2000").success();
                    count++
                }, 1E3)
            })()
        })()
    }, {"../Util/Detect.js": 31, "../Util/Listeners.js": 35}],
    6: [function (require, module, exports) {
        (function () {
            var tsina = "http://v.t.sina.com.cn/share/share.php";
            var qzone = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey";
            var tqq = "http://v.t.qq.com/share/share.php";
            var douban = "http://www.douban.com/recommend/";
            var kaixin = "http://www.kaixin001.com/repaste/share.php";
            var renren = "http://share.renren.com/share/buttonshare.do";
            var sohu = "http://t.sohu.com/third/post.jsp";
            var t163 =
                "http://t.163.com/article/user/checkLogin.do";

            function fn_share(type, info, addVmark) {
                var pic = encodeURIComponent(info.pic);
                var content = encodeURIComponent(info.desc);
                var title = encodeURIComponent(info.title);
                var url = encodeURIComponent(info.url);
                var openner = null;
                var openSet = "width=680, height=580, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no";
                if (typeof addVmark == "undefined") addVmark = true;
                switch (type) {
                    case "tsina":
                        openner = window.open(tsina + "?title=" + content + "&url=" + url + "&appkey=1493335026&pic=" +
                            pic, "", openSet);
                        break;
                    case "qzone":
                        openner = window.open(qzone + "?url=" + url + "&summary=" + content + "&title=" + title, "", openSet);
                        break;
                    case "tqq":
                        openner = window.open(tqq + "?title=" + content + "&url=" + url, "", openSet);
                        break;
                    case "douban":
                        openner = window.open(douban + "?url=" + url + "&title=" + content, "", openSet);
                        break;
                    case "kaixin001":
                        openner = window.open(kaixin + "?rtitle=" + title + "&rurl=" + url + "&rcontent=" + content, "", openSet);
                        break;
                    case "renren":
                        openner = window.open(renren + "?link=" + url, "", openSet);
                        break;
                    case "sohu":
                        openner =
                            window.open(sohu + "?&url=" + url + "&title=" + title + "&content=utf-8&pic=", "", openSet);
                        break;
                    case "t163":
                        content = title + ("  " + info.url);
                        openner = window.open(t163 + "?link=" + url + "&source=" + title + "&info=" + content, "", openSet);
                        break;
                    default:
                        break
                }
                if (addVmark) $.ajax({
                    "url": "//myopen.vip.com/my/add_vmark",
                    data: {type: "shareGoods"},
                    jsonp: "callback",
                    dataType: "jsonp",
                    jsonpCallback: "add_vmark",
                    success: function (res) {
                    }
                });
                return openner
            }

            module.exports = fn_share
        })()
    }, {}],
    7: [function (require, module, exports) {
        (function () {
            var UINFO =
                {
                    rule: {newUser: ["", "a", "b"], oldUser: ["c"]}, parseCookie: function () {
                    var uinfo = $.Cookie.get("VipUINFO");
                    if (uinfo === "")return "";
                    var pairs = uinfo.split("|");
                    var result = {};
                    var i = 0;
                    var len = pairs.length;
                    if (len > 2)for (; i < len; i++) {
                        var pair = pairs[i].split(":");
                        if (!!pair[0]) result[pair[0]] = decodeURIComponent(pair[1] || "")
                    } else result = {luc: pairs[0] || "", suc: pairs[1] || ""};
                    return result
                }, isNewUser: function () {
                    return this.is("newUser")
                }, isOldUser: function () {
                    return this.is("oldUser")
                }, is: function (ruleType, typeName) {
                    var c =
                        this.parseCookie();
                    var rtn = false;
                    typeName = typeName || "luc";
                    var i = 0;
                    var rule = this.rule[ruleType];
                    var len = rule.length;
                    for (; i < len; i++)if (rule[i] === c[typeName]) {
                        rtn = true;
                        break
                    }
                    return rtn
                }
                };
            module.exports = UINFO
        })()
    }, {}],
    8: [function (require, module, exports) {
        (function () {
            var detect = require("../Util/Detect");
            var isMobile = detect.mobile;
            var settings = {
                tap_pixel_range: 5,
                swipe_h_threshold: 20,
                swipe_v_threshold: 20,
                taphold_threshold: 750,
                doubletap_int: 500,
                touch_capable: isMobile,
                orientation_support: "orientation" in window &&
                "onorientationchange" in window,
                startevent: isMobile ? "touchstart" : "mousedown",
                endevent: isMobile ? "touchend" : "mouseup",
                moveevent: isMobile ? "touchmove" : "mousemove",
                tapevent: isMobile ? "tap" : "click",
                scrollevent: isMobile ? "touchmove" : "scroll",
                hold_timer: null,
                tap_timer: null
            };
            var eventNames = ["tapstart", "tapend", "tapmove", "swipe", "swipeup", "swiperight", "swipedown", "swipeleft", "swipeend"];
            var i = 0;
            var len = eventNames.length;
            for (; i < len; i++) {
                var name = eventNames[i];
                jQuery.fn[name] = function (fn) {
                    return fn ? this.on(name,
                            fn) : this.trigger(name)
                }
            }
            var threshold = 15;
            var incrementalElementId = 0;
            var mutex = 0;
            $.event.special.tap = {
                setup: function () {
                    var self = this;
                    var jqSelf = $(self);
                    var moveDistance = 0;
                    var touches = null;
                    var elementId = ++incrementalElementId;
                    var startPoint = null;
                    var startOffset = null;
                    var touching = false;

                    function touchStart(e) {
                        jqSelf.data("tapcallee1", touchStart);
                        if (mutex != 0)return; else mutex = elementId;
                        touching = true;
                        moveDistance = 0;
                        if (e.originalEvent.touches && e.originalEvent.touches[0]) {
                            touches = e.originalEvent.touches[0];
                            startPoint = {x: touches.pageX, y: touches.pageY};
                            startOffset = {
                                x: touches.pageX - touches.target.offsetLeft,
                                y: touches.pageY - touches.target.offsetTop
                            }
                        }
                    }

                    function touchEnd(e) {
                        jqSelf.data("tapcallee2", touchEnd);
                        if (mutex == elementId) mutex = 0;
                        if (!touching)return;
                        touching = false;
                        if (moveDistance < threshold) {
                            var touchData = {
                                position: {x: startPoint.x, y: startPoint.y},
                                offset: {x: startOffset.x, y: startOffset.y},
                                target: e.target
                            };
                            triggerCustomEvent(self, "tap", e, touchData)
                        } else jqSelf.trigger("tap-failed")
                    }

                    function touchMove(e) {
                        jqSelf.data("tapcallee3",
                            touchMove);
                        if (!touching)return;
                        if (e.originalEvent.touches.length == 0 || startPoint === null)return touching = false;
                        touches = e.originalEvent.touches[0];
                        moveDistance = Math.sqrt(Math.pow(touches.screenX - startPoint.x, 2) + Math.pow(touches.screenY - startPoint.y, 2));
                        if (moveDistance > threshold) {
                            jqSelf.trigger("exceed-tap-threshold");
                            touching = false
                        }
                    }

                    function touchcancel(e) {
                        jqSelf.data("tapcallee4", touchcancel);
                        if (mutex == elementId) mutex = 0;
                        touching = false;
                        jqSelf.trigger("tap-failed")
                    }

                    jqSelf.on(settings.startevent, touchStart);
                    jqSelf.on(settings.moveevent, touchMove);
                    jqSelf.on(settings.endevent, touchEnd);
                    jqSelf.on("touchcancel", touchcancel)
                }, remove: function () {
                    var jqSelf = $(this);
                    jqSelf.off(settings.startevent, jqSelf.data.tapcallee1).off(settings.moveevent, jqSelf.data.tapcallee2).off(settings.endevent, jqSelf.data.tapcallee3).off("tapcallee3", jqSelf.data.tapcallee4)
                }
            };
            $.event.special.tapstart = {
                setup: function () {
                    var self = this;
                    var jqSelf = $(self);

                    function event(e) {
                        jqSelf.data("callee", event);
                        if (e.which && e.which !== 1)return false;
                        var origEvent = e.originalEvent;
                        var posX, posY, offsetX, offsetY, touches;
                        if (settings.touch_capable) {
                            touches = origEvent.touches[0];
                            posX = touches.pageX;
                            posY = touches.pageY;
                            offsetX = touches.pageX - touches.target.offsetLeft;
                            offsetY = touches.pageY - touches.target.offsetTop
                        } else {
                            posX = e.pageX;
                            posY = e.pageY;
                            offsetX = e.offsetX;
                            offsetY = e.offsetY
                        }
                        var touchData = {
                            position: {x: posX, y: posY},
                            offset: {x: offsetX, y: offsetY},
                            target: e.target
                        };
                        triggerCustomEvent(self, "tapstart", e, touchData);
                        return true
                    }

                    jqSelf.on(settings.startevent, event)
                },
                remove: function () {
                    var jqSelf = $(this);
                    jqSelf.off(settings.startevent, jqSelf.data.callee)
                }
            };
            $.event.special.tapmove = {
                setup: function () {
                    var self = this;
                    var jqSelf = $(self);

                    function event(e) {
                        jqSelf.data("callee", event);
                        var origEvent = e.originalEvent;
                        var posX, posY, offsetX, offsetY, touches;
                        if (settings.touch_capable) {
                            touches = origEvent.touches[0];
                            posX = touches.pageX;
                            posY = touches.pageY;
                            offsetX = touches.pageX - touches.target.offsetLeft;
                            offsetY = touches.pageY - touches.target.offsetTop
                        } else {
                            posX = e.pageX;
                            posY = e.pageY;
                            offsetX =
                                e.offsetX;
                            offsetY = e.offsetY
                        }
                        var touchData = {
                            position: {x: posX, y: posY},
                            offset: {x: offsetX, y: offsetY},
                            target: e.target
                        };
                        triggerCustomEvent(self, "tapmove", e, touchData);
                        return true
                    }

                    jqSelf.on(settings.moveevent, event)
                }, remove: function () {
                    var jqSelf = $(this);
                    jqSelf.off(settings.moveevent, jqSelf.data.callee)
                }
            };
            $.event.special.tapend = {
                setup: function () {
                    var self = this;
                    var jqSelf = $(this);

                    function event(e) {
                        jqSelf.data("callee", event);
                        var origEvent = e.originalEvent;
                        var posX, posY, offsetX, offsetY, changedTouches;
                        if (settings.touch_capable) {
                            changedTouches =
                                origEvent.changedTouches[0];
                            posX = changedTouches.pageX;
                            posY = changedTouches.pageY;
                            offsetX = changedTouches.pageX - changedTouches.target.offsetLeft;
                            offsetY = changedTouches.pageY - changedTouches.target.offsetTop
                        } else {
                            posX = e.pageX;
                            posY = e.pageY;
                            offsetX = e.offsetX;
                            offsetY = e.offsetY
                        }
                        var touchData = {position: {x: posX, y: posY}, offset: {x: offsetX, y: offsetY}};
                        triggerCustomEvent(self, "tapend", e, touchData);
                        return true
                    }

                    jqSelf.on(settings.endevent, event)
                }, remove: function () {
                    var jqSelf = $(this);
                    jqSelf.off(settings.endevent, jqSelf.data.callee)
                }
            };
            $.event.special.swipe = {
                setup: function () {
                    var self = this;
                    var jqSelf = $(this);
                    var started = false;
                    var hasSwiped = false;
                    var originalCoord = {x: 0, y: 0};
                    var finalCoord = {x: 0, y: 0};
                    var originalOffset = {left: 0, top: 0};
                    var startEvent;
                    var swipedir;

                    function touchStart(e) {
                        var origEvent = e.originalEvent;
                        var targetTouches = origEvent.targetTouches;
                        jqSelf = $(e.target);
                        jqSelf.data("callee1", touchStart);
                        if (targetTouches) {
                            originalCoord.x = targetTouches[0].pageX;
                            originalCoord.y = targetTouches[0].pageY
                        } else {
                            originalCoord.x = e.pageX;
                            originalCoord.y =
                                e.pageY
                        }
                        finalCoord.x = originalCoord.x;
                        finalCoord.y = originalCoord.x;
                        started = true;
                        var posX, posY, offsetX, offsetY;
                        if (settings.touch_capable) {
                            var touches = origEvent.touches[0];
                            posX = touches.pageX;
                            posY = touches.pageY;
                            offsetX = posX - touches.target.offsetLeft;
                            offsetY = posY - touches.target.offsetTop;
                            originalOffset.left = offsetX;
                            originalOffset.top = offsetY
                        } else {
                            posX = e.pageX;
                            posY = e.pageY;
                            offsetX = e.offsetX;
                            offsetY = e.offsetY
                        }
                        startEvent = {
                            position: {x: posX, y: posY},
                            offset: {x: offsetX, y: offsetY},
                            time: (new Date).getTime(),
                            target: e.target
                        };
                        swipedir = undefined;
                        var dt = new Date;
                        while (new Date - dt < 100);
                    }

                    function touchMove(e) {
                        var origEvent = e.originalEvent;
                        var targetTouches = origEvent.targetTouches;
                        jqSelf = $(e.target);
                        jqSelf.data("callee2", touchMove);
                        if (targetTouches) {
                            finalCoord.x = targetTouches[0].pageX;
                            finalCoord.y = targetTouches[0].pageY
                        } else {
                            finalCoord.x = e.pageX;
                            finalCoord.y = e.pageY
                        }
                        clearTimeout(settings.hold_timer);
                        var h_threshold;
                        var v_threshold;
                        var ele_x_threshold = jqSelf.data("xthreshold");
                        var ele_y_threshold = jqSelf.data("ythreshold");
                        if (typeof ele_x_threshold !==
                            "undefined" && (ele_x_threshold !== false && parseInt(ele_x_threshold))) h_threshold = parseInt(ele_x_threshold); else h_threshold = settings.swipe_h_threshold;
                        if (typeof ele_y_threshold !== "undefined" && (ele_y_threshold !== false && parseInt(ele_y_threshold))) v_threshold = parseInt(ele_y_threshold); else v_threshold = settings.swipe_v_threshold;
                        if (originalCoord.y > finalCoord.y && originalCoord.y - finalCoord.y > v_threshold) swipedir = "swipeup";
                        if (originalCoord.x < finalCoord.x && finalCoord.x - originalCoord.x > h_threshold) swipedir = "swiperight";
                        if (originalCoord.y < finalCoord.y && finalCoord.y - originalCoord.y > v_threshold) swipedir = "swipedown";
                        if (originalCoord.x > finalCoord.x && originalCoord.x - finalCoord.x > h_threshold) swipedir = "swipeleft";
                        if (typeof swipedir != "undefined" && started) {
                            var posX, posY, offsetX, offsetY;
                            if (settings.touch_capable) {
                                var touches = origEvent.touches[0];
                                posX = touches.pageX;
                                posY = touches.pageY;
                                offsetX = touches.pageX - touches.target.offsetLeft;
                                offsetY = touches.pageY - touches.target.offsetTop
                            } else {
                                posX = e.pageX;
                                posY = e.pageY;
                                offsetX = e.offsetX;
                                offsetY = e.offsetY
                            }
                            var endEvent = {
                                position: {x: posX, y: posY},
                                offset: {x: offsetX, y: offsetY},
                                time: (new Date).getTime(),
                                target: e.target
                            };
                            var xAmount = Math.abs(startEvent.position.x - endEvent.position.x);
                            var yAmount = Math.abs(startEvent.position.y - endEvent.position.y);
                            var touchData = {
                                e: e,
                                startEvent: startEvent,
                                endEvent: endEvent,
                                direction: swipedir.replace("swipe", ""),
                                xAmount: xAmount,
                                yAmount: yAmount,
                                delta: {x: finalCoord.x - originalCoord.x, y: finalCoord.y - originalCoord.y},
                                duration: endEvent.time - startEvent.time,
                                originalOffset: originalOffset
                            };
                            hasSwiped = true;
                            jqSelf.trigger("swipe", touchData).trigger(swipedir, touchData)
                        }
                    }

                    function touchEnd(e) {
                        var jqSelf = $(e.target);
                        var swipedir = "";
                        jqSelf.data("callee3", touchEnd);
                        if (hasSwiped) {
                            var h_threshold;
                            var v_threshold;
                            var ele_x_threshold = jqSelf.data("xthreshold");
                            var ele_y_threshold = jqSelf.data("ythreshold");
                            var origEvent = e.originalEvent;
                            if (typeof ele_x_threshold !== "undefined" && (ele_x_threshold !== false && parseInt(ele_x_threshold))) h_threshold = parseInt(ele_x_threshold); else settings.swipe_h_threshold;
                            if (typeof ele_y_threshold !== "undefined" && (ele_y_threshold !== false && parseInt(ele_y_threshold))) v_threshold = parseInt(ele_y_threshold); else settings.swipe_v_threshold;
                            var posX, posY, offsetX, offsetY;
                            var changedTouches = origEvent.changedTouches[0];
                            if (settings.touch_capable) {
                                posX = changedTouches.screenX;
                                posY = changedTouches.screenY;
                                offsetX = changedTouches.pageX - changedTouches.target.offsetLeft;
                                offsetY = changedTouches.pageY - changedTouches.target.offsetTop
                            } else {
                                posX = e.screenX;
                                posY = e.screenY;
                                offsetX = e.offsetX;
                                offsetY =
                                    e.offsetY
                            }
                            var endEvent = {
                                position: {x: posX, y: posY},
                                offset: {x: offsetX, y: offsetY},
                                time: (new Date).getTime(),
                                target: e.target
                            };
                            if (startEvent.position.y > endEvent.position.y && startEvent.position.y - endEvent.position.y > v_threshold) swipedir = "swipeup";
                            if (startEvent.position.x < endEvent.position.x && endEvent.position.x - startEvent.position.x > h_threshold) swipedir = "swiperight";
                            if (startEvent.position.y < endEvent.position.y && endEvent.position.y - startEvent.position.y > v_threshold) swipedir = "swipedown";
                            if (startEvent.position.x >
                                endEvent.position.x && startEvent.position.x - endEvent.position.x > h_threshold) swipedir = "swipeleft";
                            var xAmount = Math.abs(startEvent.position.x - endEvent.position.x);
                            var yAmount = Math.abs(startEvent.position.y - endEvent.position.y);
                            var touchData = {
                                startEvent: startEvent,
                                endEvent: endEvent,
                                direction: swipedir.replace("swipe", ""),
                                xAmount: xAmount,
                                yAmount: yAmount,
                                duration: endEvent.time - startEvent.time
                            };
                            jqSelf.trigger("swipeend", touchData)
                        }
                        started = false;
                        hasSwiped = false
                    }

                    jqSelf.on(settings.startevent, touchStart);
                    jqSelf.on(settings.moveevent,
                        touchMove);
                    jqSelf.on(settings.endevent, touchEnd)
                }, remove: function () {
                    var jqSelf = $(this);
                    jqSelf.off(settings.startevent, jqSelf.data.callee1).off(settings.moveevent, jqSelf.data.callee2).off(settings.endevent, jqSelf.data.callee3)
                }
            };
            function triggerCustomEvent(obj, eventType, event, touchData) {
                var originalType = event.type;
                event.type = eventType;
                event.offsetX = touchData.offset.x;
                event.offsetY = touchData.offset.y;
                event.pageX = touchData.position.x;
                event.pageY = touchData.position.y;
                $.event.dispatch.call(obj, event, touchData);
                event.type = originalType
            }
        })()
    }, {"../Util/Detect": 31}],
    9: [function (require, module, exports) {
        (function () {
            var prefix = "[PROJECT_NAME]", supportPostMessage = "postMessage" in window;
            var toString = Object.prototype.toString;

            function isFunction(o) {
                return toString.call(o) == "[object Function]"
            }

            function isObject(o) {
                return toString.call(o) == "[object Object]"
            }

            function Target(target, name, prefix) {
                var errMsg = "";
                if (arguments.length < 2) errMsg = "target error - target and name are both requied"; else if (typeof target != "object") errMsg =
                    "target error - target itself must be window object"; else if (typeof name != "string") errMsg = "target error - target name must be string type";
                if (errMsg)throw new Error(errMsg);
                this.target = target;
                this.name = name;
                this.prefix = prefix
            }

            if (supportPostMessage) Target.prototype.send = function (msg) {
                this.target.postMessage(this.prefix + "|" + this.name + "__Messenger__" + msg, "*")
            }; else Target.prototype.send = function (msg) {
                var targetFunc = window.navigator[this.prefix + this.name];
                if (typeof targetFunc == "function") targetFunc(this.prefix +
                    "|" + this.name + "__Messenger__" + msg, window); else throw new Error("target callback function is not defined");
            };
            function Messenger(messengerName, projectName) {
                this.targets = {};
                this.name = messengerName;
                this.listenFunc = [];
                this.prefix = projectName || prefix;
                this.initListen()
            }

            Messenger.prototype.addTarget = function (target, name) {
                var targetObj = new Target(target, name, this.prefix);
                this.targets[name] = targetObj
            };
            Messenger.prototype.initListen = function () {
                var self = this;
                var generalCallback = function (msg) {
                    if (typeof msg == "object" &&
                        msg.data) msg = msg.data;
                    var msgPairs = msg.split("__Messenger__");
                    var msg = msgPairs[1];
                    var pairs = msgPairs[0].split("|");
                    var prefix = pairs[0];
                    var name = pairs[1];
                    for (var i = 0; i < self.listenFunc.length; i++)if (prefix + name === self.prefix + self.name) self.listenFunc[i](msg)
                };
                if (supportPostMessage)if ("addEventListener" in document) window.addEventListener("message", generalCallback, false); else {
                    if ("attachEvent" in document) window.attachEvent("onmessage", generalCallback)
                } else window.navigator[this.prefix + this.name] = generalCallback
            };
            Messenger.prototype.listen = function (callback) {
                var i = 0;
                var len = this.listenFunc.length;
                var cbIsExist = false;
                for (; i < len; i++)if (this.listenFunc[i] == callback) {
                    cbIsExist = true;
                    break
                }
                if (!cbIsExist) this.listenFunc.push(callback)
            };
            Messenger.prototype.clear = function () {
                this.listenFunc = []
            };
            Messenger.prototype.send = function (msg) {
                var targets = this.targets, target;
                for (target in targets)if (targets.hasOwnProperty(target)) targets[target].send(msg)
            };
            module.exports = Messenger
        })()
    }, {}],
    10: [function (require, module, exports) {
        (function () {
            var escapable =
                /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, meta = {
                "\b": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                '"': '\\"',
                "\\": "\\\\"
            };

            function quote(string) {
                return '"' + string.replace(escapable, function (a) {
                        var c = meta[a];
                        return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    }) + '"'
            }

            function f(n) {
                return n < 10 ? "0" + n : n
            }

            function str(key, holder) {
                var i, v, len, partial, value = holder[key], type = typeof value;
                if (value &&
                    (typeof value === "object" && typeof value.toJSON === "function")) {
                    value = value.toJSON(key);
                    type = typeof value
                }
                switch (type) {
                    case "string":
                        return quote(value);
                    case "number":
                        return isFinite(value) ? String(value) : "null";
                    case "boolean":
                        return String(value);
                    case "object":
                        if (!value)return "null";
                        switch (Object.prototype.toString.call(value)) {
                            case "[object Date]":
                                return isFinite(value.valueOf()) ? '"' + value.getUTCFullYear() + "-" + f(value.getUTCMonth() + 1) + "-" + f(value.getUTCDate()) + "T" + f(value.getUTCHours()) + ":" + f(value.getUTCMinutes()) +
                                    ":" + f(value.getUTCSeconds()) + "Z" + '"' : "null";
                            case "[object Array]":
                                len = value.length;
                                partial = [];
                                for (i = 0; i < len; i++)partial.push(str(i, value) || "null");
                                return "[" + partial.join(",") + "]";
                            default:
                                partial = [];
                                for (i in value)if (Object.prototype.hasOwnProperty.call(value, i)) {
                                    v = str(i, value);
                                    if (v) partial.push(quote(i) + ":" + v)
                                }
                                return "{" + partial.join(",") + "}"
                        }
                }
            }

            function stringifyJSON(value) {
                return str("", {"": value})
            }

            module.exports = stringifyJSON
        })()
    }, {}],
    11: [function (require, module, exports) {
        !function () {
            function a(a) {
                return a.replace(t,
                    "").replace(u, ",").replace(v, "").replace(w, "").replace(x, "").split(y)
            }

            function b(a) {
                return "'" + a.replace(/('|\\)/g, "\\$1").replace(/\r/g, "\\r").replace(/\n/g, "\\n") + "'"
            }

            function c(c, d) {
                function e(a) {
                    return m += a.split(/\n/).length - 1, k && (a = a.replace(/\s+/g, " ").replace(/\x3c!--[\w\W]*?--\x3e/g, "")), a && (a = s[1] + b(a) + s[2] + "\n"), a
                }

                function f(b) {
                    var c = m;
                    if (j ? b = j(b, d) : g && (b = b.replace(/\n/g, function () {
                                return m++, "$line=" + m + ";"
                            })), 0 === b.indexOf("=")) {
                        var e = l && !/^=[=#]/.test(b);
                        if (b = b.replace(/^=[=#]?|[\s;]*$/g,
                                ""), e) {
                            var f = b.replace(/\s*\([^\)]+\)/, "");
                            n[f] || (/^(include|print)$/.test(f) || (b = "$escape(" + b + ")"))
                        } else b = "$string(" + b + ")";
                        b = s[1] + b + s[2]
                    }
                    return g && (b = "$line=" + c + ";" + b), r(a(b), function (a) {
                        if (a && !p[a]) {
                            var b;
                            b = "print" === a ? u : "include" === a ? v : n[a] ? "$utils." + a : o[a] ? "$helpers." + a : "$data." + a, w += a + "=" + b + ",", p[a] = !0
                        }
                    }), b + "\n"
                }

                var g = d.debug, h = d.openTag, i = d.closeTag, j = d.parser, k = d.compress, l = d.escape, m = 1, p = {
                    $data: 1,
                    $filename: 1,
                    $utils: 1,
                    $helpers: 1,
                    $out: 1,
                    $line: 1
                }, q = "".trim, s = q ? ["$out='';", "$out+=", ";", "$out"] :
                    ["$out=[];", "$out.push(", ");", "$out.join('')"], t = q ? "$out+=text;return $out;" : "$out.push(text);", u = "function(){var text=''.concat.apply('',arguments);" + t + "}", v = "function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);" + t + "}", w = "'use strict';var $utils=this,$helpers=$utils.$helpers," + (g ? "$line=0," : ""), x = s[0], y = "return new String(" + s[3] + ");";
                r(c.split(h), function (a) {
                    a = a.split(i);
                    var b = a[0], c = a[1];
                    1 === a.length ? x += e(b) : (x += f(b), c && (x += e(c)))
                });
                var z = w + x + y;
                g && (z = "try{" +
                    z + "}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:" + b(c) + ".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");
                try {
                    var A = new Function("$data", "$filename", z);
                    return A.prototype = n, A
                } catch (B) {
                    throw B.temp = "function anonymous($data,$filename) {" + z + "}", B;
                }
            }

            var d = function (a, b) {
                return "string" == typeof b ? q(b, {filename: a}) : g(a, b)
            };
            d.version = "3.0.0", d.config = function (a, b) {
                e[a] = b
            };
            var e = d.defaults = {openTag: "<%", closeTag: "%>", escape: !0, cache: !0, compress: !1, parser: null},
                f = d.cache = {};
            d.render = function (a, b) {
                return q(a, b)
            };
            var g = d.renderFile = function (a, b) {
                var c = d.get(a) || p({filename: a, name: "Render Error", message: "Template not found"});
                return b ? c(b) : c
            };
            d.get = function (a) {
                var b;
                if (f[a]) b = f[a]; else if ("object" == typeof document) {
                    var c = document.getElementById(a);
                    if (c) {
                        var d = (c.value || c.innerHTML).replace(/^\s*|\s*$/g, "");
                        b = q(d, {filename: a})
                    }
                }
                return b
            };
            var h = function (a, b) {
                return "string" != typeof a && (b = typeof a, "number" === b ? a += "" : a = "function" === b ? h(a.call(a)) : ""), a
            }, i = {
                "<": "&#60;",
                ">": "&#62;", '"': "&#34;", "'": "&#39;", "&": "&#38;"
            }, j = function (a) {
                return i[a]
            }, k = function (a) {
                return h(a).replace(/&(?![\w#]+;)|[<>"']/g, j)
            }, l = Array.isArray || function (a) {
                    return "[object Array]" === {}.toString.call(a)
                }, m = function (a, b) {
                var c, d;
                if (l(a))for (c = 0, d = a.length; d > c; c++)b.call(a, a[c], c, a); else for (c in a)b.call(a, a[c], c)
            }, n = d.utils = {$helpers: {}, $include: g, $string: h, $escape: k, $each: m};
            d.helper = function (a, b) {
                o[a] = b
            };
            var o = d.helpers = n.$helpers;
            d.onerror = function (a) {
                var b = "Template Error\n\n";
                for (var c in a)b +=
                    "<" + c + ">\n" + a[c] + "\n\n";
                "object" == typeof console && console["error"](b)
            };
            var p = function (a) {
                    return d.onerror(a), function () {
                        return "{Template Error}"
                    }
                }, q = d.compile = function (a, b) {
                    function d(c) {
                        try {
                            return new i(c, h) + ""
                        } catch (d) {
                            return b.debug ? p(d)() : (b.debug = !0, q(a, b)(c))
                        }
                    }

                    b = b || {};
                    for (var g in e)void 0 === b[g] && (b[g] = e[g]);
                    var h = b.filename;
                    try {
                        var i = c(a, b)
                    } catch (j) {
                        return j.filename = h || "anonymous", j.name = "Syntax Error", p(j)
                    }
                    return d.prototype = i.prototype, d.toString = function () {
                        return i.toString()
                    }, h && (b.cache &&
                    (f[h] = d)), d
                }, r = n.$each, s = "break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined", t = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,
                u = /[^\w$]+/g, v = new RegExp(["\\b" + s.replace(/,/g, "\\b|\\b") + "\\b"].join("|"), "g"), w = /^\d[^,]*|,\d[^,]*/g, x = /^,+|,+$/g, y = /^$|,+/;
            e.openTag = "{{", e.closeTag = "}}";
            var z = function (a, b) {
                var c = b.split(":"), d = c.shift(), e = c.join(":") || "";
                return e && (e = ", " + e), "$helpers." + d + "(" + a + e + ")"
            };
            e.parser = function (a) {
                a = a.replace(/^\s/, "");
                var b = a.split(" "), c = b.shift(), e = b.join(" ");
                switch (c) {
                    case "if":
                        a = "if(" + e + "){";
                        break;
                    case "else":
                        b = "if" === b.shift() ? " if(" + b.join(" ") + ")" : "", a = "}else" + b + "{";
                        break;
                    case "/if":
                        a = "}";
                        break;
                    case "each":
                        var f = b[0] || "$data", g = b[1] || "as", h = b[2] || "$value", i = b[3] || "$index", j = h + "," + i;
                        "as" !== g && (f = "[]"), a = "$each(" + f + ",function(" + j + "){";
                        break;
                    case "/each":
                        a = "});";
                        break;
                    case "echo":
                        a = "print(" + e + ");";
                        break;
                    case "print":
                    case "include":
                        a = c + "(" + b.join(",") + ");";
                        break;
                    default:
                        if (/^\s*\|\s*[\w\$]/.test(e)) {
                            var k = !0;
                            0 === a.indexOf("#") && (a = a.substr(1), k = !1);
                            for (var l = 0, m = a.split("|"), n = m.length, o = m[l++]; n > l; l++)o = z(o, m[l]);
                            a = (k ? "=" : "=#") + o
                        } else a = d.helpers[c] ? "=#" + c + "(" + b.join(",") + ");" : "=" + a
                }
                return a
            },
                "function" == typeof define ? define(function () {
                        return d
                    }) : "undefined" != typeof exports ? module.exports = d : this.template = d
        }()
    }, {}],
    12: [function (require, module, exports) {
        (function ($, window) {
            var $window = $(window);
            var _now = Date.now || function () {
                    return (new Date).getTime()
                };

            function Debounce(func, wait, immediate) {
                var timeout, args, context, timestamp, result;
                var later = function () {
                    var last = _now() - timestamp;
                    if (last < wait && last >= 0) timeout = setTimeout(later, wait - last); else {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context,
                                args);
                            if (!timeout) context = args = null
                        }
                    }
                };
                return function () {
                    context = this;
                    args = arguments;
                    timestamp = _now();
                    var callNow = immediate && !timeout;
                    if (!timeout) timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                        context = args = null
                    }
                    return result
                }
            }

            $.fn.lazyload = function (options) {
                var elements = this;
                var $container;
                var settings = {
                    lazy_name: "",
                    threshold: 0,
                    failure_limit: 0,
                    event: "scroll",
                    effect: "show",
                    container: window,
                    data_attribute: "original",
                    skip_invisible: true,
                    appear: null,
                    load: null,
                    pre_class: "lazy"
                };
                var lazyLoadId = _now();

                function update() {
                    var counter = 0;
                    if (elements.length === 0) $container.off(settings.event + ".lazyload_" + lazyLoadId);
                    elements.each(function () {
                        var $this = $(this);
                        var isAttr = this.getAttribute("data-" + settings.data_attribute);
                        if (settings.skip_invisible && !$this.is(":visible") || !isAttr)return;
                        if ($.abovethetop(this, settings) || $.leftofbegin(this, settings)); else if (!$.belowthefold(this, settings) && !$.rightoffold(this, settings)) $this.trigger("appear"); else if (++counter > settings.failure_limit)return false
                    })
                }

                if (options) {
                    if (undefined !== options.failurelimit) {
                        options.failure_limit = options.failurelimit;
                        delete options.failurelimit
                    }
                    if (undefined !== options.effectspeed) {
                        options.effect_speed = options.effectspeed;
                        delete options.effectspeed
                    }
                    $.extend(settings, options)
                }
                $container = settings.container === undefined || settings.container === window ? $window : $(settings.container);
                if (settings.lazy_name) {
                    lazyLoadId = settings.lazy_name;
                    $container.off(settings.event + ".lazyload_" + lazyLoadId)
                }
                if (0 === settings.event.indexOf("scroll")) $container.on(settings.event +
                    ".lazyload_" + lazyLoadId, Debounce(function (event) {
                    return update()
                }, 200));
                this.each(function () {
                    var self = this;
                    var $self = $(self);
                    self.loaded = false;
                    function _onload() {
                        var original = $self.attr("data-" + settings.data_attribute);
                        if ($self.is("img")) {
                            $self.hide();
                            $self.attr("src", original)[settings.effect](settings.effect_speed).removeClass(settings.pre_class)
                        } else if (original.indexOf(".") == -1) $self.addClass(original).removeClass(settings.pre_class); else $self.css("background-image", "url('" + original + "')").removeClass(settings.pre_class);
                        self.loaded = true;
                        var temp = $.grep(elements, function (element) {
                            return !element.loaded && element.getAttribute("data-" + settings.data_attribute) !== ""
                        });
                        elements = $(temp);
                        if (settings.load) {
                            var elements_left = elements.length;
                            settings.load.call(self, elements_left, settings)
                        }
                    }

                    $self.off("appear").one("appear", function () {
                        if (!this.loaded) {
                            if (settings.appear) {
                                var elements_left = elements.length;
                                settings.appear.call(self, elements_left, settings)
                            }
                            if ($self.data(settings.data_attribute).indexOf(".") == -1) _onload(); else $("<img />").on("load",
                                function () {
                                    _onload()
                                }).attr("src", $self.data(settings.data_attribute))
                        }
                    });
                    if (0 !== settings.event.indexOf("scroll")) $self.on(settings.event, function (event) {
                        if (!self.loaded) $self.trigger("appear")
                    })
                });
                $window.off("resize.lazyload").on("resize.lazyload", function (event) {
                    update()
                });
                update();
                return this
            };
            $.belowthefold = function (element, settings) {
                var fold;
                if (settings.container === undefined || settings.container === window) fold = $window.height() + $window.scrollTop(); else fold = $(settings.container).offset().top + $(settings.container).height();
                return fold <= $(element).offset().top - settings.threshold
            };
            $.rightoffold = function (element, settings) {
                var fold;
                if (settings.container === undefined || settings.container === window) fold = $window.width() + $window.scrollLeft(); else fold = $(settings.container).offset().left + $(settings.container).width();
                return fold <= $(element).offset().left - settings.threshold
            };
            $.abovethetop = function (element, settings) {
                var fold;
                if (settings.container === undefined || settings.container === window) fold = $window.scrollTop(); else fold = $(settings.container).offset().top;
                return fold >= $(element).offset().top + settings.threshold + $(element).height()
            };
            $.leftofbegin = function (element, settings) {
                var fold;
                if (settings.container === undefined || settings.container === window) fold = $window.scrollLeft(); else fold = $(settings.container).offset().left;
                return fold >= $(element).offset().left + settings.threshold + $(element).width()
            };
            $.inviewport = function (element, settings) {
                return !$.rightoffold(element, settings) && (!$.leftofbegin(element, settings) && (!$.belowthefold(element, settings) && !$.abovethetop(element,
                        settings)))
            };
            $.extend($.expr[":"], {
                "below-the-fold": function (a) {
                    return $.belowthefold(a, {threshold: 0})
                }, "above-the-top": function (a) {
                    return !$.belowthefold(a, {threshold: 0})
                }, "right-of-screen": function (a) {
                    return $.rightoffold(a, {threshold: 0})
                }, "left-of-screen": function (a) {
                    return !$.rightoffold(a, {threshold: 0})
                }, "in-viewport": function (a) {
                    return !$.inviewport(a, {threshold: 0})
                }, "above-the-fold": function (a) {
                    return !$.belowthefold(a, {threshold: 0})
                }, "right-of-fold": function (a) {
                    return $.rightoffold(a, {threshold: 0})
                },
                "left-of-fold": function (a) {
                    return !$.rightoffold(a, {threshold: 0})
                }
            })
        })(jQuery, window)
    }, {}],
    13: [function (require, module, exports) {
        arguments[4][9][0].apply(exports, arguments)
    }, {"dup": 9}],
    14: [function (require, module, exports) {
        var Widget = require("./Widget");
        var Button = Widget("V.Button", null, {
            options: {
                type: "loading",
                loadingBeforeText: '<span class="ui-btn-loading-before">{$text}</span>',
                loadingAfterIcon: '<span class="ui-btn-loading-after"><i class="ii-loading-gray-16x16"></i></span>'
            }, _init: function (option) {
                options =
                    this.setOptions(option);
                this.node = $(this.options.node)
            }, loading: function (isShow) {
                if (isShow) {
                    this.loadingText(true);
                    this.loadingClass(true)
                } else this.loadingClass(false)
            }, loadingText: function () {
                var loadingBeforeNode = this.node.find(".ui-btn-loading-before");
                var loadingAfterNode = this.node.find(".ui-btn-loading-after");
                var loadingInnerHTML = [];
                var nodeHtml;
                if (!loadingBeforeNode.length) {
                    nodeHtml = options.loadingBeforeText.replace("{$text}", this.node.html());
                    loadingInnerHTML.push(nodeHtml)
                }
                if (!loadingAfterNode.length) loadingInnerHTML.push(options.loadingAfterIcon);
                if (loadingInnerHTML.length) this.node.html(loadingInnerHTML.join(""))
            }, loadingClass: function (isShow) {
                if (isShow) this.node.addClass("ui-btn-loading z-ui-btn-loading"); else this.node.removeClass("ui-btn-loading z-ui-btn-loading")
            }
        });
        module.exports = Button
    }, {"./Widget": 25}],
    15: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var tmplCache = {};
            var tmpl = function tmpl(str, data) {
                var fn = !/\W/.test(str) ? tmplCache[str] = tmplCache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj",
                        "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
                return data ? fn(data) : fn
            };
            var Datepicker = Widget("V.DatePicker", null, {
                views: {
                    years: "ui-datepicker-view-years",
                    moths: "ui-datepicker-view-months",
                    days: "ui-datepicker-view-days"
                }, tpl: {
                    wrapper: '<div class="ui-datepicker"></div>',
                    head: ['<table cellspacing="0" cellpadding="0">', "<thead>", '<tr class="ui-datepicker-year-month">', '<th colspan="7" class="ui-datepicker-month-wrap"><a class="ui-datepicker-prev" href="javascript:;"><span>&lt;</span></a>', '<a class="ui-datepicker-month" href="javascript:;"><span></span></a>', '<a class="ui-datepicker-next" href="javascript:;"><span>&gt;</span></a></th>', "</tr>", '<tr class="ui-datepicker-dow">', "<th><span><%=day1%></span></th>", "<th><span><%=day2%></span></th>", "<th><span><%=day3%></span></th>",
                        "<th><span><%=day4%></span></th>", "<th><span><%=day5%></span></th>", "<th><span><%=day6%></span></th>", "<th><span><%=day7%></span></th>", "</tr>", "</thead>", "</table>"],
                    space: '<td class="datepickerSpace"><div></div></td>',
                    days: '<tbody class="ui-datepicker-days"></tbody>',
                    months: '<tbody class="<%=className%>"></tbody>'
                }, options: {
                    date: null,
                    current: null,
                    inline: false,
                    mode: "single",
                    calendars: 1,
                    starts: 0,
                    prev: "&#9664;",
                    next: "&#9654;",
                    view: "days",
                    position: "bottom",
                    triggerType: "focus",
                    className: "",
                    isAutoSelect: true,
                    enableYearMonth: true,
                    preChange: function (date) {
                    },
                    onChange: function (date) {
                    },
                    onRenderCell: function (dom, date) {
                        return {}
                    },
                    onBeforeShow: function () {
                        return true
                    },
                    onAfterShow: $.noop,
                    onBeforeHide: function () {
                        return true
                    },
                    onAfterHide: $.noop,
                    onFillDone: function (calendar) {
                    },
                    locale: {
                        daysMin: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"],
                        months: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
                        monthsShort: ["1\u6708", "2\u6708",
                            "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"]
                    },
                    appendTxt: {},
                    extraHeight: false,
                    extraWidth: false,
                    lastSel: false
                }, _init: function (option) {
                    var options = this.setOptions(option);
                    var tpl = this.tpl;
                    this.extendDate(options.locale);
                    options.calendars = Math.max(1, parseInt(options.calendars, 10) || 1);
                    options.mode = /single|multiple|range/.test(options.mode) ? options.mode : "single";
                    options.el = options.node;
                    options.date = this.normalizeDate(options.mode, options.date);
                    this._processDayTpl();
                    this._processMonthTpl();
                    if (!options.current) options.current = new Date; else options.current = new Date(options.current);
                    options.current.setDate(1);
                    options.current.setHours(0, 0, 0, 0);
                    var id = "datepicker_" + parseInt(Math.random() * 1E3), cnt;
                    options.id = id;
                    $(options.el).data("datepickerId", options.id);
                    var cal = $(tpl.wrapper).attr("id", id).on("click", this, this.click).data("datepicker", options);
                    if (options.className) cal.addClass(options.className);
                    var html = "";
                    for (var i = 0; i < options.calendars; i++) {
                        cnt =
                            options.starts;
                        if (i > 0) html += tpl.space;
                        html += tmpl(tpl.head.join(""), {
                            prev: options.prev,
                            next: options.next,
                            day1: options.locale.daysMin[cnt++ % 7],
                            day2: options.locale.daysMin[cnt++ % 7],
                            day3: options.locale.daysMin[cnt++ % 7],
                            day4: options.locale.daysMin[cnt++ % 7],
                            day5: options.locale.daysMin[cnt++ % 7],
                            day6: options.locale.daysMin[cnt++ % 7],
                            day7: options.locale.daysMin[cnt++ % 7]
                        })
                    }
                    cal.append(html).find("table").addClass(this.views[options.view]);
                    this.fill(cal.get(0));
                    if (options.inline) cal.appendTo(options.el).show().css("position",
                        "relative"); else {
                        cal.appendTo(document.body);
                        $(options.el).on(options.triggerType, this, this.show)
                    }
                }, _processDayTpl: function () {
                    var dayTplArr = ['<tbody class="ui-datepicker-days">'];
                    for (var i = 0, iLen = 6; i < iLen; i++) {
                        dayTplArr.push("<tr>");
                        for (var j = 0, jLen = 7; j < jLen; j++) {
                            dayTplArr.push('<td class="<%=weeks[' + i + "].days[" + j + '].classname%>" ');
                            dayTplArr.push('data-date="<%=weeks[' + i + "].days[" + j + ']["data-date"]%>">');
                            dayTplArr.push('<a class="ui-datepicker-day" href="javascript:;">');
                            dayTplArr.push('<span class="dayNum"><%=weeks[' +
                                i + "].days[" + j + "].text%></span>");
                            dayTplArr.push("<%=weeks[" + i + "].days[" + j + "].appendTxt%>");
                            dayTplArr.push("</a>");
                            dayTplArr.push("</td>")
                        }
                        dayTplArr.push("</tr>")
                    }
                    dayTplArr.push("</tbody>");
                    this.tpl.days = dayTplArr.join("")
                }, _processMonthTpl: function () {
                    var monthTplArr = ['<tbody class="<%=className%>">'];
                    var k = 0;
                    for (var i = 0, iLen = 3; i < iLen; i++) {
                        monthTplArr.push("<tr>");
                        for (var j = 0, jLen = 4; j < jLen; j++) {
                            if (j === 3) monthTplArr.push('<td colspan="1">'); else monthTplArr.push('<td colspan="2">');
                            monthTplArr.push('<a href="javascript:;">');
                            monthTplArr.push("<span><%=data[" + k + "]%></span>");
                            monthTplArr.push("</a>");
                            monthTplArr.push("</td>");
                            k++
                        }
                        monthTplArr.push("</tr>")
                    }
                    monthTplArr.push("</tbody>");
                    this.tpl.months = monthTplArr
                }, fill: function (el, isSelect) {
                    var options = this.options;
                    var cal = $(el);
                    var currentCal = Math.floor(options.calendars / 2);
                    var date, data, dow, fullYear, month, cnt = 0, days, indic, indic2, html, tblCal;
                    var tpl = this.tpl;
                    cal.find("table tbody").remove();
                    for (var i = 0; i < options.calendars; i++) {
                        date = new Date(options.current);
                        date.addMonths(-currentCal +
                            i);
                        tblCal = cal.find("table").eq(i);
                        fullYear = date.getFullYear();
                        if (i == 0) tblCal.addClass("ui-datepicker-first-view");
                        if (i == options.calendars - 1) tblCal.addClass("ui-datepicker-last-view");
                        if (tblCal.hasClass("ui-datepicker-view-days")) dow = fullYear + "\u5e74" + date.getMonthName(true); else if (tblCal.hasClass("ui-datepicker-view-months")) dow = fullYear; else if (tblCal.hasClass("ui-datepicker-view-years")) dow = fullYear - 6 + " - " + (fullYear + 5);
                        tblCal.find(".ui-datepicker-month span").text(dow);
                        dow = date.getFullYear() -
                            6;
                        data = {data: [], className: "ui-datepicker-years"};
                        for (var j = 0; j < 12; j++)data.data.push(dow + j);
                        html = tmpl(tpl.months.join(""), data);
                        date.setDate(1);
                        data = {weeks: [], test: 10};
                        month = date.getMonth();
                        var dow = (date.getDay() - options.starts) % 7;
                        date.addDays(-(dow + (dow < 0 ? 7 : 0)));
                        cnt = 0;
                        while (cnt < 42) {
                            var _fullYear = date.getFullYear();
                            var _month = date.getMonth() + 1;
                            var _date = date.getDate();
                            var _fixMonth = _month < 10 ? "0" + _month : _month;
                            var _fixDate = _date < 10 ? "0" + _date : _date;
                            var ymd = [_fullYear, _month, _date].join("-");
                            var fixYMD =
                                [_fullYear, _fixMonth, _fixDate].join("-");
                            indic = parseInt(cnt / 7, 10);
                            indic2 = cnt % 7;
                            if (!data.weeks[indic]) data.weeks[indic] = {days: []};
                            data.weeks[indic].days[indic2] = {
                                text: _date,
                                classname: ["J-" + fixYMD],
                                appendTxt: options.appendTxt[ymd],
                                "data-date": _date
                            };
                            var today = new Date;
                            if (today.getDate() === _date && (today.getMonth() + 1 === _month && today.getFullYear() === _fullYear)) data.weeks[indic].days[indic2].classname.push("ui-datepicker-today");
                            if (date > today) data.weeks[indic].days[indic2].classname.push("ui-datepicker-future");
                            if (month + 1 != _month) {
                                data.weeks[indic].days[indic2].classname.push("ui-datepicker-not-in-month");
                                data.weeks[indic].days[indic2].classname.push("ui-datepicker-disabled")
                            }
                            if (date.getDay() == 0) data.weeks[indic].days[indic2].classname.push("ui-datepicker-sunday");
                            if (date.getDay() == 6) data.weeks[indic].days[indic2].classname.push("ui-datepicker-saturday");
                            var fromUser = options.onRenderCell(el, date);
                            var val = date.valueOf();
                            var flag1 = typeof isSelect === "undefined" ? options.isAutoSelect : isSelect;
                            var flag2 = !$.isArray(options.date) ||
                                options.date.length > 0;
                            var flag3 = options.date;
                            if (flag1 && (flag2 && flag3))if (fromUser.selected || (options.date == val || ($.inArray(val, options.date) > -1 || options.mode == "range" && (val >= options.date[0] && val <= options.date[1])))) data.weeks[indic].days[indic2].classname.push("ui-datepicker-selected");
                            if (fromUser.disabled) data.weeks[indic].days[indic2].classname.push("ui-datepicker-disabled");
                            if (fromUser.className) data.weeks[indic].days[indic2].classname.push(fromUser.className);
                            data.weeks[indic].days[indic2].classname =
                                data.weeks[indic].days[indic2].classname.join(" ");
                            cnt++;
                            date.addDays(1)
                        }
                        html = tmpl(tpl.days, data) + html;
                        data = {data: options.locale.monthsShort, className: "ui-datepicker-months"};
                        html = tmpl(tpl.months.join(""), data) + html;
                        tblCal.append(html)
                    }
                    options.onFillDone.call(this, tblCal)
                }, extendDate: function (locale) {
                    if (Date.prototype.tempDate)return;
                    Date.prototype.tempDate = null;
                    Date.prototype.months = locale.months;
                    Date.prototype.monthsShort = locale.monthsShort;
                    Date.prototype.getMonthName = function (fullName) {
                        return this[fullName ?
                            "months" : "monthsShort"][this.getMonth()]
                    };
                    Date.prototype.addDays = function (n) {
                        this.setDate(this.getDate() + n);
                        this.tempDate = this.getDate()
                    };
                    Date.prototype.addMonths = function (n) {
                        if (this.tempDate == null) this.tempDate = this.getDate();
                        this.setDate(1);
                        this.setMonth(this.getMonth() + n);
                        this.setDate(Math.min(this.tempDate, this.getMaxDays()))
                    };
                    Date.prototype.addYears = function (n) {
                        if (this.tempDate == null) this.tempDate = this.getDate();
                        this.setDate(1);
                        this.setFullYear(this.getFullYear() + n);
                        this.setDate(Math.min(this.tempDate,
                            this.getMaxDays()))
                    };
                    Date.prototype.getMaxDays = function () {
                        var tmpDate = new Date(Date.parse(this)), d = 28, m;
                        m = tmpDate.getMonth();
                        d = 28;
                        while (tmpDate.getMonth() == m) {
                            d++;
                            tmpDate.setDate(d)
                        }
                        return d - 1
                    }
                }, click: function (ev) {
                    var self = ev.data;
                    if ($(ev.target).is("span")) ev.target = ev.target.parentNode;
                    var el = $(ev.target).closest("a");
                    var isSelect = false, beforeSelDate, prChangeArgs;
                    if (el.is("a")) {
                        ev.target.blur();
                        if (el.hasClass("ui-datepicker-disabled"))return false;
                        var options = $(this).data("datepicker");
                        var parentEl =
                            el.parent();
                        var tblEl = parentEl.closest("table");
                        var tblIndex = $("table", this).index(tblEl.get(0));
                        var tmp = new Date(options.current);
                        var changed = false;
                        var fillIt = false;
                        var currentCal = Math.floor(options.calendars / 2);
                        if (parentEl.is("th")) {
                            if (el.hasClass("ui-datepicker-month")) {
                                if (!options.enableYearMonth)return;
                                tmp.addMonths(tblIndex - currentCal);
                                if (options.mode == "range") {
                                    options.date[0] = tmp.setHours(0, 0, 0, 0).valueOf();
                                    tmp.addDays(tmp.getMaxDays() - 1);
                                    tmp.setHours(23, 59, 59, 0);
                                    options.date[1] = tmp.valueOf();
                                    fillIt = true;
                                    changed = true;
                                    options.lastSel = false
                                } else if (options.calendars == 1)if (tblEl.eq(0).hasClass("ui-datepicker-view-days")) {
                                    tblEl.eq(0).toggleClass("ui-datepicker-view-days ui-datepicker-view-months");
                                    el.find("span").text(tmp.getFullYear())
                                } else if (tblEl.eq(0).hasClass("ui-datepicker-view-months")) {
                                    tblEl.eq(0).toggleClass("ui-datepicker-view-months ui-datepicker-view-years");
                                    el.find("span").text(tmp.getFullYear() - 6 + " - " + (tmp.getFullYear() + 5))
                                } else if (tblEl.eq(0).hasClass("ui-datepicker-view-years")) {
                                    tblEl.eq(0).toggleClass("ui-datepicker-view-years ui-datepicker-view-days");
                                    el.find("span").text(tmp.getMonthName(true) + ", " + tmp.getFullYear())
                                }
                            } else if (parentEl.parent().parent().is("thead")) {
                                if (tblEl.eq(0).hasClass("ui-datepicker-view-days")) options.current.addMonths(el.hasClass("ui-datepicker-prev") ? -1 : 1); else if (tblEl.eq(0).hasClass("ui-datepicker-view-months")) options.current.addYears(el.hasClass("ui-datepicker-prev") ? -1 : 1); else if (tblEl.eq(0).hasClass("ui-datepicker-view-years")) options.current.addYears(el.hasClass("ui-datepicker-prev") ? -12 : 12);
                                options.date = options.current.valueOf()
                            }
                            fillIt =
                                true
                        } else if (parentEl.is("td") && !parentEl.hasClass("ui-datepicker-disabled"))if (tblEl.eq(0).hasClass("ui-datepicker-view-months")) {
                            options.current.setMonth(tblEl.find("tbody.ui-datepicker-months td").index(parentEl));
                            options.current.setFullYear(parseInt(tblEl.find(".ui-datepicker-month span").text(), 10));
                            options.current.addMonths(currentCal - tblIndex);
                            tblEl.eq(0).toggleClass("ui-datepicker-view-months ui-datepicker-view-days");
                            fillIt = true
                        } else if (tblEl.eq(0).hasClass("ui-datepicker-view-years")) {
                            options.current.setFullYear(parseInt(el.text(),
                                10));
                            tblEl.eq(0).toggleClass("ui-datepicker-view-years ui-datepicker-view-months");
                            fillIt = true
                        } else {
                            var val = parseInt(parentEl.data("date"), 10);
                            tmp.addMonths(tblIndex - currentCal);
                            if (parentEl.hasClass("ui-datepicker-not-in-month")) tmp.addMonths(val > 15 ? -1 : 1);
                            tmp.setDate(val);
                            switch (options.mode) {
                                case "multiple":
                                    val = tmp.setHours(0, 0, 0, 0).valueOf();
                                    if ($.inArray(val, options.date) > -1) $.each(options.date, function (nr, dat) {
                                        if (dat == val) {
                                            options.date.splice(nr, 1);
                                            return false
                                        }
                                    }); else options.date.push(val);
                                    break;
                                case "range":
                                    if (!options.lastSel) options.date[0] = tmp.setHours(0, 0, 0, 0).valueOf();
                                    val = tmp.setHours(23, 59, 59, 0).valueOf();
                                    if (val < options.date[0]) {
                                        options.date[1] = options.date[0] + 86399E3;
                                        options.date[0] = val - 86399E3
                                    } else options.date[1] = val;
                                    options.lastSel = !options.lastSel;
                                    break;
                                default:
                                    beforeSelDate = self.getDate()[0].valueOf();
                                    options.date = tmp.valueOf();
                                    prChangeArgs = self.prepareDate(options);
                                    prChangeArgs.push(parentEl);
                                    isSelect = options.preChange.apply(this, prChangeArgs);
                                    isSelect = isSelect === false ? isSelect :
                                        true;
                                    if (!isSelect) {
                                        options.date = beforeSelDate;
                                        return false
                                    }
                                    break
                            }
                            self._selectDate(options.date, tblEl, options);
                            changed = true
                        }
                        if (fillIt) self.fill(this, isSelect);
                        if (changed) options.onChange.apply(this, self.prepareDate(options))
                    }
                    return false
                }, _selectDate: function (date, tblEl, options) {
                    var jqPicker = tblEl.closest(".ui-datepicker");
                    jqPicker.find(".ui-datepicker-selected").removeClass("ui-datepicker-selected");
                    if (typeof date === "number") jqPicker.find(".J-" + this._toYMD(date)).addClass("ui-datepicker-selected");
                    else if (options.mode === "multiple")for (var i = 0, len = date.length; i < len; i++)jqPicker.find(".J-" + this._toYMD(date[i])).addClass("ui-datepicker-selected"); else if (options.mode === "range") {
                        var T = new Date(date[0]);
                        var addClassDate = [];
                        while (T.valueOf() < date[1]) {
                            addClassDate.push(this._toYMD(T.valueOf()));
                            T.addDays(1)
                        }
                        $(".J-" + addClassDate.join(",.J-")).addClass("ui-datepicker-selected")
                    }
                }, _toYMD: function (date) {
                    var T = new Date(date);
                    var Y = T.getFullYear();
                    var M = T.getMonth() + 1;
                    var D = T.getDate();
                    M = M < 10 ? "0" + M : M;
                    D =
                        D < 10 ? "0" + D : D;
                    return [Y, M, D].join("-")
                }, prepareDate: function (options) {
                    var dates = null;
                    if (options.mode == "single") {
                        if (options.date) dates = new Date(options.date)
                    } else {
                        dates = new Array;
                        $(options.date).each(function (i, val) {
                            dates.push(new Date(val))
                        })
                    }
                    return [dates, options.el]
                }, getViewport: function () {
                    var m = document.compatMode == "CSS1Compat";
                    return {
                        l: window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
                        t: window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
                        w: window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
                        h: window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
                    }
                }, isChildOf: function (parentEl, el, container) {
                    if (parentEl == el)return true;
                    if (parentEl.contains)return parentEl.contains(el);
                    if (parentEl.compareDocumentPosition)return !!(parentEl.compareDocumentPosition(el) & 16);
                    var prEl = el.parentNode;
                    while (prEl && prEl != container) {
                        if (prEl == parentEl)return true;
                        prEl = prEl.parentNode
                    }
                    return false
                },
                show: function (ev) {
                    var self = ev.data;
                    var jqSelf = $(this);
                    var cal = $("#" + jqSelf.data("datepickerId"));
                    if (!cal.is(":visible")) {
                        var calEl = cal.get(0);
                        var options = cal.data("datepicker");
                        var test = options.onBeforeShow.apply(this, [calEl]);
                        if (options.onBeforeShow.apply(this, [calEl]) == false)return;
                        self.fill(calEl);
                        var pos = jqSelf.offset();
                        var viewPort = self.getViewport();
                        var top = pos.top;
                        var left = pos.left;
                        var oldDisplay = $(calEl).css("display");
                        cal.css({visibility: "hidden", display: "block", position: "absolute"});
                        switch (options.position) {
                            case "top":
                                top -=
                                    calEl.offsetHeight;
                                break;
                            case "left":
                                left -= calEl.offsetWidth;
                                break;
                            case "right":
                                left += jqSelf.outerWidth();
                                break;
                            case "bottom":
                                top += jqSelf.outerHeight();
                                break
                        }
                        if (top + calEl.offsetHeight > viewPort.t + viewPort.h) top = pos.top - calEl.offsetHeight;
                        if (top < viewPort.t) top = pos.top + this.offsetHeight + calEl.offsetHeight;
                        if (left + calEl.offsetWidth > viewPort.l + viewPort.w) left = pos.left - calEl.offsetWidth;
                        if (left < viewPort.l) left = pos.left + this.offsetWidth;
                        cal.css({
                            visibility: "visible", display: "block", top: top + "px", left: left +
                            "px"
                        });
                        options.onAfterShow.apply(this, [cal.get(0)]);
                        $(document).on("mousedown", {cal: cal, trigger: this, context: self}, self.hide)
                    }
                    return false
                }, hide: function (ev) {
                    var self = ev.data.context;
                    if (ev.target != ev.data.trigger && !self.isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0)))if (ev.data.cal.data("datepicker").onBeforeHide.apply(this, [ev.data.cal.get(0)]) != false) {
                        ev.data.cal.hide();
                        ev.data.cal.data("datepicker").onAfterHide.apply(this, [ev.data.cal.get(0)]);
                        $(document).off("mousedown", self.hide)
                    }
                },
                normalizeDate: function (mode, date) {
                    if (mode != "single" && !date) date = [];
                    if (date && (!$.isArray(date) || date.length > 0))if (mode != "single")if (!$.isArray(date)) {
                        date = [(new Date(date)).setHours(0, 0, 0, 0).valueOf()];
                        if (mode == "range") date.push((new Date(date[0])).setHours(23, 59, 59, 0).valueOf())
                    } else {
                        for (var i = 0; i < date.length; i++)date[i] = (new Date(date[i])).setHours(0, 0, 0, 0).valueOf();
                        if (mode == "range") {
                            if (date.length == 1) date.push(new Date(date[0]));
                            date[1] = (new Date(date[1])).setHours(23, 59, 59, 0).valueOf()
                        }
                    } else {
                        date =
                            typeof date === "string" ? date.replace(/-/g, "/") : date;
                        date = (new Date(date)).setHours(0, 0, 0, 0).valueOf()
                    }
                    return date
                }, showPicker: function () {
                    var node = this.options.node;
                    var datepickerId = node.data("datepickerId");
                    if (datepickerId) {
                        var cal = $("#" + datepickerId);
                        var options = cal.data("datepicker");
                        if (!options.inline) this.show.apply(node[0], [{data: this}])
                    }
                    return this
                }, hidePicker: function () {
                    var node = this.options.node;
                    var datepickerId = node.data("datepickerId");
                    if (datepickerId) {
                        var cal = $("#" + datepickerId);
                        var options =
                            cal.data("datepicker");
                        if (!options.inline) $("#" + datepickerId).hide()
                    }
                    return this
                }, setDate: function (date, shiftTo, isSelect) {
                    var node = this.options.node;
                    var datepickerId = node.data("datepickerId");
                    if (datepickerId) {
                        var cal = $("#" + datepickerId);
                        var options = cal.data("datepicker");
                        options.date = this.normalizeDate(options.mode, date);
                        if (shiftTo) options.current = new Date(options.mode != "single" ? options.date[0] : options.date);
                        this.fill(cal.get(0), isSelect)
                    }
                    return this
                }, getDate: function () {
                    var node = this.options.node;
                    var datepickerId = node.data("datepickerId");
                    if (node.size() > 0)return this.prepareDate($("#" + datepickerId).data("datepicker"))
                }, clear: function () {
                    var node = this.options.node;
                    var datepickerId = node.data("datepickerId");
                    if (datepickerId) {
                        var cal = $("#" + datepickerId);
                        var options = cal.data("datepicker");
                        if (options.mode == "single") options.date = null; else options.date = [];
                        fill(cal.get(0))
                    }
                    return this
                }
            });
            module.exports = Datepicker
        })()
    }, {"./Widget": 25}],
    16: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Log = require("../Util/Log");
            var Detect = require("../Util/Detect");
            var Guid = require("../Util/Guid");
            var dialogColletion = {count: 0, maskZIndex: [], openStatusDialog: []};
            var zIndex = 1E3;

            function zIndexManager() {
                return ++zIndex
            }

            var Dialog = Widget("V.Dialog", null, {
                options: {
                    size: "small",
                    position: [],
                    content: null,
                    title: null,
                    effect: {effect: "slide", duration: 500},
                    model: false,
                    elStyle: "",
                    botton: [],
                    trigger: null,
                    triggerType: "click",
                    showEvent: $.noop,
                    closeEvent: $.noop,
                    zIndex: null,
                    opacity: 0.1,
                    maskColor: "#000000",
                    isFixed: true,
                    mars_pop: "",
                    isCache: false,
                    autoResize: false,
                    clickMaskClose: false,
                    custom: false,
                    customStyle: false,
                    closeBtnAttr: {},
                    isShowCloseBtn: true
                },
                selects: [],
                buffObj: null,
                isOpenFlag: false,
                dialogTemplates: '<div class="ui-dialog">            <h2 class="ui-dialog-title">\u6807\u9898\u533a</h2>            <div class="ui-dialog-inner">                <a href="javascript:;" role="button" class="ui-dialog-close vipFont">\ue609</a>                <div class="ui-dialog-content">                    <h3 class="ui-dialog-tips f-text-center"><span class="text"><i class="vipFont if-sigh">\ue603</i>\u6807\u9898\u6807\u9898\u6807\u9898\u6807\u9898\u6807\u9898\u6807\u9898</span></h3>                    <p>\u6b63\u6587\u4e00\u822c\u7528\u4e8e\u6807\u9898\u7684\u8865\u5145\u8bf4\u660e\uff0c\u53ef\u6709\u53ef\u65e0\u4f9d\u7167\u5177\u4f53\u573a\u666f\u800c\u4f7f\u7528\u3002</p>                </div>                <div class="ui-dialog-command"></div>            </div>        </div>',
                buttonTemplates: '<a href="javascript:;" role="button" class="ui-btn-{$btnSize} ui-btn-{$btnType}">{$btnText}</a>',
                customTemplates: '<div class="ui-dialog">                    <div class="_diaTitle"></div>                    <div class="_diaContent"></div>                    <div class="_diaButton"></div>                </div>',
                _init: function (option) {
                    var self = this;
                    var contentStyle = {};
                    var posType;
                    var options;
                    var dialogTemplates;
                    var buffObj;
                    this.id = Guid();
                    this.selects = [];
                    this.buffObj = null;
                    this.tag = 0;
                    options = this.setOptions(option);
                    if (!options.custom) self.dialogTemplates = dialogTemplates = $(self.dialogTemplates); else self.dialogTemplates = dialogTemplates = $(self.customTemplates);
                    if (!options.custom) buffObj = self.buffObj = {
                        dialog: dialogTemplates,
                        diaTitle: dialogTemplates.find(".ui-dialog-title"),
                        diaContent: dialogTemplates.find(".ui-dialog-content"),
                        diaButton: dialogTemplates.find(".ui-dialog-command"),
                        diaCloseBtn: dialogTemplates.find(".ui-dialog-close")
                    }; else buffObj = self.buffObj = {
                        dialog: dialogTemplates,
                        diaTitle: dialogTemplates.find("._diaTitle"),
                        diaContent: dialogTemplates.find("._diaContent"),
                        diaButton: dialogTemplates.find(".ui-dialog-command")
                    };
                    if (options.isFixed) posType = "fixed"; else posType = "absolute";
                    dialogTemplates.css({"position": posType});
                    if (options.elStyle) buffObj.dialog.addClass(options.elStyle);
                    self.title(options.title);
                    self.button();
                    self.size();
                    if (options.customStyle) buffObj.dialog.css({
                        background: "none",
                        padding: 0,
                        "box-shadow": "none",
                        "-webkit-box-shadow": "none",
                        "filter": "none"
                    });
                    if (options.isShowCloseBtn) this.closeBtnAttr();
                    else buffObj.diaCloseBtn.hide();
                    options.trigger = options.trigger || options.node;
                    if (options.trigger) $(options.trigger).on(options.triggerType + ".dialog", function () {
                        self.open()
                    });
                    return this
                },
                _bindEvent: function () {
                    var self = this;
                    if (this.buffObj.diaCloseBtn) this.buffObj.diaCloseBtn.off("click.dialog").on("click.dialog", function (e) {
                        e.preventDefault();
                        self.close()
                    });
                    this.buffObj.diaButton.find("[role=button]").each(function (i, n) {
                        var btnOptions = self.options.button[i];
                        $(this).off("click.dialog").on("click.dialog",
                            function (btnOptions) {
                                return function (e) {
                                    e.preventDefault();
                                    btnOptions.event && btnOptions.event.call(self)
                                }
                            }(btnOptions))
                    })
                },
                _createMask: function () {
                    var self = this;
                    var options = self.options;
                    var jqBackground = $("#_diaBackground");
                    var selects = self.selects = $("select:not(#_diaWrap select):visible");
                    var maskZIndex = options.zIndex ? options.zIndex : zIndexManager();
                    options.model && dialogColletion.maskZIndex.push(maskZIndex);
                    if (jqBackground.length == 0) {
                        var maskDiv = self.maskDiv = $('<div id="_diaBackground" class="ui-window-mask"></div>');
                        var sizeCss = "background:" + options.maskColor + ";" + "opacity:" + options.opacity + ";" + "filter:alpha(opacity=" + Number(options.opacity) * 100 + ")" + ";" + "z-index:" + maskZIndex + ";" + "display:none;";
                        var ie6Css = Detect.isIE6 ? "position:absolute; width:100%; height:" + $(document).height() + "px;" : "";
                        maskDiv[0].style.cssText = sizeCss + ie6Css;
                        $("body").append(maskDiv);
                        maskDiv.show()
                    } else self.maskDiv = jqBackground.css({display: "block", zIndex: maskZIndex});
                    if (options.clickMaskClose) $("#_diaBackground").off("click.dialogMask").on("click.dialogMask",
                        function () {
                            var len = dialogColletion.openStatusDialog.length;
                            var dialog = dialogColletion.openStatusDialog[len - 1];
                            dialog && dialog.close()
                        });
                    Detect.isIE6 && selects.css({visibility: "hidden"});
                    return this
                },
                removeMask: function () {
                    var self = this;
                    self.maskDiv.animate({opacity: 0}, 300, function () {
                        $(this).remove()
                    });
                    Detect.isIE6 && self.selects.css({visibility: "hidden"});
                    return this
                },
                closeBtnAttr: function (attr) {
                    var _attr = attr || this.options.closeBtnAttr;
                    var buffObj = this.buffObj;
                    if (buffObj.diaCloseBtn) buffObj.diaCloseBtn.attr(_attr);
                    return this
                },
                title: function (text) {
                    var titleWrap = this.buffObj.diaTitle;
                    var text = text || this.options.title;
                    if (!text) titleWrap.remove(); else titleWrap.html(text).show();
                    return this
                },
                content: function (msg) {
                    var options = this.options;
                    var contentWrap = this.buffObj.diaContent;
                    if (typeof msg == "undefined" || msg === null)return this; else {
                        if ($.type(msg) === "object") msg = $(msg).html();
                        contentWrap.html(msg).show();
                        this.size();
                        this.position()
                    }
                    return this
                },
                button: function (arr) {
                    var self = this;
                    var options = self.options;
                    var buffObj =
                        self.buffObj;
                    var btnHtmlArr = $();
                    if ($.isArray(arr)) options.button = arr;
                    if (options.button && ($.isArray(options.button) && options.button.length > 0)) {
                        buffObj.diaButton.show();
                        for (var i = 0, len = options.button.length; i < len; i++) {
                            var btn = options.button[i];
                            var btnType = !btn.type ? "default" : btn.type;
                            var btnText = !btn.text ? "\u6309\u94ae" : btn.text;
                            var btnSize = !btn.size ? "medium" : btn.size;
                            var btnListener = self.btnListener = self.btnListener || {};
                            var btnHtml = self.buttonTemplates;
                            var btnHtmlProc = btnHtml.replace(/{\$btnSize}/g,
                                btnSize).replace(/{\$btnType}/g, btnType).replace(/{\$btnText}/g, btnText);
                            var jqBtn = $(btnHtmlProc);
                            btn.attr && jqBtn.attr(btn.attr);
                            btnHtmlArr = btnHtmlArr.add(jqBtn)
                        }
                        buffObj.diaButton.html(btnHtmlArr);
                        self._bindEvent()
                    } else buffObj.diaButton.hide();
                    return this
                },
                size: function (width, height) {
                    var self = this;
                    var options = self.options;
                    var buffObj = self.buffObj;
                    if (options.autoResize)return this;
                    if (!width && $.type(options.size) === "string" || $.type(arguments[0]) === "string") {
                        var sizeName = arguments[0] || options.size;
                        var sizeType = "small medium large super";
                        var rmClass = sizeType.split(" ").join(" ui-dialog-");
                        if (sizeType.indexOf(sizeName) != -1) buffObj.dialog.removeClass("ui-dialog-" + rmClass).addClass("ui-dialog-" + sizeName);
                        self.position()
                    } else if ($.type(options.size) === "array" || $.type(arguments[0]) === "number") {
                        var w = width || options.size[0];
                        var h = height || options.size[1];
                        buffObj.dialog.width(w).height(h)
                    }
                    return this
                },
                getMid: function () {
                    var scrollLeft = $(document).scrollLeft(), dW = $(document).width(), buffObj = this.buffObj,
                        mid = (dW - buffObj.dialog.outerWidth(true)) / 2 - scrollLeft + "px";
                    return mid
                },
                getVertical: function () {
                    var scrollTop = $(document).scrollTop(), cH = $(window).height(), buffObj = this.buffObj, vertical = (cH - buffObj.dialog.outerHeight(true)) / 2 + "px";
                    return vertical
                },
                position: function (left, top) {
                    var self = this, options = self.options, contentStyle = {}, pos, buffObj = self.buffObj;
                    if (options.position.length)switch (options.position.length) {
                        case 3:
                            pos = $(options.position[0]).position();
                            contentStyle = {
                                top: pos.top + options.position[1], left: pos.left +
                                options.position[2]
                            };
                            break;
                        case 2:
                            contentStyle["left"] = options.position[1];
                            contentStyle["top"] = options.position[0];
                            break;
                        case 1:
                            contentStyle["top"] = options.position[0];
                            contentStyle["left"] = self.getMid();
                            break
                    } else {
                        contentStyle["left"] = self.getMid();
                        contentStyle["top"] = self.getVertical()
                    }
                    if (!options.isFixed) contentStyle["top"] = $(window).scrollTop() + parseInt(contentStyle["top"]);
                    self.contentStyle = contentStyle;
                    buffObj.dialog.css({left: contentStyle["left"], top: contentStyle["top"]});
                    if (Detect.isIE6) {
                        buffObj.dialog.css({position: "absolute"});
                        if (options.isFixed) $(window).scroll(function () {
                            buffObj.dialog[0].style.top = Number((contentStyle["top"] + "").replace(/px/, "")) + $(document).scrollTop() + "px"
                        }).trigger("scroll")
                    }
                    return this
                },
                open: function () {
                    var self = this;
                    var dialogTop;
                    var options = self.options;
                    var buffObj = self.buffObj;
                    var jqBody = $("body");
                    if (!self.isOpenFlag) {
                        dialogColletion.count++;
                        dialogColletion.openStatusDialog.push(self);
                        self.isOpenFlag = true
                    } else return this;
                    options.model && self._createMask();
                    if (jqBody.find(buffObj.dialog).length ==
                        0) {
                        jqBody.append(self.dialogTemplates);
                        self.content(options.content);
                        self._bindEvent()
                    } else if (!options.isCache) self.content(options.content);
                    buffObj.dialog.css({zIndex: options.zIndex ? options.zIndex + 1 : zIndexManager()});
                    self.position();
                    buffObj.dialog.addClass("z-ui-dialog-in");
                    if (options.mars_pop != "") $.Listeners.pub("mars.pop").success({"mars_pop": options.mars_pop});
                    $(window).off("resize." + self.id).on("resize." + self.id, function () {
                        self.resize()
                    });
                    self.resize();
                    options.showEvent.call(self);
                    return this
                },
                resize: function (left, top) {
                    this.position(left, top);
                    return this
                },
                remove: function () {
                    var that = this;
                    this.close({forbiddenCloseEvent: true});
                    setTimeout(function () {
                        that.buffObj.dialog.remove()
                    }, 350)
                },
                destroy: function () {
                    var self = this, options = self.options;
                    $(options.trigger).off(options.triggerType + ".dialog");
                    self.remove()
                },
                close: function (forbiddenCloseEvent) {
                    var self = this, options = self.options, buffObj = self.buffObj, contentStyle = self.contentStyle, dialogTop;
                    if (!forbiddenCloseEvent) {
                        var rt = options.closeEvent.call(this,
                            null);
                        if (rt === false)return
                    }
                    if (Detect.isIE6 && self.selects.length) self.selects.css({visibility: "visible"});
                    if (self.isOpenFlag === true && dialogColletion.count > 0) {
                        dialogColletion.count--;
                        dialogColletion.openStatusDialog.pop();
                        self.isOpenFlag = false;
                        var mzList = dialogColletion.maskZIndex;
                        var lastMZ;
                        mzList.pop();
                        lastMZ = mzList[mzList.length - 1];
                        if (lastMZ) $("#_diaBackground").css("zIndex", lastMZ)
                    }
                    buffObj.dialog.addClass("z-ui-dialog-out");
                    setTimeout(function () {
                            buffObj.dialog.removeClass("z-ui-dialog-in z-ui-dialog-out")
                        },
                        350);
                    if (self.maskDiv && dialogColletion.count <= 0) self.maskDiv.hide();
                    $(window).off("resize." + self.id);
                    return this
                },
                getElem: function (str) {
                    return this.dialogTemplates.find(str)
                }
            });
            module.exports = Dialog
        })()
    }, {"../Util/Detect": 31, "../Util/Guid": 32, "../Util/Log": 37, "./Widget": 25}],
    17: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Form = Widget("V.Form", null, {
                options: {
                    trigger: "", timeout: 6E3, errorF: function () {
                    }, submitBefor: function () {
                        return true
                    }, callbackAfter: function () {
                    }
                },
                _init: function (option) {
                    var that = this;
                    var options;
                    options = this.setOptions(option);
                    if (typeof options.trigger == "string" && options.trigger.length) options.trigger = $(options.trigger);
                    if (options.trigger) this._set(options);
                    return that
                }, _set: function (parms) {
                    parms.trigger.on("submit", function () {
                        var objF = $(this);
                        if (parms.submitBefor.call(objF)) {
                            objF.find("button[type=submit]").prop("disabled", true);
                            $.ajax({
                                url: objF.attr("action"),
                                data: objF.serialize(),
                                timeout: parms.timeout,
                                dataType: "jsonp",
                                error: function () {
                                    if (objF.find("button[type=submit]").length) objF.find("button[type=submit]").html(objF.find("button[type=submit]").val()).prop("disabled",
                                        false);
                                    parms.errorF()
                                },
                                success: function (re) {
                                    if (objF.find("button[type=submit]").length) objF.find("button[type=submit]").html(objF.find("button[type=submit]").val()).prop("disabled", false);
                                    parms.callbackAfter.call(objF, re);
                                    objF[0].reset()
                                }
                            })
                        }
                        return false
                    })
                }
            });
            module.exports = Form
        })()
    }, {"./Widget": 25}],
    18: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Template = require("./Template");
            var lazyDom = Widget("V.lazyDom", null, {
                options: {
                    target: window,
                    method: "fromToBottom",
                    targetH: 0,
                    preHeight: 200,
                    renderCb: $.noop,
                    isLazyLoad: true,
                    allData: [],
                    finishEvent: $.noop,
                    preRender: 0,
                    doc: $(document),
                    oldTop: 0,
                    recTop: 0,
                    dataIndex: 0
                }, _init: function (option) {
                    var that = this;
                    var options;
                    options = this.setOptions(option);
                    options.target = $(options.target);
                    that.getTargetH();
                    that.process();
                    that.bindEvent();
                    that.scroll();
                    that.chkBegin();
                    return this
                }, process: function () {
                    var options = this.options;
                    var allData = this.options.allData;
                    var n = allData[options.dataIndex];
                    if (n) {
                        n.data = n.data ? n.data : [];
                        n._perNums = Math.ceil(options.targetH /
                            n.height);
                        n._template = $(n.template).html();
                        n.dataLen = n.data.length;
                        n.renderCb = n.renderCb ? n.renderCb : $.noop;
                        n.node = $(n.node)
                    }
                }, chkBegin: function () {
                    var that = this;
                    var options = that.options;
                    var winH = options.target.height();
                    var docH = options.doc.height();
                    if (options.preRender && !that.preRenderDone) {
                        var sData = that.extract(options.preRender);
                        if (sData) {
                            that.createDom(sData);
                            that.preRenderDone = true
                        }
                    }
                    if (options.method == "fromToTop")if (docH < winH * 2) {
                        var sData = that.extract(1);
                        if (sData) setTimeout(function () {
                            that.createDom(sData);
                            that.chkBegin()
                        }, 1)
                    }
                }, bindEvent: function () {
                    var that = this;
                    var options = this.options;
                    options.target.on("scroll.lazyDom", function () {
                        that.scroll()
                    });
                    options.target.on("resize.lazyDom", function () {
                        that.getTargetH();
                        that.process();
                        that.scroll()
                    })
                }, getTargetH: function () {
                    var options = this.options;
                    options.targetH = options.target.height();
                    return options.targetH
                }, scroll: function () {
                    var that = this;
                    var options = this.options;
                    var newTop = options.target.scrollTop();
                    var docH = options.doc.height();
                    if (options.method == "fromToTop")if (newTop >
                        options.oldTop) {
                        var scrollHeight = newTop - options.recTop;
                        if (scrollHeight > options.targetH) {
                            var len = Math.floor(scrollHeight / options.targetH);
                            if (docH - newTop < options.targetH) len = len + 1;
                            var sliceData = that.extract(len);
                            if (sliceData) that.createDom(sliceData);
                            options.recTop = newTop
                        }
                        options.oldTop = newTop
                    }
                    if (options.method == "fromToBottom")if (docH - newTop - options.targetH <= options.preHeight) {
                        var sliceData = that.extract(1);
                        if (sliceData) that.createDom(sliceData)
                    }
                }, extract: function (screenNums) {
                    var that = this;
                    var options =
                        that.options;
                    var curData = options.allData[options.dataIndex];
                    if (curData && curData.type !== "callback") {
                        var startCur = curData._startCur ? curData._startCur : 0;
                        var endCur = startCur + curData._perNums * curData.numsPerRow * screenNums;
                        var sliceData = curData.data.slice(startCur, endCur);
                        var retData = {
                            node: curData.node,
                            height: curData.height,
                            numsPerRow: curData.numsPerRow,
                            template: curData._template,
                            renderCb: curData.renderCb,
                            sliceData: sliceData,
                            perNums: curData._perNums
                        };
                        curData._startCur = endCur;
                        if (curData._startCur >= curData.data.length)if (options.dataIndex <
                            options.allData.length) {
                            options.dataIndex++;
                            that.process();
                            that.scroll()
                        }
                        return retData
                    } else if (curData && curData.type === "callback") {
                        curData.renderCb && curData.renderCb(curData.node);
                        if (options.dataIndex < options.allData.length) {
                            options.dataIndex++;
                            that.process();
                            that.scroll()
                        }
                        return null
                    } else {
                        if (!that.hasTriggerFinish) {
                            that.hasTriggerFinish = true;
                            options.finishEvent();
                            options.target.off("scroll.lazyDom");
                            options.target.off("resize.lazyDom")
                        }
                        return null
                    }
                }, lazyImg: false, createDom: function (createArr) {
                    var that =
                        this;
                    var options = this.options;
                    var obj = createArr;
                    var node = obj.node;
                    var htmlArr = [];
                    var tempInstance = Template({templateElement: obj.template, replace: null});
                    for (var j = 0, jLen = obj.sliceData.length; j < jLen; j++) {
                        var html = tempInstance.process(obj.sliceData[j]);
                        htmlArr.push(html)
                    }
                    var fragment = $(htmlArr.join(""));
                    node.append(fragment);
                    options.renderCb(node, fragment);
                    obj.renderCb(node, fragment);
                    if (options.isLazyLoad && typeof $.fn.lazyload == "function") fragment.find("img.lazy").lazyload({
                        threshold: 200,
                        failure_limit: 10
                    });
                    createArr = null
                }, destroy: function () {
                    this.options.target.off(".lazyDom")
                }
            });
            module.exports = lazyDom
        })()
    }, {"./Template": 23, "./Widget": 25}],
    19: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Detect = require("../Util/Detect");
            var Placeholder = Widget("V.Placeholder", null, {
                _init: function () {
                    this.addEvent();
                    this.addStyle()
                },
                destroy: function () {
                    this.removeEvent();
                    this.removeStyle()
                },
                selecter: "[placeholder]",
                tipsSelecter: ".J_placeholder",
                eventId: ".placeholder",
                styleId: "vipStyle_" +
                (new Date).getTime(),
                addStyle: function () {
                    var div = document.createElement("div");
                    div.innerHTML = "+<style id='" + this.styleId + "'>" + this.tipsSelecter + "{display:block;}</style>";
                    $("head:first").append(div.childNodes[1]);
                    div = null
                },
                removeStyle: function () {
                    var $style = $("#" + this.styleId);
                    if (!$style[0])return this;
                    try {
                        $style[0].styleSheet.cssText = ""
                    } catch (e) {
                    }
                    $style.remove()
                },
                getTips: function ($target) {
                    return $target.parent().find(this.tipsSelecter)
                },
                keyup: function ($target) {
                    var val = $.trim($target.val()), $tips =
                        this.getTips($target);
                    if (!$tips[0])return;
                    if (!val.length) $tips.show(); else $tips.hide()
                },
                keypress: function ($target) {
                    var val = $.trim($target.val()), $tips = this.getTips($target);
                    if (!$tips[0])return;
                    $tips.hide()
                },
                addEvent: function () {
                    var self = this, selecter = self.selecter, eventId = self.eventId, tipsSelecter = self.tipsSelecter, $body = $("body");
                    $body.delegate(selecter, "keyup" + eventId, function (e) {
                        self.keyup($(e.target))
                    });
                    $body.delegate(selecter, "keypress" + eventId, function (e) {
                        self.keypress($(e.target))
                    });
                    $body.delegate(tipsSelecter,
                        "click" + eventId, function (e) {
                            var $target = $(e.target), $input = $target.parent().find(self.selecter);
                            $input[0] && $input.focus()
                        })
                },
                removeEvent: function () {
                    $("body").undelegate(this.eventId);
                    $body.undelegate(this.selecter, "placeholder")
                }
            });
            $(function () {
                if (!Detect.placeholder) Placeholder()
            });
            module.exports = Placeholder
        })()
    }, {"../Util/Detect": 31, "./Widget": 25}],
    20: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Log = require("../Util/Log");
            var Scrollspy = Widget("V.scrollspy", null,
                {
                    options: {
                        trigger: "",
                        panel: "",
                        diffHeight: 0,
                        triggerType: "click",
                        activeCls: "cur",
                        isAlwaysCall: true,
                        reverse: true,
                        speed: 600,
                        noSpyEvent: $.noop,
                        spyEvent: $.noop,
                        clickEvent: $.noop,
                        _curObject: null
                    }, _init: function (option) {
                    var that = this, options, triggerDom, panelDom;
                    options = this.setOptions(option);
                    if (options.target) options.node = $(options.target);
                    that._spyArray = that.triggerDomArray = that.panelDomArray = null;
                    that.timeStamp = +new Date;
                    $(window).resize(function () {
                        that._expands()
                    });
                    that._expands();
                    that._bindScroll();
                    return that
                }, _expands: function (trigger, panel) {
                    var tempObj, that = this, options = that.options, trigger = trigger || options.trigger, panel = panel || options.panel, triggerDomArray = that.triggerDomArray = $(trigger), panelDomArray = that.panelDomArray = $(panel), spyArray = that._spyArray;
                    if (arguments.length == 0) spyArray = [];
                    for (var i = 0, len = triggerDomArray.length; i < len; i++) {
                        tempObj = {};
                        tempObj.triggerDom = triggerDomArray.eq(i);
                        tempObj.panelDom = panelDomArray.eq(i);
                        if (tempObj.panelDom.length > 0 && tempObj.panelDom.offset().top > 5E4)return;
                        tempObj.selfStartDiffHeight = tempObj.panelDom.data("startDiffHeight") || 0;
                        tempObj.selfEndDiffHeight = tempObj.panelDom.data("endDiffHeight") || 0;
                        if (options.addUp)if (i == 0) tempObj.panelDom.length > 0 && (tempObj.startPoint = tempObj.panelDom.offset().top); else tempObj.startPoint = spyArray[i - 1].endPoint; else tempObj.panelDom.length > 0 && (tempObj.startPoint = tempObj.panelDom.offset().top);
                        tempObj.endPoint = tempObj.startPoint + (tempObj.panelDom.data("preHeight") || tempObj.panelDom.height());
                        spyArray.push(tempObj);
                        that._bindClickScroll(tempObj)
                    }
                    that._spyArray =
                        spyArray;
                    return this
                }, push: function (trigger, panel) {
                    var that = this, options = that.options;
                    that._expands(trigger, panel);
                    return this
                }, refresh: function () {
                    this._expands();
                    return this
                }, setDiffHeight: function (value) {
                    this.options.diffHeight = value;
                    return this
                }, _runFunction: function (spyObject) {
                    var that = this, options = that.options, activeCls = options.activeCls;
                    that.triggerDomArray.removeClass(activeCls);
                    spyObject.triggerDom.addClass(activeCls);
                    if (options.spyEvent) options.spyEvent.call(spyObject)
                }, _scrollEvent: function () {
                    var i,
                        len, spyObject, _scrollTop, that = this, options = that.options, node = options.node, _spyArray = that._spyArray, scrollTop = node.scrollTop(), isInFlag = false;
                    _scrollTop = scrollTop + options.diffHeight;
                    if (!_spyArray)return;
                    for (i = 0, len = _spyArray.length; i < len; i++) {
                        spyObject = _spyArray[i];
                        if (_scrollTop >= spyObject.startPoint - spyObject.selfStartDiffHeight && _scrollTop < spyObject.endPoint + spyObject.selfEndDiffHeight) {
                            if (options.isAlwaysCall) that._runFunction(spyObject); else if (options._curObject != spyObject) {
                                that._runFunction(spyObject);
                                options._curObject = spyObject
                            }
                            isInFlag = true
                        }
                    }
                    if (!isInFlag)if (options.noSpyEvent && $.isFunction(options.noSpyEvent)) {
                        options._curObject = null;
                        options.noSpyEvent()
                    }
                    return this
                }, _bindScroll: function () {
                    var that = this, options = that.options, node = options.node, t, t_cur, t_start = +new Date;
                    node.on("scroll.spy_" + that.timeStamp, function () {
                        t_cur = +new Date;
                        clearTimeout(t);
                        if (t_cur - t_start > 120) {
                            that._scrollEvent();
                            t_start = t_cur
                        } else t = setTimeout(function () {
                            that._scrollEvent()
                        }, 100)
                    });
                    that._scrollEvent();
                    return this
                }, _bindClickScroll: function (spyObject) {
                    var that =
                        this, options = that.options, triggerDomArray = that.triggerDomArray, triggerType = this.triggerType = options.triggerType + ".spy_" + that.timeStamp, speed = options.speed, scrollToPoint, func, i, len;
                    if (!options.reverse)return this;
                    spyObject.triggerDom.off(triggerType);
                    spyObject.triggerDom.on(triggerType, function () {
                        var clickEvent = options.clickEvent;
                        if (!spyObject.panelDom.length > 0) {
                            Log("\u6ca1\u627e\u5230\u5bf9\u5e94\u7684\u5185\u5bb9\u533a");
                            return this
                        }
                        $("html, body").stop(true, true).animate({
                            scrollTop: spyObject.startPoint -
                            options.diffHeight - spyObject.selfStartDiffHeight
                        }, speed);
                        if (clickEvent) clickEvent.call(spyObject)
                    });
                    return this
                }, destory: function () {
                }
                });
            module.exports = Scrollspy
        })()
    }, {"../Util/Log": 37, "./Widget": 25}],
    21: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Log = require("../Util/Log");
            var Detect = require("../Util/Detect");
            var Selector = Widget("V.Selector", null, {
                options: {
                    everyLoad: false,
                    multiple: false,
                    triggerType: "click",
                    classPre: "",
                    loaded: false,
                    defTxt: "\u8bf7\u9009\u62e9",
                    onClickCb: $.noop,
                    evtChoose: null,
                    autoWidth: true,
                    maxVisiNum: null,
                    width: null,
                    selectorTpl: '<div id="{$selectorWrapId}" class="ui-form-item-group">                                <div class="ui-dropdown">                                    <div class="ui-dropdown-hd">                                        <a href="javascript:;" role="button" title="{$defTxt}" class="ui-dropdown-current">{$defTxt}</a>                                        <i class="vipFont i-arrow-up">&#xe615;</i>                                        <i class="vipFont i-arrow-down">&#xe616;</i>                                    </div>                                    <div class="ui-dropdown-bd"></div>                                </div>                            </div>',
                    itemTpl: '<li class="{$classPre}">                            <a href="javascript:;" title="{$text}" data-val="{$val}" role="button">{$text}</a>                        </li>'
                }, _init: function (option) {
                    var that = this, hoverTime, selectorWrapId, options;
                    options = this.setOptions(option);
                    if (typeof options.clone == "string") {
                        selectorWrapId = this.selectorWrapId = options.clone.replace("#", "");
                        options.clone = $(options.clone);
                        if ($(options.clone).length == 0) {
                            var selectorTpl = options.selectorTpl.replace(/{\$selectorWrapId}/,
                                selectorWrapId).replace(/{\$defTxt}/g, options.defTxt);
                            options.selector = $(selectorTpl);
                            options.node.after(options.selector)
                        } else options.selector = $(options.clone)
                    }
                    this._getDom();
                    options.node.hide();
                    if (Detect.isIE6) {
                        setTimeout(function () {
                            options.node.css({"visibility": "hidden"})
                        }, 0);
                        this.selectorOpt.css("height", 346)
                    }
                    if (options.autoWidth) that.autoWidth();
                    that._bindSelectorTxt();
                    return this
                }, autoWidth: function () {
                    var that = this;
                    var options = this.options;
                    this.render();
                    var bd = this.selectorOpt;
                    var wrap = this.selectorWrap;
                    var maxWidth;
                    maxWidth = Math.max(wrap.outerWidth(true), bd.outerWidth()) - 2;
                    bd.css({width: ""});
                    wrap.css({width: ""});
                    bd.css("width", maxWidth);
                    wrap.css("width", maxWidth + 2);
                    if (Detect.isIE6) that.selectorCurr.css("width", that.selectorTxt.outerWidth() - 32)
                }, reset: function () {
                    var that = this, options = that.options;
                    that.selectorWrap.find("." + options.classPre + "_optCur").removeClass(options.classPre + "_optCur");
                    that.selectorCurr.html(options.defTxt);
                    options.node.val("");
                    return this
                }, debug: function () {
                    VIPSHOP.log(this.options);
                    return this
                }, click: function () {
                    var that = this, options = that.options;
                    if (arguments.length == 1) options.selector.find("." + options.classPre + "_opt:eq(" + arguments[0] + ") a").trigger("click"); else options.selector.find("." + options.classPre + "_opt a[data-val=" + arguments[1] + "]").trigger("click");
                    return this
                }, render: function () {
                    this._render();
                    this._addAttr();
                    return this
                }, show: function () {
                    this._show();
                    return this
                }, hide: function () {
                    this._hide();
                    return this
                }, disable: function () {
                    var that = this, options = this.options;
                    that.selectorWrap.addClass("z-ui-dropdown-disable");
                    that._unbindSelectorTxt();
                    return this
                }, enable: function () {
                    var that = this, options = this.options;
                    that.selectorWrap.removeClass("z-ui-dropdown-disable");
                    that._bindSelectorTxt();
                    return this
                }, _getDom: function () {
                    var options = this.options;
                    this.selectorWrap = options.selector.find(".ui-dropdown");
                    this.selectorTxt = options.selector.find(".ui-dropdown-hd");
                    this.selectorOpt = options.selector.find(".ui-dropdown-bd");
                    this.selectorCurr = options.selector.find(".ui-dropdown-current")
                }, _bindSelectorTxt: function () {
                    var that =
                        this;
                    var options = that.options;
                    switch (options.triggerType) {
                        case "click":
                            $(document).on("click.selector_" + that.selectorWrapId, function (e) {
                                var target = e.target;
                                var hoverFlag = false;
                                $(target).parents().each(function (i, n) {
                                    if ($(n).attr("id") == that.selectorWrapId) hoverFlag = true
                                });
                                if (!hoverFlag) that.hide()
                            });
                            that.selectorTxt.on("click", function (e) {
                                if (!that.isShowed) that.show(); else that.hide();
                                options.onClickCb(that.isShowed)
                            });
                            break;
                        case "mouse":
                            that.selectorWrap.on({
                                "mouseenter": function () {
                                    that.show()
                                }, "mouseleave": function () {
                                    that.hoverTime =
                                        setTimeout(function () {
                                            that.hide()
                                        }, 200)
                                }
                            });
                            break
                    }
                    return this
                }, _unbindSelectorTxt: function () {
                    var that = this, options = that.options;
                    switch (options.triggerType) {
                        case "click":
                            $(document).on("click.selector_" + that.selectorWrapId);
                            that.selectorTxt.off("click");
                            break;
                        case "mouse":
                            that.selectorTxt.off("mouseenter mouseleave");
                            break
                    }
                    return this
                }, _show: function () {
                    var that = this;
                    var options = that.options;
                    if (!that.selectorOpt.is(":visible")) {
                        if (!options.loaded) that._render(options);
                        that.selectorWrap.addClass("z-ui-dropdown-open")
                    }
                    that.isShowed =
                        true;
                    return false
                }, _hide: function (e) {
                    this.selectorWrap.removeClass("z-ui-dropdown-open");
                    this.isShowed = false
                }, _render: function () {
                    var that = this;
                    var options = that.options;
                    var items = $(options.node).find("option");
                    var itemsTxt = '<ul class="ui-dropdown-menu">';
                    for (var i = 0, len = items.length; i < len; i++) {
                        var text = $(items[i]).text();
                        var val = $(items[i]).val();
                        var cls = options.classPre + "_opt";
                        itemsTxt += options.itemTpl.replace(/{\$classPre}/g, cls).replace(/{\$val}/g, val).replace(/{\$text}/g, text)
                    }
                    itemsTxt = itemsTxt +
                        "</ul>";
                    that.selectorItems = $(itemsTxt);
                    that.selectorOpt.html(that.selectorItems);
                    if (options.maxVisiNum) this.selectorOpt.height(options.maxVisiNum * 28 - 8);
                    if (options.width) this.selectorWrap.width(options.width);
                    options.loaded = true;
                    that.selectorOpt.find("a").on("click", function (e) {
                        that._fill($(this), e)
                    })
                }, _addAttr: function () {
                    var that = this;
                    var options = this.options;
                    var node = options.node;
                    var parentAttrs = this._getAttr(node[0]);
                    this.selectorTxt.attr(parentAttrs);
                    node.children("option").each(function (i, n) {
                        var itemAttrs =
                            that._getAttr(n);
                        var $dom = $("." + options.classPre + "_opt", that.selectorItems).eq(i);
                        $dom.attr(itemAttrs);
                        if (itemAttrs["selected"] != undefined && itemAttrs["selected"] == "selected") {
                            $dom.addClass("selected");
                            that.selectorCurr.html($dom.text())
                        }
                    })
                }, _getAttr: function (targetNode) {
                    var attrs = {};
                    $(targetNode.attributes).each(function (i, attr) {
                        if (attr.specified === true) {
                            var attrName = attr.nodeName;
                            var attrValue = attr.nodeValue;
                            if (attrName !== "id" && (attrName !== "class" && (attrName !== "style" && (attrName !== "value" && !/jQuery\d+/.test(attrName))))) attrs[attrName] =
                                attrValue
                        }
                    });
                    return attrs
                }, _fill: function (clickOpt, e) {
                    var that = this;
                    var options = that.options;
                    var selectorTxt = $.trim(clickOpt.text());
                    that.selectorOpt.find(".selected").removeClass("selected");
                    options.selector.addClass("z-ui-dropdown-selected");
                    clickOpt.parents("li").addClass("selected");
                    that.selectorCurr.html(selectorTxt).attr("title", selectorTxt);
                    options.node.val(clickOpt.data("val"));
                    if (!options.multiple) that.hide();
                    switch (typeof options.evtChoose) {
                        case "function":
                            options.evtChoose.call(clickOpt,
                                e);
                            break;
                        case "string":
                            eval(options.evtChoose);
                            break
                    }
                    return false
                }
            });
            module.exports = Selector
        })()
    }, {"../Util/Detect": 31, "../Util/Log": 37, "./Widget": 25}],
    22: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Detect = require("../Util/Detect");
            var Swipe = require("../Event/Event");
            var Guid = require("../Util/Guid");
            var Switchable = Widget("V.Switchable", null, {
                options: {
                    _triggers: [],
                    _panels: [],
                    _prev: null,
                    _next: null,
                    nowOn: "",
                    visiNum: 1,
                    viewNum: 1,
                    effect: "default",
                    activeCls: "active",
                    activePannelCls: "active-pannel",
                    autoPlay: false,
                    interval: 1E3,
                    isHover: false,
                    activeIndex: 0,
                    fadeOutSpeed: 700,
                    fadeInSpeed: 700,
                    delay: 500,
                    pervCls: null,
                    nextCls: null,
                    trigger: "click",
                    switchEvent: $.noop,
                    panelCls: ".bd",
                    triggerCls: "",
                    firstCls: "switchable-first",
                    lastCls: "switchable-last",
                    setChildWidth: null,
                    setChildHeight: null,
                    lazyload: true
                }, _init: function (option) {
                    var that = this, options, node, jqWindow = $(window);
                    that.guid = Guid();
                    options = this.setOptions(option);
                    node = that.node = $(options.node);
                    options.pannelDom = $(options.panelCls);
                    options.triggerDom = $(options.triggerCls);
                    options.prevDom = $(options.pervCls);
                    options.nextDom = $(options.nextCls);
                    options.windowBindNS = "resize.switchable_";
                    options.windowBindNS += that.guid;
                    options.windowBindNS += " orientationchange.switchable";
                    options.windowBindNS += that.guid;
                    jqWindow.on(options.windowBindNS, function () {
                        if (jqWindow.width() != that.windowWidth) that._runInit()
                    });
                    that._runInit();
                    return this
                }, _runInit: function () {
                    var that = this;
                    var jqWindow = $(window);
                    that._destory();
                    that.getChildInfo();
                    that.setStyle();
                    that.setWrapWidth();
                    that.bindTriggerEvent();
                    that.bindSwipeEvent();
                    that.autoPlay();
                    that.windowWidth = jqWindow.width()
                }, autoPlay: function () {
                    var that = this;
                    var options = this.options;
                    if (options.autoPlay) {
                        var proxyEvt = $.proxy(this.next, this);
                        options._interval && clearInterval(options._interval);
                        if (!options.isHover) options._interval = setInterval(proxyEvt, options.interval);
                        this.node.off("mouseenter.switchable mouseleave.switchable").on({
                            "mouseenter.switchable": function () {
                                options.isHover = true;
                                clearInterval(options._interval)
                            },
                            "mouseleave.switchable": function () {
                                options.isHover = false;
                                clearInterval(options._interval);
                                options._interval = setInterval(proxyEvt, options.interval)
                            }
                        })
                    }
                }, getChildInfo: function () {
                    var options = this.options;
                    var childWidth = 0;
                    var childHeight = 0;
                    options.childs = options.pannelDom.children();
                    options.firstChild = options.childs.eq(0);
                    var childML = options.firstChild.css("marginLeft");
                    var childMR = options.firstChild.css("marginRight");
                    var childMT = options.firstChild.css("marginTop");
                    var childMB = options.firstChild.css("marginBottom");
                    var childMLR = parseInt(childML != "auto" ? childML : 0) + parseInt(childMR != "auto" ? childMR : 0);
                    var childMTB = parseInt(childMT != "auto" ? childMT : 0) + parseInt(childMB != "auto" ? childMB : 0);
                    if ($.isFunction(options.setChildWidth)) childWidth = options.setChildWidth() + childMLR; else if ($.isNumeric(options.setChildWidth)) childWidth = options.setChildWidth + childMLR; else if (options.effect === "slideX" || options.effect === "slideXLoop") childWidth = this.node.width() / options.visiNum; else childWidth = options.firstChild.width();
                    if ($.isFunction(options.setChildHeight)) childHeight =
                        options.setChildHeight() + childMTB; else if ($.isNumeric(options.setChildHeight)) childHeight = options.setChildHeight + childMTB; else if (options.effect === "slideY" || options.effect === "slideYLoop") childHeight = this.node.height() / options.visiNum; else childHeight = options.firstChild.height();
                    if (options.effect !== "default") {
                        options.pannelDom.children().css("width", childWidth);
                        options.pannelDom.children().css("height", childHeight)
                    }
                    options.childWidth = options.firstChild.outerWidth(true);
                    options.childHeight = childHeight;
                    options.childLen = options.childs.length
                }, setStyle: function () {
                    var that = this;
                    var options = that.options;
                    switch (options.effect) {
                        case "slideXLoop":
                        case "slideYLoop":
                        case "slideX":
                        case "slideY":
                            var pannelDomParent = options.pannelDom.parent();
                            if (pannelDomParent.css("position") != "relative") pannelDomParent.css("position", "relative");
                            if (options.pannelDom.css("position") != "absolute") options.pannelDom.css("position", "absolute");
                            options.pannelDom.children().css("float", "left");
                            break;
                        case "fade":
                            if (options.pannelDom.children().css("position") !=
                                "absolute") options.pannelDom.children().css("position", "absolute");
                            if (that.ieVersion(9)) options.pannelDom.children().eq(options.nowOn || options.activeIndex).siblings().css({"opacity": 0}); else options.pannelDom.children().eq(options.nowOn || options.activeIndex).siblings().css({"display": "none"});
                            break;
                        default:
                            break
                    }
                }, ieVersion: function (version) {
                    var rule1 = !jQuery.browser.msie;
                    var rule2 = jQuery.browser.msie && jQuery.browser.version - 0 >= version;
                    return rule1 || rule2
                }, setWrapWidth: function () {
                    var that = this;
                    var options =
                        that.options;
                    switch (options.effect) {
                        case "slideXLoop":
                        case "slideYLoop":
                            options.childs.slice(0, options.visiNum).clone().addClass("loop_clone_next").appendTo(options.pannelDom);
                            options.childs.slice(options.childLen - options.visiNum).clone().addClass("loop_clone_prev").prependTo(options.pannelDom);
                            if (options.effect == "slideXLoop") options.pannelDom.css({
                                position: "absolute",
                                width: options.childWidth * (options.childLen + options.visiNum * 2),
                                height: options.childHeight,
                                left: -options.childWidth * options.visiNum,
                                top: 0
                            }); else if (options.effect == "slideYLoop") options.pannelDom.css({
                                position: "absolute",
                                width: options.childWidth,
                                height: options.childHeight * (options.childLen + options.visiNum * 2),
                                top: -options.childHeight * options.visiNum,
                                left: 0
                            });
                            break;
                        case "slideX":
                            options.pannelDom.css({width: options.childWidth * options.childLen, left: 0});
                        default:
                            break
                    }
                    return this
                }, bindTriggerEvent: function () {
                    var that = this;
                    var options = that.options;
                    var trigger = options.trigger === "over" ? "mouseenter" : options.trigger;
                    var t;
                    options.nextDom.on("click.switchable",
                        $.proxy(that.next, that));
                    options.prevDom.on("click.switchable", $.proxy(that.prev, that));
                    options.triggerDom.children().on(trigger + ".switchable", function () {
                        var index = $(this).index();
                        if (trigger === "mouseenter") {
                            t && clearTimeout(t);
                            t = setTimeout(function () {
                                that._triggerAddName(index);
                                that.switchTo(index)
                            }, options.delay)
                        } else {
                            that._triggerAddName(index);
                            that.switchTo(index)
                        }
                    });
                    that._triggerAddName(options.nowOn || options.activeIndex);
                    that.switchTo(options.nowOn || options.activeIndex, true);
                    if (trigger === "mouseenter") options.triggerDom.on("mouseleave" +
                        ".switchable", function () {
                        t && clearTimeout(t)
                    });
                    if (options.lazyload) that.lazyload(0);
                    return this
                }, _triggerAddName: function (index) {
                    this.options.triggerDom.children().eq(index).addClass(this.options.activeCls).siblings().removeClass(this.options.activeCls)
                }, bindSwipeEvent: function () {
                    if (Detect.mobile) {
                        var startX, startY;
                        var self = this;
                        var options = this.options;
                        var pannelDom = options.pannelDom;
                        var amount;
                        var direction;
                        var diffX, diffY;
                        var _scrolling;
                        pannelDom.on("tapstart.switchable", function (e) {
                            if (!self.scrolling) {
                                amount =
                                    0;
                                startX = parseInt($(this).css("left")) || 0;
                                startY = parseInt($(this).css("top")) || 0;
                                _scrolling = false
                            } else _scrolling = true;
                            if (options.autoPlay) options._interval && clearInterval(options._interval)
                        }).on("swipe.switchable", function (e, data) {
                            var noFirstLoop;
                            var noLastLoop;
                            var leftFlag, rightFlag, topFlag, bottomFlag;
                            switch (options.effect) {
                                case "slideXLoop":
                                case "slideYLoop":
                                    leftFlag = data.direction == "left";
                                    rightFlag = data.direction == "right";
                                    topFlag = data.direction == "up";
                                    bottomFlag = data.direction == "down";
                                    break;
                                case "slideX":
                                case "slideY":
                                    if (options.nowOn ==
                                        0) noFirstLoop = true;
                                    if (options.nowOn == Math.ceil(options.childLen / options.visiNum) - 1) noLastLoop = true;
                                    leftFlag = data.direction == "left" && !noLastLoop;
                                    rightFlag = data.direction == "right" && !noFirstLoop;
                                    break
                            }
                            if (!_scrolling)if (options.effect == "slideXLoop" || options.effect == "slideX") {
                                if (leftFlag) diffX = startX - data.xAmount; else if (rightFlag) diffX = startX + data.xAmount;
                                if (leftFlag || rightFlag) {
                                    $(this).css("left", diffX);
                                    amount = data.xAmount;
                                    direction = data.direction;
                                    data.e.preventDefault()
                                }
                            } else if (options.effect == "slideYLoop" ||
                                options.effect == "slideY") {
                                if (topFlag) diffY = startY - data.yAmount; else if (bottomFlag) diffY = startY + data.yAmount;
                                if (topFlag || bottomFlag) {
                                    $(this).css("top", diffY);
                                    amount = data.yAmount;
                                    direction = data.direction
                                }
                            }
                        }).on("tapend.switchable", function (e, data) {
                            if (!_scrolling)if (Math.abs(amount) > 80)if (direction == "left" || direction == "up") self.next(); else {
                                if (direction == "right" || direction == "down") self.prev()
                            } else self.switchTo(options.nowOn);
                            self.autoPlay()
                        })
                    }
                }, switchTo: function (i, isAnimate, direction) {
                    var that = this;
                    var options = that.options;
                    var target = i % options.childLen;
                    var pageNums = Math.round(options.childLen / options.visiNum);
                    var animteTime = isAnimate ? 0 : 300;
                    if (this.scrolling && options.effect != "fade")return;
                    if (i === pageNums) target = 0;
                    switch (options.effect) {
                        case "slideXLoop":
                        case "slideYLoop":
                            var transitTo;
                            var orienTo;
                            if (i > options.nowOn && !(direction == "prev" && options.nowOn == 0)) {
                                if (options.effect == "slideXLoop") {
                                    transitTo = {"left": -(i + 1) * options.childWidth * options.visiNum};
                                    orienTo = {
                                        "left": -(target + 1) * options.childWidth *
                                        options.visiNum
                                    }
                                } else {
                                    transitTo = {"top": -(i + 1) * options.childHeight * options.visiNum};
                                    orienTo = {"top": -(target + 1) * options.childHeight * options.visiNum}
                                }
                                that.scrolling = true;
                                options.pannelDom.animate(transitTo, animteTime, function () {
                                    $(this).css(orienTo);
                                    that.triggerAddCls(Math.abs(target));
                                    options.nowOn = target;
                                    that.scrolling = false
                                })
                            } else if (i < options.nowOn || direction == "prev" && options.nowOn == 0) {
                                var orient = i == -1 ? pageNums : i + 1;
                                if (options.effect == "slideXLoop") {
                                    transitTo = {"left": -(i + 1) * options.childWidth * options.visiNum};
                                    orienTo = {"left": -orient * options.childWidth * options.visiNum}
                                } else {
                                    transitTo = {"top": -(i + 1) * options.childHeight * options.visiNum};
                                    orienTo = {"top": -orient * options.childHeight * options.visiNum}
                                }
                                that.scrolling = true;
                                options.pannelDom.animate(transitTo, animteTime, function () {
                                    $(this).css(orienTo);
                                    that.triggerAddCls(i);
                                    options.nowOn = i == -1 ? pageNums - 1 : i;
                                    that.scrolling = false
                                })
                            } else {
                                that.scrolling = true;
                                if (options.effect == "slideXLoop") options.pannelDom.stop(true, false).animate({"left": -(i + 1) * options.childWidth * options.visiNum},
                                    animteTime, function () {
                                        that.scrolling = false
                                    }); else if (options.effect == "slideYLoop") options.pannelDom.stop(true, false).animate({"top": -(i + 1) * options.childHeight * options.visiNum}, animteTime, function () {
                                    that.scrolling = false
                                })
                            }
                            that.pannelAddCls(target + 1);
                            break;
                        case "slideX":
                        case "slideY":
                            var proxyEvt = $.proxy(that.next, that);
                            var animateOption;
                            options._interval && clearInterval(options._interval);
                            if (i < 0)return;
                            if (i == Math.ceil(options.childLen / options.visiNum))return;
                            if (i + options.viewNum > options.childLen)return;
                            if (i <= 0) options.prevDom.addClass(options.firstCls); else options.prevDom.removeClass(options.firstCls);
                            if (i >= Math.ceil(options.childLen / options.visiNum) - 1) options.nextDom.addClass(options.lastCls); else options.nextDom.removeClass(options.lastCls);
                            that.scrolling = true;
                            if (options.effect === "slideX") animateOption = {"left": -i * options.childWidth * options.visiNum}; else animateOption = {"top": -i * options.childHeight * options.visiNum};
                            options.pannelDom.stop(true, false).animate(animateOption, animteTime, function () {
                                that.scrolling =
                                    false;
                                that.triggerAddCls(target);
                                options.nowOn = i
                            });
                            if (options.autoPlay && options.interval) options._interval = setInterval(proxyEvt, options.interval);
                            that.pannelAddCls(target);
                            break;
                        case "fade":
                            that.scrolling = true;
                            that.fadeCallback = function () {
                                that.scrolling = false;
                                that.triggerAddCls(target);
                                options.nowOn = target;
                                that.pannelAddCls(target)
                            };
                            if (that.ieVersion(9)) {
                                options.pannelDom.children().eq(target).siblings().css({"z-index": 1}).stop(true, false).animate({opacity: 0}, options.fadeOutSpeed);
                                options.pannelDom.children().eq(target).css({"z-index": 2}).stop(true,
                                    false).animate({opacity: 1}, options.fadeInSpeed)
                            } else {
                                options.pannelDom.children().eq(target).siblings().stop(true, false).fadeOut(options.fadeOutSpeed);
                                options.pannelDom.children().eq(target).stop(true, false).fadeIn(options.fadeInSpeed)
                            }
                            that.fadeCallback();
                            break;
                        default:
                            that.triggerAddCls(target);
                            options.nowOn = target;
                            options.pannelDom.children().eq(target).show().siblings().hide();
                            that.pannelAddCls(target);
                            break
                    }
                    var I = i % options.childLen;
                    if (I < 0) I = options.childLen - 1;
                    var curTrigger = options.triggerDom.children().eq(I);
                    var curPannel;
                    if (options.effect.indexOf("Loop") > 0) curPannel = options.pannelDom.children().eq(i + 1); else curPannel = options.pannelDom.children().eq(I);
                    if (options.lazyload) that.lazyload(i);
                    options.switchEvent(I, curTrigger, curPannel);
                    that.autoPlay();
                    return this
                }, start: function () {
                    this.autoPlay()
                }, stop: function () {
                    clearInterval(this.options._interval)
                }, lazyload: function (i) {
                    var options = this.options;
                    if (i < 0) this.lazyload(options.childLen - 1);
                    if (!!~options.effect.indexOf("Loop")) i = i + 1;
                    options.pannelDom.children().slice(i *
                        options.visiNum, i * options.visiNum + options.visiNum).find("img.switchable-lazy, img.lazy").each(function (i, n) {
                        var jqN = $(n);
                        jqN.attr("src", jqN.data("original"));
                        jqN.removeClass("switchable-lazy lazy")
                    });
                    return this
                }, prev: function () {
                    var that = this;
                    var options = that.options;
                    var i = options.nowOn;
                    i--;
                    if (i < 0 && (options.effect == "slideXLoop" || (options.effect == "slideYLoop" || options.effect == "fade")));
                    switch (options.effect) {
                        case "slideXLoop":
                        case "slideYLoop":
                        case "slideX":
                        case "slideY":
                            that.switchTo(i, false, "prev");
                            break;
                        default:
                            that.switchTo(i, false, "prev");
                            options.nowOn = i;
                            break
                    }
                    return this
                }, next: function () {
                    var that = this;
                    var options = that.options;
                    var i = options.nowOn;
                    i++;
                    switch (options.effect) {
                        case "slideXLoop":
                        case "slideYLoop":
                        case "slideX":
                        case "slideY":
                            that.switchTo(i);
                            break;
                        default:
                            that.switchTo(i);
                            options.nowOn = i;
                            break
                    }
                    return this
                }, triggerAddCls: function (i) {
                    var that = this;
                    var options = that.options;
                    options.triggerDom.children().eq(i).addClass(options.activeCls).siblings().removeClass(options.activeCls)
                }, pannelAddCls: function (i) {
                    var options =
                        this.options;
                    var pannelChilds = options.pannelDom.children();
                    pannelChilds.removeClass(options.activePannelCls).eq(i * options.visiNum).addClass(options.activePannelCls)
                }, _destory: function () {
                    var options = this.options;
                    var trigger = options.trigger === "over" ? "mouseenter" : options.trigger;
                    options.pannelDom.off("tapstart.switchable").off("swipe.switchable").off("tapend.switchable").children(".loop_clone_prev, .loop_clone_next").remove();
                    options.nextDom.off("click.switchable");
                    options.prevDom.off("click.switchable");
                    options.triggerDom.children().off(trigger + ".switchable");
                    if (trigger === "mouseenter") options.triggerDom.off("mouseleave" + ".switchable");
                    this.node.off("mouseenter.switchable");
                    this.node.off("mouseleave.switchable")
                }, destory: function () {
                    $(window).off(this.options.windowBindNS);
                    this._destory()
                }
            });
            module.exports = Switchable
        })()
    }, {"../Event/Event": 8, "../Util/Detect": 31, "../Util/Guid": 32, "./Widget": 25}],
    23: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Log = require("../Util/Log");
            var Template = Widget("V.Template", null, {
                options: {template: "", replace: true, tagMark: [], arr: []}, _init: function (option) {
                    var options = this.setOptions(option);
                    var tplElem = options.templateElement;
                    if ($.type(tplElem) == "object")if (tplElem.length) options.tpl = tplElem.html(); else {
                        Log("\u7f3a\u5c11\u76ee\u6807template", options);
                        return false
                    } else options.tpl = tplElem;
                    return this
                }, _parser: function (s, n, obj) {
                    var i = obj.i;
                    var result = obj.result;
                    var st = obj.st;
                    var pf;
                    st[obj.i++] = n;
                    if (n.charAt(0) === "/")if (i && "/" + st[i - 1] ===
                        st[i]) result[result.length] = 'return "' + s + '";})})(data.' + n.slice(1) + ")"; else result[result.length] = '+ "' + s + '"})})(data.' + n.slice(1) + ")"; else {
                        pf = i && st[i - 1].charAt(0) === "/" ? "+" : "return ";
                        result[result.length] = pf + '"' + s + '" + (function(data) { return self._objHandle(data,function(data) {'
                    }
                }, _toFunction: function (tpl) {
                    var obj = {st: [], result: [], i: 0};
                    var re_field = /\{#(\/?\w+?)\}/g;
                    var re_var = /\{\$(\w+)}/g;
                    var re_trim = /^\s+|\s+$/g;
                    var i = 0;
                    var match;
                    var result = obj.result;
                    tpl = tpl.replace(/[\n\r]/g, "");
                    tpl = tpl.replace(/(["'])/g,
                        "\\$1");
                    while (match = re_field.exec(tpl)) {
                        this._parser(tpl.slice(i, match.index).replace(re_trim, ""), match[1], obj);
                        i = match.index + match[0].length
                    }
                    if (result.length) {
                        result[result.length] = '+ "' + tpl.slice(i) + '"';
                        result.unshift("var self = this;");
                        result.unshift("var undef = undefined;");
                        result = result.join("")
                    } else result = "var self = this;var undef = undefined;return " + '"' + tpl + '";';
                    return new Function("data", result.replace(re_var, '" + (data.$1 != undef ? data.$1 : "") + "'))
                }, _objHandle: function (data, callback) {
                    var type =
                        {}.toString.call(data);
                    var i;
                    var len;
                    var result = "";
                    if (typeof data === "undefined")return result;
                    switch (type) {
                        case "[object Array]":
                            i = 0, len = data.length;
                            for (; i < len; i++)result += callback(data[i]);
                            break;
                        case "[object Object]":
                            result = callback(data);
                            break
                    }
                    return result
                }, process: function (data) {
                    var options = this.options;
                    if (!this.handle) this.handle = this._toFunction(options.tpl);
                    var result = this.handle(data);
                    if (options.replace === true) options.node.html(result); else if (options.replace === false) options.node.append(result);
                    else return result
                }
            });
            module.exports = Template
        })()
    }, {"../Util/Log": 37, "./Widget": 25}],
    24: [function (require, module, exports) {
        (function () {
            var Widget = require("./Widget");
            var Validation = Widget("V.Validation", null, {
                options: {errStyle: "", susStyle: "", msgType: "after"}, rules: {
                    required: /.+/,
                    email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
                    url: /^((http)|(https)|(ftp)):\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
                    phone: /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,
                    mobile: /^1\d{10}$/,
                    chinese: /^[\u4e00-\u9fa5]+$/,
                    english: /^[A-Za-z]+$/,
                    currency: /^\d+(\.\d+)?$/,
                    birthday: /^((19)|(20))(\d{2})\-((0[1-9])|1[0-2])\-((0[1-9])|([1-2][0-9])|(3[0-1]))$/,
                    birthday8: /^((19)|(20))(\d{2})((0[1-9])|1[0-2])((0[1-9])|([1-2][0-9])|(3[0-1]))$/,
                    qq: /^[1-9]\d{4,13}$/,
                    number: /^\d+$/
                }, fields: [], _init: function (option) {
                    var that = this, target;
                    var options = this.setOptions(option);
                    if (!options.target && !options.node) {
                        VIPSHOP.log("\u7f3a\u5c11\u76ee\u6807form");
                        return false
                    } else target = options.node =
                        options.target ? $(options.target) : options.node;
                    target = target[0];
                    var elemCount = target.elements.length;
                    that.fields = [];
                    for (var i = 0; i < elemCount; i++)that.addField($(target.elements[i]));
                    return that
                }, addField: function (elem) {
                    var that = this;
                    var options = that.options;
                    var fields = that.fields;
                    var op;
                    if (typeof elem == "string") elem = $(elem);
                    if (arguments.length == 1) eval("var op = " + elem.data("valid")); else op = arguments[1];
                    if (typeof op != "undefined") {
                        fields.push({target: elem, option: op});
                        elem.data({index: fields.length - 1}).on("blur",
                            function () {
                                var jqLabel = $("label[for=" + $(this).attr("id") + "]");
                                if ($(this).val() != "") jqLabel.hide(); else jqLabel.show().animate({opacity: 0.5}, 200);
                                that.valid($(this).data("index"))
                            }).on("focus", function () {
                            var jqLabel = $("label[for=" + $(this).attr("id") + "]");
                            if ($(this).val() == "") jqLabel.show().animate({opacity: 0.25}, 200); else jqLabel.hide()
                        }).on("keypress change", function () {
                            var jqLabel = $("label[for=" + $(this).attr("id") + "]");
                            jqLabel.hide()
                        })
                    }
                    return that
                }, valid: function (i) {
                    var that = this, options = that.options,
                        field = that.fields[i], isErr = false, errMsg = "";
                    for (x in field.option) {
                        var val = field.target.val();
                        switch (x) {
                            case "func":
                                isErr = !field.option[x][0].apply(field.target, [val]);
                                if (isErr) errMsg = field.option[x][1];
                                break;
                            case "regex":
                                if (!field.option[x][0].test(val)) {
                                    isErr = true;
                                    errMsg = field.option[x][1]
                                }
                                break;
                            case "equalTo":
                                if (val != $(field.option[x][0]).val()) {
                                    isErr = true;
                                    errMsg = field.option[x][1]
                                }
                                break;
                            case "length":
                                if (val.length < field.option[x][0] || val.length > field.option[x][1]) {
                                    isErr = true;
                                    errMsg = field.option[x][2]
                                }
                                break;
                            case "maxLength":
                                if (val.length > field.option[x][0]) {
                                    isErr = true;
                                    errMsg = field.option[x][1]
                                }
                                break;
                            case "minLength":
                                if (val.length < field.option[x][0]) {
                                    isErr = true;
                                    errMsg = field.option[x][1]
                                }
                                break;
                            case "rang":
                                if (val < field.option[x][0] || val > field.option[x][1]) {
                                    isErr = true;
                                    errMsg = field.option[x][2]
                                }
                                break;
                            case "group":
                                var group = $("input[name='" + field.target.attr("name") + "']:checked");
                                if (group.length < field.option[x][0] || group.length > field.option[x][1]) {
                                    isErr = true;
                                    errMsg = field.option[x][2]
                                }
                                break;
                            case "required":
                                if (val ==
                                    "" || val == "0") {
                                    isErr = true;
                                    errMsg = field.option[x]
                                }
                                break;
                            case "email":
                            case "url":
                            case "phone":
                            case "mobile":
                            case "english":
                            case "chinese":
                            case "currency":
                            case "birthday":
                            case "birthday8":
                            case "number":
                                if (val != "" && !this.rules[x].test(val)) {
                                    isErr = true;
                                    errMsg = field.option[x]
                                }
                                break
                        }
                    }
                    if (!isErr && field.option["cb"]) isErr = field.option["cb"].call(that, field.target, field.option);
                    if (isErr)switch (options.msgType) {
                        case "alert":
                            alert(errMsg);
                            break;
                        case "all":
                        case "inner":
                            field.target.addClass(options.errStyle).removeClass(options.susStyle);
                            if (options.msgType == "inner")break;
                        case "after":
                            var id = field.target.attr("id");
                            var name = field.target.attr("name");
                            id = id || name;
                            if ($("#" + id + "_tip").length == 0) field.target.after('<span id="' + id + '_tip"></span>');
                            $("#" + id + "_tip").addClass(options.errStyle).removeClass(options.susStyle).html(errMsg);
                            break
                    } else switch (options.msgType) {
                        case "all":
                        case "inner":
                            field.target.removeClass(options.errStyle).addClass(options.susStyle);
                            if (options.msgType == "inner")break;
                        case "after":
                            var id = field.target.attr("id");
                            var name = field.target.attr("name");
                            id = id || name;
                            if ($("#" + id + "_tip").length == 0) field.target.after('<span id="' + id + '_tip"></span>');
                            $("#" + id + "_tip").removeClass(options.errStyle).addClass(options.susStyle).html("");
                            break
                    }
                    return isErr
                }, run: function () {
                    var fields = this.fields;
                    var fieldCount = fields.length;
                    var err = false;
                    for (var i = 0; i < fieldCount; i++)if (this.valid(i) || err) err = true;
                    return err
                }, reset: function () {
                    var that = this, options = that.options, fields = that.fields, fieldCount = fields.length;
                    for (var i = 0; i < fieldCount; i++) {
                        var field =
                            fields[i];
                        switch (options.msgType) {
                            case "all":
                            case "inner":
                                field.target.removeClass(options.errStyle + " " + options.susStyle);
                                if (options.msgType == "inner")break;
                            case "after":
                                var id = field.target.attr("id");
                                var name = field.target.attr("name");
                                id = id || name;
                                if ($("#" + id + "_tip").length != 0) $("#" + id + "_tip").removeClass(options.errStyle + " " + options.susStyle).html("");
                                break
                        }
                    }
                }
            });
            module.exports = Validation
        })()
    }, {"./Widget": 25}],
    25: [function (require, module, exports) {
        (function () {
            var namespace = require("../Util/NameSpace")(VIPSHOP);
            var Class = require("../Class/Class");
            var AP = Array.prototype;
            var Widget = function (name, base, prop) {
                var widgetName = name.split(".")[1];
                var baseClass = Class(base);
                var widgetClass = baseClass.extend(prop);
                var ret = namespace(name, function (options) {
                    return new widgetClass(options)
                });
                bridgeTojQuery(widgetName, widgetClass);
                return ret
            };
            var bridgeTojQuery = function (name, widget) {
                jQuery.fn[name] = function (options) {
                    var args = AP.slice.call(arguments, 1);
                    var ret = $(this);
                    this.each(function () {
                        var jqSelf = $(this);
                        var config = $.extend({},
                            options, {node: jqSelf});
                        var dataWidget = "widget_" + name;
                        var _instance = jqSelf.data(dataWidget);
                        if (typeof options == "string" && _instance) {
                            var method = _instance[options];
                            ret = "";
                            if (method) {
                                ret = method.apply(_instance, args);
                                if (ret === _instance || typeof ret === "undefined") ret = $(this)
                            }
                        } else {
                            if (typeof _instance !== "undefined") {
                                _instance.destory && _instance.destory();
                                jqSelf.removeData(dataWidget)
                            }
                            var instance = new widget(config);
                            jqSelf.data(dataWidget, instance);
                            ret = $(this)
                        }
                    });
                    return ret
                };
                jQuery[name] = function (options) {
                    var instance =
                        new widget(options);
                    return instance
                }
            };
            module.exports = Widget
        })()
    }, {"../Class/Class": 1, "../Util/NameSpace": 40}],
    26: [function (require, module, exports) {
        var Listeners = require("./Listeners");
        var template = require("../Lib/artTemplate");
        var Component = function (opt) {
            var config = {
                data: {}, el: null, tmplId: null, async: false, events: {}, init: function () {
                }
            };
            $.extend(config, opt);
            this._init(config)
        };
        $.extend(Component.prototype, {
            config: {}, name: "", level: null, _init: function (opt) {
                var that = this;
                that.config = opt;
                for (var key in that.config) {
                    var itm =
                        that.config[key];
                    switch (key) {
                        case "data":
                            that.$data = itm;
                            break;
                        case "el":
                            that.$el = itm;
                            break;
                        case "tmplId":
                            break;
                        case "init":
                            that.init = itm;
                            that._ready = function () {
                                if (that.config.async) that.init(function () {
                                    that._onInit()
                                }); else {
                                    that.init();
                                    that._onInit()
                                }
                            };
                            break;
                        default:
                            that[key] = itm;
                            break
                    }
                }
                return this
            }, _onInit: function () {
                var that = this;
                this.$data = this.config.data;
                this.$el = $(this.config.el);
                if (this.config.tmplId != null) this.$el.html(template(this.config.tmplId, that.$data));
                for (var n in that.config.events)(function (n) {
                    var fnName =
                        that.config.events[n], fn = that.config[fnName] || that[fnName], i = n.indexOf(" ");
                    if (i == -1) Listeners.sub(n).onsuccess(function (data) {
                        fn.call(that, data)
                    }); else {
                        var ev = n.substring(0, i), selector = n.substring(i + 1);
                        if (fn) that.$el.on(ev, selector, function (ev) {
                            that.trggier = $(this);
                            fn.call(that.trggier, ev, that)
                        })
                    }
                })(n);
                var event = this.name + ".init.success";
                Listeners.pub(event).success()
            }
        });
        module.exports = Component
    }, {"../Lib/artTemplate": 11, "./Listeners": 35}],
    27: [function (require, module, exports) {
        (function () {
            var Class =
                require("../Class/Class");
            var Cookie = Class({
                options: {path: "/", domain: ""}, init: function (options) {
                    this.setOptions(options)
                }, set: function (name, value, domain, path, hour) {
                    if (hour) {
                        var today = new Date;
                        var expire = new Date;
                        expire.setTime(today.getTime() + 36E5 * hour)
                    }
                    var cookieArr = [];
                    var _path = path || this.options.path;
                    var _domain = domain || this.options.domain;
                    cookieArr.push(name + "=" + escape(value) + "; ");
                    cookieArr.push(hour ? "expires=" + expire.toGMTString() + "; " : "");
                    cookieArr.push("path=" + _path + "; ");
                    cookieArr.push("domain=" +
                        _domain + ";");
                    document.cookie = cookieArr.join("");
                    return true
                }, get: function (name) {
                    var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
                    var m = document.cookie.match(r);
                    return unescape(decodeURIComponent(!m ? "" : m[1]))
                }, del: function (name, domain, path) {
                    var cookieArr = [];
                    var _path = path || this.options.path;
                    var _domain = domain || this.options.domain;
                    cookieArr.push(name + "=; ");
                    cookieArr.push("expires=Mon, 26 Jul 1997 05:00:00 GMT; ");
                    cookieArr.push("path=" + _path + "; ");
                    cookieArr.push("domain=" + _domain + ";");
                    document.cookie =
                        cookieArr.join("")
                }
            });
            module.exports = Cookie
        })()
    }, {"../Class/Class": 1}],
    28: [function (require, module, exports) {
        (function () {
            var Messenger = require("../Lib/Messenger");
            var crossStorage = {
                status: "unload",
                iframe: "//s2.vipstatic.com/html/public/helper/crossStorage.html",
                data: null,
                hasSub: false,
                cbList: {},
                cbs: {set: {}, get: {}},
                id: 0,
                loadRes: function (cbObj) {
                    var self = this;
                    if (this.status == "unload") {
                        this.status = "loading";
                        var ifrObj = document.createElement("iframe");
                        ifrObj.src = this.iframe;
                        ifrObj.setAttribute("width", 0);
                        ifrObj.setAttribute("height", 0);
                        ifrObj.setAttribute("style", "display: none");
                        if (ifrObj.attachEvent) ifrObj.attachEvent("onload", function () {
                            self._loadMessenger(ifrObj)
                        }); else ifrObj.onload = function () {
                            self._loadMessenger(ifrObj)
                        };
                        $("body")[0].appendChild(ifrObj)
                    }
                    if (this.status != "loaded") {
                        var cbType = cbObj.type;
                        this.cbList[cbType] = cbObj.func;
                        if (!self.hasSub) {
                            self.hasSub = true;
                            $.Listeners.sub("csHelper").onsuccess(function (data) {
                                var ifrWindow = data.ifrObj.contentWindow;
                                data.messenger = new Messenger("parent",
                                    "CS");
                                data.messenger.addTarget(ifrWindow, "csHelper");
                                data.messenger.listen(self.listeners);
                                self.status = "loaded";
                                self.data = data;
                                for (var i in self.cbList)self.cbList[i](data)
                            })
                        }
                    } else cbObj.func(this.data)
                },
                _loadMessenger: function (ifrObj) {
                    $.Listeners.pub("csHelper").success({ifrObj: ifrObj})
                },
                createId: function () {
                    return ++this.id
                },
                listeners: function (msg) {
                    var self = crossStorage;
                    var msgObj = $.parseJSON(msg);
                    var method = msgObj.method;
                    var key = msgObj.key;
                    var val = msgObj.val;
                    var cbFunc = self.cbs[method][key];
                    var id =
                        msgObj.id;
                    cbFunc[id].cb && cbFunc[id].cb(val);
                    delete cbFunc[id]
                },
                set: function (key, val, expires, cb) {
                    var self = this;
                    if (!cb) {
                        cb = expires;
                        expires = undefined
                    }
                    var id = this.createId();
                    var setObj = {method: "set", id: id, key: key, val: val, expires: expires, cb: cb};
                    var setCbs = self.cbs.set;
                    if (!setCbs[key]) setCbs[key] = {};
                    setCbs[key][id] = setObj;
                    this.loadRes({
                        type: "set", func: function (data) {
                            var messenger = data.messenger;
                            for (var cbKey in setCbs)for (var id in setCbs[cbKey]) {
                                var o = setCbs[cbKey][id];
                                if (!o.hasSend) {
                                    o.hasSend = true;
                                    var s =
                                        $.stringifyJSON(o);
                                    messenger.targets.csHelper.send(s)
                                }
                            }
                        }
                    })
                },
                get: function (key, cb) {
                    var self = this;
                    var id = this.createId();
                    var getObj = {method: "get", id: id, key: key, cb: cb};
                    var getCbs = self.cbs.get;
                    if (!getCbs[key]) getCbs[key] = {};
                    getCbs[key][id] = getObj;
                    this.loadRes({
                        type: "get", func: function (data) {
                            var messenger = data.messenger;
                            for (var cbKey in getCbs)for (var id in getCbs[cbKey]) {
                                var o = getCbs[cbKey][id];
                                if (!o.hasSend) {
                                    o.hasSend = true;
                                    var s = $.stringifyJSON(o);
                                    messenger.targets.csHelper.send(s)
                                }
                            }
                        }
                    })
                },
                _queueGet: {},
                qGet: function (key, cb) {
                    var self = this;
                    var _queueGet = this._queueGet[key] || [0];
                    this._queueGet[key] = _queueGet;
                    _queueGet.push(function (key, cb) {
                        return function () {
                            self.get(key, function (val) {
                                cb(val, function () {
                                    if (_queueGet.length === 0) delete self._queueGet[key]; else _queueGet.shift()()
                                })
                            })
                        }
                    }(key, cb));
                    if (_queueGet[0] === 0) {
                        _queueGet.shift();
                        _queueGet.shift()()
                    }
                }
            };
            module.exports = crossStorage
        })()
    }, {"../Lib/Messenger": 9}],
    29: [function (require, module, exports) {
        (function () {
            function fn_cutString(str, len) {
                if (!str)return "";
                var strlen = 0;
                var s = "";
                for (var i = 0, j = str.length; i < j; i++) {
                    if (str.charCodeAt(i) > 128) strlen += 2; else strlen++;
                    s += str.charAt(i);
                    if (strlen >= len)return s
                }
                return s
            }

            module.exports = fn_cutString
        })()
    }, {}],
    30: [function (require, module, exports) {
        (function () {
            var _now = Date.now || function () {
                    return (new Date).getTime()
                };

            function Debounce(func, wait, immediate) {
                var timeout, args, context, timestamp, result;
                var later = function () {
                    var last = _now() - timestamp;
                    if (last < wait && last >= 0) timeout = setTimeout(later, wait - last); else {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                            if (!timeout) context = args = null
                        }
                    }
                };
                return function () {
                    context = this;
                    args = arguments;
                    timestamp = _now();
                    var callNow = immediate && !timeout;
                    if (!timeout) timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                        context = args = null
                    }
                    return result
                }
            }

            module.exports = Debounce
        })()
    }, {}],
    31: [function (require, module, exports) {
        (function () {
            var browser, version, mobile, os, bit, isIE6, placeholder;
            var ua = window.navigator.userAgent;
            var platform = window.navigator.platform;
            var elem = document.body || document.documentElement;
            var webpCache = {};
            var mobile = false;
            if (/MSIE/.test(ua)) {
                browser = "MSIE";
                if (/IEMobile/.test(ua)) mobile = true;
                version = /MSIE \d+[.]\d+/.exec(ua)[0].split(" ")[1]
            } else if (navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
                browser = "MSIE";
                version = 11
            } else if (/Chrome/.test(ua)) {
                if (/CrOS/.test(ua)) platform = "CrOS";
                browser = "Chrome";
                version = /Chrome\/[\d\.]+/.exec(ua)[0].split("/")[1]
            } else if (/Opera/.test(ua)) {
                browser = "Opera";
                if (/mini/.test(ua) || /Mobile/.test(ua)) mobile =
                    true
            } else if (/Android/.test(ua)) {
                browser = "Android Webkit Browser";
                mobile = true;
                os = /Android\s[\.\d]+/.exec(ua)[0]
            } else if (/Firefox/.test(ua)) {
                browser = "Firefox";
                if (/Fennec/.test(ua)) mobile = true;
                version = /Firefox\/[\.\d]+/.exec(ua)[0].split("/")[1]
            } else if (/Safari/.test(ua)) {
                browser = "Safari";
                if (/iPhone/.test(ua) || (/iPad/.test(ua) || /iPod/.test(ua))) {
                    os = "iOS";
                    mobile = true
                }
            }
            if (!version) {
                version = /Version\/[\.\d]+/.exec(ua);
                if (version) version = version[0].split("/")[1]; else version = undefined
            }
            if (platform === "MacIntel" ||
                platform === "MacPPC") os = "Mac OS X"; else if (platform === "CrOS") os = "ChromeOS"; else if (platform === "Win32" || platform == "Win64") {
                os = "Windows";
                bit = platform.replace(/[^0-9]+/, "")
            } else if (!os && /Android/.test(ua)) os = "Android"; else if (!os && /Linux/.test(platform)) os = "Linux"; else if (!os && /Windows/.test(ua)) os = "Windows";
            if (!mobile && "createTouch" in document) mobile = true;
            isIE6 = browser == "MSIE" && version == "6.0";
            function supportWebP() {
                var elem = document.createElement("canvas");
                if (!!(elem.getContext && elem.getContext("2d")))return elem.toDataURL("image/webp").indexOf("data:image/webp") ==
                    0; else return false
            }

            placeholder = "placeholder" in document.createElement("input");
            var elemStyle = elem.style;
            var transitionProperties = ["webkitTransition", "mozTransition", "oTransition", "msTransition", "transition"];
            var browserPreList = ["-webkit-", "-moz-", "-o-", "-ms-", ""];
            var transition = false;
            var transitionEnd = "";
            var browserPre = "";
            for (var i = 0; i < transitionProperties.length; i++)if (transitionProperties[i] in elemStyle) {
                transition = true;
                transitionEnd = transitionProperties[i] + (i != 4 ? "End" : "end");
                browserPre = browserPreList[i];
                break
            }
            var Detect = {
                ua: ua,
                browser: browser,
                version: version,
                mobile: mobile,
                os: os,
                osbit: bit,
                webp: supportWebP,
                isIE6: isIE6,
                placeholder: placeholder,
                transition: transition,
                transitionEnd: transitionEnd,
                browserPre: browserPre
            };
            if (window.jQuery && !jQuery.browser) {
                var uaMatch = function (ua) {
                    var ua = ua.toLowerCase();
                    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || (/(webkit)[ \/]([\w.]+)/.exec(ua) || (/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || (/(msie) ([\w.]+)/.exec(ua) || (ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                        []))));
                    return {browser: match[1] || "", version: match[2] || "0"}
                }, matched = uaMatch(navigator.userAgent), browser = {};
                if (matched.browser) {
                    browser[matched.browser] = true;
                    browser.version = matched.version
                }
                if (browser.chrome) browser.webkit = true; else if (browser.webkit) browser.safari = true;
                jQuery.browser = browser
            }
            module.exports = Detect
        })()
    }, {}],
    32: [function (require, module, exports) {
        (function () {
            function uuid(len, radix) {
                var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
                var uuid = [], i;
                radix =
                    radix || chars.length;
                if (len)for (i = 0; i < len; i++)uuid[i] = chars[0 | Math.random() * radix]; else {
                    var r;
                    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
                    uuid[14] = "4";
                    for (i = 0; i < 36; i++)if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[i == 19 ? r & 3 | 8 : r]
                    }
                }
                return uuid.join("")
            }

            module.exports = uuid
        })()
    }, {}],
    33: [function (require, module, exports) {
        (function () {
            var hashTable = {};

            function _getHash() {
                var href = decodeURIComponent(location.href);
                var match = href.match(/#(.*)$/);
                if (!match) {
                    hashTable = {};
                    return
                }
                var splits = match[1].split("&");
                var s;
                while (splits.length > 0) {
                    s = splits.shift().split("=");
                    hashTable[s[0]] = s[1]
                }
            }

            function _joinHash() {
                var hashStr = [];
                for (var i in hashTable) {
                    var s = i + "=" + hashTable[i];
                    hashStr.push(s)
                }
                window.location.hash = hashStr.join("&")
            }

            function addHash(hashName, hashValue) {
                _getHash();
                hashTable[hashName] = hashValue;
                _joinHash();
                return this
            }

            function getHash(hashName) {
                _getHash();
                return hashTable[hashName]
            }

            function removeHash(hashName) {
                if (hashTable[hashName]) {
                    delete hashTable[hashName];
                    _joinHash()
                }
                return this
            }

            module.exports = {
                add: addHash,
                get: getHash, remove: removeHash, getTable: hashTable
            }
        })()
    }, {}],
    34: [function (require, module, exports) {
        (function () {
            function isset(obj, propName, expect) {
                if (!obj)return false;
                var pairs = propName.split(".");
                var i = 0;
                var len = pairs.length;
                for (; i < len; i++) {
                    var key = pairs[i];
                    if (typeof obj[key] === "undefined")return false
                }
            }

            module.exports = isset
        })()
    }, {}],
    35: [function (require, module, exports) {
        (function () {
            function Subject(subName, subNameSpace, data) {
                this.subName = subName;
                this.subNameSpace = subNameSpace;
                this.allowSuccessFlag =
                    true;
                this.allowErrorFlag = true;
                this.hasSuccess = subNameSpace[subName]["hasSuccess"] || false;
                this.hasError = subNameSpace[subName]["hasError"] || false;
                this.callbacks = {"onsuccess": new Callbacks, "onerrors": new Callbacks};
                this.data = data || {}
            }

            Subject.prototype = {
                onsuccess: function (callbackFunc) {
                    this._when("onsuccess", callbackFunc);
                    return this
                }, onerror: function (callbackFunc) {
                    this._when("onerrors", callbackFunc);
                    return this
                }, ononce: function (callbackFunc) {
                    this._when("ononce", callbackFunc);
                    return this
                }, trigger: function (type,
                                      data) {
                    var callbacks = this.callbacks, that = this, status;
                    switch (type) {
                        case "onsuccess":
                            status = "hasSuccess";
                            break;
                        case "onerrors":
                            status = "hasError";
                            break;
                        default:
                            break
                    }
                    that[status] = true;
                    if (that[status] && this.allowSuccessFlag) callbacks[type].fire(data)
                }, unsub: function (type) {
                    switch (type) {
                        case "success":
                            this.allowSuccessFlag = false;
                            break;
                        case "error":
                            this.allowErrorFlag = false;
                            break;
                        default:
                            this.allowSuccessFlag = false;
                            this.allowErrorFlag = false
                    }
                }, _when: function (type, callbackFunc) {
                    var callbacks = this.callbacks,
                        status, allow, that = this;
                    switch (type) {
                        case "onsuccess":
                            callbacks["onsuccess"].add(callbackFunc);
                            status = "hasSuccess";
                            allow = "allowSuccessFlag";
                            break;
                        case "onerrors":
                            callbacks["onerrors"].add(callbackFunc);
                            status = "hasError";
                            allow = "allowErrorFlag";
                            break;
                        case "ononce":
                            var i = 0;
                            var subNameList = that.subNameSpace[that.subName].subNameList;
                            var len = callbacks["onsuccess"].list.length;
                            var funcStr = callbackFunc.toString();
                            var lsFuncStr = "";
                            var isSame = false;
                            for (var k in subNameList) {
                                var lsFunc = subNameList[k].callbacks.onsuccess.list[0];
                                var lsFuncStr = lsFunc ? lsFunc.toString() : "";
                                if (funcStr == lsFuncStr) isSame = true
                            }
                            if (!isSame) that._when("onsuccess", callbackFunc); else {
                                status = "hasSuccess";
                                allow = "allowSuccessFlag";
                                type = "onsuccess"
                            }
                            break;
                        default:
                            break
                    }
                    var deps = that.subName.split(",");
                    var doneCount = 0;
                    var extData = {};
                    for (var i = 0, len = deps.length; i < len; i++)if (that.subNameSpace[deps[i]] && that.subNameSpace[deps[i]][status] == true) {
                        extData = $.extend(extData, that.subNameSpace[deps[i]]["data"][type]);
                        doneCount++
                    }
                    if (doneCount == len && that[allow]) callbackFunc(extData)
                }
            };
            function Callbacks() {
                this.list = []
            }

            Callbacks.prototype = {
                add: function (func) {
                    var list = this.list;
                    var type = $.isFunction(func);
                    for (var i = 0, len = list.length + 1; i < len; i++)if (type && func != list[i]) list.push(func)
                }, fire: function () {
                    var list = this.list;
                    var args = arguments;
                    for (var i = 0, len = list.length; i < len; i++)list[i].apply(null, args)
                }
            };
            var Listeners = {
                version: "1.0.1.20130109", subNameSpace: {}, hasPubList: [], subNameList: [], sub: function (subName) {
                    if (typeof subName != "string")return;
                    var subNameSpace = this.subNameSpace, _t = Math.floor(Math.random() *
                        (new Date).getTime() + 1), args = Array.prototype.slice.call(arguments), subjectObj;
                    subName = args.join(",");
                    if (!subNameSpace[subName]) subNameSpace[subName] = {subNameList: {}};
                    subjectObj = new Subject(subName, subNameSpace, subNameSpace[subName].data);
                    subjectObj["_t"] = _t;
                    subNameSpace[subName]["subNameList"]["subjectObj_" + _t] = subjectObj;
                    return subjectObj
                }, _facade: function (subName, type, data) {
                    var subNameSpace = this.subNameSpace, hasState;
                    switch (type) {
                        case "onsuccess":
                            hasState = "hasSuccess";
                            break;
                        case "onerrors":
                            hasState =
                                "hasError";
                            break;
                        default:
                            break
                    }
                    !subNameSpace[subName]["data"] && (subNameSpace[subName]["data"] = {});
                    subNameSpace[subName]["data"][type] = $.extend({}, subNameSpace[subName]["data"][type], data);
                    subNameSpace[subName][hasState] = true;
                    if ($.inArray(subName, this.hasPubList) == -1) this.hasPubList.push(subName);
                    for (var i in subNameSpace) {
                        var count;
                        var arr = i.split(",");
                        var len = count = arr.length;
                        var extData = {};
                        if ($.inArray(subName, arr) != -1) {
                            for (var j = 0; j < len; j++)if ($.inArray(arr[j], this.hasPubList) != -1) {
                                extData = $.extend(extData,
                                    subNameSpace[arr[j]]["data"][type]);
                                count--
                            }
                            if (count == 0)for (var k in subNameSpace[i]["subNameList"])subNameSpace[i]["subNameList"][k].trigger(type, extData)
                        }
                    }
                }, pub: function (subName) {
                    var subNameSpace = this.subNameSpace, callbackType, args = Array.prototype.slice.call(arguments), that = this;
                    for (var i = 0, len = args.length; i < len; i++) {
                        subName = args[i];
                        if (!subNameSpace[subName]) subNameSpace[subName] = {subNameList: {}}
                    }
                    return {
                        success: function (data) {
                            for (var i = 0, len = args.length; i < len; i++)that._facade(args[i], "onsuccess",
                                data);
                            return this
                        }, error: function (data) {
                            for (var i = 0, len = args.length; i < len; i++)that._facade(args[i], "onerrors", data);
                            return this
                        }
                    }
                }, reset: function (subName) {
                    var hasPubList = this.hasPubList;
                    var subNameSpace = this.subNameSpace;
                    var index = $.inArray(subName, hasPubList);
                    if (index != -1) {
                        hasPubList.splice(index, 1);
                        delete subNameSpace[subName];
                        for (var i in subNameSpace) {
                            var tempArr = i.split(",");
                            if ($.inArray(subName, tempArr) != -1) delete subNameSpace[i]["data"]
                        }
                    }
                    return this
                }, unsub: function (subName) {
                    var subNameSpace =
                        this.subNameSpace, facade;
                    if (subNameSpace[subName]) {
                        facade = function (type, key) {
                            if (key) {
                                var _t = key._t;
                                var subjectObj = subNameSpace[subName]["subNameList"]["subjectObj_" + _t];
                                subjectObj.unsub(type)
                            } else for (var i in subNameSpace[subName]["subNameList"])subNameSpace[subName]["subNameList"][i].unsub(type)
                        };
                        return {
                            success: function (key) {
                                facade("success", key);
                                return this
                            }, error: function (key) {
                                facade("error", key);
                                return this
                            }, all: function () {
                                facade();
                                return this
                            }
                        }
                    } else {
                        var rtnNoop = function () {
                            return this
                        };
                        return {
                            success: rtnNoop,
                            error: rtnNoop, all: rtnNoop
                        }
                    }
                }
            };
            module.exports = Listeners
        })()
    }, {}],
    36: [function (require, module, exports) {
        (function () {
            var Loader = {
                _queue: [],
                _modules: [],
                _loaded: {"lazyload": 1},
                _loadedPagelet: [],
                nonce: "",
                pagelet: function (pars) {
                    if (pars.name && this._loadedPagelet[pars.name])return;
                    var loadQueue = [];
                    if (typeof pars.pid != "undefined" && pars.pid != "") pars.pid = $(pars.pid); else pars.pid = $("body");
                    if (typeof pars.css != "undefined" && pars.css.length) this.style(pars.css);
                    if (pars.json) {
                        if (!$.isArray(pars.json)) pars.json = [pars.json];
                        for (var i = 0, len = pars.json.length; i < len; i++)loadQueue.push($.getJSON(pars.json[i]))
                    }
                    if (pars.jsonp) {
                        if (!$.isArray(pars.jsonp)) pars.jsonp = [pars.jsonp];
                        for (var i = 0, len = pars.jsonp.length; i < len; i++) {
                            var rtnDtd = this.jsonp(pars.jsonp[i]);
                            loadQueue.push(rtnDtd)
                        }
                    }
                    if (pars.html) {
                        if (!$.isArray(pars.html)) pars.html = [pars.html];
                        for (var i = 0, len = pars.html.length; i < len; i++) {
                            var rtnDtd = this.loadHtml(pars.html[i]);
                            loadQueue.push(rtnDtd)
                        }
                    }
                    var q = $.when.apply(null, loadQueue);
                    q.then(function () {
                        var dataList = Array.prototype.slice.call(arguments);
                        pars.callback && pars.callback.apply(null, dataList);
                        if (typeof pars.js == "function") pars.js(); else $.Loader.script(pars.js)
                    });
                    if (pars.name) this._loadedPagelet[pars.name] = 1;
                    return this
                },
                style: function (herf) {
                    if (typeof herf === "string") {
                        var styleTag = document.createElement("link");
                        styleTag.setAttribute("rel", "stylesheet");
                        styleTag.setAttribute("href", herf);
                        $("head")[0].appendChild(styleTag)
                    } else if (herf.length > 0)for (var i = 0, j = herf.length; i < j; i++)this.style(herf[i]);
                    return this
                },
                css: function (cssurl, callback) {
                    var node =
                        document.createElement("link");
                    node.setAttribute("rel", "stylesheet");
                    node.setAttribute("type", "text/css");
                    node.setAttribute("href", $.trim(cssurl));
                    document.body.appendChild(node);
                    this._styleOnload(node, function () {
                        callback && callback()
                    })
                },
                _styleOnload: function (node, callback) {
                    var self = this;
                    if (node.attachEvent) node.attachEvent("onload", callback); else setTimeout(function () {
                        self._poll(node, callback)
                    }, 0)
                },
                _poll: function (node, callback) {
                    var self = this;
                    if (callback.isCalled)return;
                    var isLoaded = false;
                    if (/webkit/i.test(navigator.userAgent)) {
                        if (node["sheet"]) isLoaded =
                            true
                    } else if (node["sheet"])try {
                        if (node["sheet"].cssRules) isLoaded = true
                    } catch (ex) {
                        if (ex.code === 1E3) isLoaded = true
                    }
                    if (isLoaded) setTimeout(function () {
                        callback()
                    }, 1); else setTimeout(function () {
                        self._poll(node, callback)
                    }, 1)
                },
                script: function (src) {
                    if (typeof src === "string") $.ajax({
                        url: $.trim(src),
                        dataType: "script",
                        cache: true,
                        nonce: this.nonce
                    }); else if (src.length > 0)for (var i = 0, j = src.length; i < j; i++)this.script(src[i]);
                    return this
                },
                jsonp: function (src) {
                    var dtd = $.Deferred();
                    if (typeof src === "object") {
                        var fetchJsonp =
                            $.ajax({
                                url: $.trim(src.url),
                                data: src.data || "",
                                dataType: "jsonp",
                                cache: src.cache || false,
                                jsonp: src.jsonp || "callback",
                                jsonpCallback: src.jsonpCallback || "",
                                nonce: src.nonce || "",
                                success: function (data) {
                                    src.success && src.success(data);
                                    dtd.resolve(data)
                                }
                            });
                        fetchJsonp.complete(function () {
                            dtd.resolve()
                        })
                    } else dtd.resolve();
                    return dtd.promise()
                },
                loadHtml: function (src) {
                    var dtd = $.Deferred();
                    var aTag = document.createElement("a");
                    var pathname, cbName;
                    aTag.setAttribute("href", src);
                    pathname = aTag.pathname;
                    cbName = pathname.replace("/public",
                        "").replace(/[\/\.]/g, "_").replace(/^_/, "");
                    $.ajax({
                        url: src,
                        dataType: "jsonp",
                        jsonp: "callback",
                        jsonpCallback: cbName,
                        cache: true,
                        success: function (data) {
                            dtd.resolve(data)
                        }
                    });
                    return dtd.promise()
                },
                advScript: function () {
                    for (var i = 0, j = arguments.length; i < j; i++) {
                        var module = $.extend({}, arguments[i], {req: 0});
                        if (this._loaded[module.name])continue;
                        this._modules[module.name] = module;
                        if ($.isArray(module.requires) && module.requires.length > 0) module.req = module.requires.length;
                        if (module.nonce) this.nonce = module.nonce;
                        this._queue.push(module)
                    }
                    this._Execute();
                    return this
                },
                _Execute: function () {
                    if (this._queue.length <= 0)return;
                    var index = 0;
                    var src;
                    while (src = this._queue[index]) {
                        if (this._loaded[src.name]) {
                            this._queue.splice(index, 1);
                            continue
                        }
                        if ($.isArray(src.requires) && src.requires.length > 0)for (var i = 0, j = src.requires.length; i < j; i++)if (this._loaded[src.requires[i]]) {
                            src.req--;
                            src.requires.splice(i, 1);
                            i--
                        }
                        if (src.req > 0) {
                            index++;
                            continue
                        }
                        if (src.url) {
                            this._queue.splice(index, 1);
                            $.ajax({
                                url: $.trim(src.url),
                                dataType: "script",
                                context: {name: src.name},
                                cache: true,
                                nonce: this.nonce,
                                success: function () {
                                    Loader._loaded[this.name] = 1;
                                    Loader._Execute()
                                }
                            })
                        } else {
                            src.def && src.def();
                            this._loaded[src.name] = 1;
                            this._queue.splice(index, 1)
                        }
                    }
                }
            };
            module.exports = Loader
        })()
    }, {}],
    37: [function (require, module, exports) {
        (function () {
            var log = function (msg) {
                if (window["console"])try {
                    console["log"].apply(console, arguments)
                } catch (e) {
                    console["log"](msg)
                }
                return this
            };
            module.exports = log
        })()
    }, {}],
    38: [function (require, module, exports) {
        var Listeners = require("./Listeners");
        var defaltModfel = {
            data: {}, config: {}, init: function () {
            },
            _onInit: function () {
                var that = this;
                for (var n in that.events)(function (n) {
                    var fnName = that.events[n], fn = that[fnName];
                    Listeners.sub(n).onsuccess(function (data) {
                        fn.call(that, data)
                    })
                })(n);
                var event = this.name + "Model.init.success";
                Listeners.pub(event).success()
            }
        };
        var Model = {
            extend: function (opt) {
                var m = $.extend(true, {}, defaltModfel, opt);
                m.init = function (initData) {
                    var ex = opt.init(initData);
                    m = $.extend(true, {}, m, ex);
                    m._onInit()
                };
                return m
            }
        };
        var MV = {Model: Model};
        module.exports = MV
    }, {"./Listeners": 35}],
    39: [function (require,
                   module, exports) {
        (function () {
            var Log = require("./Log");
            var Listeners = require("./Listeners");
            var Collection = {};
            var errorMsg = "depMods only accept string type value!";
            var Mod = {
                get: function (modName) {
                    return modName ? Collection[modName] : Collection
                }, add: function (modName, ready, depMods) {
                    depMods = depMods || "";
                    ready = ready || 1;
                    if ($.type(depMods) != "string") Log(errorMsg);
                    Collection[modName] = {"level": ready, "depMods": depMods}
                }, init: function () {
                    for (var modName in Collection) {
                        var curMod = Collection[modName];
                        var Listenfunc =
                            function (modName) {
                                return function () {
                                    eval(modName + ".init()")
                                }
                            }(modName);
                        if (!curMod.depMods) {
                            var levelMaps = {1: "ready.first", 2: "ready.second", 3: "ready.third"};
                            var levelName = levelMaps[curMod.level];
                            Listeners.sub(levelName).onsuccess(Listenfunc)
                        } else Listeners.sub(curMod.depMods).onsuccess(Listenfunc)
                    }
                }
            };
            module.exports = Mod
        })()
    }, {"./Listeners": 35, "./Log": 37}],
    40: [function (require, module, exports) {
        (function () {
            var NS = function (root) {
                var namespace = function (str, val) {
                    var arr = str.split(".");
                    var _root = root;
                    var i =
                        arr[0] == "V" ? "1" : 0;
                    var len = arr.length;
                    for (; i < len; i++) {
                        _root[arr[i]] = _root[arr[i]] || {};
                        if (i == len - 1 && typeof val !== "undefined") _root[arr[i]] = val;
                        _root = _root[arr[i]]
                    }
                    return _root
                };
                return namespace
            };
            module.exports = NS
        })()
    }, {}],
    41: [function (require, module, exports) {
        var Listeners = require("./Listeners");
        var PageRoot = function (customConfig) {
            this._init(customConfig)
        };
        PageRoot.extend = function (customConfig) {
            return new Component(customConfig)
        };
        PageRoot.component = function (name, component, customConfig) {
            PageRoot.prototype.addComponent(name,
                component, customConfig)
        };
        var levelMaps = {1: "ready.first", 2: "ready.second", 3: "ready.third"};
        $.extend(PageRoot.prototype, {
            config: {data: {}, el: "body", tmplId: null}, $children: {}, _init: function (opt) {
                var that = this;
                $.extend(that.config, opt);
                this._bindListener()
            }, addComponent: function (name, component, opt) {
                var set = {level: 1};
                $.extend(set, opt);
                component.name = name;
                component.level = set.level;
                this.$children[name] = component
            }, _bindListener: function () {
                var that = this;
                for (var modName in that.$children) {
                    var curMod = that.$children[modName];
                    var Listenfunc = function (modName) {
                        return function () {
                            that.$children[modName]._ready()
                        }
                    }(modName);
                    var levelName = levelMaps[curMod.level];
                    Listeners.sub(levelName).onsuccess(Listenfunc)
                }
            }
        });
        module.exports = PageRoot
    }, {"./Listeners": 35}],
    42: [function (require, module, exports) {
        (function () {
            var Cookie = require("../Util/Cookie");
            var stringifyJSON = require("../Lib/StringifyJSON");
            var cookie = new Cookie({path: "/", domain: ".vip.com"});
            var Report = {
                onError: function (msg, fileUrl, fileLine) {
                    var that = this;
                    var _ua = navigator.userAgent,
                        target, mouseX, mouseY, docST = $(document).scrollTop(), docSL = $(document).scrollLeft(), errorContent;
                    $(function () {
                        $(document).mousemove(function (e) {
                            target = e.target;
                            mouseX = e.pageX;
                            mouseY = e.pageY
                        });
                        setTimeout(function () {
                            errorContent = {
                                fileUrl: fileUrl,
                                fileLine: fileLine,
                                exception_info: encodeURIComponent(msg),
                                docST: docST,
                                docSL: docSL,
                                target: target,
                                mouseX: mouseX,
                                mouseY: mouseY
                            };
                            var protocal = document.location.href.toLowerCase().indexOf("https://") !== -1 ? "https://" : "http://";
                            var params = {
                                client: "pc", ua: navigator.userAgent,
                                mid: cookie.get("mars_cid")
                            };
                            $.extend(params, errorContent);
                            var url = protocal + "stat.vipstatic.com/h5front/report?" + $.param(params) + "&r=" + Math.random();
                            if (url.length > 2083) url.substr(0, 2082);
                            var img = new Image(1, 1);
                            img.onload = img.onerror = img.onabort = function () {
                                img.onload = img.onerror = img.onabort = null;
                                img = null
                            };
                            img.src = url
                        }, 10)
                    })
                }
            };
            module.exports = Report
        })()
    }, {"../Lib/StringifyJSON": 10, "../Util/Cookie": 27}],
    43: [function (require, module, exports) {
        (function () {
            var detect = require("./Detect");
            var Storage = function () {
                var rule1 =
                    detect.browser != "MSIE";
                var rule2 = detect.browser == "MSIE" && detect.version - 0 >= 8;
                if (rule1 || rule2) {
                    try {
                        localStorage.setItem("localStorageTest", 1)
                    } catch (e) {
                        return {set: $.noop, get: $.noop, remove: $.noop}
                    }
                    localStorage.removeItem("localStorageTest")
                }
                if (window.localStorage)return function () {
                    var method = {
                        set: function (key, value, expires) {
                            var v = [];
                            if (expires) {
                                var d = (new Date).getTime();
                                v.push({"expires": d + expires * 1E3})
                            }
                            v.push(value);
                            localStorage.setItem(key, $.stringifyJSON(v))
                        }, get: function (key) {
                            var value = localStorage.getItem(key);
                            if (value == null || value == undefined) {
                                value = "";
                                return value
                            }
                            try {
                                value = $.parseJSON(value)
                            } catch (e) {
                            }
                            if (typeof value != "object")return value;
                            if ($.type(value[0]) == "string")return value[0];
                            if ($.type(value) == "object")return value;
                            var expires = value[0] && value[0].expires;
                            if (expires && /^\d{13,}$/.test(expires)) {
                                var d = (new Date).getTime();
                                if (expires <= d) {
                                    localStorage.removeItem(key);
                                    return ""
                                }
                                value.shift()
                            }
                            return value[0]
                        }, remove: function (key) {
                            localStorage.removeItem(key)
                        }
                    };
                    var d = (new Date).getTime();
                    for (var key in localStorage) {
                        var v =
                            localStorage.getItem(key);
                        try {
                            v = $.parseJSON(v)
                        } catch (e) {
                        }
                        if (Object.prototype.toString.call(v).toLowerCase().indexOf("array") > 0) {
                            var expires = v[0] && v[0].expires;
                            if (expires && (/^\d{13,}$/.test(expires) && expires <= d)) localStorage.removeItem(key)
                        }
                    }
                    return method
                }(); else return function () {
                    var storage = null;
                    var hostName = "vip.com";

                    function buildInput() {
                        try {
                            if (!storage) {
                                storage = document.createElement("INPUT");
                                storage.type = "hidden";
                                storage.style.display = "none";
                                storage.addBehavior("#default#userData");
                                document.body.appendChild(storage);
                                var expires = new Date;
                                expires.setDate(expires.getDate() + 365);
                                storage.expires = expires.toUTCString()
                            }
                        } catch (e) {
                            VIPSHOP.log(e);
                            return
                        }
                    }

                    return {
                        set: function (key, value, expires) {
                            buildInput();
                            var v = [];
                            if (expires) {
                                var d = (new Date).getTime();
                                v.push({"expires": d + expires * 1E3})
                            }
                            v.push(value);
                            storage.load(hostName);
                            storage.setAttribute("_" + key, $.stringifyJSON(v));
                            storage.save(hostName)
                        }, get: function (key) {
                            buildInput();
                            storage.load(hostName);
                            if (key === "")return "";
                            var value = storage.getAttribute(key);
                            if (value == null ||
                                value == undefined) {
                                value = "";
                                return value
                            }
                            try {
                                value = $.parseJSON(value)
                            } catch (e) {
                            }
                            if ($.type(value[0]) == "string")return value[0];
                            if ($.type(value) == "object")return value;
                            if (typeof value != "object")return value;
                            var expires = value[0].expires;
                            if (expires && /^\d{13,}$/.test(expires)) {
                                var d = (new Date).getTime();
                                if (expires <= d) {
                                    storage.load(hostName);
                                    storage.removeAttribute("_" + key);
                                    storage.save(hostName);
                                    return ""
                                }
                                value.shift()
                            }
                            return value[0]
                        }, remove: function (key) {
                            buildInput();
                            storage.load(hostName);
                            storage.removeAttribute("_" +
                                key);
                            storage.save(hostName)
                        }
                    }
                }()
            }();
            module.exports = Storage
        })()
    }, {"./Detect": 31}],
    44: [function (require, module, exports) {
        (function () {
            var _now = Date.now || function () {
                    return (new Date).getTime()
                };

            function Throttle(func, wait, options) {
                var context, args, result;
                var timeout = null;
                var previous = 0;
                if (!options) options = {};
                var later = function () {
                    previous = options.leading === false ? 0 : _now();
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null
                };
                return function () {
                    var now = _now();
                    if (!previous && options.leading ===
                        false) previous = now;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0 || remaining > wait) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null
                        }
                        previous = now;
                        result = func.apply(context, args);
                        if (!timeout) context = args = null
                    } else if (!timeout && options.trailing !== false) timeout = setTimeout(later, remaining);
                    return result
                }
            }

            module.exports = Throttle
        })()
    }, {}],
    45: [function (require, module, exports) {
        (function () {
            var Cookie = require("./Cookie");
            Cookie = new Cookie({path: "/", domain: ".vip.com"});
            var Time = {};
            var _Globals = {"VipDFT": parseInt(Cookie.get("VipDFT"))};
            var hasRegulate = false;
            Time.fn_countDown = function (timestamp, opt) {
                var set = {calibration: true};
                $.extend(set, opt);
                var nowTime = Math.round((new Date).getTime() / 1E3);
                var recoup = _Globals["VipDFT"] ? _Globals["VipDFT"] : 0;
                if (arguments.length > 1 && typeof arguments[1] == "number")var lastTime = nowTime - recoup - arguments[1]; else var lastTime = timestamp - nowTime - recoup;
                var rt = {};
                if (lastTime > 0) {
                    rt.day = Math.floor(lastTime / 86400);
                    if (set.calibration && (!hasRegulate && rt.day >
                        20)) {
                        hasRegulate = true;
                        jQuery.ajax({
                            url: "//www.vip.com/index-ajax.php",
                            data: {act: "getServerTime"},
                            dataType: "jsonp",
                            success: function (data) {
                                _Globals["VipDFT"] = data.time - nowTime;
                                jQuery.Cookie.set("VipDFT", _Globals["VipDFT"])
                            }
                        });
                        return {day: "-", hour: "-", min: "-", sec: "-"}
                    }
                    var day_timestamp = 86400 * rt.day;
                    var v = "00" + Math.floor((lastTime - day_timestamp) / 3600);
                    rt.hour = v.substring(v.length - 2);
                    var hour_timestamp = 3600 * rt.hour;
                    var v = "00" + Math.floor((lastTime - day_timestamp - hour_timestamp) / 60);
                    rt.min = v.substring(v.length -
                        2);
                    var v = "00" + (lastTime - day_timestamp - hour_timestamp - 60 * rt.min);
                    rt.sec = v.substring(v.length - 2)
                } else {
                    rt.day = 0;
                    rt.hour = 0;
                    rt.min = 0;
                    rt.sec = 0
                }
                return rt
            };
            Time.parse = function (dateStr) {
                return Date.parse(dateStr.replace(/-/g, "/"))
            };
            Time.get = function (timeStamp, formatStr) {
                var T = timeStamp ? new Date(timeStamp) : new Date;
                var timeTmp = [];
                var patterns = /[YMDHmS]/g;
                var cursor = 0;
                var match;
                while (match = patterns.exec(formatStr)) {
                    var linker = formatStr.slice(cursor, match.index);
                    add(linker)(match[0], true);
                    cursor = match.index +
                        match[0].length
                }
                function add(str, isMatch) {
                    if (isMatch) timeTmp.push(convert(str)); else timeTmp.push(str);
                    return add
                }

                function convert(str) {
                    switch (str) {
                        case "Y":
                            return T.getFullYear();
                            break;
                        case "M":
                            return T.getMonth() + 1;
                            break;
                        case "D":
                            return T.getDate();
                            break;
                        case "H":
                            return T.getHours();
                            break;
                        case "m":
                            return T.getMinutes();
                            break;
                        case "S":
                            return T.getSeconds();
                            break;
                        default:
                            break
                    }
                }

                timeTmp.shift();
                return timeTmp.join("")
            };
            Time.getTime = function (diffTime, cb) {
                var nowTime = Math.round((new Date).getTime() /
                    1E3);
                var recoup = _Globals["VipDFT"] ? _Globals["VipDFT"] : 0;
                if (Math.abs(recoup) > diffTime) $.ajax({
                    url: "//www.vip.com/index-ajax.php",
                    data: {act: "getServerTime"},
                    dataType: "jsonp",
                    success: function (data) {
                        var diffTime = new Date - data.time;
                        var hostname = location.hostname;
                        $.Cookie.set("VipDFT", diffTime, hostname, "/", 1);
                        cb && cb(data.time)
                    }
                }); else cb(nowTime - recoup)
            };
            Time.diff = function (timestamp) {
                var re = "", rt = Time.fn_countDown(timestamp, {calibration: false});
                rt.day = parseInt(rt.day);
                rt.hour = parseInt(rt.hour);
                rt.min = parseInt(rt.min);
                rt.sec = parseInt(rt.sec);
                if (rt.day) {
                    if (rt.hour || (rt.min || rt.sec)) ++rt.day;
                    re = "\u5269" + rt.day + "\u5929"
                }
                if (!rt.day && rt.hour) {
                    if (rt.min || rt.sec) ++rt.hour;
                    re = "\u5269" + rt.hour + "\u65f6"
                }
                if (!rt.day && (!rt.hour && rt.min)) {
                    if (rt.sec) ++rt.min;
                    re = "\u5269" + rt.min + "\u5206"
                }
                if (!rt.day && (!rt.hour && (!rt.min && rt.sec)) || !rt.day && (!rt.hour && (!rt.min && !rt.sec))) re = "\u52691\u5206";
                return re
            };
            module.exports = Time
        })()
    }, {"./Cookie": 27}],
    46: [function (require, module, exports) {
        (function () {
            function Url(uri) {
                if (!uri) uri = location.href;
                uri = decodeURI(uri);
                var tag = document.createElement("a");
                var rt = {};
                tag.href = uri;
                rt.protocol = tag.protocol;
                rt.hostname = tag.hostname;
                rt.port = tag.port;
                rt.pathname = tag.pathname;
                rt.search = tag.search;
                rt.hash = tag.hash;
                rt.host = tag.host;
                rt.domain = tag.hostname;
                return rt
            }

            module.exports = Url
        })()
    }, {}],
    47: [function (require, module, exports) {
        (function () {
            var Collection = {};
            var lastMethods = {
                set: function (currObj, key, value) {
                    currObj[key] = value;
                    return currObj[key]
                }, get: function (currObj, key) {
                    return currObj[key]
                }, del: function (currObj,
                                  key) {
                    delete currObj[key]
                }, add: function (currObj, key, value) {
                    currObj[key] = $.extend(currObj[key], value)
                }
            };
            var objCtrl = function (type, variable, value) {
                var varArr = variable.split(".");
                var currObj = Collection;
                var lastEvt = lastMethods[type];
                for (var i = 0, len = varArr.length; i < len; i++)if (i == len - 1)return lastEvt(currObj, varArr[i], value); else {
                    if (type == "get" && !currObj[varArr[i]])return;
                    if ($.type(currObj[varArr[i]]) == "object") currObj[varArr[i]] = currObj[varArr[i]]; else currObj[varArr[i]] = {};
                    currObj = currObj[varArr[i]]
                }
            };
            var Var = {
                set: function (variable, value) {
                    return objCtrl("set", variable, value)
                }, get: function (variable) {
                    return objCtrl("get", variable)
                }, del: function (variable) {
                    return objCtrl("del", variable)
                }, add: function (variable, value) {
                    objCtrl("add", variable, value)
                }
            };
            module.exports = Var
        })()
    }, {}],
    48: [function (require, module, exports) {
        (function () {
            var queryStringToJSON = function (url) {
                if (url === "")return "";
                var pairs = (url || location.search).replace(/^\?/, "").split("&");
                var result = {};
                for (var i = 0, len = pairs.length; i < len; i++) {
                    var pair =
                        pairs[i].split("=");
                    if (!!pair[0]) result[pair[0]] = decodeURIComponent(pair[1] || "")
                }
                return result
            };
            module.exports = queryStringToJSON
        })()
    }, {}],
    49: [function (require, module, exports) {
        window.VIPSHOP = window.VIPSHOP || {
                apiHost: "//w2.vip.com",
                commonHost: "//common.vip.com",
                cartHost: "//cart.vip.com/te2",
                checkoutHost: "//checkout.vip.com/te2",
                detailHost: "//www.vip.com",
                listHost: "//www.vip.com",
                frontHost: "//www.vip.com",
                staticHost: "//s2.vipstatic.com",
                staticCss: "//s2.vipstatic.com/css/public",
                staticImg: "//s2.vipstatic.com/img",
                staticJs: "//s2.vipstatic.com/js/public",
                userHost: "https://passport.vip.com",
                user_profile_api: "//reco.api.vip.com:8050",
                bootstrapHost: "//bootstrap.vipstatic.com",
                catStaticHost: "//category.vipstatic.com",
                globalStaticHost: "//global.vipstatic.com",
                homeStaticHost: "//home.vipstatic.com",
                beautyStaticHost: "//beauty.vipstatic.com",
                ugcStaticHost: "//ugc.vipstatic.com",
                memberStaticHost: "//member.vipstatic.com",
                ccpStaticHost: "//ccp.vipstatic.com",
                payStaticHost: "//pay-static.vip.com",
                kidStaticHost: "//kid.vipstatic.com",
                pmsHost: "//pms.vip.com",
                config: {pmsHost: "//pms.vip.com"}
            };
        VIPSHOP.core3 = true;
        var Class = require("./Class/Class");
        var Loader = require("./Util/Loader");
        var Cookie = require("./Util/Cookie");
        var Time = require("./Util/Time");
        var Hash = require("./Util/Hash");
        var Log = require("./Util/Log");
        var NS = require("./Util/NameSpace");
        var Url = require("./Util/Url");
        var Mod = require("./Util/Mod");
        var Var = require("./Util/Var");
        var Guid = require("./Util/Guid");
        var Isset = require("./Util/Isset");
        var Detect = require("./Util/Detect");
        var Storage = require("./Util/Storage");
        var Listeners = require("./Util/Listeners");
        var Switchable = require("./UI/Switchable");
        var Selector = require("./UI/Selector");
        var Template = require("./UI/Template");
        var artTemplate = require("./Lib/artTemplate.js");
        var Lazyload = require("./Lib/lazyload.js");
        var Dialog = require("./UI/Dialog");
        var Button = require("./UI/Button");
        var Form = require("./UI/Form");
        var DatePicker = require("./UI/DatePicker");
        var Lazydom = require("./UI/Lazydom");
        var Scrollspy = require("./UI/Scrollspy");
        var Validation = require("./UI/Validation");
        var Placeholder = require("./UI/Placeholder");
        var Messenger = require("./Lib/messenger");
        var stringifyJSON = require("./Lib/StringifyJSON");
        var CrossStorage = require("./Util/CrossStorage");
        var Throttle = require("./Util/Throttle");
        var Debounce = require("./Util/Debounce");
        var CutString = require("./Util/CutString");
        var queryStringToJSON = require("./Util/queryStringToJSON");
        var Report = require("./Util/Report");
        var Event = require("./Event/Event");
        var PageRoot = require("./Util/PageRoot");
        var Component = require("./Util/Component");
        var MV = require("./Util/MV");
        var Login = require("./Component/Login");
        var Share = require("./Component/Share");
        var OnlineService = require("./Component/OnlineService");
        var Member = require("./Component/Member");
        var UINFO = require("./Component/UINFO");
        var Ready = require("./Component/Ready");
        VIPSHOP.Class = Class;
        VIPSHOP.Time = Time;
        VIPSHOP.Hash = Hash;
        VIPSHOP.log = Log;
        VIPSHOP.report = Report;
        VIPSHOP.NS = NS(VIPSHOP);
        VIPSHOP.Url = Url;
        VIPSHOP.isset = Isset;
        VIPSHOP.Detect = Detect;
        VIPSHOP.guid =
            Guid;
        VIPSHOP.Throttle = Throttle;
        VIPSHOP.Debounce = Debounce;
        VIPSHOP.Share = Share;
        VIPSHOP.OnlineService = OnlineService;
        VIPSHOP.Member = VIPSHOP.member = Member;
        VIPSHOP.UINFO = window.UINFO = UINFO;
        VIPSHOP.CutString = CutString;
        VIPSHOP.login = Login.login;
        VIPSHOP.setPwd = Login.setPwd;
        VIPSHOP.queryStringToJSON = queryStringToJSON;
        jQuery.Loader = Loader;
        jQuery.stringifyJSON = stringifyJSON;
        jQuery.Storage = Storage;
        jQuery.crossStorage = CrossStorage;
        jQuery.Validation = Validation;
        jQuery.Listeners = Listeners;
        jQuery.Messenger = Messenger;
        jQuery.Template = Template;
        jQuery.Tpl = artTemplate;
        jQuery.Form = Form;
        jQuery.Mod = Mod;
        jQuery.PageRoot = PageRoot;
        jQuery.Component = Component;
        jQuery.MV = MV;
        jQuery.Var = Var;
        jQuery.Cookie = new Cookie({path: "/", domain: ".vip.com"});
        if (typeof actErrlogTurnon == "number" && actErrlogTurnon == 1) window.onerror = Report.onError;
        VIPSHOP.isIE6 = VIPSHOP.Detect.isIE6
    }, {
        "./Class/Class": 1,
        "./Component/Login": 2,
        "./Component/Member": 3,
        "./Component/OnlineService": 4,
        "./Component/Ready": 5,
        "./Component/Share": 6,
        "./Component/UINFO": 7,
        "./Event/Event": 8,
        "./Lib/StringifyJSON": 10,
        "./Lib/artTemplate.js": 11,
        "./Lib/lazyload.js": 12,
        "./Lib/messenger": 13,
        "./UI/Button": 14,
        "./UI/DatePicker": 15,
        "./UI/Dialog": 16,
        "./UI/Form": 17,
        "./UI/Lazydom": 18,
        "./UI/Placeholder": 19,
        "./UI/Scrollspy": 20,
        "./UI/Selector": 21,
        "./UI/Switchable": 22,
        "./UI/Template": 23,
        "./UI/Validation": 24,
        "./Util/Component": 26,
        "./Util/Cookie": 27,
        "./Util/CrossStorage": 28,
        "./Util/CutString": 29,
        "./Util/Debounce": 30,
        "./Util/Detect": 31,
        "./Util/Guid": 32,
        "./Util/Hash": 33,
        "./Util/Isset": 34,
        "./Util/Listeners": 35,
        "./Util/Loader": 36,
        "./Util/Log": 37,
        "./Util/MV": 38,
        "./Util/Mod": 39,
        "./Util/NameSpace": 40,
        "./Util/PageRoot": 41,
        "./Util/Report": 42,
        "./Util/Storage": 43,
        "./Util/Throttle": 44,
        "./Util/Time": 45,
        "./Util/Url": 46,
        "./Util/Var": 47,
        "./Util/queryStringToJSON": 48
    }]
}, {}, [49]);