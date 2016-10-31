import React, { PropTypes } from 'react'
import { shell } from 'electron'
import { Dropdown, MenuItem } from 'react-bootstrap'
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle'
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu'

class UserDropdown extends React.Component {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    groupClassName: PropTypes.string.isRequired
  }

  render() {
    const {
      auth,
    } = this.props

    const onClickLogout = (e) => {
      e.preventDefault()
      this.props.logout()
    }

    return (
      <Dropdown id="user-drop" className={this.props.groupClassName}>
        <DropdownToggle className="btn btn-sm btn-default m-l-sm pull-right">
          <span><i className="fa fa-user"></i></span>
        </DropdownToggle>
        <DropdownMenu>
          <MenuItem
            eventKey="3"
            onClick={(e) => {
              e.preventDefault()
              shell.openExternal(`https://${auth.project}.rinocloud.com/app/`)
            }}
          >
            <i className="fa fa-external-link fa-small"></i>{'  '}
            <span>Open My Rinocloud</span>
          </MenuItem>

          {auth.isAuthenticating &&
            <MenuItem
              eventKey="1"
              onClick={onClickLogout}
            >
              <i className="fa fa-spinner fa-spin"></i>{'  '}
              <span>Logging out</span>
            </MenuItem>
          }

          {!auth.isAuthenticating &&
            <MenuItem
              eventKey="2"
              onClick={onClickLogout}
            >
              <i className="fa fa-sign-out"></i>{'  '}
              <span>Logout {auth.username}</span>
            </MenuItem>
          }

        </DropdownMenu>
      </Dropdown>
    )
  }
}

export { UserDropdown }
