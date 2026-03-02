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
        ".dice-net-anim{position:absolute;left:50%;top:50%;width:230px;height:190px;transform:translate(-50%,-50%);}",
        ".dice-cell{position:absolute;width:44px;height:44px;border:2px solid #365173;border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#28415f;transform-origin:center center;transition:transform 0.8s ease,opacity 0.8s ease,background-color 0.4s ease,border-color 0.4s ease;}",
        ".dice-cell.conflict{background:#ffe7ea;border-color:#b44b5f;color:#8e2a3d;box-shadow:0 0 0 2px rgba(180,75,95,0.2);animation:conflictPulse 0.6s ease-in-out 2;}",
        ".dice-cube{position:absolute;left:50%;top:50%;width:72px;height:72px;transform-style:preserve-3d;transform:translate(-50%,-50%) rotateX(-22deg) rotateY(35deg);opacity:0;}",
        ".dice-cube.show{opacity:1;animation:diceSpin 1.8s ease-out forwards;}",
        ".dice-cube-face{position:absolute;width:72px;height:72px;border:2px solid #304b6a;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;color:#223b57;}",
        ".face-front{transform:translateZ(36px);} .face-back{transform:rotateY(180deg) translateZ(36px);} .face-right{transform:rotateY(90deg) translateZ(36px);} .face-left{transform:rotateY(-90deg) translateZ(36px);} .face-top{transform:rotateX(90deg) translateZ(36px);} .face-bottom{transform:rotateX(-90deg) translateZ(36px);}",
        ".dice-fail{position:absolute;left:50%;top:50%;width:220px;height:130px;transform:translate(-50%,-50%);opacity:0;}",
        ".dice-fail.show{opacity:1;}",
        ".dice-fail-note{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:8px 10px;border-radius:8px;border:1px solid #c26a7a;background:#fff0f3;color:#7a3040;font-size:12px;font-weight:700;}",
        ".dice-feedback{margin-top:10px;padding:10px;border-radius:8px;background:#fff;border:1px solid #cfd7e3;font-size:13px;line-height:1.5;color:#1f3651;min-height:48px;}",
        ".dice-feedback.ok{border-color:#7cb48d;background:#eefaf1;}",
        ".dice-feedback.ng{border-color:#d39797;background:#fff1f1;}",
        "@keyframes diceSpin{0%{transform:translate(-50%,-50%) rotateX(-18deg) rotateY(20deg) scale(0.5);}100%{transform:translate(-50%,-50%) rotateX(-30deg) rotateY(390deg) scale(1);}}",
        "@keyframes conflictPulse{0%{transform:scale(1);}50%{transform:scale(1.08);}100%{transform:scale(1);}}"
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
      var analysis = this._analyzeNet(option.cells);
      var foldable = analysis.foldable;
      var stage = this._baseElement.querySelector('[data-role="stage"]');
      var feedback = this._baseElement.querySelector('[data-role="feedback"]');
      if (!stage || !feedback) {
        return;
      }

      stage.innerHTML = "";
      var scene = this._buildNetAnimation(option, analysis);
      stage.appendChild(scene.base);

      var cube = this._buildCube(analysis.normalToFaceLabel);
      stage.appendChild(cube);

      var fail = this._buildFailedAssembly(analysis.conflictPairs);
      stage.appendChild(fail);

      var totalMs = this._playFoldAnimation(scene, analysis, animate);
      if (!animate) {
        if (foldable) {
          cube.classList.add("show");
        } else {
          fail.classList.add("show");
        }
        this._setFeedback(optionId, foldable, feedback);
      } else {
        var self = this;
        this._timers.push(setTimeout(function () {
          if (foldable) {
            cube.classList.add("show");
          } else {
            fail.classList.add("show");
          }
          self._setFeedback(optionId, foldable, feedback);
        }, totalMs));
      }
    },

    _buildNetAnimation: function (option, analysis) {
      var base = document.createElement("div");
      base.className = "dice-net-anim";

      var minX = 999;
      var minY = 999;
      var maxX = -999;
      var maxY = -999;
      var i;
      for (i = 0; i < option.cells.length; i += 1) {
        if (option.cells[i].x < minX) { minX = option.cells[i].x; }
        if (option.cells[i].y < minY) { minY = option.cells[i].y; }
        if (option.cells[i].x > maxX) { maxX = option.cells[i].x; }
        if (option.cells[i].y > maxY) { maxY = option.cells[i].y; }
      }

      var size = 44;
      var w = (maxX - minX + 1) * size;
      var h = (maxY - minY + 1) * size;
      var offsetX = Math.floor((230 - w) / 2);
      var offsetY = Math.floor((190 - h) / 2);
      var nodes = {};

      for (i = 0; i < option.cells.length; i += 1) {
        var c = option.cells[i];
        var d = document.createElement("div");
        d.className = "dice-cell";
        var left = offsetX + (c.x - minX) * size;
        var top = offsetY + (c.y - minY) * size;
        d.style.left = String(left) + "px";
        d.style.top = String(top) + "px";
        d.textContent = String(i + 1);
        var key = k(c);
        nodes[key] = {
          el: d,
          x: left + size / 2,
          y: top + size / 2,
          depth: analysis.depthMap[key] || 0,
          normalKey: analysis.normalMap[key] || "0,0,1"
        };
        base.appendChild(d);
      }
      return {
        base: base,
        nodes: nodes,
        centerX: 115,
        centerY: 95
      };
    },

    _playFoldAnimation: function (scene, analysis, animate) {
      var targetByNormal = {
        "0,0,1": { x: 0, y: 0, a: 0 },
        "1,0,0": { x: 36, y: -5, a: 18 },
        "-1,0,0": { x: -36, y: -5, a: -18 },
        "0,1,0": { x: 0, y: 34, a: 10 },
        "0,-1,0": { x: 0, y: -34, a: -10 },
        "0,0,-1": { x: 0, y: -12, a: 0 }
      };

      var maxDepth = 0;
      var key;
      for (key in scene.nodes) {
        if (Object.prototype.hasOwnProperty.call(scene.nodes, key)) {
          if (scene.nodes[key].depth > maxDepth) {
            maxDepth = scene.nodes[key].depth;
          }
        }
      }
      var baseDelay = animate ? 120 : 0;
      var stepDelay = animate ? 260 : 0;
      var applyFold = function () {
        for (key in scene.nodes) {
          if (!Object.prototype.hasOwnProperty.call(scene.nodes, key)) {
            continue;
          }
          var node = scene.nodes[key];
          var target = targetByNormal[node.normalKey] || targetByNormal["0,0,1"];
          var dx = scene.centerX + target.x - node.x;
          var dy = scene.centerY + target.y - node.y;
          var rot = target.a;
          var scale = node.normalKey === "0,0,1" ? 1 : 0.88;
          var delay = baseDelay + node.depth * stepDelay;
          node.el.style.transitionDelay = String(delay) + "ms";
          node.el.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + scale + ") rotate(" + rot + "deg)";
          node.el.style.opacity = node.normalKey === "0,0,-1" ? "0.45" : "0.92";
        }
      };
      if (animate) {
        this._timers.push(setTimeout(applyFold, 30));
      } else {
        applyFold();
      }

      if (!analysis.foldable) {
        var i;
        var conflictKeys = {};
        for (i = 0; i < analysis.conflictPairs.length; i += 1) {
          conflictKeys[analysis.conflictPairs[i].a] = true;
          conflictKeys[analysis.conflictPairs[i].b] = true;
        }
        var markConflict = function () {
          for (key in conflictKeys) {
            if (Object.prototype.hasOwnProperty.call(conflictKeys, key) && scene.nodes[key]) {
              scene.nodes[key].el.classList.add("conflict");
            }
          }
        };
        if (animate) {
          this._timers.push(setTimeout(markConflict, baseDelay + maxDepth * stepDelay + 200));
        } else {
          markConflict();
        }
      }

      return baseDelay + maxDepth * stepDelay + (animate ? 900 : 0);
    },

    _buildCube: function (normalToFaceLabel) {
      var cube = document.createElement("div");
      cube.className = "dice-cube";
      var faces = [
        { css: "front", n: "0,0,1" },
        { css: "back", n: "0,0,-1" },
        { css: "right", n: "1,0,0" },
        { css: "left", n: "-1,0,0" },
        { css: "top", n: "0,-1,0" },
        { css: "bottom", n: "0,1,0" }
      ];
      for (var i = 0; i < faces.length; i += 1) {
        var f = document.createElement("div");
        f.className = "dice-cube-face face-" + faces[i].css;
        f.textContent = normalToFaceLabel[faces[i].n] || "?";
        cube.appendChild(f);
      }
      return cube;
    },

    _buildFailedAssembly: function (conflictPairs) {
      var cont = document.createElement("div");
      cont.className = "dice-fail";
      var note = document.createElement("div");
      note.className = "dice-fail-note";
      if (conflictPairs.length) {
        note.textContent = "面が重なって衝突: " + conflictPairs[0].labelA + " と " + conflictPairs[0].labelB;
      } else {
        note.textContent = "折りたたみ時に衝突が発生";
      }
      cont.appendChild(note);
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

    _analyzeNet: function (cells) {
      var empty = {
        foldable: false,
        depthMap: {},
        normalMap: {},
        normalToFaceLabel: {},
        conflictPairs: []
      };
      if (!cells || cells.length !== 6) {
        return empty;
      }
      var map = {};
      var indexByKey = {};
      var i;
      for (i = 0; i < cells.length; i += 1) {
        var key = k(cells[i]);
        map[key] = cells[i];
        indexByKey[key] = i + 1;
      }

      var pivot = cells[0];
      var bestNeighbors = -1;
      for (i = 0; i < cells.length; i += 1) {
        var nCount = 0;
        var dirs0 = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
          { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        for (var d0 = 0; d0 < dirs0.length; d0 += 1) {
          if (map[(cells[i].x + dirs0[d0].dx) + "," + (cells[i].y + dirs0[d0].dy)]) {
            nCount += 1;
          }
        }
        if (nCount > bestNeighbors) {
          bestNeighbors = nCount;
          pivot = cells[i];
        }
      }

      var seen = {};
      var queue = [pivot];
      seen[k(pivot)] = true;
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
        return empty;
      }

      var ori = {};
      var depthMap = {};
      ori[k(pivot)] = {
        n: { x: 0, y: 0, z: 1 },
        u: { x: 1, y: 0, z: 0 },
        v: { x: 0, y: 1, z: 0 }
      };
      depthMap[k(pivot)] = 0;
      queue = [pivot];
      var inconsistent = false;

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
            depthMap[key2] = depthMap[ck] + 1;
            queue.push(map[key2]);
          } else if (!this._sameOri(ori[key2], no)) {
            inconsistent = true;
          }
        }
      }
      if (inconsistent) {
        return empty;
      }

      var normals = {};
      var normalOwners = {};
      var normalMap = {};
      var normalToFaceLabel = {};
      for (var ok in ori) {
        if (Object.prototype.hasOwnProperty.call(ori, ok)) {
          var n = ori[ok].n;
          var nk2 = n.x + "," + n.y + "," + n.z;
          normals[nk2] = true;
          normalMap[ok] = nk2;
          normalToFaceLabel[nk2] = String(indexByKey[ok]);
          if (!normalOwners[nk2]) {
            normalOwners[nk2] = [];
          }
          normalOwners[nk2].push(ok);
        }
      }
      var normalsCount = 0;
      for (var nn in normals) {
        if (Object.prototype.hasOwnProperty.call(normals, nn) && normals[nn]) {
          normalsCount += 1;
        }
      }
      var conflictPairs = [];
      for (var nkey in normalOwners) {
        if (Object.prototype.hasOwnProperty.call(normalOwners, nkey) && normalOwners[nkey].length > 1) {
          var owners = normalOwners[nkey];
          for (i = 1; i < owners.length; i += 1) {
            conflictPairs.push({
              a: owners[0],
              b: owners[i],
              labelA: String(indexByKey[owners[0]]),
              labelB: String(indexByKey[owners[i]])
            });
          }
        }
      }

      return {
        foldable: normalsCount === 6 && conflictPairs.length === 0,
        depthMap: depthMap,
        normalMap: normalMap,
        normalToFaceLabel: normalToFaceLabel,
        conflictPairs: conflictPairs
      };
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
