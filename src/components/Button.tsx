import type { ComponentPropsWithRef } from 'react'

//ComponentPropsWithRef<'button'> means: This component accepts exactly the same props as a normal <button> element—including all optional ones

export default function Button({
  onClick,
  children,
  type = 'button', // default value
  className = '',
  ...props
}: ComponentPropsWithRef<'button'>) {
  // const analytics = () => console.log('button clicked')
  return (
    // put ...props on top make user override the default props such as className
    <button
      {...props}
      type={type}
      onClick={onClick}
      // {props.className} can override the default className
      className={`cursor-pointer rounded-md border border-amber-300 bg-amber-600 px-4 py-2 text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}
