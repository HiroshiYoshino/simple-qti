"use strict";

define(["qtiCustomInteractionContext"], function (ctx) {
  /*
   * PCIの典型的な呼び出し順（実際のタイミングはプレイヤー実装に依存）
   * 1. getInstance: プレイヤーがインスタンス生成
   * 2. onready通知: PCIが初期化完了を通知
   * 3. onchanged通知: PCIが変更を通知（任意）
   * 4. getResponse: プレイヤーが回答値を取得
   * 5. getState: プレイヤーが復元用状態を取得
   * 6. cleanup: プレイヤーが破棄時に後始末を実行
   */
  var pci = {
    typeIdentifier: "urn:example.jp:pci:basic-choice:v1",
    _baseElement: null,
    _config: {},
    // プレイヤーから渡される設定値（properties）の例。
    _props: {
      defaultChoice: "",
      promptPrefix: "現在の選択: "
    },
    _state: { selected: "" },
    _handlers: [],

    getInstance: function (dom, configuration, state) {
      // 役割: PCIインスタンスを生成し、初期化処理へ接続する。
      var instance = this._extend({}, this);
      instance._state = { selected: "" };
      instance._handlers = [];
      instance._init(dom, configuration, state);
      return instance;
    },

    _init: function (dom, configuration, state) {
      // 役割: プレイヤーから渡された設定と状態を受け取り、初期表示を組み立てる。
      this._baseElement = dom;
      this._config = configuration || {};
      this._props = this._extend(this._props, this._config.properties || {});

      // 役割: 以前保存したstate文字列があれば復元する。
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

      // 役割: stateが無い場合は設定値を初期選択として反映する。
      if (!this._state.selected && this._props.defaultChoice) {
        this._state.selected = this._props.defaultChoice;
      }

      this._render();
      this.oncompleted = this.cleanup.bind(this);

      // 役割: 初期化完了をプレイヤーへ通知する。
      if (this._config.onready) {
        this._config.onready(this, this.getState());
      }
    },

    _render: function () {
      // 役割: 現在stateをもとにUIを描画し直す。
      this._baseElement.innerHTML = "";

      var style = document.createElement("style");
      style.textContent = [
        ".pci-basic-wrap{border:1px solid #ccd6e2;border-radius:8px;padding:10px;background:#f9fbff;max-width:420px;}",
        ".pci-basic-option{display:block;margin:6px 0;font-size:14px;}",
        ".pci-basic-status{margin-top:8px;font-size:12px;color:#314a66;}"
      ].join("");
      this._baseElement.appendChild(style);

      var wrap = document.createElement("div");
      wrap.className = "pci-basic-wrap";

      var options = [
        { id: "A", label: "A: 正しくない" },
        { id: "B", label: "B: 正しい" }
      ];

      for (var i = 0; i < options.length; i += 1) {
        var opt = options[i];
        var label = document.createElement("label");
        label.className = "pci-basic-option";

        var input = document.createElement("input");
        input.type = "radio";
        input.name = "pci-basic-choice";
        input.value = opt.id;
        if (this._state.selected === opt.id) {
          input.checked = true;
        }

        var handler = this._onChange.bind(this);
        input.addEventListener("change", handler);
        this._handlers.push({ el: input, fn: handler, type: "change" });

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt.label));
        wrap.appendChild(label);
      }

      var status = document.createElement("div");
      status.className = "pci-basic-status";
      status.setAttribute("data-role", "status");
      status.textContent = this._state.selected ? (this._props.promptPrefix + this._state.selected) : "未選択";
      wrap.appendChild(status);

      this._baseElement.appendChild(wrap);
    },

    _onChange: function (event) {
      // 役割: 選択変更をstateへ反映し、表示更新と変更通知を行う。
      if (!event.target.checked) {
        return;
      }
      this._state.selected = event.target.value;
      var status = this._baseElement.querySelector('[data-role="status"]');
      if (status) {
        status.textContent = this._props.promptPrefix + this._state.selected;
      }
      this._notifyChange();
    },

    _notifyChange: function () {
      // 役割: 回答変更をプレイヤーへ通知する（onchangedがある場合のみ）。
      if (this._config && typeof this._config.onchanged === "function") {
        this._config.onchanged(this, this.getState());
      }
    },

    // 役割: 採点対象の回答値（RESPONSE）をプレイヤーへ返す。
    getResponse: function () {
      return {
        base: {
          string: this._state.selected || ""
        }
      };
    },

    // 役割: 復元用の内部状態を文字列でプレイヤーへ返す。
    getState: function () {
      return JSON.stringify(this._state);
    },

    // 役割: プレイヤーから回答値を再注入された場合にstateへ反映する。
    setResponse: function (response) {
      var next = "";
      if (response && response.base && typeof response.base.string === "string") {
        next = response.base.string;
      }
      this._state.selected = next;
      this._render();
    },

    // 役割: プレイヤーからstateを後適用された場合に復元する。
    setState: function (state) {
      if (!state) {
        return;
      }
      try {
        var parsed = JSON.parse(state);
        if (parsed && typeof parsed.selected === "string") {
          this._state.selected = parsed.selected;
          this._render();
        }
      } catch (_e) {
        // no-op: 不正stateは無視する
      }
    },

    // 役割: 状態を初期化し、必要に応じてプレイヤーへ変更通知する。
    reset: function () {
      this._state.selected = "";
      this._render();
      this._notifyChange();
    },

    // 役割: イベントリスナを解除して破棄時の後始末を行う。
    cleanup: function () {
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
