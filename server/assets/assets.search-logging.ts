import 'server-only'

import {
  buildAssetSearchPathLog,
  type AssetSearchPathLogInput,
} from './assets.search-logging.pure'

export function logAssetSearchPath(input: AssetSearchPathLogInput) {
  console.info('[assets.search] Path selected', buildAssetSearchPathLog(input))
}
