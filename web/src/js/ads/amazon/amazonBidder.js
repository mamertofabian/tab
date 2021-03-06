import getAmazonTag from 'js/ads/amazon/getAmazonTag'
import {
  getNumberOfAdsToShow,
  getVerticalAdSizes,
  getHorizontalAdSizes,
  BIDDER_TIMEOUT,
  CONSENT_MANAGEMENT_TIMEOUT,
  VERTICAL_AD_SLOT_DOM_ID,
  SECOND_VERTICAL_AD_SLOT_DOM_ID,
  HORIZONTAL_AD_SLOT_DOM_ID,
} from 'js/ads/adSettings'
import logger from 'js/utils/logger'
import { getTabGlobal } from 'js/utils/utils'

// Save returned Amazon bids.
var amazonBids

/**
 * If there are Amazon bids, store them in the tabforacause
 * global object for use with analytics. Only do this if the
 * Amazon bids return early enough to be included in the ad
 * server request; otherwise, the bids are not meaningful.
 * @return {undefined}
 */
export const storeAmazonBids = () => {
  // Bid object structure:
  // {
  //   amznbid: '1',
  //   amzniid: 'some-id',
  //   amznp: '1',
  //   amznsz: '0x0',
  //   size: '0x0',
  //   slotID: 'div-gpt-ad-123456789-0'
  // }
  const tabGlobal = getTabGlobal()
  try {
    if (amazonBids && amazonBids.length) {
      amazonBids.forEach(bid => {
        tabGlobal.ads.amazonBids[bid.slotID] = bid
      })
    }
  } catch (e) {
    logger.error(e)
  }
}

/**
 * Return a promise that resolves when the Amazon bids
 * return or the request times out. See:
 * https://ams.amazon.com/webpublisher/uam/docs/web-integration-documentation/integration-guide/javascript-guide/api-reference.html
 * @return {Promise<undefined>} Resolves when the Amazon
 *   bid requests return or time out.
 */
function initApstag() {
  const numAds = getNumberOfAdsToShow()
  if (numAds < 1) {
    return
  }
  const apstag = getAmazonTag()

  // Only get bids for the horizontal ad slot if only
  // one ad is enabled.
  const slots = [
    {
      slotID: HORIZONTAL_AD_SLOT_DOM_ID,
      sizes: getHorizontalAdSizes(),
    },
  ]
  if (numAds > 1) {
    slots.push({
      slotID: VERTICAL_AD_SLOT_DOM_ID,
      sizes: getVerticalAdSizes(),
    })
  }
  if (numAds > 2) {
    slots.push({
      slotID: SECOND_VERTICAL_AD_SLOT_DOM_ID,
      sizes: getVerticalAdSizes(),
    })
  }

  return new Promise((resolve, reject) => {
    apstag.init({
      pubID: 'ea374841-51b0-4335-9960-99200427f7c8',
      adServer: 'googletag',
      gdpr: {
        cmpTimeout: CONSENT_MANAGEMENT_TIMEOUT,
      },
    })
    apstag.fetchBids(
      {
        slots: slots,
        timeout: BIDDER_TIMEOUT,
      },
      function(bids) {
        amazonBids = bids
        handleAuctionEnd()
      }
    )

    function handleAuctionEnd() {
      resolve()
    }
  })
}

export default () => {
  return initApstag()
}
