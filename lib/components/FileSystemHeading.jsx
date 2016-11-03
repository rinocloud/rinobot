import React, { PropTypes } from 'react'
import { ChooseFolderButton } from '../components/ChooseFolderButton'
import { Breadcrumbs } from '../components/Breadcrumbs'

export const FileSystemHeading = (props) => {
  const {
    currentPath,
    basePath,
    onClickBreadcrumb,
    onChooseFolder
  } = props

  return (
    <div className="panel-heading">
      <div className="row">
        <div className="col-sm-10">
          {currentPath &&
            <Breadcrumbs
              basePath={basePath}
              path={currentPath}
              onClick={onClickBreadcrumb}
            />
          }
        </div>
        <div className="col-sm-2">
          <ChooseFolderButton
            extraClassNames="pull-right"
            onChooseFolder={onChooseFolder}
          />
        </div>
      </div>
    </div>
  )
}


FileSystemHeading.propTypes = {
  currentPath: PropTypes.string.isRequired,
  basePath: PropTypes.string.isRequired,
  onClickBreadcrumb: PropTypes.func.isRequired,
  onChooseFolder: PropTypes.func.isRequired,
}
