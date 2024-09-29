var V = Object.defineProperty;
var W = (t, e, n) => e in t ? V(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var _ = (t, e, n) => W(t, typeof e != "symbol" ? e + "" : e, n);
function m() {
}
function R(t) {
  return t();
}
function j() {
  return /* @__PURE__ */ Object.create(null);
}
function b(t) {
  t.forEach(R);
}
function U(t) {
  return typeof t == "function";
}
function q(t, e) {
  return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}
function z(t) {
  return Object.keys(t).length === 0;
}
function p(t, e, n) {
  t.insertBefore(e, n || null);
}
function a(t) {
  t.parentNode && t.parentNode.removeChild(t);
}
function k(t) {
  return document.createElement(t);
}
function D(t) {
  return document.createTextNode(t);
}
function O() {
  return D(" ");
}
function $(t, e, n) {
  n == null ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n);
}
function F(t) {
  return Array.from(t.childNodes);
}
let v;
function g(t) {
  v = t;
}
const d = [], A = [];
let h = [];
const B = [], G = /* @__PURE__ */ Promise.resolve();
let w = !1;
function J() {
  w || (w = !0, G.then(I));
}
function C(t) {
  h.push(t);
}
const x = /* @__PURE__ */ new Set();
let f = 0;
function I() {
  if (f !== 0)
    return;
  const t = v;
  do {
    try {
      for (; f < d.length; ) {
        const e = d[f];
        f++, g(e), K(e.$$);
      }
    } catch (e) {
      throw d.length = 0, f = 0, e;
    }
    for (g(null), d.length = 0, f = 0; A.length; ) A.pop()();
    for (let e = 0; e < h.length; e += 1) {
      const n = h[e];
      x.has(n) || (x.add(n), n());
    }
    h.length = 0;
  } while (d.length);
  for (; B.length; )
    B.pop()();
  w = !1, x.clear(), g(t);
}
function K(t) {
  if (t.fragment !== null) {
    t.update(), b(t.before_update);
    const e = t.dirty;
    t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(C);
  }
}
function Q(t) {
  const e = [], n = [];
  h.forEach((i) => t.indexOf(i) === -1 ? e.push(i) : n.push(i)), n.forEach((i) => i()), h = e;
}
const X = /* @__PURE__ */ new Set();
function Y(t, e) {
  t && t.i && (X.delete(t), t.i(e));
}
function Z(t, e, n) {
  const { fragment: i, after_update: r } = t.$$;
  i && i.m(e, n), C(() => {
    const o = t.$$.on_mount.map(R).filter(U);
    t.$$.on_destroy ? t.$$.on_destroy.push(...o) : b(o), t.$$.on_mount = [];
  }), r.forEach(C);
}
function tt(t, e) {
  const n = t.$$;
  n.fragment !== null && (Q(n.after_update), b(n.on_destroy), n.fragment && n.fragment.d(e), n.on_destroy = n.fragment = null, n.ctx = []);
}
function et(t, e) {
  t.$$.dirty[0] === -1 && (d.push(t), J(), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function nt(t, e, n, i, r, o, c = null, u = [-1]) {
  const y = v;
  g(t);
  const s = t.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: o,
    update: m,
    not_equal: r,
    bound: j(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (y ? y.$$.context : [])),
    // everything else
    callbacks: j(),
    dirty: u,
    skip_bound: !1,
    root: e.target || y.$$.root
  };
  c && c(s.root);
  let E = !1;
  if (s.ctx = n ? n(t, e.props || {}, (l, P, ...S) => {
    const N = S.length ? S[0] : P;
    return s.ctx && r(s.ctx[l], s.ctx[l] = N) && (!s.skip_bound && s.bound[l] && s.bound[l](N), E && et(t, l)), P;
  }) : [], s.update(), E = !0, b(s.before_update), s.fragment = i ? i(s.ctx) : !1, e.target) {
    if (e.hydrate) {
      const l = F(e.target);
      s.fragment && s.fragment.l(l), l.forEach(a);
    } else
      s.fragment && s.fragment.c();
    e.intro && Y(t.$$.fragment), Z(t, e.target, e.anchor), I();
  }
  g(y);
}
class it {
  constructor() {
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    _(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    _(this, "$$set");
  }
  /** @returns {void} */
  $destroy() {
    tt(this, 1), this.$destroy = m;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(e, n) {
    if (!U(n))
      return m;
    const i = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return i.push(n), () => {
      const r = i.indexOf(n);
      r !== -1 && i.splice(r, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(e) {
    this.$$set && !z(e) && (this.$$.skip_bound = !0, this.$$set(e), this.$$.skip_bound = !1);
  }
}
const ot = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(ot);
const M = "oscd-plugin-store", T = "0.0.1";
function L(t) {
  let e;
  return {
    c() {
      e = k("h2"), e.textContent = "Welcome to oscd-plugin-store";
    },
    m(n, i) {
      p(n, e, i);
    },
    d(n) {
      n && a(e);
    }
  };
}
function rt(t) {
  let e, n, i, r, o = (
    /*doc*/
    t[0] && L()
  );
  return {
    c() {
      o && o.c(), e = O(), n = k("input"), i = O(), r = k("input"), $(n, "type", "hidden"), $(n, "name", "package-name"), n.value = M, $(r, "type", "hidden"), $(r, "name", "package-version"), r.value = T;
    },
    m(c, u) {
      o && o.m(c, u), p(c, e, u), p(c, n, u), p(c, i, u), p(c, r, u);
    },
    p(c, [u]) {
      /*doc*/
      c[0] ? o || (o = L(), o.c(), o.m(e.parentNode, e)) : o && (o.d(1), o = null);
    },
    i: m,
    o: m,
    d(c) {
      c && (a(e), a(n), a(i), a(r)), o && o.d(c);
    }
  };
}
function H() {
  console.log("Plugin is running");
}
function st(t, e, n) {
  let { doc: i } = e, { editCount: r } = e;
  return t.$$set = (o) => {
    "doc" in o && n(0, i = o.doc), "editCount" in o && n(1, r = o.editCount);
  }, [i, r, H];
}
class ct extends it {
  constructor(e) {
    super(), nt(this, e, st, rt, q, { doc: 0, editCount: 1, run: 2 });
  }
  get run() {
    return H;
  }
}
class dt extends HTMLElement {
  constructor() {
    super(...arguments);
    _(this, "plugin");
    _(this, "_doc");
  }
  run() {
    var n;
    (n = this.plugin) == null || n.run();
  }
  connectedCallback() {
    var i;
    this.attachShadow({ mode: "open" }), this.plugin = new ct({
      target: this.shadowRoot,
      props: {
        doc: this._doc,
        editCount: -1
      }
    });
    const n = ut();
    (i = this.shadowRoot) == null || i.appendChild(n);
  }
  set doc(n) {
    this._doc = n, this.plugin && this.plugin.$set({ doc: n });
  }
  set editCount(n) {
    this.plugin && this.plugin.$set({ editCount: n });
  }
}
function ut() {
  const t = `${M}-v${T}-style`, e = lt(), n = document.createElement("link");
  return n.rel = "stylesheet", n.type = "text/css", n.href = e, n.id = t, n;
}
function lt() {
  const t = new URL(import.meta.url), e = t.origin, n = t.pathname.split("/").slice(0, -1).filter(Boolean).join("/");
  return [e, n, "style.css"].filter(Boolean).join("/");
}
export {
  dt as default
};
