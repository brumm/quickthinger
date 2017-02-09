import React from 'react'
import Flex from 'flex-component'

import highlightMatch from 'highlightMatch'
import Icon from 'components/Icon'

import css from './Pane.scss'

const Pane = ({ label, icon, active, changeActivePaneIndex, searchTerm }) => (
  <Flex
    basis='0'
    className={active ? css.sentenceFragmentActive : css.sentenceFragment}
    alignItems='center'
    justifyContent='center'
    direction='column'
    onClick={changeActivePaneIndex}
  >
    <Icon path={icon} size={96} />

    {searchTerm ? (
      <div
        className={css.sentenceObjectLabel}
        dangerouslySetInnerHTML={{ __html: highlightMatch(label, searchTerm) }}
      />
    ) : (
      <div className={css.sentenceObjectLabel}>{label}</div>
    )}
  </Flex>
)

export default Pane
