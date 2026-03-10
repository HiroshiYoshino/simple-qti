"use strict";

/*
 * 選択式UIの共通レンダラ
 * - プロンプト、選択肢、状態表示の描画
 * - 選択イベントの購読/解除
 */
define(function () {
  var renderer = {
    render: function (container, model, props, schema, onSelect) {
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

      var handlers = [];
      for (var i = 0; i < schema.options.length; i += 1) {
        var opt = schema.options[i];
        var label = document.createElement("label");
        label.className = "pci-basic-option";

        var input = document.createElement("input");
        input.type = "radio";
        input.name = schema.inputName;
        input.value = opt.id;
        if (model.selected === opt.id) {
          input.checked = true;
        }

        var handler = function (event) {
          if (!event.target.checked) {
            return;
          }
          onSelect(event.target.value);
        };
        input.addEventListener("change", handler);
        handlers.push({ el: input, fn: handler });

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt.label));
        wrap.appendChild(label);
      }

      var status = document.createElement("div");
      status.className = "pci-basic-status";
      renderer.setStatus(status, model.selected, props);
      wrap.appendChild(status);

      container.appendChild(wrap);

      return {
        statusEl: status,
        handlers: handlers
      };
    },

    setStatus: function (statusEl, selected, props) {
      statusEl.textContent = selected ? (props.promptPrefix + selected) : "未選択";
    },

    cleanup: function (view) {
      if (!view || !view.handlers) {
        return;
      }
      for (var i = 0; i < view.handlers.length; i += 1) {
        view.handlers[i].el.removeEventListener("change", view.handlers[i].fn);
      }
    }
  };

  return renderer;
});
