import React from 'react'
import PropTypes from 'prop-types'

const SearchMenuComponent = props => {
  const {
    style,
    app: { dollarsPerDayRate, moneyRaised },
  } = props
  return (
    <div style={style}>
      <div>{moneyRaised}</div>
      <div>{dollarsPerDayRate}</div>
    </div>
  )
}

SearchMenuComponent.displayNamae = 'SearchMenuComponent'

SearchMenuComponent.propTypes = {
  // May not exist if the user is not signed in.
  user: PropTypes.shape({
    id: PropTypes.string,
  }),
  app: PropTypes.shape({
    // TODO: move these to the MoneyRaised component
    moneyRaised: PropTypes.number.isRequired,
    dollarsPerDayRate: PropTypes.number.isRequired,
  }),
}

SearchMenuComponent.defaultProps = {}

export default SearchMenuComponent
