/*******************************************************************************
 * @author      : 程巍巍 (littocats@gmail.com)
 * @created     : Sunday Aug 28, 2022 09:24:31 CST
 *
 * @description : index
 *
 ******************************************************************************/
import Modifiers = Candidate.Modifiers;

namespace Phonetic {
  export type Options = {
    id?: string;

    onInput?(text: string): void;
  };

  export type Table<T extends Entry = Entry> = {
    // language name
    name: string;
    // language code
    code: string;
    data: T[] | T[][];
  };

  export type Entry = {
    codec: string;
    value: string | number;
  };
}
interface Phonetic {
  attach(element: HTMLElement): Phonetic;
  detach(element: HTMLElement): Phonetic;

  table(): Phonetic.Table;
  use(table: Phonetic.Table): Phonetic;
}

function Phonetic(options?: Phonetic.Options): Phonetic {
  const table: Phonetic.Table = {
    name: "@",
    code: "@",
    data: [],
  };
  const database = Database();
  const candidate = Candidate(database, { onInput });

  const instance: Phonetic = Object.setPrototypeOf(
    {
      attach: $attach,
      detach: $detach,
      table: $table,
      use: $use,
    },
    Phonetic.prototype
  );

  return instance;

  function $attach(element: HTMLElement): Phonetic {
    element.addEventListener("keydown", onKeyDown);
    element.addEventListener("blur", onBlur);
    return instance;
  }

  function $detach(element: HTMLElement): Phonetic {
    element.removeEventListener("keydown", onKeyDown);
    element.removeEventListener("blur", onBlur);
    return instance;
  }

  function $table(): Phonetic.Table {
    return table;
  }

  function $use(table: Phonetic.Table): Phonetic {
    if (table.data.length) {
      const groups = Array.isArray(table.data[0]) ? table.data : [table.data];
      for (const entries of groups as Phonetic.Entry[][]) {
        for (const entry of entries) {
          const value =
            typeof entry.value === "number"
              ? String.fromCharCode(entry.value)
              : entry.value;
          database.use(entry.codec, value);
        }
      }
    }
    return instance;
  }

  /**
   * handle Backspace
   * @param event
   */
  function onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const options = {
      isAlt: event.altKey,
      isShift: event.shiftKey,
      isCtrl: event.ctrlKey,
      isMeta: event.metaKey,
    };
    if (key === "Backspace") {
      if (candidate.backspace(options)) {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (candidate.input(event.key, options)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function onBlur() {
    candidate.clear();
  }

  function onInput(key: string) {
    options?.onInput?.(key);
  }
}

namespace Candidate {
  export type Options = {
    onInput?(text: string): void;
  };
  export type Modifiers = {
    isAlt: boolean;
    isCtrl: boolean;
    isShift: boolean;
    isMeta: boolean;
  };
}
interface Candidate {
  input(key: string, options: Candidate.Modifiers): boolean;
  backspace(options: Candidate.Modifiers): boolean;
  clear(): void;
}
function Candidate(database: Database, options?: Candidate.Options): Candidate {
  const candidate = document.createElement("div");
  candidate.className = "pim";

  return Object.setPrototypeOf(
    {
      input: $input,
      backspace: $backspace,
      clear: $clear,
    },
    Candidate.prototype
  );

  /**
   *
   * @param key
   */
  function $input(key: string, m: Candidate.Modifiers): boolean {
    // TODO: 暂时不处理组合键
    if (m.isAlt || m.isCtrl || m.isMeta || m.isShift) return false;

    let current = candidate.dataset.value || "";
    let consumed = false;
    if (key.length > 1 || key.trim().length === 0) {
      // 如果存在备选结果，输出备选结果
      if (current) {
        const entry = database.match(current).shift();
        consumed = !!entry?.value;
        if (entry?.value) options?.onInput?.(entry.value as string);
      }
      candidate.dataset.value = "";
    } else {
      const cc = !current ? [] : database.match(current);
      let nc = database.match(current + key);
      if (nc.length === 0) {
        if (cc.length) options?.onInput?.(cc[0].value as string);
        nc = database.match(key);
        candidate.dataset.value = key;
        current = "";
      }
      if (nc.length === 1) {
        options?.onInput?.(nc[0].value as string);
        candidate.dataset.value = "";
      } else {
        candidate.dataset.value = current + key;
        candidate.innerHTML = "<div>" + nc.map(render).join("") + "</div>";
      }
      consumed = true;
    }
    refresh();
    return consumed;
  }

  /**
   *
   */
  function $backspace(m: Modifiers): boolean {
    let consumed = false;
    if (m.isAlt || m.isCtrl || m.isMeta || m.isShift) return consumed;

    if (candidate.dataset.value?.length > 0) {
      candidate.dataset.value = candidate.dataset.value.slice(0, -1);
      consumed = true;
    }
    refresh();
    return consumed;
  }

  function $clear() {
    candidate.dataset.value = "";
    refresh();
  }

  function refresh() {
    const value = candidate.dataset.value;
    if (!value) return candidate.parentElement && candidate.remove();
    if (!candidate.parentElement) document.body.append(candidate);

    const selection = document.getSelection();
    if (selection.rangeCount < 1) return null;
    const range = selection.getRangeAt(0);
    let parent = range.endContainer;
    while (parent && !(parent instanceof HTMLElement))
      parent = parent.parentElement;
    const style =
      parent instanceof HTMLElement ? window.getComputedStyle(parent) : null;
    if (style) {
      candidate.style.fontSize = style.fontSize;
    }

    let rect = range.getBoundingClientRect();
    if (
      rect.left === 0 &&
      rect.right === 0 &&
      rect.bottom === 0 &&
      rect.top === 0
    ) {
      if (parent instanceof HTMLElement) {
        rect = parent.getBoundingClientRect();
        rect = {
          ...rect,
          left: rect.left + parseFloat(style.paddingLeft),
          top:
            rect.top +
            parseFloat(style.paddingTop) +
            (parseFloat(style.lineHeight) - parseFloat(style.fontSize)) / 2,
        };
      }
    }
    candidate.style.setProperty("left", `${rect.left}px`);
    candidate.style.setProperty("top", `${rect.top}px`);

    if (document.getElementById("pim-style")) return;
    const css = document.createElement("style");
    css.id = "pim-style";
    css.innerText = PIMStyles;
    document.head.append(css);
  }

  function render(e: Phonetic.Entry): string {
    const tx = candidate.dataset.value || "";
    return `<div data-value="${e.value}" data-codec="${e.codec.slice(
      tx.length
    )}">${tx}</div>`;
  }
}

interface Database {
  match(codec: string): Phonetic.Entry[];
  find(codec: string): Phonetic.Entry | null;
  use(codec: string, value: string | null);
}

function Database(): Database {
  type Entry = { codec?: string; value?: string; leaves: Map<number, Entry> };
  const root: Entry = { leaves: new Map() };

  return Object.setPrototypeOf(
    {
      match: $match,
      find: $find,
      use: $use,
      __root: root,
    },
    Database.prototype
  );

  function $match(codec: string): Phonetic.Entry[] {
    let entry: undefined | Entry = root;
    for (let index = 0; index < codec.length; index++) {
      entry = entry?.leaves.get(codec.charCodeAt(index));
      if (!entry) return [];
    }
    return resolve(entry, []);

    function resolve(
      entry: Entry,
      results: Phonetic.Entry[]
    ): Phonetic.Entry[] {
      if (entry.codec && entry.value)
        results.push({ codec: entry.codec, value: entry.value });
      for (const leaf of entry.leaves.values()) resolve(leaf, results);
      return results;
    }
  }

  function $find(codec: string): Phonetic.Entry | null {
    let entry: undefined | Entry = root;
    for (let index = 0; index < codec.length; index++) {
      entry = entry?.leaves.get(codec.charCodeAt(index));
      if (!entry) return null;
    }
    return entry.codec && entry.value
      ? { codec: entry.codec, value: entry.value }
      : null;
  }

  function $use(codec: string, value: string | null) {
    const indexes = Array(codec.length)
      .fill(codec)
      .map((_, index) => _.charCodeAt(index));

    patch(root, 0);

    function patch(entry: Entry, depth: number) {
      const index = indexes[depth];

      if (!entry.leaves.has(index)) {
        if (value === null) return;
        entry.leaves.set(index, { leaves: new Map() });
      }
      const current = entry.leaves.get(index);

      if (depth < indexes.length - 1) {
        patch(current, depth + 1);
      } else if (depth === indexes.length - 1) {
        if (value === null) {
          delete current.codec;
          delete current.value;
        } else {
          current.codec = codec;
          current.value = value;
        }
      }

      if (current.codec) return;
      if (current.value) return;
      if (current.leaves.size) return;

      entry.leaves.delete(index);
    }
  }
}

const PIMStyles = `
.pim {
  position: absolute;
  display: flex;
  flex-direction: row;
  overflow: visible;
}
.pim:before {
  content: attr(data-value);
  background-color: burlywood;
}

.pim > div {
  position: absolute;
  top: 100%;
  color: green;
  display: flex;
  column-gap: 0.3em;
  background-color: white;
  border-radius: 0.3em;
  box-shadow: 1px 1px lightgrey;
}
.pim > div > div {
  padding: 0.2em;
  min-width: 2em;
  font-size: 0.8em;
  color: lightgrey;
}
.pim > div > div:before {
  content: attr(data-value);
  display: block;
  font-size: 1.5em;
  color: black;
}
.pim > div > div:after {
  content: attr(data-codec);
  display: inline;
  font-size: 1em;
  color: red;
}
`;

Phonetic.Default = function Default(): Phonetic {
  return (
    Default.prototype.phonetic ||
    (Default.prototype.phonetic = Phonetic({ onInput }))
  );

  function onInput(text: string) {
    document.execCommand("insertText", false, text);
  }
};

Phonetic.Database = Database;

export { Phonetic };
export default Phonetic;
