import React from 'react'
import classNames from 'classnames';

const Button = (props) => {
  let buttonStyles = [
    props.block ? [
      "block"
    ] : "",
    "font-bold",
    "text-lg",
    "text-center",
    "cursor-pointer",
    "px-4",
    "py-2",
    "rounded-lg", 
    "transition-all",
    "duration-300",
    "mt-4",
    "text-black",
    "dark:text-white",
    props.filled
      ? [ 
        "opacity-80",
        "hover:opacity-100",
        "bg-black",
        "dark:bg-white",
        "text-white",
        "dark:text-black",
        props.block ? [
          "hover:text-xl",
        ] : "",
        "border-2",
        "border-[#00000050]",
        "dark:border-[#ffffff50]",
        "active:text-lg",
      ] : [
        "hover:bg-black",
        "dark:hover:bg-white",
        "hover:text-white",
        "dark:hover:text-black",
        "border-black",
        "dark:border-white",
        "border-2",
        props.block ? [
          "hover:text-xl",
        ] : "",
        "active:text-lg",
      ]
  ]

  if (props.link) {
    return (
      <a href = {props.link}
        className = {classNames(buttonStyles)}>{ props.children }</a>
    )
  } else {
    return (
      <a onClick = {props.click} 
        className = {classNames(buttonStyles)}>{ props.children }</a>
    )
  }
}

export default Button