import crypto from "crypto";
import { utils } from "ethers";

const telegramBotToken = process.env.COMMITMENT_MAPPER_TELEGRAM_BOT_ACCESS_TOKEN!

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

  async verify({ payload }: { payload: string }): Promise<TelegramAccount> {
    if (!payload) {
      throw new Error("Payload must not be empty");
    }
    const data = this._decodePayload(payload);
    if (!this._checkHash(data)) {
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

  protected _checkHash(payload: TelegramPayload): boolean {
    if (!payload.hash) {
      throw new Error("Payload must contain hash");
    }
    const checkString = Object.entries(payload)
      .filter(([key, _]) => key !== "hash")
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');
    const secretKey = crypto.createHash("sha256").update(this._getTelegramBotToken()).digest();  
    const hash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
    return hash === payload.hash;
  }

  protected _decodePayload(payload: string): TelegramPayload {
    try {
      return JSON.parse(atob(payload));
    } catch (err) {
      throw new Error("Payload is not a valid JSON");
    }
  }

  protected _getTelegramBotToken(): string {
    return telegramBotToken;
  }
}