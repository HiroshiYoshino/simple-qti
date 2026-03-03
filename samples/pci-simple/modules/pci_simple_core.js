"use strict";

/*
 * PCI必須部分（汎用）
 * - プレイヤーとのライフサイクル
 * - 状態文字列の受け渡し
 * - 変更通知
 *
 * 問題固有の状態モデルやレスポンス形式は spec 側へ委譲する。
 */
define(function () {
  function createCore(spec) {
    var pci = {
      typeIdentifier: spec.typeIdentifier,
      _baseElement: null,
      _config: {},
      _props: null,
      _model: null,
      _view: null,

      // 役割: プレイヤーが最初に呼ぶインスタンス生成入口。
      getInstance: function (dom, configuration, state) {
        var instance = this._clone(this);
        instance._props = null;
        instance._model = null;
        instance._view = null;
        instance._init(dom, configuration, state);
        return instance;
      },

      // 役割: 設定・状態を受け取り、問題UIを初期化する。
      _init: function (dom, configuration, state) {
        this._baseElement = dom;
        this._config = configuration || {};

        this._props = this._resolveProps(this._config);
        this._model = this._restoreModel(state, this._props);

        this._render();
        this.oncompleted = this.cleanup.bind(this);

        if (typeof this._config.onready === "function") {
          this._config.onready(this, this.getState());
        }
      },

      // 役割: 問題固有UIを描画する。
      _render: function () {
        if (this._view && typeof this._cleanupQuestion === "function") {
          this._cleanupQuestion(this._view);
        }
        this._view = this._renderQuestion(
          this._baseElement,
          this._model,
          this._props,
          this._onModelChange.bind(this)
        );
      },

      // 役割: 問題側から受け取った最新モデルを反映し、プレイヤーへ変更通知する。
      _onModelChange: function (nextModel) {
        this._model = nextModel;
        if (typeof this._syncView === "function") {
          this._syncView(this._view, this._model, this._props);
        }
        this._notifyChange();
      },

      // 役割: 変更通知（onchanged）をプレイヤーへ渡す。
      _notifyChange: function () {
        if (this._config && typeof this._config.onchanged === "function") {
          this._config.onchanged(this, this.getState());
        }
      },

      // 役割: 採点用のレスポンス形式へ変換して返す。
      getResponse: function () {
        return this._buildResponse(this._model, this._props);
      },

      // 役割: モデルを復元可能な文字列として返す。
      getState: function () {
        return this._serializeModel(this._model, this._props);
      },

      // 役割: プレイヤーから回答値を再注入された時にモデルへ変換して反映する。
      setResponse: function (response) {
        this._model = this._responseToModel(response, this._model, this._props);
        this._render();
      },

      // 役割: プレイヤーから受け取った状態文字列をモデルへ復元して反映する。
      setState: function (state) {
        this._model = this._restoreModel(state, this._props);
        this._render();
      },

      // 役割: 問題側が定義する初期モデルへリセットする。
      reset: function () {
        this._model = this._createInitialModel(this._props);
        this._render();
        this._notifyChange();
      },

      // 役割: 破棄時の後始末を行う。
      cleanup: function () {
        if (this._view && typeof this._cleanupQuestion === "function") {
          this._cleanupQuestion(this._view);
        }
        this._view = null;
      },

      // 役割: coreオブジェクトを浅いコピーで複製する。
      _clone: function (obj) {
        return Object.assign({}, obj);
      },

      // 以下は問題側(spec)に実装を委譲するフック群。
      _resolveProps: spec.resolveProps,
      _createInitialModel: spec.createInitialModel,
      _serializeModel: spec.serializeModel,
      _deserializeModel: spec.deserializeModel,
      _buildResponse: spec.buildResponse,
      _responseToModel: spec.responseToModel,
      _renderQuestion: spec.renderQuestion,
      _syncView: spec.syncView,
      _cleanupQuestion: spec.cleanupQuestion,

      // 役割: state文字列からモデル復元。失敗時は初期モデルを返す。
      _restoreModel: function (stateString, props) {
        if (!stateString) {
          return this._createInitialModel(props);
        }
        try {
          return this._deserializeModel(stateString, props);
        } catch (_e) {
          return this._createInitialModel(props);
        }
      }
    };

    return pci;
  }

  return {
    createCore: createCore
  };
});
