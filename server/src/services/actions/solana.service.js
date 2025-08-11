import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction, Connection } from "@solana/web3.js";
import base58 from "bs58";
import logger from '../../utils/logger.js';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", 
  "finalized"
);


export async function sendSolAction(config) {
  const { toAddress, amount } = config;
  if (!toAddress || !amount) {
    throw new Error('Send SOL action requires "toAddress" and "amount" in config.');
  }
  if (!process.env.SOL_PRIVATE_KEY) {
    throw new Error('SOL_PRIVATE_KEY is not set in environment variables.');
  }

  const keypair = Keypair.fromSecretKey(base58.decode(process.env.SOL_PRIVATE_KEY));

  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transferTransaction, [keypair]);
  logger.info(`SOL sent successfully to ${toAddress}. Signature: ${signature}`);
  return { success: true, signature, message: `${amount} SOL sent to ${toAddress}` };
}
