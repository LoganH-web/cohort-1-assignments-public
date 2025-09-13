import { BigInt } from "@graphprotocol/graph-ts"
import { Swap as SwapEvent } from "../generated/MiniAMM/MiniAMM"
import { Swap } from "../generated/schema"

export function handleSwap(event: SwapEvent): void {
  const id = event.transaction.hash.toHexString()
  let swap = new Swap(id)
  
  swap.user = event.transaction.from
  swap.token0Amount = event.params.xAmountIn
  swap.token1Amount = event.params.yAmountIn
  swap.timestamp = event.block.timestamp
  swap.blockNumber = event.block.number
  
  swap.save()
}