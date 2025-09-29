const { network } = require("hardhat");

async function main() {
  const now = Math.floor(Date.now() / 1000);
  await network.provider.send("evm_setNextBlockTimestamp", [now]);
  await network.provider.send("evm_mine");
  console.log("区块时间已同步:", new Date(now * 1000).toLocaleString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




