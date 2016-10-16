import React from 'react'
import Flex from 'flex-component'

import highlightMatch from 'highlightMatch'
import Icon from 'components/Icon'

import css from './Pane.scss'

const Pane = ({ label, icon, active, changeActivePaneIndex, searchTerm }) => (
  <Flex
    shrink={0}
    basis='0'
    className={active ? css.sentenceFragmentActive : css.sentenceFragment}
    alignItems='center'
    justifyContent='center'
    direction='column'
    onClick={changeActivePaneIndex}
  >
    <Icon path={icon} size={128} />

    {searchTerm ? (
      <div className={css.sentenceObjectLabel} dangerouslySetInnerHTML={{ __html: highlightMatch(label, searchTerm) }} />
    ) : (
      <div className={css.sentenceObjectLabel}>{label}</div>
    )}
  </Flex>
)

export default Pane
