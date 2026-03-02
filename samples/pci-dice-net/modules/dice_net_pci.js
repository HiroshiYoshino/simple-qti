"use strict";

define(["qtiCustomInteractionContext"], function (ctx) {
  var OPTIONS = [
    {
      id: "A",
      label: "選択肢A",
      cells: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
        { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }
      ]
    },
    {
      id: "B",
      label: "選択肢B",
      cells: [
        { x: 1, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
        { x: 1, y: 2 }, { x: 1, y: 3 }
      ]
    },
    {
      id: "C",
      label: "選択肢C",
      cells: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
        { x: 1, y: 1 }, { x: 2, y: 1 }
      ]
    }
  ];

  var CORRECT_ID = "B";

  function k(p) {
    return p.x + "," + p.y;
  }

  var pci = {
    typeIdentifier: "urn:example.jp:pci:dice-net:v1",
    _baseElement: null,
    _config: {},
    _state: { selected: "" },
    _handlers: [],
    _timers: [],

    getInstance: function (dom, configuration, state) {
      var instance = this._extend({}, this);
      instance._state = { selected: "" };
      instance._handlers = [];
      instance._timers = [];
      instance._init(dom, configuration, state);
      return instance;
    },

    _init: function (dom, configuration, state) {
      this._baseElement = dom;
      this._config = configuration || {};
      if (state) {
        try {
          var parsed = JSON.parse(state);
          if (parsed && typeof parsed.selected === "string") {
            this._state = parsed;
          }
        } catch (_e) {
          this._state = { selected: "" };
        }
      }

      this._render();
      this.oncompleted = this.cleanup.bind(this);
      if (this._config.onready) {
        this._config.onready(this, this.getState());
      }
    },

    _render: function () {
      this._baseElement.innerHTML = "";

      var style = document.createElement("style");
      style.textContent = [
        ".dice-root{font-family:sans-serif;max-width:980px;}",
        ".dice-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:14px;}",
        ".dice-choice{border:1px solid #cfd7e3;border-radius:8px;padding:8px;background:#fff;}",
        ".dice-choice input{margin-right:6px;}",
        ".dice-choice-title{font-weight:700;font-size:13px;margin-bottom:6px;display:flex;align-items:center;}",
        ".dice-svg{width:100%;height:120px;display:block;background:linear-gradient(180deg,#f8fbff,#edf3fa);border-radius:6px;}",
        ".dice-face{fill:#fefefe;stroke:#3f5775;stroke-width:2;}",
        ".dice-num{font-size:16px;fill:#2d4665;font-weight:700;dominant-baseline:middle;text-anchor:middle;}",
        ".dice-stage-wrap{border:1px solid #cfd7e3;border-radius:10px;background:#f5f8fc;padding:10px;}",
        ".dice-stage-title{font-size:13px;font-weight:700;margin-bottom:8px;color:#27405f;}",
        ".dice-stage{position:relative;height:220px;overflow:hidden;border-radius:8px;background:radial-gradient(circle at 30% 25%,#ffffff,#deebf8);}",
        ".dice-net-anim{position:absolute;left:50%;top:50%;width:170px;height:170px;transform:translate(-50%,-50%);}",
        ".dice-cell{position:absolute;width:44px;height:44px;border:2px solid #365173;border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#28415f;transition:transform 0.9s ease,opacity 0.9s ease;}",
        ".dice-net-anim.folding .dice-cell{transform:translate(58px,58px) scale(0.35) rotate(30deg);opacity:0.08;}",
        ".dice-cube{position:absolute;left:50%;top:50%;width:72px;height:72px;transform-style:preserve-3d;transform:translate(-50%,-50%) rotateX(-22deg) rotateY(35deg);opacity:0;}",
        ".dice-cube.show{opacity:1;animation:diceSpin 1.8s ease-out forwards;}",
        ".dice-cube-face{position:absolute;width:72px;height:72px;border:2px solid #304b6a;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#223b57;}",
        ".face-front{transform:translateZ(36px);} .face-back{transform:rotateY(180deg) translateZ(36px);} .face-right{transform:rotateY(90deg) translateZ(36px);} .face-left{transform:rotateY(-90deg) translateZ(36px);} .face-top{transform:rotateX(90deg) translateZ(36px);} .face-bottom{transform:rotateX(-90deg) translateZ(36px);}",
        ".dice-fail{position:absolute;left:50%;top:50%;width:180px;height:120px;transform:translate(-50%,-50%);opacity:0;}",
        ".dice-fail.show{opacity:1;}",
        ".dice-fail-piece{position:absolute;width:38px;height:38px;border:2px solid #7a3040;border-radius:6px;background:#fff4f6;display:flex;align-items:center;justify-content:center;color:#7a3040;font-weight:700;animation:scatter 1.2s ease-out forwards;}",
        ".dice-feedback{margin-top:10px;padding:10px;border-radius:8px;background:#fff;border:1px solid #cfd7e3;font-size:13px;line-height:1.5;color:#1f3651;min-height:48px;}",
        ".dice-feedback.ok{border-color:#7cb48d;background:#eefaf1;}",
        ".dice-feedback.ng{border-color:#d39797;background:#fff1f1;}",
        "@keyframes diceSpin{0%{transform:translate(-50%,-50%) rotateX(-18deg) rotateY(20deg) scale(0.5);}100%{transform:translate(-50%,-50%) rotateX(-30deg) rotateY(390deg) scale(1);}}",
        "@keyframes scatter{0%{transform:translate(0,0) rotate(0deg);opacity:1;}100%{transform:translate(var(--tx),var(--ty)) rotate(var(--rot));opacity:0.15;}}"
      ].join("");
      this._baseElement.appendChild(style);

      var root = document.createElement("div");
      root.className = "dice-root";

      var choices = document.createElement("div");
      choices.className = "dice-choices";
      for (var i = 0; i < OPTIONS.length; i += 1) {
        choices.appendChild(this._renderChoiceCard(OPTIONS[i]));
      }
      root.appendChild(choices);

      var stageWrap = document.createElement("div");
      stageWrap.className = "dice-stage-wrap";

      var stageTitle = document.createElement("div");
      stageTitle.className = "dice-stage-title";
      stageTitle.textContent = "組み立てシミュレーション";
      stageWrap.appendChild(stageTitle);

      var stage = document.createElement("div");
      stage.className = "dice-stage";
      stage.setAttribute("data-role", "stage");
      stageWrap.appendChild(stage);

      var feedback = document.createElement("div");
      feedback.className = "dice-feedback";
      feedback.setAttribute("data-role", "feedback");
      feedback.textContent = "いずれかの選択肢を選ぶと、ここに組み立て可否と正誤説明が表示されます。";
      stageWrap.appendChild(feedback);

      root.appendChild(stageWrap);
      this._baseElement.appendChild(root);

      if (this._state.selected) {
        this._startSimulation(this._state.selected, false);
      }
    },

    _renderChoiceCard: function (opt) {
      var card = document.createElement("label");
      card.className = "dice-choice";

      var title = document.createElement("div");
      title.className = "dice-choice-title";
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "dice-net-answer";
      radio.value = opt.id;
      if (this._state.selected === opt.id) {
        radio.checked = true;
      }
      var onChange = this._onChoose.bind(this);
      radio.addEventListener("change", onChange);
      this._handlers.push({ el: radio, fn: onChange, type: "change" });
      title.appendChild(radio);

      var text = document.createElement("span");
      text.textContent = opt.label;
      title.appendChild(text);
      card.appendChild(title);

      card.appendChild(this._renderNetSvg(opt));
      return card;
    },

    _renderNetSvg: function (opt) {
      var ns = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(ns, "svg");
      svg.setAttribute("class", "dice-svg");
      svg.setAttribute("viewBox", "0 0 220 120");
      var minX = 999;
      var minY = 999;
      var maxX = -999;
      var maxY = -999;
      var i;
      for (i = 0; i < opt.cells.length; i += 1) {
        if (opt.cells[i].x < minX) { minX = opt.cells[i].x; }
        if (opt.cells[i].y < minY) { minY = opt.cells[i].y; }
        if (opt.cells[i].x > maxX) { maxX = opt.cells[i].x; }
        if (opt.cells[i].y > maxY) { maxY = opt.cells[i].y; }
      }
      var w = maxX - minX + 1;
      var h = maxY - minY + 1;
      var size = Math.min(38, Math.floor(Math.min(200 / w, 100 / h)));
      var startX = Math.floor((220 - w * size) / 2);
      var startY = Math.floor((120 - h * size) / 2);

      for (i = 0; i < opt.cells.length; i += 1) {
        var cell = opt.cells[i];
        var x = startX + (cell.x - minX) * size;
        var y = startY + (cell.y - minY) * size;

        var r = document.createElementNS(ns, "rect");
        r.setAttribute("class", "dice-face");
        r.setAttribute("x", String(x));
        r.setAttribute("y", String(y));
        r.setAttribute("width", String(size));
        r.setAttribute("height", String(size));
        svg.appendChild(r);

        var t = document.createElementNS(ns, "text");
        t.setAttribute("class", "dice-num");
        t.setAttribute("x", String(x + size / 2));
        t.setAttribute("y", String(y + size / 2 + 1));
        t.textContent = String(i + 1);
        svg.appendChild(t);
      }

      return svg;
    },

    _onChoose: function (event) {
      if (!event.target.checked) {
        return;
      }
      this._state.selected = event.target.value;
      this._startSimulation(this._state.selected, true);
    },

    _startSimulation: function (optionId, animate) {
      this._clearTimers();

      var option = this._findOption(optionId);
      if (!option) {
        return;
      }
      var foldable = this._isFoldable(option.cells);
      var stage = this._baseElement.querySelector('[data-role="stage"]');
      var feedback = this._baseElement.querySelector('[data-role="feedback"]');
      if (!stage || !feedback) {
        return;
      }

      stage.innerHTML = "";
      var net = this._buildNetAnimation(option);
      stage.appendChild(net);

      var cube = this._buildCube();
      stage.appendChild(cube);

      var fail = this._buildFailedAssembly();
      stage.appendChild(fail);

      if (!animate) {
        net.classList.add("folding");
        if (foldable) {
          cube.classList.add("show");
        } else {
          fail.classList.add("show");
        }
      } else {
        var self = this;
        this._timers.push(setTimeout(function () {
          net.classList.add("folding");
        }, 120));
        this._timers.push(setTimeout(function () {
          if (foldable) {
            cube.classList.add("show");
          } else {
            fail.classList.add("show");
          }
          self._setFeedback(optionId, foldable, feedback);
        }, 980));
      }

      if (!animate) {
        this._setFeedback(optionId, foldable, feedback);
      }
    },

    _buildNetAnimation: function (option) {
      var base = document.createElement("div");
      base.className = "dice-net-anim";

      var minX = 999;
      var minY = 999;
      var i;
      for (i = 0; i < option.cells.length; i += 1) {
        if (option.cells[i].x < minX) { minX = option.cells[i].x; }
        if (option.cells[i].y < minY) { minY = option.cells[i].y; }
      }

      for (i = 0; i < option.cells.length; i += 1) {
        var c = option.cells[i];
        var d = document.createElement("div");
        d.className = "dice-cell";
        d.style.left = String((c.x - minX) * 44) + "px";
        d.style.top = String((c.y - minY) * 44) + "px";
        d.textContent = String(i + 1);
        base.appendChild(d);
      }
      return base;
    },

    _buildCube: function () {
      var cube = document.createElement("div");
      cube.className = "dice-cube";
      var faces = ["front", "back", "right", "left", "top", "bottom"];
      for (var i = 0; i < faces.length; i += 1) {
        var f = document.createElement("div");
        f.className = "dice-cube-face face-" + faces[i];
        f.textContent = String(i + 1);
        cube.appendChild(f);
      }
      return cube;
    },

    _buildFailedAssembly: function () {
      var cont = document.createElement("div");
      cont.className = "dice-fail";
      var dirs = [
        { x: -70, y: -30, rot: "-35deg" },
        { x: -20, y: -45, rot: "18deg" },
        { x: 25, y: -10, rot: "55deg" },
        { x: 65, y: 20, rot: "12deg" },
        { x: -50, y: 30, rot: "-22deg" },
        { x: 10, y: 40, rot: "28deg" }
      ];
      for (var i = 0; i < 6; i += 1) {
        var p = document.createElement("div");
        p.className = "dice-fail-piece";
        p.style.left = "70px";
        p.style.top = "38px";
        p.style.setProperty("--tx", dirs[i].x + "px");
        p.style.setProperty("--ty", dirs[i].y + "px");
        p.style.setProperty("--rot", dirs[i].rot);
        p.textContent = String(i + 1);
        cont.appendChild(p);
      }
      return cont;
    },

    _setFeedback: function (optionId, foldable, feedbackEl) {
      feedbackEl.className = "dice-feedback";
      if (foldable && optionId === CORRECT_ID) {
        feedbackEl.classList.add("ok");
        feedbackEl.textContent = "正解です。選択肢" + optionId + "は6面が重ならずに立方体へ折りたためる展開図です。";
      } else {
        feedbackEl.classList.add("ng");
        if (!foldable) {
          feedbackEl.textContent = "不正解です。選択肢" + optionId + "は折りたたむと面の向きが衝突し、立方体を作れません。";
        } else {
          feedbackEl.textContent = "不正解です。選択肢" + optionId + "は組み立て可能ですが、今回の正解として設定された展開図ではありません。";
        }
      }
    },

    _findOption: function (id) {
      for (var i = 0; i < OPTIONS.length; i += 1) {
        if (OPTIONS[i].id === id) {
          return OPTIONS[i];
        }
      }
      return null;
    },

    _isFoldable: function (cells) {
      if (!cells || cells.length !== 6) {
        return false;
      }
      var map = {};
      var i;
      for (i = 0; i < cells.length; i += 1) {
        map[k(cells[i])] = cells[i];
      }

      var seen = {};
      var queue = [cells[0]];
      seen[k(cells[0])] = true;
      var dirs = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
      ];
      while (queue.length) {
        var c = queue.shift();
        for (i = 0; i < dirs.length; i += 1) {
          var nk = (c.x + dirs[i].dx) + "," + (c.y + dirs[i].dy);
          if (map[nk] && !seen[nk]) {
            seen[nk] = true;
            queue.push(map[nk]);
          }
        }
      }
      var count = 0;
      for (var sk in seen) {
        if (Object.prototype.hasOwnProperty.call(seen, sk) && seen[sk]) {
          count += 1;
        }
      }
      if (count !== 6) {
        return false;
      }

      var root = cells[0];
      var ori = {};
      ori[k(root)] = {
        n: { x: 0, y: 0, z: 1 },
        u: { x: 1, y: 0, z: 0 },
        v: { x: 0, y: 1, z: 0 }
      };
      queue = [root];

      while (queue.length) {
        var cur = queue.shift();
        var ck = k(cur);
        var o = ori[ck];
        var trans = [
          { dx: 1, dy: 0, d: "R" },
          { dx: -1, dy: 0, d: "L" },
          { dx: 0, dy: 1, d: "D" },
          { dx: 0, dy: -1, d: "U" }
        ];
        for (i = 0; i < trans.length; i += 1) {
          var t = trans[i];
          var key2 = (cur.x + t.dx) + "," + (cur.y + t.dy);
          if (!map[key2]) {
            continue;
          }
          var no = this._rot(o, t.d);
          if (!ori[key2]) {
            ori[key2] = no;
            queue.push(map[key2]);
          } else if (!this._sameOri(ori[key2], no)) {
            return false;
          }
        }
      }

      var normals = {};
      for (var ok in ori) {
        if (Object.prototype.hasOwnProperty.call(ori, ok)) {
          var n = ori[ok].n;
          var nk2 = n.x + "," + n.y + "," + n.z;
          normals[nk2] = true;
        }
      }
      var normalsCount = 0;
      for (var nn in normals) {
        if (Object.prototype.hasOwnProperty.call(normals, nn) && normals[nn]) {
          normalsCount += 1;
        }
      }
      return normalsCount === 6;
    },

    _rot: function (o, d) {
      var n = o.n;
      var u = o.u;
      var v = o.v;
      if (d === "R") {
        return { n: u, u: this._neg(n), v: v };
      }
      if (d === "L") {
        return { n: this._neg(u), u: n, v: v };
      }
      if (d === "D") {
        return { n: this._neg(v), u: u, v: n };
      }
      return { n: v, u: u, v: this._neg(n) };
    },

    _neg: function (p) {
      return { x: -p.x, y: -p.y, z: -p.z };
    },

    _sameOri: function (a, b) {
      return a.n.x === b.n.x && a.n.y === b.n.y && a.n.z === b.n.z &&
        a.u.x === b.u.x && a.u.y === b.u.y && a.u.z === b.u.z &&
        a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
    },

    _clearTimers: function () {
      for (var i = 0; i < this._timers.length; i += 1) {
        clearTimeout(this._timers[i]);
      }
      this._timers = [];
    },

    getResponse: function () {
      return {
        base: {
          string: this._state.selected || ""
        }
      };
    },

    getState: function () {
      return JSON.stringify(this._state);
    },

    cleanup: function () {
      this._clearTimers();
      for (var i = 0; i < this._handlers.length; i += 1) {
        var h = this._handlers[i];
        h.el.removeEventListener(h.type, h.fn);
      }
      this._handlers = [];
    },

    _extend: function (A, B) {
      var r = {};
      var key;
      for (key in A) {
        if (Object.prototype.hasOwnProperty.call(A, key)) {
          r[key] = A[key];
        }
      }
      for (key in B) {
        if (Object.prototype.hasOwnProperty.call(B, key)) {
          r[key] = B[key];
        }
      }
      return r;
    }
  };

  if (ctx) {
    ctx.register(pci);
  }
  return pci;
});
