import React from 'react'
import MoonLoader from 'halogen/MoonLoader'

const Loader = ({ color = 'black', size = 50 }) => (
  <MoonLoader color={color} size={`${size}px`} />
)

export default Loader
