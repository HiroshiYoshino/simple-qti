"use strict";

/*
 * 問題固有モジュール（宣言中心）
 * - モデル定義
 * - レスポンス変換
 * - レンダラへの設定受け渡し
 */
define(["qtiCustomInteractionContext", "pciSimpleCore", "choiceRenderer"], function (ctx, core, choiceRenderer) {
  var schema = {
    inputName: "pci-basic-choice-split",
    options: [
      { id: "A", label: "A: 正しくない" },
      { id: "B", label: "B: 正しい" }
    ]
  };

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
    responseToModel: function (response) {
      var next = "";
      if (response && response.base && typeof response.base.string === "string") {
        next = response.base.string;
      }
      return { selected: next };
    },

    // 役割: 共通レンダラを使って問題UIを描画する。
    renderQuestion: function (container, model, props, onModelChange) {
      return choiceRenderer.render(container, model, props, schema, function (selected) {
        onModelChange({ selected: selected });
      });
    },

    // 役割: 描画済みUIの表示だけを同期更新する。
    syncView: function (view, model, props) {
      if (!view || !view.statusEl) {
        return;
      }
      choiceRenderer.setStatus(view.statusEl, model.selected, props);
    },

    // 役割: UIイベントリスナの後始末を行う。
    cleanupQuestion: function (view) {
      choiceRenderer.cleanup(view);
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
