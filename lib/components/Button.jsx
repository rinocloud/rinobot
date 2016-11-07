
import React, { PropTypes } from 'react'

export const Button = (props) => {
  const {
    onClick,
    className = 'btn btn-sm btn-default ignore-react-onclickoutside',
    extraClassNames = '',
    children,
    disabled = false
  } = props

  return (
    <a
      href="#"
      className={`${className} ${extraClassNames}`}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
    >
      {children}
    </a>
  )
}

Button.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  extraClassNames: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}
