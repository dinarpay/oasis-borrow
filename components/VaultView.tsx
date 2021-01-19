import { Vault } from "features/vaults/vault";
import { formatCryptoBalance, formatFiatBalance, formatPercent, formatPrecision } from "helpers/formatters/format";
import { Box, Button, Grid, Heading, Text } from 'theme-ui'

interface Props {
    vault: Vault; 
    account: string
    deposit(): void;
}
export function VaultView({ vault, account, deposit }: Props) {
    const token = vault.token;
    const vaultId = vault.id;
    const liquidationPrice = vault.liquidationPrice ? formatFiatBalance(vault.liquidationPrice) : 0
    const liquidationPenalty = formatPercent(vault.liquidationPenalty?.times(100))
    const collateralizationRatio = vault.collateralizationRatio ? vault.collateralizationRatio.toString() : '0'
    const stabilityFee = formatPrecision(vault.stabilityFee, 2)
    const lockedAmount = formatCryptoBalance(vault.collateral)
    const lockedAmountUSD = formatFiatBalance(vault.collateralPrice)
    const availableToWithdraw = formatCryptoBalance(vault.freeCollateral)
    const availableToWithdrawPrice = formatCryptoBalance(vault.freeCollateralPrice)
    const debt = formatCryptoBalance(vault.debt)
    const debtAvailable = formatCryptoBalance(vault?.availableDebt)

    return (
        <Grid>
            <Text>Connected Address :: {account}</Text>
            <Text>Vault :: {vaultId}</Text>
            <Heading as="h1">{vault?.ilk} Vault #{vault?.id}</Heading>
            <Box>
                <Heading as="h2">Liquidation price</Heading>
                <Text>Liquidation price: {liquidationPrice} USD</Text>
                <Text>Liquidation penalty: {liquidationPenalty}</Text>
            </Box>
            <Box>
                <Heading as="h2">Collateralization Ratio</Heading>
                <Text>Collateralization Ratio: {collateralizationRatio}</Text>
                <Text>Stability fee: {stabilityFee}%</Text>
            </Box>
            <Box>
                <Heading as="h2">{token} locked</Heading>
                <Text>{token} locked: {lockedAmount}{token}/{lockedAmountUSD}USD</Text>
                <Button onClick={deposit}>Deposit</Button>
                <Text>Available to withdraw: {availableToWithdraw}{token}/{availableToWithdrawPrice}USD</Text>
                <Button>Withdraw</Button>
            </Box>
            <Box>
                <Heading as="h2">Outstanding debt</Heading>
                <Text>Outstanding Dai debt {debt}DAI</Text>
                <Text>Available to generate {debtAvailable}DAI</Text>
            </Box>
        </Grid>
    )
}
