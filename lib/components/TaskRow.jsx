import React, { PropTypes } from 'react'
import { TaskFlowButton } from './TaskFlowButton'


export class TaskRow extends React.Component {
  static propTypes = {
    tasks: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    onChangeTaskFlow: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    children: PropTypes.node.isRequired
  }

  constructor(props) {
    super(props)
    this.onClickFlow = this.onClickFlow.bind(this)
  }

  onClickFlow(index, type) {
    const { onChangeTaskFlow, isDisabled = false } = this.props
    if (!isDisabled) {
      onChangeTaskFlow(index, type)
    }
  }

  calculateHorzLineClass(tasks, index) {
    // Calculates which grey horizontal line
    // should be given to the task
    let horzLineClass = 'grey_horz_task'
    if (index === 0) {
      horzLineClass = 'grey_horz_task grey_horz_task_first'
    }
    if (index === tasks.length - 1) {
      horzLineClass = 'grey_horz_task grey_horz_task_last'
    }
    if (tasks.length === 1) {
      horzLineClass = 'grey_horz_task grey_horz_task_only'
    }

    return horzLineClass
  }

  render() {
    const {
      tasks,
      index,
      children
    } = this.props

    const horzLineClass = this.calculateHorzLineClass(tasks, index)

    return (
      <div className="row row-task">
        <div className="sf_wrapper_task">
          <div className={horzLineClass}></div>
        </div>
        <div className="col-xs-12">
          {index > 0 &&
            <div className="row-flow">
              <div className="m-t m-b">
                <div className="toggle btn-group btn-group-xs">
                  <TaskFlowButton
                    index={index}
                    onClickFlow={this.onClickFlow}
                    flow={tasks[index].flow}
                  />
                </div>
              </div>
            </div>
          }

          {children}
        </div>
      </div>
    )
  }
}

export default { TaskRow }