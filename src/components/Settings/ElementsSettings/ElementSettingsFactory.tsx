import * as React from 'react';

import plugins from '../../generic/plugins';

export default class ElementSettingsFactory {

  static uniqueId = 0;

  static getSettingsEditor(element: IElement): JSX.Element {

    if (!element) { return null; }

    let ReactElementClass = plugins[element.type];
    if (ReactElementClass.editor) {
      let SettingsEditor = ReactElementClass.editor;
      return <SettingsEditor key={ElementSettingsFactory.uniqueId++} settings={element} />;
    }
    return null;
  }
}