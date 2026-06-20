import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={base} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} resize-y`} {...props} />
}
