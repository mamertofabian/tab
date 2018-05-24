/* global graphql */

import React from 'react'
import {QueryRenderer} from 'react-relay/compat'
import environment from '../../../../relay-env'

import SettingsChildWrapper from '../SettingsChildWrapperComponent'
import ProfileDonateHearts from './ProfileDonateHeartsContainer'
import AuthUserComponent from 'general/AuthUserComponent'
import ErrorMessage from 'general/ErrorMessage'

class ProfileDonateHeartsView extends React.Component {
  render () {
    return (
      <AuthUserComponent>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProfileDonateHeartsViewQuery($userId: String!) {
              app {
                ...ProfileDonateHeartsContainer_app
              }
              user(userId: $userId) {
                ...ProfileDonateHeartsContainer_user
              }
            }
          `}
          render={({error, props}) => {
            if (error) {
              console.error(error, error.source)
              const errMsg = 'We had a problem loading the Donate Hearts page.'
              return <ErrorMessage message={errMsg} />
            }
            const showError = this.props.showError
            const dataLoaded = !!props
            return (
              <SettingsChildWrapper loaded={dataLoaded}>
                { dataLoaded
                  ? (
                    <ProfileDonateHearts
                      app={props.app}
                      user={props.user}
                      showError={showError}
                    />
                  )
                  : null
                }
              </SettingsChildWrapper>
            )
          }} />
      </AuthUserComponent>
    )
  }
}

export default ProfileDonateHeartsView
