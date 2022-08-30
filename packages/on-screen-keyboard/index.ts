/*******************************************************************************
 * @author      : 程巍巍 (littocats@gmail.com)
 * @created     : Sunday Aug 28, 2022 09:24:55 CST
 *
 * @description : index
 *
 ******************************************************************************/

import type Phonetic from "../phonetic";

namespace OnScreenKeyboard {
  export type Options = {
    id?: string;
  };

  export type Table = Entry[][] | Entry[];
  export type Entry = Phonetic.Entry & {
    /**
     * default 1x, 正方型按銉
     */
    weight?: number;
    label?: string;

    // 因为浏览器环境不一，模拟的 keydown keyup 事件，不一定能触发 input 等元素的输入事件
    // 需要使用以下方法，实现按键功能
    onKeyDown?(entry: Entry): void;
    onKeyUp?(entry: Entry): void;
    onKeyCancel?(entry: Entry): void;
  };
}
interface OnScreenKeyboard {
  hidden(): boolean;
  hide(visible?: boolean): OnScreenKeyboard;
  use(table: OnScreenKeyboard.Table): OnScreenKeyboard;
}
function OnScreenKeyboard(
  options?: OnScreenKeyboard.Options
): OnScreenKeyboard {
  const keyboard: OnScreenKeyboard = Object.setPrototypeOf(
    {
      hidden: $hidden,
      hide: $hide,
      use: $use,
    },
    OnScreenKeyboard
  );

  const E_Sym = Symbol("OSK-Entry");
  let activeElement: EventTarget | undefined; /* HTMLElement */

  const ui = document.createElement("div");
  ui.addEventListener("pointerdown", onPointerDown);
  ui.className = "osk vk";
  if (options?.id) ui.id = options.id;

  return keyboard;

  function $hidden(): boolean {
    return !!ui.parentElement;
  }

  function $hide(hidden = true): OnScreenKeyboard {
    if (!hidden) !ui.parentElement && document.body.append(ui);
    else ui.remove();
    return keyboard;
  }

  function $use(table: OnScreenKeyboard.Table): OnScreenKeyboard {
    ui.innerHTML = "";
    let matrix: OnScreenKeyboard.Entry[][];
    let wrap = "";
    if (table[0] && !Array.isArray(table[0])) {
      matrix = [table as OnScreenKeyboard.Entry[]];
      wrap = "wrap";
    } else matrix = table as OnScreenKeyboard.Entry[][];

    for (const entries of matrix) {
      const line = document.createElement("div");
      line.addEventListener("pointerdown", onPointerDown);
      if (wrap) line.className = wrap;
      ui.append(line);

      for (const entry of entries) {
        const item = document.createElement("div");
        item[E_Sym] = entry;
        item.addEventListener("pointerdown", onKeyDown);
        item.addEventListener("pointerdown", onPointerDown);
        item.dataset.codec = entry.codec;
        item.dataset.label = `${entry.label || entry.value}`;
        item.dataset.value =
          typeof entry.value === "string"
            ? entry.value
            : String.fromCharCode(entry.value);
        item.style.setProperty("width", `${(entry.weight || 1) * 2}em`);
        line.append(item);
      }
    }
    if (!document.getElementById("osk-style")) {
      const style = document.createElement("style");
      style.id = "osk-style";
      style.innerText = OSKStyle;
      document.head.append(style);
    }
    return keyboard;
  }

  function onKeyDown(event: PointerEvent) {
    const entry: OnScreenKeyboard.Entry = event.currentTarget[E_Sym];
    if (!entry) return;
    activeElement = event.currentTarget;
    document.addEventListener("pointerup", onKeyUp, { once: true });
    entry.onKeyDown?.(entry);
  }

  function onKeyUp(event: PointerEvent) {
    const entry: OnScreenKeyboard.Entry = event.target[E_Sym];
    const previous = activeElement;
    activeElement = null;

    if (!entry || previous !== event.target) {
      const entry = previous?.[E_Sym];
      if (entry) entry.onKeyCancel?.(entry);
    } else {
      entry.onKeyUp?.(entry);
    }
  }

  function onPointerDown(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget === ui && event.buttons === 1)
      window.addEventListener("pointermove", onPointerMove);
  }

  function onPointerMove(event: PointerEvent) {
    if (event.buttons !== 1)
      return window.removeEventListener("pointermove", onPointerMove);

    const rect = ui.getBoundingClientRect();
    const view = window.visualViewport;

    ui.style.setProperty(
      "bottom",
      `${((view.height - rect.bottom - event.movementY) / view.height) * 100}vh`
    );
    ui.style.setProperty(
      "right",
      `${((view.width - rect.right - event.movementX) / view.width) * 100}vw`
    );
  }
}

const OSKStyle = `
.osk {
  position: absolute;
  bottom: 1em;
  right: 1em;
  background-color: #000000aa;
  padding: 1em;
  display: flex;
  flex-direction: column;
  border-radius: 0.5em;
  cursor: move;
}
.osk > div {
  display: flex;
  column-gap: 0.3em;
  padding: 0.15em;
  flex-direction: row;
  justify-content: center;
  font-size: inherit;
  cursor: default;
}
.osk > div.wrap {
  flex-wrap: wrap;
}
.osk > div > div {
  font-size: inherit;
  border-radius: 0.3em;
  height: 2em;
  line-height: 1.3em;
  background-color: black;
  text-align: center;
  color: white;
  cursor: default;
}
.osk > div > div:active {
  background-color: darkgrey;
}
.osk > div > div:before {
  content: attr(data-label);
}
.osk > div > div:after {
  content: attr(data-codec);
  display: block;
  font-size: 0.7em;
  line-height: 0.7em;
  color: grey;
  // transform: translateY(-100%);
}
`;

OnScreenKeyboard.Default = function Default(): OnScreenKeyboard {
  return (
    Default.prototype.keyboard ||
    (Default.prototype.keyboard = OnScreenKeyboard({}))
  );
};

export { OnScreenKeyboard };
export default OnScreenKeyboard;
