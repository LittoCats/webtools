/*******************************************************************************
 * @author      : 程巍巍 (littocats@gmail.com)
 * @created     : Sunday Aug 28, 2022 09:28:56 CST
 *
 * @description : index
 *
 ******************************************************************************/
import { useEffect, useRef } from "react";
import Phonetic from "./packages/phonetic";
import OnScreenKeyboard from "./packages/on-screen-keyboard";

export default function Main() {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const input = editor.current;
    if (!input) return;

    OnScreenKeyboard.Default().use(Keyboard).hide(false);

    Phonetic.Default()
      .use({
        name: "custom",
        code: "@",
        data: Keyboard,
      })
      .attach(input);

    return () => {
      Phonetic.Default().detach(input);
    };
  }, []);
  return (
    <>
      <div ref={editor} id={"editor"} contentEditable={true} />
    </>
  );
}

const Keyboard: OnScreenKeyboard.Table = [
  [
    { codec: "aab", value: "`" },
    ...Array(10)
      .fill(0)
      .map((_, index) => ({ codec: `${index}`, value: `${index}` })),
    { codec: "-", value: "-" },
    { codec: "=", value: "=" },
    { codec: "", value: "Del", weight: 1.5 },
  ],
  [
    { codec: "`", value: "Tab", weight: 1.5 },
    ...Array.from("qwertyuiop[]\\").map((char) => ({
      codec: char,
      value: char,
    })),
  ],
  [
    { codec: "", value: 0, weight: 1.8, label: "Caps" },
    ...Array.from("asdfghjkl;'").map((char) => ({ codec: char, value: char })),
    { codec: "", value: 23, weight: 1.9, label: "Enter" },
  ],
  [
    {
      codec: "",
      value: 27,
      weight: 2.4,
      label: "Shift",
    },
    ...Array.from("zxcvbnm,./").map((char) => ({ codec: char, value: char })),
    {
      codec: "",
      value: 27,
      weight: 2.4,
      label: "Shift",
    },
  ],
  [
    { codec: "", value: "", label: "Fn" },
    { codec: "", value: "", label: "Ctrl" },
    { codec: "", value: "", label: "Alt" },
    { codec: "", value: "", label: "Win", weight: 1.3 },
    { codec: "", value: "", label: "Space", weight: 5.5 },
    { codec: "", value: "", label: "Win", weight: 1.3 },
    { codec: "", value: "", label: "Alt" },
    { codec: "", value: "", label: "", weight: 3.3 },
  ],
].map((items) =>
  items.map((item: OnScreenKeyboard.Entry) => {
    item.onKeyDown = onKeyDown;
    item.onKeyUp = onKeyUp;
    item.onKeyCancel = onKeyCancel;
    return item;
  })
);

function onKeyDown(entry) {
  console.log("keydown", entry);
}

function onKeyUp(entry) {
  console.log("keyup", entry);
}

function onKeyCancel(entry) {
  console.log("keycancel", entry);
}
