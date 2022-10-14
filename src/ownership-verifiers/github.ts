import { Octokit } from "@octokit/core";
import axios from "axios";
import { utils } from "ethers";

const clientSecret = process.env.COMMITMENT_MAPPER_GITHUB_OAUTH_SECRET;
const clientID = process.env.COMMITMENT_MAPPER_GITHUB_OAUTH_ID;

export type GithubAccount = {
  login: string;
  profileId: number;
  name: string | null;
  avatarUrl: string;
  identifier: string;
};

export class GithubOwnershipVerifier {
  async verify({ code }: { code: string }): Promise<GithubAccount> {
    if (!code) {
      throw new Error("Code should always be defined!");
    }

    const accessResponse = await axios({
      method: "post",
      url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${code}`,
      headers: {
        accept: "application/json",
      },
    });

    const accessToken = accessResponse.data.access_token;
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.request("GET /user");
    if (!data.id) {
      throw new Error("Github id not found");
    }
    const identifier = `0x1001${utils.hexZeroPad(`0x${data.id}`, 20).slice(6)}`;
    const userDetail: GithubAccount = {
      login: data.login,
      profileId: data.id,
      name: data.name,
      avatarUrl: data.avatar_url,
      identifier,
    };
    return userDetail;
  }
}
