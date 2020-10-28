import React from "react";
import { render } from "react-dom";
import { WysiwygEditor } from '@remirror/editor-wysiwyg';

import "./../style/index.css";

const NUMBER_OF_REMIRRORS = 1000;

export const EMPTY_PARAGRAPH_NODE = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

function Editors() {
  return (
    <>
      {
        [...Array(NUMBER_OF_REMIRRORS).keys()].map(i => {
          return <div key={i}>
            <h1>Remirror {i}</h1>
            <WysiwygEditor 
              initialContent={EMPTY_PARAGRAPH_NODE} 
              autoFocus={true} 
              suppressHydrationWarning
              />
            </div>
          }
        )
      }
    </>
  )
};

const editor = document.getElementById("editor-content");
render(<Editors />, editor);
