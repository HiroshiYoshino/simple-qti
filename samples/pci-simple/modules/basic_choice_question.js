"use strict";

/*
 * 問題固有モジュール
 * - 状態モデル定義（selected）
 * - モデル <-> QTIレスポンス変換
 * - UI描画
 */
define(["qtiCustomInteractionContext", "pciSimpleCore"], function (ctx, core) {
  var question = {
    // 役割: 設定値（properties）を組み立てる。
    resolveProps: function (configuration) {
      var defaults = {
        defaultChoice: "",
        promptPrefix: "現在の選択: ",
        promptText: "次のうち正しいものを選んでください: 「2 + 2 = 4」"
      };
      var props = (configuration && configuration.properties) || {};
      return Object.assign({}, defaults, props);
    },

    // 役割: この問題の初期モデルを返す。
    createInitialModel: function (props) {
      return { selected: props.defaultChoice || "" };
    },

    // 役割: モデルをstate文字列へ変換する。
    serializeModel: function (model) {
      return JSON.stringify(model || { selected: "" });
    },

    // 役割: state文字列からモデルを復元する。
    deserializeModel: function (stateString, props) {
      var parsed = JSON.parse(stateString);
      if (!parsed || typeof parsed.selected !== "string") {
        return question.createInitialModel(props);
      }
      return parsed;
    },

    // 役割: モデルをQTIレスポンス形式に変換する。
    buildResponse: function (model) {
      return {
        base: {
          string: (model && model.selected) || ""
        }
      };
    },

    // 役割: QTIレスポンスをモデルへ変換する。
    responseToModel: function (response, prevModel) {
      var next = "";
      if (response && response.base && typeof response.base.string === "string") {
        next = response.base.string;
      }
      return {
        selected: next || (prevModel && prevModel.selected) || ""
      };
    },

    // 役割: 問題UIを描画し、viewオブジェクトを返す。
    renderQuestion: function (container, model, props, onModelChange) {
      container.innerHTML = "";

      var style = document.createElement("style");
      style.textContent = [
        ".pci-basic-wrap{border:1px solid #ccd6e2;border-radius:8px;padding:10px;background:#f9fbff;max-width:420px;}",
        ".pci-basic-prompt{margin:0 0 8px 0;font-size:14px;color:#213a55;}",
        ".pci-basic-option{display:block;margin:6px 0;font-size:14px;}",
        ".pci-basic-status{margin-top:8px;font-size:12px;color:#314a66;}"
      ].join("");
      container.appendChild(style);

      var wrap = document.createElement("div");
      wrap.className = "pci-basic-wrap";

      var prompt = document.createElement("p");
      prompt.className = "pci-basic-prompt";
      prompt.textContent = props.promptText;
      wrap.appendChild(prompt);

      var options = [
        { id: "A", label: "A: 正しくない" },
        { id: "B", label: "B: 正しい" }
      ];

      var handlers = [];
      for (var i = 0; i < options.length; i += 1) {
        var opt = options[i];
        var label = document.createElement("label");
        label.className = "pci-basic-option";

        var input = document.createElement("input");
        input.type = "radio";
        input.name = "pci-basic-choice-split";
        input.value = opt.id;
        if (model.selected === opt.id) {
          input.checked = true;
        }

        var handler = function (event) {
          if (!event.target.checked) {
            return;
          }
          onModelChange({ selected: event.target.value });
        };
        input.addEventListener("change", handler);
        handlers.push({ el: input, fn: handler });

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt.label));
        wrap.appendChild(label);
      }

      var status = document.createElement("div");
      status.className = "pci-basic-status";
      status.textContent = model.selected ? (props.promptPrefix + model.selected) : "未選択";
      wrap.appendChild(status);

      container.appendChild(wrap);

      return {
        statusEl: status,
        handlers: handlers
      };
    },

    // 役割: 描画済みUIの表示だけを同期更新する。
    syncView: function (view, model, props) {
      if (!view || !view.statusEl) {
        return;
      }
      view.statusEl.textContent = model.selected ? (props.promptPrefix + model.selected) : "未選択";
    },

    // 役割: UIイベントリスナの後始末を行う。
    cleanupQuestion: function (view) {
      if (!view || !view.handlers) {
        return;
      }
      for (var i = 0; i < view.handlers.length; i += 1) {
        view.handlers[i].el.removeEventListener("change", view.handlers[i].fn);
      }
    }
  };

  var pci = core.createCore({
    typeIdentifier: "urn:example.jp:pci:basic-choice-split:v1",
    resolveProps: question.resolveProps,
    createInitialModel: question.createInitialModel,
    serializeModel: question.serializeModel,
    deserializeModel: question.deserializeModel,
    buildResponse: question.buildResponse,
    responseToModel: question.responseToModel,
    renderQuestion: question.renderQuestion,
    syncView: question.syncView,
    cleanupQuestion: question.cleanupQuestion
  });

  if (ctx) {
    ctx.register(pci);
  }
  return pci;
});
