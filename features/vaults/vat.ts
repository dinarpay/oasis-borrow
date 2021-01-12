import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Vat } from 'types/web3-v1-contracts/vat'
import Web3 from 'web3'

import { call, CallDef } from '../../components/blockchain/calls/callsHelpers'
import { ContextConnected } from '../../components/blockchain/network'
import { filterNullish } from './utils'

interface VatUrnsArgs {
  ilk: string
  urnAddress: string
}

export interface Urn {
  collateral: BigNumber
  normalizedDebt: BigNumber
}

type VatUrnsResult = Urn | undefined

const vatUrns: CallDef<VatUrnsArgs, VatUrnsResult> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.urns
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (urn: any) =>
    urn
      ? {
          collateral: new BigNumber(urn.ink),
          normalizedDebt: new BigNumber(urn.art),
        }
      : undefined,
}

export function createVatUrns$(
  connectedContext$: Observable<ContextConnected>,
  cdpManagerUrns$: (id: string) => Observable<string>,
  cdpManagerIlks$: (id: string) => Observable<string>,
  id: string,
): Observable<Urn> {
  return combineLatest(connectedContext$, cdpManagerIlks$(id), cdpManagerUrns$(id)).pipe(
    switchMap(([context, ilk, urnAddress]) => {
      return call(context, vatUrns)({ ilk, urnAddress })
    }),
    filterNullish(),
  )
}

export interface Ilk {
  /*
   * Art [wad]
   */
  globalDebt: BigNumber
  /*
   * rate [ray]
   */
  debtScalingFactor: BigNumber
  /*
   * spot [ray]
   */
  maxDebtPerUnitCollateral: BigNumber
  /*
   * line [rad]
   */
  debtCeiling: BigNumber
  /*
   * debtFloor [rad]
   */
  debtFloor: BigNumber
}

interface VatIlksArgs {
  ilk: string
}

type VatIlksResult = Ilk | undefined

const vatIlks: CallDef<VatIlksArgs, VatIlksResult> = {
  call: ({}, { contract, vat }) => {
    return contract<Vat>(vat).methods.ilks
  },
  prepareArgs: ({ ilk }) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: (ilk: any) =>
    ilk
      ? {
          globalDebt: new BigNumber(ilk.Art),
          debtScalingFactor: new BigNumber(ilk.rate),
          maxDebtPerUnitCollateral: new BigNumber(ilk.spot),
          debtCeiling: new BigNumber(ilk.line),
          debtFloor: new BigNumber(ilk.dust),
        }
      : undefined,
}

export function createVatIlks$(
  connectedContext$: Observable<ContextConnected>,
  ilk: string,
): Observable<Ilk> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, vatIlks)({ ilk })
    }),
    filterNullish(),
  )
}

interface VatGemArgs {
  ilk: string
  urnAddress: string
}

type VatGemResult = BigNumber | undefined

const vatGem: CallDef<VatGemArgs, VatGemResult> = {
  call: ({}, { contract, vat }) => {
    return contract<Vat>(vat).methods.gem
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (gem) => (gem ? new BigNumber(gem) : undefined),
}

export function createVatGem$(
  connectedContext$: Observable<ContextConnected>,
  cdpManagerUrns$: (id: string) => Observable<string>,
  cdpManagerIlks$: (id: string) => Observable<string>,
  id: string,
): Observable<BigNumber> {
  return combineLatest(connectedContext$, cdpManagerIlks$(id), cdpManagerUrns$(id)).pipe(
    switchMap(([context, ilk, urnAddress]) => {
      return call(context, vatGem)({ ilk, urnAddress })
    }),
    filterNullish(),
  )
}

const vatLine: CallDef<{}, BigNumber> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.Line
  },
  prepareArgs: () => [],
}

export function createVatLine$(
  connectedContext$: Observable<ContextConnected>,
): Observable<BigNumber> {
  return connectedContext$.pipe(
    switchMap((context) => {
      return call(context, vatLine)({})
    }),
    filterNullish(),
  )
}