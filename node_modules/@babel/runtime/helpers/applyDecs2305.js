var _typeof = require("./typeof.js")["default"];
var checkInRHS = require("./checkInRHS.js");
function _bindPropCall(e, t) {
  return function (r, a) {
    return e[t].call(r, a);
  };
}
function createAddInitializerMethod(e, t) {
  return function (r) {
    if (t.v) throw new Error("attempted to call addInitializer after decoration was finished");
    assertCallable(r, "An initializer", !0), e.push(r);
  };
}
function memberDec(e, t, r, a, n, i, o, s, l, c, u) {
  function assertInstanceIfPrivate(e) {
    return function (t, r) {
      if (!c(t)) throw new TypeError("Attempted to access private element on non-instance");
      return e(t, r);
    };
  }
  var f,
    d,
    p = {
      v: !1
    },
    v = {
      kind: ["field", "accessor", "method", "getter", "setter", "field"][i],
      name: s ? "#" + r : r,
      "static": o,
      "private": s,
      metadata: u,
      addInitializer: createAddInitializerMethod(n, p)
    };
  if (s || 0 !== i && 2 !== i) {
    if (2 === i) f = assertInstanceIfPrivate(function () {
      return a.value;
    });else {
      var h = 0 === i || 1 === i;
      (h || 3 === i) && (f = _bindPropCall(a, "get"), s && (f = assertInstanceIfPrivate(f))), (h || 4 === i) && (d = _bindPropCall(a, "set"), s && (d = assertInstanceIfPrivate(d)));
    }
  } else f = function f(e) {
    return e[r];
  }, 0 === i && (d = function d(e, t) {
    e[r] = t;
  });
  var m = s ? c.bind() : function (e) {
      return r in e;
    },
    b = v.access = {
      has: m
    };
  f && (b.get = f), d && (b.set = d);
  try {
    return e.call(t, l, v);
  } finally {
    p.v = !0;
  }
}
function assertCallable(e, t, r) {
  if ("function" != typeof e && (r || void 0 !== e)) throw new TypeError(t + " must be a function");
}
function assertValidReturnValue(e, t) {
  var r = _typeof(t);
  if (1 === e) {
    if ("object" !== r || !t) throw new TypeError("accessor decorators must return an object with get, set, or init properties or void 0");
    assertCallable(t.get, "accessor.get"), assertCallable(t.set, "accessor.set"), assertCallable(t.init, "accessor.init");
  } else if ("function" !== r) throw new TypeError((0 === e ? "field" : 5 === e ? "class" : "method") + " decorators must return a function or void 0");
}
function applyMemberDec(e, t, r, a, n, i, o, s, l, c, u) {
  var f,
    d,
    p,
    v,
    h = r[0],
    m = r[3];
  a || Array.isArray(h) || (h = [h]), s ? f = 0 === i || 1 === i ? {
    get: function get() {
      return m(this);
    },
    set: function set(e) {
      r[4](this, e);
    }
  } : 3 === i ? {
    get: m
  } : 4 === i ? {
    set: m
  } : {
    value: m
  } : 0 !== i && (f = Object.getOwnPropertyDescriptor(t, n)), 1 === i ? p = {
    get: f.get,
    set: f.set
  } : 2 === i ? p = f.value : 3 === i ? p = f.get : 4 === i && (p = f.set);
  for (var b = a ? 2 : 1, y = h.length - 1; y >= 0; y -= b) {
    var g;
    if (void 0 !== (v = memberDec(h[y], a ? h[y - 1] : void 0, n, f, l, i, o, s, p, c, u))) assertValidReturnValue(i, v), 0 === i ? g = v : 1 === i ? (g = v.init, p = {
      get: v.get || p.get,
      set: v.set || p.set
    }) : p = v, void 0 !== g && (void 0 === d ? d = g : "function" == typeof d ? d = [d, g] : d.push(g));
  }
  if (0 === i || 1 === i) {
    if (void 0 === d) d = function d(e, t) {
      return t;
    };else if ("function" != typeof d) {
      var I = d;
      d = function d(e, t) {
        for (var r = t, a = I.length - 1; a >= 0; a--) r = I[a].call(e, r);
        return r;
      };
    } else {
      var w = d;
      d = d.call.bind(w);
    }
    e.push(d);
  }
  0 !== i && (1 === i ? (f.get = p.get, f.set = p.set) : 2 === i ? f.value = p : 3 === i ? f.get = p : 4 === i && (f.set = p), s ? 1 === i ? e.push(_bindPropCall(f, "get"), _bindPropCall(f, "set")) : e.push(2 === i ? p : Function.call.bind(p)) : Object.defineProperty(t, n, f));
}
function applyMemberDecs(e, t, r, a) {
  var n,
    i,
    o,
    s = [],
    l = new Map(),
    c = new Map();
  function pushInitializers(e) {
    e && s.push(function (t) {
      for (var r = 0; r < e.length; r++) e[r].call(t);
      return t;
    });
  }
  for (var u = 0; u < t.length; u++) {
    var f = t[u];
    if (Array.isArray(f)) {
      var d,
        p,
        v = f[1],
        h = f[2],
        m = f.length > 3,
        b = 16 & v,
        y = !!(8 & v),
        g = r;
      if (v &= 7, y ? (d = e, p = i = i || [], m && !o && (o = function o(t) {
        return checkInRHS(t) === e;
      }), g = o) : (d = e.prototype, p = n = n || []), 0 !== v && !m) {
        var I = y ? c : l,
          w = I.get(h) || 0;
        if (!0 === w || 3 === w && 4 !== v || 4 === w && 3 !== v) throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: " + h);
        I.set(h, !(!w && v > 2) || v);
      }
      applyMemberDec(s, d, f, b, h, v, y, m, p, g, a);
    }
  }
  return pushInitializers(n), pushInitializers(i), s;
}
function applyClassDecs(e, t, r, a) {
  if (t.length) {
    for (var n = [], i = e, o = e.name, s = r ? 2 : 1, l = t.length - 1; l >= 0; l -= s) {
      var c = {
        v: !1
      };
      try {
        var u = t[l].call(r ? t[l - 1] : void 0, i, {
          kind: "class",
          name: o,
          addInitializer: createAddInitializerMethod(n, c),
          metadata: a
        });
      } finally {
        c.v = !0;
      }
      void 0 !== u && (assertValidReturnValue(5, u), i = u);
    }
    return [defineMetadata(i, a), function () {
      for (var e = 0; e < n.length; e++) n[e].call(i);
    }];
  }
}
function defineMetadata(e, t) {
  return Object.defineProperty(e, Symbol.metadata || Symbol["for"]("Symbol.metadata"), {
    configurable: !0,
    enumerable: !0,
    value: t
  });
}
function applyDecs2305(e, t, r, a, n, i) {
  if (arguments.length >= 6) var o = i[Symbol.metadata || Symbol["for"]("Symbol.metadata")];
  var s = Object.create(void 0 === o ? null : o),
    l = applyMemberDecs(e, t, n, s);
  return r.length || defineMetadata(e, s), {
    e: l,
    get c() {
      return applyClassDecs(e, r, a, s);
    }
  };
}
module.exports = applyDecs2305, module.exports.__esModule = true, module.exports["default"] = module.exports;