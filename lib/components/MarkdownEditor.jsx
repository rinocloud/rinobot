import React, { PropTypes } from 'react'
import { Button } from '../components/Button'
import debounce from 'lodash/debounce'
import SimpleMDE from 'simplemde/dist/simplemde.min'

import * as utils from './MarkdownEditorUtils.jsx'

require('codemirror/lib/codemirror.css')
require('codemirror/mode/markdown/markdown')
// require('../../css/codemirror-overrides.css')

export class MarkdownEditor extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    options: PropTypes.object,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = { modalShown: false }

    this.onVolatileChange = this.onVolatileChange.bind(this)
    this.onChange = this.onChange.bind(this)
    this.debouncedOnChange = this.debouncedOnChange.bind(this)
    this.toolbarButton = this.toolbarButton.bind(this)
  }

  componentDidMount() {
    const initialOptions = {
      autofocus: true,
      spellChecker: false,
      initialValue: this.props.initialValue,
      toolbar: false,
      toolbarTips: true,
      element: this._textarea,
    }
    const allOptions = Object.assign({}, initialOptions, this.props.options)
    this.simplemde = new SimpleMDE(allOptions)

    this.$codemirror = this._node.querySelectorAll('.CodeMirror')[0]
    this.$codemirror.addEventListener('keyup', this.onVolatileChange)
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialValue === '' && prevProps.initialValue !== '') {
      this.simplemde.codemirror.getDoc().setValue('')
    }
  }

  componentWillUnmount() {
    this.$codemirror.removeEventListener('keyup', this.onVolatileChange)
    if (this.simplemde) this.simplemde.codemirror.toTextArea()
  }

  onVolatileChange() {
    this.setState({ value: this.simplemde.value() })
    this.debouncedOnChange()
  }

  onChange() {
    if (this.props.onChange != null) {
      this.props.onChange.call(this, this.state.value)
    }
  }

  debouncedOnChange = debounce(() => {
    this.onChange()
  }, 250)

  toolbarButton(type) {
    if (type === 'toggleBlockMath') {
      utils.toggleMath(this.simplemde, 'block-math', '\n$$ ', ' $$\n')
    } else if (type === 'toggleInlineMath') {
      utils.toggleMath(this.simplemde, 'inline-math', '$ ', ' $')
    } else {
      utils[type](this.simplemde)
    }
    return this.onVolatileChange()
  }

  render() {
    return (
      <div>
        <div className="editor-toolbar">
          <Button onClick={() => this.toolbarButton('toggleBold')}>
            <i className="fa fa-bold" />
          </Button>

          <Button onClick={() => this.toolbarButton('toggleItalic')}>
            <i className="fa fa-italic" />
          </Button>

          <Button onClick={() => this.toolbarButton('toggleHeadingSmaller')}>
            <i className="fa fa-header" />
          </Button>

          <i className="separator">|</i>

          <Button onClick={() => this.toolbarButton('toggleCodeBlock')}>
            <i className="fa fa-code" />
          </Button>

          <Button onClick={() => this.toolbarButton('toggleBlockquote')}>
            <i className="fa fa-quote-left" />
          </Button>

          <Button onClick={() => this.toolbarButton('toggleUnorderedList')}>
            <i className="fa fa-list-ul" />
          </Button>

          <Button onClick={() => this.toolbarButton('toggleOrderedList')}>
            <i className="fa fa-list-ol" />
          </Button>

          <Button onClick={() => this.toolbarButton('drawLink')}>
            <i className="fa fa-link" />
          </Button>

          <Button onClick={() => this.toolbarButton('drawImage')}>
            <i className="fa fa-picture-o" />
          </Button>

          <Button onClick={() => this.toolbarButton('drawTable')}>
            <i className="fa fa-table" />
          </Button>

          <Button onClick={() => this.toolbarButton('drawHorizontalRule')}>
            <i className="fa fa-minus" />
          </Button>

          <i className="separator">|</i>

          <Button onClick={() => this.toolbarButton('toggleInlineMath')}>
            <i className="fa fa-alpha" />
          </Button>

          <Button onClick={() => this.toolbarButton('toggleBlockMath')}>
            <i className="fa fa-gamma" />
          </Button>

          <i className="separator">|</i>

          <Button onClick={() => this.toolbarButton('undo')}>
            <i className="fa fa-undo no-disable" />
          </Button>

          <Button onClick={() => this.toolbarButton('redo')}>
            <i className="fa fa-repeat no-disable" />
          </Button>
        </div>
        <div ref={(c) => { this._node = c }}>
          <textarea ref={(c) => { this._textarea = c }} />
        </div>
      </div>
    )
  }
}
