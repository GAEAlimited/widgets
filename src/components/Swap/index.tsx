import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import BrandedFooter from 'components/BrandedFooter'
import Wallet from 'components/ConnectWallet'
import { SwapInfoProvider } from 'hooks/swap/useSwapInfo'
import useSyncController, { SwapController } from 'hooks/swap/useSyncController'
import useSyncConvenienceFee, { FeeOptions } from 'hooks/swap/useSyncConvenienceFee'
import useSyncSwapEventHandlers, { SwapEventHandlers } from 'hooks/swap/useSyncSwapEventHandlers'
import useSyncSwapRouterUrl from 'hooks/swap/useSyncSwapRouterUrl'
import useSyncTokenDefaults, { TokenDefaults } from 'hooks/swap/useSyncTokenDefaults'
import { usePendingTransactions } from 'hooks/transactions'
import { useBrandedFooter } from 'hooks/useSyncFlags'
import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { displayTxHashAtom } from 'state/swap'

import Dialog from '../Dialog'
import Header from '../Header'
import { PopoverBoundaryProvider } from '../Popover'
import Input from './Input'
import Output from './Output'
import ReverseButton from './ReverseButton'
import Settings from './Settings'
import { StatusDialog } from './Status'
import SwapActionButton from './SwapActionButton'
import Toolbar, { Provider as ToolbarProvider } from './Toolbar'
import useValidate from './useValidate'

// SwapProps also currently includes props needed for wallet connection (eg hideConnectionUI),
// since the wallet connection component exists within the Swap component.
// TODO(zzmp): refactor WalletConnection into Widget component
export interface SwapProps extends FeeOptions, SwapController, SwapEventHandlers, TokenDefaults {
  hideConnectionUI?: boolean
  routerUrl?: string
}

export default function Swap(props: SwapProps) {
  useValidate(props)
  useSyncController(props as SwapController)
  useSyncConvenienceFee(props as FeeOptions)
  useSyncSwapEventHandlers(props as SwapEventHandlers)
  useSyncTokenDefaults(props as TokenDefaults)
  useSyncSwapRouterUrl(props.routerUrl)

  const { account } = useWeb3React()

  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)

  const [displayTxHash, setDisplayTxHash] = useAtom(displayTxHashAtom)
  const pendingTxs = usePendingTransactions()
  const displayTx = useMemo(() => displayTxHash && pendingTxs[displayTxHash], [displayTxHash, pendingTxs])

  return (
    <>
      <Header title={<Trans>Swap</Trans>}>
        <Wallet disabled={props.hideConnectionUI} />
        <Settings />
      </Header>
      <div ref={setWrapper}>
        <PopoverBoundaryProvider value={wrapper}>
          <SwapInfoProvider routerUrl={props.routerUrl}>
            <Input />
            <ReverseButton />
            <Output />
            <ToolbarProvider>
              {account && <Toolbar />}
              <SwapActionButton />
            </ToolbarProvider>
            {useBrandedFooter() && <BrandedFooter />}
          </SwapInfoProvider>
        </PopoverBoundaryProvider>
      </div>
      {displayTx && (
        <Dialog color="dialog">
          <StatusDialog tx={displayTx} onClose={() => setDisplayTxHash()} />
        </Dialog>
      )}
    </>
  )
}
