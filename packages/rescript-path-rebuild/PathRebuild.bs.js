// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Path = require("path");
var Js_exn = require("@rescript/std/lib/js/js_exn.js");
var Caml_array = require("@rescript/std/lib/js/caml_array.js");
var Caml_splice_call = require("@rescript/std/lib/js/caml_splice_call.js");

function $$int(str) {
  var result = Number(str);
  var result$p = result | 0;
  if (result === result$p) {
    return result$p;
  }
  
}

function commit(result, status) {
  switch (status.TAG | 0) {
    case /* L */0 :
        var s = status._0;
        if (s === "") {
          return {
                  TAG: /* Ok */0,
                  _0: result
                };
        } else {
          return {
                  TAG: /* Ok */0,
                  _0: result.concat({
                        TAG: /* Literal */1,
                        _0: s
                      })
                };
        }
    case /* S */1 :
        return Js_exn.raiseError("Cannot commit a Skip");
    case /* I */2 :
        var n = status._0;
        var n$p = $$int(n);
        if (n$p !== undefined) {
          return {
                  TAG: /* Ok */0,
                  _0: result.concat({
                        TAG: /* Range */0,
                        _0: n$p,
                        _1: n$p
                      })
                };
        } else {
          return {
                  TAG: /* Error */1,
                  _0: "Bad range limit: " + n
                };
        }
    case /* D */3 :
        return Js_exn.raiseError("Cannot commit a Dot");
    case /* R */4 :
        var m = status._1;
        var n$1 = status._0;
        var n$p$1 = $$int(n$1);
        if (n$p$1 === undefined) {
          return {
                  TAG: /* Error */1,
                  _0: "Bad range limit: " + n$1
                };
        }
        var m$p = $$int(m);
        if (m$p !== undefined) {
          if (n$p$1 >= 0 ? m$p >= 0 && m$p < n$p$1 : m$p >= 0 || n$p$1 > m$p) {
            return {
                    TAG: /* Error */1,
                    _0: "Bad range limits: " + n$1 + ".." + m
                  };
          } else {
            return {
                    TAG: /* Ok */0,
                    _0: result.concat({
                          TAG: /* Range */0,
                          _0: n$p$1,
                          _1: m$p
                        })
                  };
          }
        } else {
          return {
                  TAG: /* Error */1,
                  _0: "Bad range limit: " + m
                };
        }
    
  }
}

function printError(str, i, msg) {
  return {
          TAG: /* Error */1,
          _0: str + "\n" + " ".repeat(i) + "^\n" + msg
        };
}

function parse(str) {
  var _i = 0;
  var _mStatus = {
    TAG: /* L */0,
    _0: ""
  };
  var _mResult = {
    TAG: /* Ok */0,
    _0: []
  };
  while(true) {
    var mResult = _mResult;
    var mStatus = _mStatus;
    var i = _i;
    if (mResult.TAG !== /* Ok */0) {
      return printError(str, i - 1 | 0, mResult._0);
    }
    var result = mResult._0;
    if (mStatus === undefined) {
      return {
              TAG: /* Ok */0,
              _0: result
            };
    }
    var ch = str.charAt(i);
    var i$p = i + 1 | 0;
    var exit = 0;
    var exit$1 = 0;
    var exit$2 = 0;
    var exit$3 = 0;
    var exit$4 = 0;
    switch (ch) {
      case "" :
          switch (mStatus.TAG | 0) {
            case /* L */0 :
                _mResult = commit(result, mStatus);
                _mStatus = undefined;
                _i = i$p;
                continue ;
            case /* S */1 :
                return printError(str, i, "Unexpected end of string. Expected a character after the escape symbol");
            default:
              return printError(str, i, "Unexpected end of string. Did you forget to close a range?");
          }
      case "." :
          switch (mStatus.TAG | 0) {
            case /* L */0 :
                exit = 1;
                break;
            case /* S */1 :
                exit$4 = 6;
                break;
            case /* I */2 :
                _mStatus = {
                  TAG: /* D */3,
                  _0: mStatus._0
                };
                _i = i$p;
                continue ;
            case /* D */3 :
                _mStatus = {
                  TAG: /* R */4,
                  _0: mStatus._0,
                  _1: ""
                };
                _i = i$p;
                continue ;
            case /* R */4 :
                return printError(str, i, "Unexpected . symbol");
            
          }
          break;
      case "/" :
          switch (mStatus.TAG | 0) {
            case /* L */0 :
                var r = commit(result, mStatus);
                var tmp;
                tmp = r.TAG === /* Ok */0 ? ({
                      TAG: /* Ok */0,
                      _0: r._0.concat(/* Sep */0)
                    }) : ({
                      TAG: /* Error */1,
                      _0: r._0
                    });
                _mResult = tmp;
                _mStatus = {
                  TAG: /* L */0,
                  _0: ""
                };
                _i = i$p;
                continue ;
            case /* S */1 :
                exit$4 = 6;
                break;
            case /* D */3 :
                exit$2 = 4;
                break;
            case /* I */2 :
            case /* R */4 :
                exit$1 = 3;
                break;
            
          }
          break;
      case "\\" :
          switch (mStatus.TAG | 0) {
            case /* L */0 :
                _mStatus = {
                  TAG: /* S */1,
                  _0: mStatus._0
                };
                _i = i$p;
                continue ;
            case /* S */1 :
                exit$4 = 6;
                break;
            default:
              exit$3 = 5;
          }
          break;
      case "{" :
          switch (mStatus.TAG | 0) {
            case /* L */0 :
                _mResult = commit(result, mStatus);
                _mStatus = {
                  TAG: /* I */2,
                  _0: ""
                };
                _i = i$p;
                continue ;
            case /* S */1 :
                exit$4 = 6;
                break;
            default:
              exit$3 = 5;
          }
          break;
      case "}" :
          switch (mStatus.TAG | 0) {
            case /* S */1 :
                exit$4 = 6;
                break;
            case /* L */0 :
            case /* D */3 :
                exit$3 = 5;
                break;
            case /* I */2 :
            case /* R */4 :
                exit = 2;
                break;
            
          }
          break;
      default:
        exit$4 = 6;
    }
    if (exit$4 === 6) {
      if (mStatus.TAG === /* S */1) {
        _mStatus = {
          TAG: /* L */0,
          _0: mStatus._0 + ch
        };
        _i = i$p;
        continue ;
      }
      exit$3 = 5;
    }
    if (exit$3 === 5) {
      switch (ch) {
        case "\\" :
            return printError(str, i, "Unexpected escape symbol inside a range");
        case "{" :
            return printError(str, i, "Unexpected { symbol inside a range");
        case "}" :
            return printError(str, i, "Unexpected } symbol");
        default:
          exit$2 = 4;
      }
    }
    if (exit$2 === 4) {
      if (mStatus.TAG === /* D */3) {
        return printError(str, i, "Unexpected character: " + ch + ". Was expecting a . symbol");
      }
      exit$1 = 3;
    }
    if (exit$1 === 3) {
      if (ch === "/") {
        return printError(str, i, "Unexpected / symbol inside a range");
      }
      exit = 1;
    }
    switch (exit) {
      case 1 :
          switch (mStatus.TAG | 0) {
            case /* L */0 :
                _mStatus = {
                  TAG: /* L */0,
                  _0: mStatus._0 + ch
                };
                _i = i$p;
                continue ;
            case /* I */2 :
                _mStatus = {
                  TAG: /* I */2,
                  _0: mStatus._0 + ch
                };
                _i = i$p;
                continue ;
            case /* R */4 :
                _mStatus = {
                  TAG: /* R */4,
                  _0: mStatus._0,
                  _1: mStatus._1 + ch
                };
                _i = i$p;
                continue ;
            
          }
      case 2 :
          _mResult = commit(result, mStatus);
          _mStatus = {
            TAG: /* L */0,
            _0: ""
          };
          _i = i$p;
          continue ;
      
    }
  };
}

function make(str) {
  var nodes = parse(str);
  if (nodes.TAG !== /* Ok */0) {
    return {
            TAG: /* Error */1,
            _0: nodes._0
          };
  }
  var nodes$1 = nodes._0;
  return {
          TAG: /* Ok */0,
          _0: (function (sep, path) {
              var sep$1 = sep !== undefined ? sep : Path.sep;
              if (Path.isAbsolute(path)) {
                return {
                        TAG: /* Error */1,
                        _0: "An absolute path cannot be used as a source path"
                      };
              }
              var ext = Path.extname(path);
              var withoutExt = path.substring(0, path.length - ext.length | 0);
              var parts = withoutExt.split(sep$1).concat(ext);
              var len = parts.length;
              var norm = nodes$1.map(function (node) {
                    if (typeof node === "number") {
                      return node;
                    }
                    if (node.TAG !== /* Range */0) {
                      return node;
                    }
                    var max = node._1;
                    var min = node._0;
                    var min$1 = Math.max(0, min < 0 ? len + min | 0 : min);
                    var max$1 = Math.min(len - 1 | 0, max < 0 ? len + max | 0 : max);
                    if (max$1 < min$1) {
                      return ;
                    } else {
                      return {
                              TAG: /* Range */0,
                              _0: min$1,
                              _1: max$1
                            };
                    }
                  });
              var __x = norm.map(function (node, i) {
                    if (node !== undefined) {
                      if (typeof node === "number") {
                        if (i > 0 && Caml_array.get(norm, i - 1 | 0) === undefined) {
                          return [];
                        } else {
                          return [/* Sep */0];
                        }
                      } else {
                        return [node];
                      }
                    } else {
                      return [];
                    }
                  });
              return {
                      TAG: /* Ok */0,
                      _0: Caml_splice_call.spliceObjApply([], "concat", [__x]).map(function (node) {
                              if (typeof node === "number") {
                                return sep$1;
                              } else if (node.TAG === /* Range */0) {
                                var min = node._0;
                                var max = node._1;
                                var helper = function (st) {
                                  var i = min + st | 0;
                                  if (i === max) {
                                    return Caml_array.get(parts, i);
                                  } else {
                                    return Caml_array.get(parts, i) + (
                                            i === (parts.length - 2 | 0) ? "" : sep$1
                                          ) + helper(st + 1 | 0);
                                  }
                                };
                                return helper(0);
                              } else {
                                return node._0;
                              }
                            }).join("")
                    };
            })
        };
}

exports.make = make;
/* path Not a pure module */
