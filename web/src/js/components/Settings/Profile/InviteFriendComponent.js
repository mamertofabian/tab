import React from 'react'
import PropTypes from 'prop-types'
import { get } from 'lodash/object'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import LogReferralLinkClick from 'js/mutations/LogReferralLinkClickMutation'
import logger from 'js/utils/logger'

const styles = theme => ({
  inputUnderline: {
    '&:after': {
      borderColor: theme.palette.secondary.main,
    },
  },
  formLabelRoot: {
    '&$formLabelFocused': {
      color: theme.palette.secondary.main,
    },
  },
  formLabelFocused: {},
})

class InviteFriend extends React.Component {
  getReferralUrl() {
    const { baseURL, user } = this.props
    const username = get(user, 'username')
    const rootURL = baseURL || 'https://tab.gladly.io'
    const referralUrl = username
      ? `${rootURL}/?u=${encodeURIComponent(username)}`
      : rootURL
    return referralUrl
  }

  onTextFieldClicked() {
    if (this.input) {
      this.input.select()
    }

    // Log that the user clicked their referral link,
    // which helps us gauge attempted but unsuccessful
    // referrals.
    const { user } = this.props
    if (user) {
      return LogReferralLinkClick({
        userId: user.id,
      }).catch(e => {
        logger.error(e)
      })
    }
  }

  render() {
    const { baseURL, classes, user, ...otherProps } = this.props
    const referralUrl = this.getReferralUrl()

    return (
      <TextField
        id={'refer-friend-input'}
        inputRef={input => {
          this.input = input
        }}
        onClick={this.onTextFieldClicked.bind(this)}
        value={referralUrl}
        label={'Share this link'}
        helperText={
          get(user, 'username')
            ? `and you'll get 350 Hearts for every person who joins!`
            : `and have a bigger positive impact!`
        }
        {...otherProps}
        InputProps={{
          ...get(otherProps, 'InputProps', {}),
          classes: {
            underline: classes.inputUnderline,
          },
        }}
        InputLabelProps={{
          ...get(otherProps, 'InputLabelProps', {}),
          FormLabelClasses: {
            root: classes.formLabelRoot,
            focused: classes.formLabelFocused,
          },
        }}
      />
    )
  }
}

InviteFriend.propTypes = {
  baseURL: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string,
  }),
  classes: PropTypes.object.isRequired,
  style: PropTypes.object,
}

InviteFriend.defaultProps = {
  style: {},
}

export default withStyles(styles)(InviteFriend)
