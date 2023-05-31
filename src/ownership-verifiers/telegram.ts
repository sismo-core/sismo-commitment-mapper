import crypto from "crypto";
import { utils } from "ethers";

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username: string;
  photo_url?: string;
  auth_date?: number;
};

export type TelegramPayload = TelegramUser & {
  hash: string;
};

export type TelegramAccount = TelegramUser & {
  identifier: string;
};

export class TelegramOwnershipVerifier {

  async verify({
     botId, 
     payload 
    }: { 
      botId: string, 
      payload: string 
    }): Promise<TelegramAccount> {
    this._validateInput(botId, payload);
    const data = this._decodePayload(payload);
    if (!this._checkHash(botId, data)) {
      throw new Error("Hash check failed, data is not from Telegram");
    }
    const userId = data.id;
    const username = data.username;   
    if (!userId || !username) { 
      throw new Error("Payload must contain userId and username");
    }
    return {
      id: userId,
      identifier: `0x1003${utils.hexZeroPad(`0x${userId}`, 20).slice(6)}`,
      first_name: data.first_name,
      last_name: data.last_name,
      username: username,
      photo_url: data.photo_url,
      auth_date: data.auth_date
    };
  }

  protected _checkHash(botId: string, payload: TelegramPayload): boolean {
    if (!payload.hash) {
      throw new Error("Payload must contain hash");
    }
    const payloadPreImage = Object.entries(payload)
      .filter(([key, _]) => key !== "hash")
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    const secretKey = this._getTelegramBotToken(botId); 
    return this._hash(secretKey, payloadPreImage) === payload.hash;
  }

  protected _decodePayload(payload: string): TelegramPayload {
    try {
      return JSON.parse(Buffer.from(payload, "base64").toString());
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Error(`Error decoding payload: ${errorMessage}`);
    }
  }

  protected _getTelegramBotToken(botId: string): string {
    const telegramBotTokens = this._getTelegramBotTokens();
    const token = telegramBotTokens.split(',').find((token) => {
      const [id, _] = token.split(':');
      if (id === botId) {
        return token;
      }
    });
    if (!token) { 
      throw new Error(`Telegram bot token not found for botId: ${botId}`);
    }
    return token;
  }

  protected _getTelegramBotTokens() {
    const telegramBotTokens = process.env.COMMITMENT_MAPPER_TELEGRAM_BOT_ACCESS_TOKENS!
    if (!telegramBotTokens) {
      throw new Error("Telegram bot tokens not found");
    }
    return telegramBotTokens;
  }

  protected _hash(key: string, data: string): string {
    const secretKey = crypto.createHash("sha256").update(key).digest();  
    return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
  }

  protected _validateInput(botId: string, payload: string): void {
    if (!botId) {
      throw new Error("Bot ID (bot_id) must not be empty");
    }
    if (!payload) {
      throw new Error("Payload (payload) must not be empty");
    }
  }
}