import React from 'react'
import PropTypes from 'prop-types'
import DonateVcMutation from 'mutations/DonateVcMutation'
import { goToHome } from 'navigation/navigation'

import {GridList, GridTile} from 'material-ui/GridList'

import {Card, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'

import Dialog from 'material-ui/Dialog'
import Popover from 'material-ui/Popover'
import RaisedButton from 'material-ui/RaisedButton'
import Slider from 'material-ui/Slider'
import Subheader from 'material-ui/Subheader'

import appTheme from 'theme/default'

class Charity extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      donateSlider: 1,
      thanksDialog: false
    }
  }

  componentDidMount () {
    const { user } = this.props
    this.setState({
      donateSlider: user.vcCurrent
    })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.user.vcCurrent !== nextProps.user.vcCurrent) {
      this.setState({
        donateSlider: nextProps.user.vcCurrent
      })
    }
  }

  openCharityWebsite () {
    const { charity } = this.props
    window.open(charity.website)
  }

  handleOpen (event) {
    if (this.state.donateSlider <= 1) { return }
      // This prevents ghost click.
    event.preventDefault()

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    })
  }

  handleClose () {
    this.setState({
      open: false
    })
  }

  thanksDialogShow () {
    this.setState({
      thanksDialog: true
    })
  }

  thanksDialogClose () {
    this.setState({
      thanksDialog: false
    })
  }

  handleDonateSlider (event, value) {
    this.setState({donateSlider: value})
  }

  heartsDonationError () {
    this.props.showError('Oops, we could not donate your Hearts just now :(')
  }

  donateHearts () {
    if (this.state.donateSlider <= 0) { return }
    const { charity, user } = this.props
    const self = this
    DonateVcMutation.commit(
      this.props.relay.environment,
      user,
      charity.id,
      this.state.donateSlider,
      self.thanksDialogShow.bind(this),
      self.heartsDonationError.bind(this)
    )
  }

  goToHome () {
    goToHome()
  }

  render () {
    const { charity, user } = this.props

    const cardActions = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }

    var customDonationLink
    if (this.state.donateSlider > 1) {
      const customDonationLinkStyle = {
        fontSize: 11,
        color: appTheme.palette.accent1Color,
        cursor: 'pointer',
        marginTop: 5
      }

      customDonationLink = (<span
        style={customDonationLinkStyle}
        onClick={this.handleOpen.bind(this)}>
           Want to donate another quantity?
      </span>)
    }

    const sliderContainer = {
      textAlign: 'center',
      height: 'auto',
      width: 'auto',
      padding: 20
    }

    const sliderStyle = {
      margin: 0
    }

    const subheader = {
      padding: 0
    }

    const logo = {
      cursor: 'pointer'
    }

    const charityImpactStyle = {
      marginTop: 0,
      paddingLeft: 20,
      paddingRight: 20
    }

    const linkToCharity = {
      color: '#2196F3',
      cursor: 'pointer'
    }

    const cardTitle = {
      style: {
        height: 70
      },
      title: {
        lineHeight: '100%'
      }
    }

    const cardText = {
      height: 70,
      paddingTop: 0,
      paddingBottom: 0
    }

    var slider
    if (user.vcCurrent > 1) {
      slider = (
        <Slider
          sliderStyle={sliderStyle}
          min={1}
          max={user.vcCurrent}
          step={1}
          defaultValue={1}
          value={this.state.donateSlider}
          onChange={this.handleDonateSlider.bind(this)} />)
    }

    const actions = [
      <FlatButton
        label='Stay'
        primary
        onTouchTap={this.thanksDialogClose.bind(this)}
          />,
      <FlatButton
        label='Go Back Home'
        primary
        keyboardFocused
        onTouchTap={this.goToHome.bind(this)}
          />
    ]

    return (
      <GridTile
        key={charity.id}>
        <Card>
          <CardMedia>
            <img
              style={logo}
              src={charity.logo}
              onClick={this.openCharityWebsite.bind(this)} />
          </CardMedia>
          <CardTitle
            titleStyle={cardTitle.title}
            style={cardTitle.style}
            title={charity.name}
            subtitle={charity.category} />
          <CardText
            style={cardText}>
            {charity.description}
          </CardText>
          <CardActions style={cardActions}>
            <RaisedButton
              label={'Donate ' + this.state.donateSlider + ' Hearts'}
              primary
              disabled={this.state.donateSlider <= 0}
              onClick={this.donateHearts.bind(this)} />

            {customDonationLink}
          </CardActions>
        </Card>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleClose.bind(this)}>
          <div style={sliderContainer}>
            <Subheader
              style={subheader}>Use the slider to select the amount to donate</Subheader>
            {slider}
          </div>
        </Popover>
        <Dialog
          title='Thank you for donating your Hearts!'
          modal={false}
          actions={actions}
          open={this.state.thanksDialog}
          onRequestClose={this.thanksDialogClose.bind(this)}>
          <GridList
            cellHeight={280}>
            <GridTile>
              <img src={charity.image} />
            </GridTile>
            <GridTile>
              <p style={charityImpactStyle}>Thanks for donating to <span
                style={linkToCharity}
                onClick={this.openCharityWebsite.bind(this)}>{charity.name}</span></p>
              <p style={charityImpactStyle}>{charity.impact}</p>
            </GridTile>
          </GridList>
        </Dialog>
      </GridTile>
    )
  }
}

Charity.propTypes = {
  charity: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  showError: PropTypes.func.isRequired
}

export default Charity
