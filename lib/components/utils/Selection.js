import React, { PropTypes } from 'react'
import ReactDom from 'react-dom'
import _ from 'lodash'


export class Selection extends React.Component {

  static propTypes = {
    enabled: PropTypes.bool,
    onSelectionChange: PropTypes.func
  }

  static defaultProps = {
    enabled: true,
    onSelectionChange: _.noop,
  }

  constructor(props) {
    super(props)

    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._boxIntersects = this._boxIntersects.bind(this)
    this._updateCollidingChildren = this._updateCollidingChildren.bind(this)
    this._calculateSelectionBox = this._calculateSelectionBox.bind(this)

    this.state = {
      mouseDown: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      selectedItems: {},
      appendMode: false
    }
  }

  componentWillMount() {
    this.selectedChildren = {}
  }

  componentWillReceiveProps(nextProps) {
    const nextState = {}
    if (!nextProps.enabled) {
      nextState.selectedItems = {}
    }
    this.setState(nextState)
  }

  componentDidUpdate() {
    if (this.state.mouseDown && !_.isNull(this.state.selectionBox)) {
      this._updateCollidingChildren(this.state.selectionBox)
    }
  }

  _onMouseDown(e) {
    if (!this.props.enabled || e.button === 2 || e.nativeEvent.which === 2) {
      return
    }
    const nextState = {}
    if (e.ctrlKey || e.altKey || e.shiftKey) {
      nextState.appendMode = true
    }
    nextState.mouseDown = true
    nextState.startPoint = {
      x: e.pageX,
      y: e.pageY
    }
    this.setState(nextState)
    window.document.addEventListener('mousemove', this._onMouseMove)
    window.document.addEventListener('mouseup', this._onMouseUp)
  }

  _onMouseUp() {
    window.document.removeEventListener('mousemove', this._onMouseMove)
    window.document.removeEventListener('mouseup', this._onMouseUp)
    this.setState({
      mouseDown: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      appendMode: false
    })
    this.props.onSelectionChange.call(null, _.keys(this.selectedChildren))
  }

  _onMouseMove(e) {
    e.preventDefault()
    if (this.state.mouseDown) {
      const endPoint = {
        x: e.pageX,
        y: e.pageY
      }
      this.setState({
        endPoint,
        selectionBox: this._calculateSelectionBox(this.state.startPoint, endPoint)
      }, () => {
        this.props.onSelectionChange.call(null, _.keys(this.selectedChildren))
      })
    }
  }

  _boxIntersects(boxA, boxB) {
    if (boxA.left <= boxB.left + boxB.width &&
        boxA.left + boxA.width >= boxB.left &&
        boxA.top <= boxB.top + boxB.height &&
        boxA.top + boxA.height >= boxB.top) {
      return true
    }
    return false
  }

  _updateCollidingChildren(selectionBox) {
    let tmpNode = null
    let tmpBox = null
    _.each(this.refs, (ref, key) => {
      if (key !== 'selectionBox') {
        tmpNode = ReactDom.findDOMNode(ref)
        tmpBox = {
          top: tmpNode.offsetTop,
          left: tmpNode.offsetLeft,
          width: tmpNode.clientWidth,
          height: tmpNode.clientHeight
        }
        if (this._boxIntersects(selectionBox, tmpBox)) {
          this.selectedChildren[key] = true
        } else {
          if (!this.state.appendMode) {
            delete this.selectedChildren[key]
          }
        }
      }
    })
  }

  _calculateSelectionBox(startPoint, endPoint) {
    if (!this.state.mouseDown || _.isNull(endPoint) || _.isNull(startPoint)) {
      return null
    }

    const rect = this.refs.selectionBox.getBoundingClientRect()

    const left = Math.min(startPoint.x, endPoint.x) - rect.left
    const top = Math.min(startPoint.y, endPoint.y) - rect.top + this.refs.selectionBox.offsetTop
    const width = Math.abs(startPoint.x - endPoint.x)
    const height = Math.abs(startPoint.y - endPoint.y)
    return {
      left,
      top,
      width,
      height
    }
  }

  render() {
    let selectionBox = null

    if (this.state.mouseDown && !_.isNull(this.state.endPoint)
      && !_.isNull(this.state.startPoint)) {
      selectionBox = <tr className="selection-border" style={this.state.selectionBox}></tr>
    }

    const children = React.Children.map(this.props.children, (child) => { // eslint-disable-line
      return React.cloneElement(child, {
        ref: child.key,
      })
    })

    return (
      <tbody ref="selectionBox" onMouseDown={this._onMouseDown}>
        {children}
        {selectionBox}
      </tbody>
    )
  }
}

export default { Selection }
