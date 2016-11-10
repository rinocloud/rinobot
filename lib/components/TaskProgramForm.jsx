import React, { PropTypes } from 'react'
import pt from 'path'
import { shell } from 'electron'
import { ChooseFolderButton } from './ChooseFolderButton'

export const TaskProgramForm = (props) => {
  const {
    programName,
    onChangeArgs,
    isDisabled = false,
    value,
  } = props
  console.log(programName)
  return (
    <span>
      <ChooseFolderButton
        onChooseFolder={(paths) => {
          onChangeArgs('default', paths[0])
        }}
        disabled={isDisabled}
        properties={['openFile']}
      >
        Select {programName === 'Rscript' ? 'R' : programName} file

      </ChooseFolderButton>
      <small className="m-l-sm">
        {`${value ? pt.basename(value) : ''}`}
      </small>
      {programName === 'python' &&
        <a
          href="#"
          className="pull-right"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal('https://huddle.eurostarsoftwaretesting.com/wp-content/uploads/2014/05/python-programming.jpg')
          }}
        >More about <u>{programName}</u> here <i className="fa fa-external-link" />
        </a>
      }
      {programName === 'matlab' &&
        <a
          href="#"
          className="pull-right"
          onClick={(e) => {
            e.preventDefault()
            shell.openExternal('http://www.quickmeme.com/MATLAB')
          }}
        >More about <u>{programName}</u> here <i className="fa fa-external-link" />
        </a>
      }
    {programName === 'Rscript' &&
      <a
        href="#"
        className="pull-right"
        onClick={(e) => {
          e.preventDefault()
          shell.openExternal('https://s-media-cache-ak0.pinimg.com/736x/14/6f/44/146f449c36b2003515f3fbaaca85c63b.jpg')
        }}
      >More about <u>{programName}</u> here <i className="fa fa-external-link" />
      </a>
    }
    </span>
  )
}

TaskProgramForm.propTypes = {
  programName: PropTypes.string.isRequired,
  onChangeArgs: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool
}
