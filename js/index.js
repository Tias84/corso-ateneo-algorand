import algosdk from 'algosdk';
export const approvalProgram = `
#pragma version 6
txn ApplicationID
int 0
==
bnz main_l4
global GroupSize
int 1
==
txn RekeyTo
global ZeroAddress
==
&&
bnz main_l3
err
main_l3:
callsub changeowner_1
b main_l5
main_l4:
callsub deploy_0
main_l5:
return

// deploy
deploy_0:
byte "owner"
txn Sender
app_global_put
int 1
retsub

// change_owner
changeowner_1:
txn Sender
byte "owner"
app_global_get
==
assert
int 1
retsub
`
export const clearProgram = `
#pragma version 6
int 1
return
`

const account = algosdk.mnemonicToSecretKey("all pluck spatial hybrid announce fluid like pipe degree into island million apple mutual dice patrol tumble work dream anger speed scorpion life ability find")
const client = new algosdk.Algodv2("", "https://node.testnet.algoexplorerapi.io", "");
const indexer = new algosdk.Indexer("", "https://algoindexer.testnet.algoexplorerapi.io", "");


(async deployFund => {
    const onComplete = algosdk.OnApplicationComplete.NoOpOC;

    const params = await client.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    const txn = algosdk.makeApplicationCreateTxn(
        account.addr,
        params,
        onComplete,
        await compileProgram(approvalProgram),
        await compileProgram(clearProgram),
        0,
        0,
        0,
        1,
    );

    const signedTxn = txn.signTxn(account.sk)
    await client.sendRawTransaction(signedTxn).do();
    console.log(txn.txID())
})()

async function compileProgram(programSource) {
    const encoder = new TextEncoder();
    const programBytes = encoder.encode(programSource);
    const compileResponse = await client.compile(programBytes).do();
    const compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, 'base64'));

    return compiledBytes;
}