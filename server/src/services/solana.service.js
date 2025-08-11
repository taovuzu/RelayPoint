import { 
  Connection as SolanaConnection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { Connection } from '../models/connection.model.js';
import { EncryptionService } from './encryption.service.js';
import logger from '../utils/logger.js';

export class SolanaService {
  
  static createConnection() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    return new SolanaConnection(rpcUrl, 'confirmed');
  }

  static async getUserKeypair(userId) {
    try {
      const connection = await Connection.findOne({
        userId,
        service: 'solana',
        isActive: true
      });

      if (!connection) {
        throw new Error('No active Solana connection found for user');
      }

      const credentials = EncryptionService.decryptObject(connection.encryptedCredentials);
      const privateKey = credentials.privateKey;

      const privateKeyBytes = Uint8Array.from(Buffer.from(privateKey, 'base64'));
      const keypair = Keypair.fromSecretKey(privateKeyBytes);

      await Connection.findByIdAndUpdate(connection._id, {
        lastUsedAt: new Date()
      });

      return keypair;

    } catch (error) {
      logger.error('Failed to get user keypair', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  static async getBalance(userId) {
    try {
      const keypair = await this.getUserKeypair(userId);
      const connection = this.createConnection();
      
      const balance = await connection.getBalance(keypair.publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      logger.info('Solana balance retrieved', {
        userId,
        publicKey: keypair.publicKey.toString(),
        balance: solBalance
      });

      return solBalance;

    } catch (error) {
      logger.error('Failed to get Solana balance', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  static async sendSol(userId, options) {
    const { recipient, amount } = options;

    if (!recipient || !amount) {
      throw new Error('Recipient and amount are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    try {
      const keypair = await this.getUserKeypair(userId);
      const connection = this.createConnection();

      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch (error) {
        throw new Error('Invalid recipient address');
      }

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      const balance = await connection.getBalance(keypair.publicKey);
      if (balance < lamports) {
        throw new Error(`Insufficient balance. Required: ${amount} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`);
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: lamports
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = keypair.publicKey;

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair],
        {
          commitment: 'confirmed',
          maxRetries: 3
        }
      );

      logger.info('SOL sent successfully', {
        userId,
        from: keypair.publicKey.toString(),
        to: recipient,
        amount,
        signature
      });

      return {
        signature,
        from: keypair.publicKey.toString(),
        to: recipient,
        amount,
        lamports,
        explorerUrl: this.getExplorerUrl(signature)
      };

    } catch (error) {
      logger.error('Failed to send SOL', {
        userId,
        recipient,
        amount,
        error: error.message
      });
      throw error;
    }
  }

  static async getTransaction(signature) {
    try {
      const connection = this.createConnection();
      const transaction = await connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee,
        status: transaction.meta?.err ? 'failed' : 'success',
        error: transaction.meta?.err
      };

    } catch (error) {
      logger.error('Failed to get transaction', {
        signature,
        error: error.message
      });
      throw error;
    }
  }

  static async getAccountInfo(userId) {
    try {
      const keypair = await this.getUserKeypair(userId);
      const connection = this.createConnection();
      
      const accountInfo = await connection.getAccountInfo(keypair.publicKey);
      const balance = await connection.getBalance(keypair.publicKey);

      return {
        publicKey: keypair.publicKey.toString(),
        balance: balance / LAMPORTS_PER_SOL,
        lamports: balance,
        owner: accountInfo?.owner?.toString(),
        executable: accountInfo?.executable,
        rentEpoch: accountInfo?.rentEpoch
      };

    } catch (error) {
      logger.error('Failed to get account info', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  static getExplorerUrl(signature) {
    const cluster = process.env.SOLANA_CLUSTER || 'devnet';
    const baseUrl = cluster === 'mainnet-beta' 
      ? 'https://explorer.solana.com'
      : `https://explorer.solana.com/${cluster}`;
    
    return `${baseUrl}/tx/${signature}`;
  }

  static isValidAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getNetworkInfo() {
    try {
      const connection = this.createConnection();
      const version = await connection.getVersion();
      const genesisHash = await connection.getGenesisHash();
      const slot = await connection.getSlot();

      return {
        version: version['solana-core'],
        genesisHash,
        currentSlot: slot,
        cluster: process.env.SOLANA_CLUSTER || 'devnet'
      };

    } catch (error) {
      logger.error('Failed to get network info', {
        error: error.message
      });
      throw error;
    }
  }

  static async testConnection(userId) {
    try {
      const keypair = await this.getUserKeypair(userId);
      const connection = this.createConnection();
      
      const accountInfo = await connection.getAccountInfo(keypair.publicKey);
      const balance = await connection.getBalance(keypair.publicKey);

      return {
        isValid: true,
        publicKey: keypair.publicKey.toString(),
        balance: balance / LAMPORTS_PER_SOL,
        network: process.env.SOLANA_CLUSTER || 'devnet'
      };

    } catch (error) {
      logger.error('Solana connection test failed', {
        userId,
        error: error.message
      });

      return {
        isValid: false,
        error: error.message
      };
    }
  }
}
