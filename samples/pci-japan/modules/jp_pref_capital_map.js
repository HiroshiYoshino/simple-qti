"use strict";

define(["qtiCustomInteractionContext"], function (ctx) {
  var PREFECTURES = [
    { code: "hokkaido", pref: "北海道", capital: "札幌市", x: 840, y: 40 },
    { code: "aomori", pref: "青森県", capital: "青森市", x: 760, y: 130 },
    { code: "iwate", pref: "岩手県", capital: "盛岡市", x: 790, y: 170 },
    { code: "akita", pref: "秋田県", capital: "秋田市", x: 730, y: 180 },
    { code: "miyagi", pref: "宮城県", capital: "仙台市", x: 770, y: 220 },
    { code: "yamagata", pref: "山形県", capital: "山形市", x: 720, y: 230 },
    { code: "fukushima", pref: "福島県", capital: "福島市", x: 750, y: 280 },

    { code: "ibaraki", pref: "茨城県", capital: "水戸市", x: 790, y: 320 },
    { code: "tochigi", pref: "栃木県", capital: "宇都宮市", x: 760, y: 320 },
    { code: "gunma", pref: "群馬県", capital: "前橋市", x: 730, y: 320 },
    { code: "saitama", pref: "埼玉県", capital: "さいたま市", x: 740, y: 360 },
    { code: "chiba", pref: "千葉県", capital: "千葉市", x: 800, y: 370 },
    { code: "tokyo", pref: "東京都", capital: "東京都", x: 760, y: 390 },
    { code: "kanagawa", pref: "神奈川県", capital: "横浜市", x: 740, y: 420 },

    { code: "niigata", pref: "新潟県", capital: "新潟市", x: 700, y: 290 },
    { code: "toyama", pref: "富山県", capital: "富山市", x: 650, y: 320 },
    { code: "ishikawa", pref: "石川県", capital: "金沢市", x: 620, y: 320 },
    { code: "fukui", pref: "福井県", capital: "福井市", x: 610, y: 360 },
    { code: "yamanashi", pref: "山梨県", capital: "甲府市", x: 700, y: 380 },
    { code: "nagano", pref: "長野県", capital: "長野市", x: 690, y: 340 },
    { code: "gifu", pref: "岐阜県", capital: "岐阜市", x: 650, y: 390 },
    { code: "shizuoka", pref: "静岡県", capital: "静岡市", x: 700, y: 430 },
    { code: "aichi", pref: "愛知県", capital: "名古屋市", x: 650, y: 430 },

    { code: "mie", pref: "三重県", capital: "津市", x: 610, y: 430 },
    { code: "shiga", pref: "滋賀県", capital: "大津市", x: 600, y: 390 },
    { code: "kyoto", pref: "京都府", capital: "京都市", x: 570, y: 390 },
    { code: "osaka", pref: "大阪府", capital: "大阪市", x: 560, y: 420 },
    { code: "hyogo", pref: "兵庫県", capital: "神戸市", x: 530, y: 410 },
    { code: "nara", pref: "奈良県", capital: "奈良市", x: 590, y: 420 },
    { code: "wakayama", pref: "和歌山県", capital: "和歌山市", x: 570, y: 450 },

    { code: "tottori", pref: "鳥取県", capital: "鳥取市", x: 500, y: 390 },
    { code: "shimane", pref: "島根県", capital: "松江市", x: 460, y: 380 },
    { code: "okayama", pref: "岡山県", capital: "岡山市", x: 500, y: 420 },
    { code: "hiroshima", pref: "広島県", capital: "広島市", x: 460, y: 420 },
    { code: "yamaguchi", pref: "山口県", capital: "山口市", x: 420, y: 420 },

    { code: "kagawa", pref: "香川県", capital: "高松市", x: 500, y: 460 },
    { code: "tokushima", pref: "徳島県", capital: "徳島市", x: 540, y: 470 },
    { code: "ehime", pref: "愛媛県", capital: "松山市", x: 460, y: 480 },
    { code: "kochi", pref: "高知県", capital: "高知市", x: 500, y: 500 },

    { code: "fukuoka", pref: "福岡県", capital: "福岡市", x: 390, y: 460 },
    { code: "saga", pref: "佐賀県", capital: "佐賀市", x: 360, y: 470 },
    { code: "nagasaki", pref: "長崎県", capital: "長崎市", x: 330, y: 490 },
    { code: "kumamoto", pref: "熊本県", capital: "熊本市", x: 380, y: 500 },
    { code: "oita", pref: "大分県", capital: "大分市", x: 420, y: 500 },
    { code: "miyazaki", pref: "宮崎県", capital: "宮崎市", x: 430, y: 540 },
    { code: "kagoshima", pref: "鹿児島県", capital: "鹿児島市", x: 380, y: 560 },
    { code: "okinawa", pref: "沖縄県", capital: "那覇市", x: 180, y: 580 }
  ];

  var CAPITAL_OPTIONS = PREFECTURES
    .map(function (p) {
      return p.capital;
    })
    .sort(function (a, b) {
      return a.localeCompare(b, "ja");
    });

  var pci = {
    typeIdentifier: "urn:example.jp:pci:pref-capital-map:v1",
    _baseElement: null,
    _config: {},
    _state: { selections: {} },
    _eventHandlers: [],

    getInstance: function (dom, configuration, state) {
      var instance = this._extend({}, this);
      instance._state = { selections: {} };
      instance._eventHandlers = [];
      instance._init(dom, configuration, state);
      return instance;
    },

    _init: function (dom, configuration, state) {
      this._baseElement = dom;
      this._config = configuration || {};

      if (state) {
        try {
          this._state = JSON.parse(state);
          if (!this._state || !this._state.selections) {
            this._state = { selections: {} };
          }
        } catch (_e) {
          this._state = { selections: {} };
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
        ".jp-map-wrap{position:relative;max-width:1000px;min-height:640px;border:1px solid #c8d0d9;border-radius:8px;overflow:auto;background:linear-gradient(180deg,#f8fbff 0%,#eef4fa 100%);}",
        ".jp-map-panel{position:relative;width:1000px;height:620px;}",
        ".jp-pref-node{position:absolute;width:104px;padding:6px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.12);border:1px solid #d8e0ea;border-radius:6px;transform:translate(-52px,-10px);}",
        ".jp-pref-name{font-size:12px;font-weight:700;line-height:1.2;margin-bottom:4px;}",
        ".jp-pref-select{width:100%;font-size:12px;padding:2px;}",
        ".jp-map-note{font-size:12px;color:#2f4156;margin:6px 0 10px;}"
      ].join("");
      this._baseElement.appendChild(style);

      var note = document.createElement("div");
      note.className = "jp-map-note";
      note.textContent = "簡易地図（位置は概略）: 各都道府県に対して県庁所在地を選択";
      this._baseElement.appendChild(note);

      var wrap = document.createElement("div");
      wrap.className = "jp-map-wrap";
      var panel = document.createElement("div");
      panel.className = "jp-map-panel";
      wrap.appendChild(panel);

      for (var i = 0; i < PREFECTURES.length; i += 1) {
        var p = PREFECTURES[i];
        var node = document.createElement("div");
        node.className = "jp-pref-node";
        node.style.left = p.x + "px";
        node.style.top = p.y + "px";

        var label = document.createElement("div");
        label.className = "jp-pref-name";
        label.textContent = p.pref;
        node.appendChild(label);

        var select = document.createElement("select");
        select.className = "jp-pref-select";
        select.setAttribute("data-pref-code", p.code);

        var blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "-- 選択 --";
        select.appendChild(blank);

        for (var j = 0; j < CAPITAL_OPTIONS.length; j += 1) {
          var city = CAPITAL_OPTIONS[j];
          var opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          select.appendChild(opt);
        }

        if (this._state.selections[p.code]) {
          select.value = this._state.selections[p.code];
        }

        var onChange = this._onSelectChange.bind(this);
        select.addEventListener("change", onChange);
        this._eventHandlers.push({ el: select, fn: onChange });

        node.appendChild(select);
        panel.appendChild(node);
      }

      this._baseElement.appendChild(wrap);
    },

    _onSelectChange: function (event) {
      var code = event.target.getAttribute("data-pref-code");
      this._state.selections[code] = event.target.value;
    },

    getResponse: function () {
      return {
        base: {
          string: this._serializeSelections()
        }
      };
    },

    getState: function () {
      return JSON.stringify(this._state);
    },

    _serializeSelections: function () {
      var parts = [];
      for (var i = 0; i < PREFECTURES.length; i += 1) {
        var p = PREFECTURES[i];
        var value = this._state.selections[p.code] || "";
        parts.push(p.code + ":" + value);
      }
      return parts.join("|");
    },

    cleanup: function () {
      for (var i = 0; i < this._eventHandlers.length; i += 1) {
        var h = this._eventHandlers[i];
        h.el.removeEventListener("change", h.fn);
      }
      this._eventHandlers = [];
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
