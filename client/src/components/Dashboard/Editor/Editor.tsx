import * as React from 'react';

import Dialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons/Button';
import Toolbar from 'react-md/lib/Toolbars';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import SelectField from 'react-md/lib/SelectFields';

import AceEditor, { EditorProps, Annotation } from 'react-ace';
import * as brace from 'brace';
import 'brace/mode/javascript';
import 'brace/ext/searchbox';
import 'brace/ext/language_tools';

import EditorActions from './EditorActions';
import EditorStore from './EditorStore';
import { Toast, ToastActions, IToast } from '../../Toast';
import ConfigurationsActions from '../../../actions/ConfigurationsActions';

const themes: string[] = ['github', 'twilight'];
themes.forEach((theme) => {
  require(`brace/theme/${theme}`);
});

const editorProps: EditorProps = {
  $blockScrolling: 1
};

interface IEditorProps {
  offsetHeight?: number;
  dashboard?: IDashboardConfig;
}

interface IEditorState {
  value?: string;
  visible?: boolean;
  selectedTheme: number;
  // internal
  saveDisabled: boolean;
}

export default class Editor extends React.PureComponent<IEditorProps, IEditorState> {

  static defaultProps = {
    offsetHeight: 64 // set to height of header / toolbar
  };

  private aceEditor?: AceEditor;
  private originalValue: string;

  constructor(props: IEditorProps) {
    super(props);

    this.state = EditorStore.getState();

    this.onChange = this.onChange.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.copy = this.copy.bind(this);
    this.trySave = this.trySave.bind(this);
    this.onLint = this.onLint.bind(this);
  }

  componentDidMount() {
    EditorStore.listen(this.onChange);
  }
  componentWillUnmount() {
    EditorStore.unlisten(this.onChange);
  }

  onChange(state: IEditorState) {
    const { value, visible, selectedTheme, saveDisabled } = state;
    if (!this.originalValue) {
      this.originalValue = value;
    }
    this.setState({ value, visible, selectedTheme, saveDisabled });
  }

  openDialog = (dashboardId: string) => {
    EditorActions.openDialog();
    EditorActions.loadDashboard(dashboardId);
  }

  closeDialog = () => {
    EditorActions.closeDialog();
  }

  undo() {
    this.aceEditor['editor'].undo();
  }

  redo() {
    this.aceEditor['editor'].redo();
  }

  copy() {
    if (!document.queryCommandSupported('copy')) {
      this.toast('Browser not supported');
      return;
    }
    const {value} = this.state;
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    this.toast('Copied to clipboard');
  }

  trySave() {
    if (!this.isModified()) {
      this.closeDialog(); // close if no changes
    } else {
      this.save();
    }
  }

  onLint(annotations: Annotation[]) {
    const { saveDisabled } = this.state;
    const isLintPassed = this.isLintPassed();
    if (isLintPassed && saveDisabled) {
      this.setState({ saveDisabled: false });
    } else if (!isLintPassed && !saveDisabled) {
      this.setState({ saveDisabled: true });
    }
  }

  render() {
    const { visible, value, selectedTheme, saveDisabled } = this.state;
    const theme = themes[selectedTheme];
    const saveLabel = !saveDisabled ? 'Save' : 'Fix errors';
    const saveClass = !saveDisabled ? 'pass' : 'fail';
    const actionButtons = [
      (
        <SelectField
          id="theme"
          placeholder="Theme"
          position={SelectField.Positions.BELOW}
          defaultValue={theme}
          menuItems={themes}
          onChange={(newValue, index) => EditorActions.selectTheme(index)}
          tabIndex={-1}
        />
      ),
      <Button icon tooltipLabel="Undo" onClick={this.undo} tabIndex={-1}>undo</Button>,
      <Button icon tooltipLabel="Redo" onClick={this.redo} tabIndex={-1}>redo</Button>,
      <Button icon tooltipLabel="Copy document" onClick={this.copy} tabIndex={-1}>content_copy</Button>,
      (
        <Button
          flat
          label={saveLabel}
          className={saveClass}
          onClick={this.trySave}
          tabIndex={-1}
          accessKey="s"
          disabled={saveDisabled}
        />
      )
    ];

    const actions = !value ? null : actionButtons;
    const content = !value ? this.renderLoading() : this.renderEditor(value, theme);

    return (
      <Dialog
        id="editDialog"
        visible={visible}
        aria-label="Edit Dashboard"
        dialogStyle={{ overflow: 'hidden' }}
        contentStyle={{ overflow: 'hidden' }}
        fullPage
        focusOnMount={false}
      >
        <Toolbar
          colored
          nav={<Button icon onClick={this.closeDialog} tabIndex={-1}>close</Button>}
          actions={actions}
          title="Edit dashboard"
          fixed
        />
        {content}
      </Dialog>
    );
  }

  private renderLoading() {
    return (
      <div className="layout">
        <div className="center">
          <CircularProgress id="loading" />
        </div>
      </div>
    );
  }

  private renderEditor(value: string, theme: string) {
    const { offsetHeight } = this.props;
    const calculatedHeight = offsetHeight > 0 ? 'calc(100vh - ' + offsetHeight + 'px)' : '100vh';
    return (
      <div className="md-grid md-grid--no-spacing">
        <form className="md-toolbar-relative" style={{ width: '100%' }}>
          <AceEditor
            ref={(self) => this.aceEditor = self}
            value={value}
            onLoad={(editor) => editor['session'].$worker.on('annotate', (e) => this.onLint(e.data))}
            onChange={(newValue) => EditorActions.updateValue(newValue)}
            mode="javascript"
            theme={theme}
            name="ace"
            showGutter={true}
            showPrintMargin={false}
            highlightActiveLine={true}
            tabSize={2}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            width="100%"
            height={calculatedHeight}
            editorProps={editorProps}
          />
        </form>
      </div>
    );
  }

  private isEditor(): boolean {
    if (!this.aceEditor || !this.aceEditor['editor']) {
      return false;
    }
    return true;
  }

  private isModified(): boolean {
    if (!this.isEditor || !this.originalValue) {
      return false;
    }
    const {value} = this.state;
    return (this.originalValue !== value);
  }

  private isLintPassed(): boolean {
    const annotations = this.aceEditor['editor'].getSession().getAnnotations();
    return (annotations.findIndex(annotation => annotation.type === 'error') === -1);
  }

  private save() {
    const {dashboard} = this.props;
    const {value} = this.state;
    const objectString = value.replace(/(^\s*return\s*)|(\s*$)/g, '');
    let newDashboard: IDashboardConfig = null;
    
    try {
      // tslint:disable-next-line:no-eval
      newDashboard = eval('(' + objectString + ')') as IDashboardConfig;
    } catch (e) {
      throw new Error('Failed to parse dashboard.');
    }

    // overwrites existing dashboard
    if (dashboard && dashboard.id && dashboard.url) {
      newDashboard.id = dashboard.id;
      newDashboard.url = dashboard.url;
    }
    
    this.toast('Saving changes');
    ConfigurationsActions.saveConfiguration(newDashboard);
  }

  private toast(text: string) {
    ToastActions.showText(text);
  }

}