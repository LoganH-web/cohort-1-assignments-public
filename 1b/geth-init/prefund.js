const from = eth.accounts[0];
const contractDeployer = "0xD76ce7F02351Ab3E3103ee3b6A64601BEc580c6E";  //change thsis to your contract deployer address
eth.sendTransaction({
  from: from,
  to: contractDeployer,
  value: web3.toWei(100, "ether"),
});
// PK: be44593f36ac74d23ed0e80569b672ac08fa963ede14b63a967d92739b0c8659
