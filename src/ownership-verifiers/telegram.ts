import crypto from "crypto";
import { utils } from "ethers";

const telegramBotToken = process.env.COMMITMENT_MAPPER_TELEGRAM_BOT_ACCESS_TOKEN!;

export type TelegramAccount = {
  id: number;
  identifier: string;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
  authDate: number;
};

type TelegramPayload = TelegramAccount & {
  hash: string;
};

export class TelegramOwnershipVerifier {

  async verify({ payload }: { payload: string }): Promise<TelegramAccount> {
    if (!payload) {
      throw new Error("Payload should always be defined!");
    }
    const telegramPayload: TelegramPayload = JSON.parse(atob(payload));
    if (!this._checkHash(telegramPayload)) {
      throw new Error("Hash check failed. Data is NOT from Telegram");
    }
    const userId = telegramPayload.id;    
    if (!userId) { 
      throw new Error("Cannot store commitment without user ID");
    }
    return {
      id: userId,
      identifier: `0x1003${utils.hexZeroPad(`0x${userId}`, 20).slice(6)}`,
      firstName: telegramPayload.firstName,
      lastName: telegramPayload.lastName,
      username: telegramPayload.username,
      photoUrl: telegramPayload.photoUrl,
      authDate: telegramPayload.authDate
    };
  }

  private _checkHash(payload: TelegramPayload): boolean {
    if (!payload.hash) {
      throw new Error("Payload must contain hash");
    }
    const checkString = Object.entries(payload)
      .filter(([key, _]) => key !== "hash")
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');
    const secretKey = crypto.createHash("sha256").update(telegramBotToken).digest();  
    const hash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
    return hash === payload.hash;
  }
}