import React from 'react'

// Button using the project's CSS classes (no Tailwind required)
export function Button({ asChild, children, className = '', variant, size, ...props }) {
  const baseClass = 'btn'
  const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary'
  const sizeClass = size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : 'btn-md'

  const combined = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ')

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: [children.props.className, combined].filter(Boolean).join(' '),
      ...props,
    })
  }

  return (
    <button className={combined} {...props}>
      {children}
    </button>
  )
}

export default Button
